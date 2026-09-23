#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import torch
import bisect
# import numpy as np
# from numpy.dtypes import StringDType
import csv
from random import randrange
import subprocess
import mmap
import matplotlib.pyplot as plt


# In[ ]:


#!pip install colorama
#from colorama import Fore, Style
#from google.colab import drive
#drive.mount('/content/drive')


# In[ ]:


#%cd /content/drive/MyDrive/PyTorch/Tokenisation/padunk/model_versions/tokeniser2000_windowsize96_LSTM+GRUdecoder


# In[ ]:


batch_size = 32
transformer_window_length = 96
token_vocabulary_size = 2039
transformer_stride = transformer_window_length//2


# In[ ]:


def countLines (file_path) -> int:
  line_count = 0
  with open(file_path, "r") as python_filehandle:
    with mmap.mmap(python_filehandle.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_filehandle:
        while mmap_filehandle.readline():
            line_count += 1

  return line_count


# In[ ]:


def retrieveSentence (sentence_idx, tokens_list, sentence_offsets) -> str:
    end_idx = len(tokens_list) if sentence_idx+1 == len(sentence_offsets) else sentence_offsets[sentence_idx+1]
    print(end_idx)
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[sentence_offsets[sentence_idx]:end_idx]).strip()


# In[ ]:


def retrieveSubtext(subtext_idx, tokens_list, subtext_offsets) -> str:
    end_idx = len(tokens_list) if subtext_idx+1 == len(subtext_offsets) else subtext_offsets[subtext_idx+1]
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[subtext_offsets[subtext_idx]:end_idx]).strip()


# In[ ]:


def retrieveSubtextBeginning(subtext_idx, tokens_list, subtext_offsets) -> str:
    end_idx = subtext_offsets[subtext_idx] + 15
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[subtext_offsets[subtext_idx]:end_idx]).strip()


# In[ ]:


def stringifyTokensTensor(tokens_tensor, token_boundaries=False) -> str:
    token_separator = "" if token_boundaries == False else "|"
    return token_separator.join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_tensor.tolist()).strip()


# In[ ]:


def stringifyPosTensor(pos_tensor) -> str:
    return " ".join(pos_dict[pos_code] for pos_code in pos_tensor.tolist()).strip()


# In[ ]:


def stringifyMorphTagsTensor(morph_tags_tensor, array=False) -> str:

    tags = []
    tags_str = ""
    for i in range(morph_tags_tensor.shape[0]):
        tag_str = ""
        for j in range(10):
            tag_str += morph_slots_dicts[j][morph_tags_tensor[i][j].item()]
        tags.append(tag_str)
        tags_str += "|"+tag_str

    return tags if array==True else tags_str[1:]



# In[ ]:


def stringifyLSTMWindowEntry(char_tensor):
    word_str = ""
    for char_code in char_tensor.tolist():
        if char_code == 0:
            break
        word_str += char_dict[char_code]
    return word_str


# In[ ]:


def sortedListFind(sorted_list, sought_after_value) -> int:
    'Locate the leftmost value exactly equal to x'
    i = bisect.bisect_left(sorted_list, sought_after_value)
    if i != len(sorted_list) and sorted_list[i] == sought_after_value:
        return i
    else:
        return -1


# In[ ]:


def getSubtextWindowIndices(flat_index):
    total = 0
    for s in range(len(subtext_windows)):
        for w in range(subtext_windows[s].size(0)):
            if total == flat_index:
                return s, w
            total += 1


# In[ ]:


def getWindowLossMask(subtext_idx, window_idx, current_token_window, subtext_offsets, word_offsets, tokens_list) -> tuple[torch.Tensor, int, int]:
    token_offset_at_window_start = subtext_offsets[subtext_idx] + window_idx*transformer_stride

    non_padding_transformer_window_size = current_token_window.nonzero().size(0)

    loss_mask = torch.zeros(transformer_window_length, dtype=torch.bool)
    loss_mask = current_token_window != 0 #sets padding token positions to False




    first_whole_word_idx = 0
    start_word_offsets_idx = 0
    for i in range(0, non_padding_transformer_window_size):
        start_word_offsets_idx = sortedListFind(word_offsets, token_offset_at_window_start+i)
        if start_word_offsets_idx != -1:
            first_whole_word_idx = i
            break

    ##
    if start_word_offsets_idx == -1:
        return torch.zeros(transformer_window_length, dtype=torch.bool), -1, -1

    last_whole_word_idx = non_padding_transformer_window_size - 1##how can we get the last whole-word token from within a window without knowing if it crosses over the boundary?
    end_word_offsets_idx = 0
    for i in range(non_padding_transformer_window_size - 1, -1, -1): #transformer_window_length overshoots well into next subtext if this window is padded
        idx_pos_in_word_offsets = sortedListFind(word_offsets, token_offset_at_window_start+i)
        if idx_pos_in_word_offsets != -1:
            last_whole_word_idx = i - 1
            end_word_offsets_idx = idx_pos_in_word_offsets - 1
            break

    ##check whether the token after the end of the window is a new word, if so take whole window
    if sortedListFind(word_offsets, token_offset_at_window_start+non_padding_transformer_window_size) != -1 or token_offset_at_window_start+non_padding_transformer_window_size >= len(tokens_list):
        last_whole_word_idx = non_padding_transformer_window_size - 1
        end_word_offsets_idx += 1

    if token_offset_at_window_start+non_padding_transformer_window_size >= len(tokens_list):
        print(f"last_whole_word_idx: {last_whole_word_idx}")


    loss_mask[last_whole_word_idx + 1:] = False
    loss_mask[:first_whole_word_idx] = False

    #to account for cases where the window contains only non-initial subword tokens and padding
    if loss_mask.nonzero().size(0) == 0:
        return loss_mask, -1, -1

    # post_final_word_token_offset = token_offset_at_window_start + loss_mask.nonzero()[-1].item() + 1
    # end_word_offsets_idx = 0
    # post_final_word_word_offset = sortedListFind(word_offsets, post_final_word_token_offset)
    # if post_final_word_word_offset == -1:
    #     end_word_offsets_idx = len(word_offsets) - 1
    # else:
    #     end_word_offsets_idx = post_final_word_word_offset - 1

    return loss_mask, start_word_offsets_idx, end_word_offsets_idx


# In[ ]:


def getFlatWindowIndex(s, w):
    total = 0
    for i in range(s+1):
        for j in range(len(subtext_windows[i])):
            if i == s and j == w:
                return total
            total += 1
    return total


# In[ ]:


def getWindowWordLengths(start_word_offset, end_word_offset, word_offsets, tokens_list, padded=False):
    subtext_window_word_lengths = []
    for i in range(start_word_offset, end_word_offset):
        word_token_length = word_offsets[i + 1] - word_offsets[i]
        subtext_window_word_lengths.append(word_token_length)

    final_word_token_length = 1
    if len(word_offsets) - 1 == end_word_offset:
        final_word_token_length = len(tokens_list) - word_offsets[end_word_offset]
    else:
        final_word_token_length = word_offsets[end_word_offset + 1] - word_offsets[end_word_offset]
    subtext_window_word_lengths.append(final_word_token_length)

    if padded:
        return torch.nn.functional.pad(torch.tensor(subtext_window_word_lengths, dtype=torch.int64), (0, transformer_window_length-len(subtext_window_word_lengths)), value=0) 
    else:
        return torch.tensor(subtext_window_word_lengths, dtype=torch.int64)


# In[ ]:


def getTargetTagWindows(start_word_offset, end_word_offset, pos_tensor, morph_tag_tensors):
    if start_word_offset == -1:
        return torch.tensor([-1], dtype=torch.int64).expand(transformer_window_length), torch.tensor([-1], dtype=torch.int64).expand(transformer_window_length).unsqueeze(1).expand(-1, 10)

    num_words_in_window = end_word_offset+1 - start_word_offset
    return pos_tensor[start_word_offset:end_word_offset+1], morph_tag_tensors[start_word_offset:end_word_offset+1] 


# In[ ]:


def getCharLSTMInputWindow(token_window: torch.Tensor, loss_mask: torch.Tensor, start_word_offset: int, end_word_offset: int, word_offsets, tokens_list, max_word_length=32) -> (torch.Tensor, torch.Tensor, list):

    if start_word_offset == -1:
        return torch.zeros(transformer_window_length, max_word_length, dtype=torch.int64), torch.zeros(transformer_window_length, dtype=torch.bool), []

    word_tokens_tensor = token_window[loss_mask]

    i = start_word_offset
    j = start_word_offset
    char_lstm_window_word_tensors_list = []
    word_lengths_list = []
    for i in range(start_word_offset, end_word_offset):
        word_token_length = word_offsets[i + 1] - word_offsets[i]
        start_idx = j - start_word_offset
        one_past_end_idx = start_idx + word_token_length

        word_str = stringifyTokensTensor(word_tokens_tensor[start_idx:one_past_end_idx])[:max_word_length]
        word_char_ids = []
        for char in word_str:
            if char in char_dict_reversed:
                word_char_ids.append(char_dict_reversed[char])
            else:
                word_char_ids.append(char_dict_reversed["<unk>"])

        word_tensor = torch.nn.functional.pad(torch.tensor(word_char_ids, dtype=torch.int64), (0, max_word_length-len(word_char_ids)), value=0)
        char_lstm_window_word_tensors_list.append(word_tensor)
        word_lengths_list.append(len(word_char_ids))
        # if start_word_offset == 67013:
        #     print(f"word_str: {word_str},i:j: {i}:{j}, start_idx:one_past_end_idx: {start_idx}:{one_past_end_idx}, word_tokens_tensor.shape: {word_tokens_tensor.shape}")
        j += word_token_length

    final_word_token_length = 1
    if len(word_offsets) -1 == end_word_offset:
        final_word_token_length = len(tokens_list) - word_offsets[end_word_offset]
    else:
        final_word_token_length = word_offsets[end_word_offset + 1] - word_offsets[end_word_offset]
    final_start_idx = j - start_word_offset
    final_one_past_end_idx = final_start_idx + final_word_token_length
    word_str = stringifyTokensTensor(word_tokens_tensor[final_start_idx:final_one_past_end_idx])[:max_word_length]
    word_char_ids = []
    for char in word_str:
        if char in char_dict_reversed:
            word_char_ids.append(char_dict_reversed[char])
        else:
            word_char_ids.append(char_dict_reversed["<unk>"])


    word_tensor = torch.nn.functional.pad(torch.tensor(word_char_ids, dtype=torch.int64), (0, max_word_length-len(word_char_ids)), value=0)
    char_lstm_window_word_tensors_list.append(word_tensor)
    word_lengths_list.append(len(word_char_ids))
    # if start_word_offset == 67013 and len(word_char_ids) == 0:
    #     print(f"word_str: {word_str}, start_idx:one_past_end_idx: {start_idx}:{one_past_end_idx}, word_tokens_tensor.shape: {word_tokens_tensor.shape}")

    unpadded_char_lstm_window_tensor = torch.stack(char_lstm_window_word_tensors_list, dim=0)
    char_lstm_window_tensor = torch.nn.functional.pad(unpadded_char_lstm_window_tensor, (0, 0, 0, transformer_window_length-unpadded_char_lstm_window_tensor.size(0)), value=0)
    lstm_word_mask = (char_lstm_window_tensor != 0).any(dim=1)

    return char_lstm_window_tensor, lstm_word_mask, word_lengths_list


# In[ ]:


pos_dict = {}
pos_dict_reversed = {}
for row in csv.DictReader(open("../../torot_pos.csv", "r"), delimiter="|"):
    pos_tag = row["pos_tag"]
    pos_tag_id = int(row["pos_tag_id"])
    pos_dict[pos_tag_id] = pos_tag
    pos_dict_reversed[pos_tag] = pos_tag_id


# In[ ]:


morph_slots_dicts = []
morph_slots_reverse_dicts = []
for row in csv.DictReader(open("../../torot_morphtags.csv", "r"), delimiter="|"):
    field_name = row["field_name"]
    field_values = row["field_values"]
    morph_slots_dict = {0: "-"}
    morph_slots_reverse_dict = {"-": 0}
    i = 1
    for value in field_values.split(";"):
        morph_slots_dict[i] = value
        morph_slots_reverse_dict[value] = i
        i += 1
    morph_slots_dicts.append(morph_slots_dict)
    morph_slots_reverse_dicts.append(morph_slots_reverse_dict)


# In[ ]:





# In[ ]:


tokens_dict = {}
tokens_dict_reversed = {}
char_dict = {}
char_dict_reversed = {}
with open("../../bpe_token_indices.csv", "r") as bpe_token_indices_file:
    with mmap.mmap(bpe_token_indices_file.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_bpe_file:
        line_no = 0
        for bin_line in iter(mmap_bpe_file.readline, b""):
            line = bin_line.decode("utf-8").strip()
            split_line = line.split(",")
            tokens_dict[int(split_line[0])] = split_line[1].strip()
            tokens_dict_reversed[split_line[1]] = int(split_line[0])
            if line_no < 38:
                char_dict[int(split_line[0])] = split_line[1].strip()
                char_dict_reversed[split_line[1]] = int(split_line[0])
            line_no += 1
            if line_no == token_vocabulary_size:
                break


# In[ ]:





# In[ ]:


def getDatasetInput(tokenised_data_filepath, tagged_data_filepath):

    tokens_list = []
    word_offsets = []
    with open(tokenised_data_filepath, "r") as tokenised_data_file:
        with mmap.mmap(tokenised_data_file.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_tokenised_data_file:
            word_token_count = 0
            for b_line in iter(mmap_tokenised_data_file.readline, b""):
                word_offsets.append(word_token_count)
                for token_no in b_line.decode("utf-8").strip().split(",")[0].split(" "):
                    tokens_list.append(int(token_no))
                    word_token_count += 1
    tokens_tensor = torch.tensor(tokens_list, dtype=torch.int64)

    sentence_offsets = []
    subtext_offsets = []
    text_offsets = []
    row_no = 0
    sentence_no_prev = 0
    subtext_no_prev = 0
    text_id_prev = 0
    token_count = 0
    training_data_wordcount = countLines(tagged_data_filepath) - 1
    pos_tensor = torch.zeros(training_data_wordcount, dtype=torch.int64)
    morph_tag_tensors = []
    for row in csv.DictReader(open(tagged_data_filepath, "r"), delimiter="|"):
        sentence_no = int(row["sentence_no"])
        subtext_no = int(row["subtitle_id"])
        text_id_no = int(row["text_id"])
        if sentence_no != sentence_no_prev:
            sentence_offsets.append(word_offsets[row_no])
            sentence_no_prev = sentence_no
        if text_id_no != text_id_prev:
            text_offsets.append(word_offsets[row_no])
            text_id_prev = text_id_no
            subtext_offsets.append(word_offsets[row_no])
            subtext_no_prev = subtext_no
        elif subtext_no != subtext_no_prev:
            subtext_offsets.append(word_offsets[row_no])
            subtext_no_prev = subtext_no

        pos = row["pos"]
        morph_tag = row["morph_tag"]
        pos_tensor[row_no] = pos_dict_reversed[pos]
        morph_tag_tensor = torch.zeros(10, dtype=torch.int64)
        for i in range(10):
            morph_tag_tensor[i] = morph_slots_reverse_dicts[i][morph_tag[i]]
        morph_tag_tensors.append(morph_tag_tensor)        
        row_no += 1
    morph_tag_tensors = torch.stack(morph_tag_tensors, dim=0)

    subtext_windows = []
    flat_subtext_window_tensors = []

    subtext_window_loss_masks = []
    flat_token_loss_mask_tensors = []
    flat_window_word_token_lengths = []
    flat_window_word_token_lengths_padded_tensor = []
    pos_window_tensors = []
    morph_tag_window_tensors = []

    for i in range(len(subtext_offsets)):
        end_idx = len(tokens_list) if i+1 == len(subtext_offsets) else subtext_offsets[i+1]
        subtext_tokens = tokens_tensor[subtext_offsets[i]:end_idx]
        subtext_token_length = subtext_tokens.size(0)

        subtext_chunks = []
        loss_mask_chunks = []
        w = 0
        for j in range(0, subtext_token_length, transformer_stride):
            window_tokens = subtext_tokens[j:j+transformer_window_length]
            padded_window = torch.nn.functional.pad(window_tokens, (0, transformer_window_length-window_tokens.size(0)), value=0)
            loss_mask, start_word_offset, end_word_offset = getWindowLossMask(i, w, padded_window, subtext_offsets, word_offsets, tokens_list)
            if i == 220 and w == 51:
                print(loss_mask, start_word_offset, end_word_offset)
            if start_word_offset != -1:    
                subtext_chunks.append(padded_window)
                flat_subtext_window_tensors.append(padded_window)

                loss_mask_chunks.append((loss_mask, start_word_offset, end_word_offset))
                flat_token_loss_mask_tensors.append(loss_mask)
                flat_window_word_token_lengths.append(getWindowWordLengths(start_word_offset, end_word_offset, word_offsets, tokens_list))
                flat_window_word_token_lengths_padded_tensor.append(getWindowWordLengths(start_word_offset, end_word_offset, word_offsets, tokens_list, padded=True))

                pos_window, morph_tag_window = getTargetTagWindows(start_word_offset, end_word_offset, pos_tensor, morph_tag_tensors)
                pos_window_tensors.append(pos_window)
                morph_tag_window_tensors.append(morph_tag_window)

                w += 1
        subtext_window_loss_masks.append(loss_mask_chunks)       

        subtext_windows.append(torch.stack(subtext_chunks, dim=0))


    flat_token_loss_mask_tensors = torch.stack(flat_token_loss_mask_tensors)
    flat_window_word_token_lengths_padded_tensor = torch.stack(flat_window_word_token_lengths_padded_tensor)

    flat_subtext_window_tensors = torch.stack(flat_subtext_window_tensors)

    subtext_window_sizes = []
    for subtext_tensors in subtext_windows:
        subtext_window_sizes.append(subtext_tensors.size(0))


    lstm_windows = []
    lstm_word_masks = []
    lstm_word_lengths = []
    lstm_windows_num_words = []
    flat_pos_window_tensors = []
    flat_morph_tag_window_tensors = []
    for s in range(len(subtext_windows)):
        for w in range(subtext_windows[s].size(0)):
            loss_mask, start_word_offset, end_word_offset = subtext_window_loss_masks[s][w]
            lstm_window, lstm_word_mask, lstm_window_word_lengths = getCharLSTMInputWindow(subtext_windows[s][w], loss_mask, start_word_offset, end_word_offset, word_offsets, tokens_list)
            lstm_windows.append(lstm_window)
            lstm_word_masks.append(lstm_word_mask)
            lstm_word_lengths.append(torch.tensor(lstm_window_word_lengths, dtype=torch.int64))
            lstm_windows_num_words.append(len(lstm_window_word_lengths))

    lstm_windows = torch.stack(lstm_windows)
    lstm_word_masks = torch.stack(lstm_word_masks)
    lstm_windows_num_words = torch.tensor(lstm_windows_num_words, dtype=torch.int64)

    return flat_subtext_window_tensors, flat_token_loss_mask_tensors, flat_window_word_token_lengths_padded_tensor, lstm_windows, lstm_word_masks, lstm_word_lengths, lstm_windows_num_words, pos_window_tensors, morph_tag_window_tensors


# In[ ]:


train_dataset_input = getDatasetInput("tokenised_chu_words_training_deepcleaned.csv", "../../chu_words_tagged.csv")


# In[ ]:


validation_dataset_input = getDatasetInput("tokenised_zogr_validation_words_deepcleaned.csv", "../../zogr_unannotated_validation.csv")


# In[ ]:


stringifyTokensTensor(validation_dataset_input[0][201]), stringifyPosTensor(validation_dataset_input[7][201]), stringifyMorphTagsTensor(validation_dataset_input[8][201]), validation_dataset_input[3][201][:, :10]


# In[ ]:


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# In[ ]:


print(device)


# In[ ]:


class MorphologyLSTMTransformerModel(torch.nn.Module):
    def __init__(self, token_vocab_size=token_vocabulary_size, token_embedding_dim=256, token_seq_length=transformer_window_length, attention_heads=4, trans_layers=4, char_vocab_size=38, char_embedding_dim=32, lstm_hidden_size=64, lstm_layers=1, tag_slots_num=11, tag_slot_embedding_dim=32, decoder_lstm_hidden_size=256):
        super().__init__()

        self.gru_input_dim = decoder_lstm_hidden_size+tag_slot_embedding_dim+16

        self.token_embedder = torch.nn.Embedding(num_embeddings=token_vocab_size, embedding_dim=token_embedding_dim, padding_idx=0)
        self.positional_embedder = torch.nn.Embedding(num_embeddings=token_seq_length, embedding_dim=token_embedding_dim)
        transformer_encoder_layer = torch.nn.TransformerEncoderLayer(d_model=token_embedding_dim, nhead=attention_heads, dim_feedforward=4*token_embedding_dim, batch_first=True)
        self.transformer = torch.nn.TransformerEncoder(transformer_encoder_layer, trans_layers)

        self.char_embedder = torch.nn.Embedding(num_embeddings=char_vocab_size, embedding_dim=char_embedding_dim, padding_idx=0)
        self.char_dropout = torch.nn.Dropout(0.1)
        self.lstm = torch.nn.LSTM(input_size=char_embedding_dim, hidden_size=lstm_hidden_size, num_layers=lstm_layers, batch_first=True, bidirectional=True)

        self.word_lstm_tag_downprojection = torch.nn.Linear(tag_slot_embedding_dim*tag_slots_num, 128)
        self.word_level_decoder_lstm = torch.nn.LSTM(input_size=512, hidden_size=decoder_lstm_hidden_size, num_layers=lstm_layers, batch_first=True, bidirectional=False)
        self.word_lstm_STARTTAG_embedding = torch.nn.Parameter(torch.randn(tag_slot_embedding_dim*11))

        self.decoder_gru = torch.nn.GRU(input_size=self.gru_input_dim, hidden_size=128, batch_first=True)

        self.gru_tag_slot_embedders = torch.nn.ModuleList([
            torch.nn.Embedding(num_embeddings=len(pos_dict), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[0]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[1]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[2]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[3]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[4]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[5]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[6]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[7]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[8]), embedding_dim=tag_slot_embedding_dim),
            torch.nn.Embedding(num_embeddings=len(morph_slots_dicts[9]), embedding_dim=tag_slot_embedding_dim)
        ])
        self.gru_slot_positional_embedder = torch.nn.Embedding(num_embeddings=tag_slots_num, embedding_dim=16)
        self.gru_START_embedding = torch.nn.Parameter(torch.randn(tag_slot_embedding_dim))
        self.gru_classifier_heads = torch.nn.ModuleList([
            torch.nn.Linear(128, len(pos_dict)),
            torch.nn.Linear(128, len(morph_slots_dicts[0])),
            torch.nn.Linear(128, len(morph_slots_dicts[1])),
            torch.nn.Linear(128, len(morph_slots_dicts[2])),
            torch.nn.Linear(128, len(morph_slots_dicts[3])),
            torch.nn.Linear(128, len(morph_slots_dicts[4])),
            torch.nn.Linear(128, len(morph_slots_dicts[5])),
            torch.nn.Linear(128, len(morph_slots_dicts[6])),
            torch.nn.Linear(128, len(morph_slots_dicts[7])),
            torch.nn.Linear(128, len(morph_slots_dicts[8])),
            torch.nn.Linear(128, len(morph_slots_dicts[9]))
        ])

        self.token_embedding_dim = token_embedding_dim
        self.lstm_hidden_size = lstm_hidden_size
        self.decoder_lstm_hidden_size = decoder_lstm_hidden_size
        self.register_buffer("position_ids", torch.arange(token_seq_length).unsqueeze_(0))
        self.register_buffer("gru_slot_ids", torch.arange(11).unsqueeze_(0))
        self.register_buffer("word_offsets", torch.zeros(242536)) #DELETE

    def gru_decode_training(self, flattened_final_word_vectors, flat_pos_window_tensors, flat_morph_tag_window_tensors):

        N = flattened_final_word_vectors.shape[0] #(N, 256)
        flat_word_vectors_gru_expanded = flattened_final_word_vectors.unsqueeze(1).expand(-1, 11, -1) #(N, 11, 256)
        slot_embeddings = self.gru_slot_positional_embedder(self.gru_slot_ids.expand(N, -1)) #(N, 11, 16)
        gru_START_embedding = self.gru_START_embedding.unsqueeze(0).expand(N, -1) #(N, 32)

        prev_tag_embeddings = [gru_START_embedding.unsqueeze(1), self.gru_tag_slot_embedders[0](flat_pos_window_tensors).unsqueeze(1)]
        for i in range(1, 10):
            prev_tag_embeddings.append(self.gru_tag_slot_embedders[i](flat_morph_tag_window_tensors[:, i-1]).unsqueeze(1))
            #print(self.gru_tag_slot_embedders[i], flat_pos_morph_tag_tensors[:, i])
        #produces array of 11 tensors with shape (N, 1, 32)

        prev_tag_embeddings = torch.cat(prev_tag_embeddings, dim=1) #(N, 1*11, 32) -> (N, 11, 32)
        #print(flat_word_vectors_gru_expanded.shape, prev_tag_embeddings.shape, slot_embeddings.shape)

        # (N, 11, 256) + (N, 11, 32) + (N, 11, 16) -> (N, 11, 304)
        gru_input = torch.cat([flat_word_vectors_gru_expanded, prev_tag_embeddings, slot_embeddings], dim=2) #the second dimension of the GRU's input is sequence-length, which for training is 11 because we are feeding it the full 11-slot sequence at once, but at inference we feed it each previous time-step's slot-prediction one by one, so the second dimension is 1, hence the difference between flat_word_vectors_gru_expanded (repeat the word-encodings for each of the 11 slots) at training and flat_word_vectors_gru_unsqueezed (just a single representation of the word-encoding fed at each of the 11 timesteps) at inference

        #(N, 11, 128)
        gru_output = self.decoder_gru(gru_input)[0] #the second parameter is the GRU's initial hidden-state which defaults to zeros, which we provide explicitly in the inference-code below because it needs to be replaced for subsequent time-steps with the actual hidden-state outputs of the GRU 

        output_logits = []
        for j in range(11):
            output_logits.append(self.gru_classifier_heads[j](gru_output[:, j, :])) #(N, 128) -> (N, slot_possibilities)
        return output_logits #[(N, slot_possibilities)*11]

    def gru_decode_inference(self, decoder_lstm_hidden_state):

        B = decoder_lstm_hidden_state.shape[0] 
        decoder_lstm_hidden_state_unsqueezed = decoder_lstm_hidden_state.unsqueeze(1) #(B, 1, 256)
        slot_embeddings = self.gru_slot_positional_embedder(self.gru_slot_ids.expand(B, -1)) # (1, 11) -> (B, 11) -> (B, 11, 16)
        gru_START_embedding = self.gru_START_embedding.unsqueeze(0).expand(B, -1) #(B, 32)

        output_logits = []
        predicted_idcs = []

        gru_hidden = decoder_lstm_hidden_state.new_zeros(1, B, 128)
        prev_tag_embedding = gru_START_embedding.unsqueeze(1) #(B, 1, 32)
        for j in range(11):
            current_slot_embedding = slot_embeddings[:, j, :].unsqueeze(1) #(B, 1, 16)
            gru_input = torch.cat([decoder_lstm_hidden_state_unsqueezed, prev_tag_embedding, current_slot_embedding], dim=2)
            gru_output, gru_hidden = self.decoder_gru(gru_input, gru_hidden) #here we explicitly provide the hidden-state (initialising it as .new_zeros() above) because at inference we run the GRU step by step and so need to provide it with the previous output's hidden state
            #(B, 1, 128), (1, B, 128) #for this 1-member sequence gru_ouput and gru_hidden are the same except for shape

            tag_logit = self.gru_classifier_heads[j](gru_output[:, 0, :]) #(B, 1, 128) -> (B, 128) -> (B, num_slot_options)
            output_logits.append(tag_logit)
            predicted_idx = torch.argmax(tag_logit, dim=1) #(B)
            predicted_idcs.append(predicted_idx)

            prev_tag_embedding = self.gru_tag_slot_embedders[j](predicted_idx).unsqueeze(1) #(B, 1, 32)

        return output_logits, torch.stack(predicted_idcs, dim=1) #[(B, num_slot_options)*11], (B, 11)

    def poolWordTokensKeepFlat(self, token_windows, token_windows_loss_masks, token_windows_word_lengths):

        B, W, H = token_windows.shape

        flattened_selected_word_tokens = token_windows[token_windows_loss_masks]
        flattened_unpadded_lengths = token_windows_word_lengths[token_windows_word_lengths > 0]

        flattened_pooled_tokens = torch.segment_reduce(flattened_selected_word_tokens, 'mean', lengths=flattened_unpadded_lengths)

        return flattened_pooled_tokens

    def batchify_flatshit(self, B, lstm_windows_num_words, combined_final_word_vectors, flat_pos_window_tensors, flat_morph_tag_window_tensors):

        #re-batching the flat tag tensors should really be unnecessary and I should keep them batched in my dataloader etc.
        max_window_word_count = lstm_windows_num_words.max()
        batched_combined_final_word_vectors = combined_final_word_vectors.new_zeros(B, max_window_word_count, combined_final_word_vectors.shape[-1]) #(B, Wmax, 384)
        batched_pos_window_tensors = flat_pos_window_tensors.new_zeros(B, max_window_word_count)
        batched_morph_tag_window_tensors = flat_morph_tag_window_tensors.new_zeros(B, max_window_word_count, 10)

        batch_word_offset = 0
        #print(batched_combined_final_word_vectors.shape)
        for batch_no, num_words in enumerate(lstm_windows_num_words):     
            batched_combined_final_word_vectors[batch_no, :num_words] = combined_final_word_vectors[batch_word_offset:batch_word_offset+num_words]
            batched_pos_window_tensors[batch_no, :num_words] = flat_pos_window_tensors[batch_word_offset:batch_word_offset+num_words]
            batched_morph_tag_window_tensors[batch_no, :num_words] = flat_morph_tag_window_tensors[batch_word_offset:batch_word_offset+num_words]
            batch_word_offset += num_words

        return batched_combined_final_word_vectors, batched_pos_window_tensors, batched_morph_tag_window_tensors

    def forward(self, token_windows, token_windows_loss_masks, token_windows_word_lengths, lstm_windows, lstm_word_masks, lstm_word_lengths, lstm_windows_num_words, flat_pos_window_tensors, flat_morph_tag_window_tensors) -> torch.Tensor:
        ### TRANSFORMER ###
        token_embeddings = self.token_embedder(token_windows)
        positional_embeddings = self.positional_embedder(self.position_ids.expand(token_embeddings.size(0), -1))
        padding_mask = (token_windows == 0)

        token_states = self.transformer(token_embeddings + positional_embeddings, src_key_padding_mask=padding_mask)
        word_pooled_token_states = self.poolWordTokensKeepFlat(token_states, token_windows_loss_masks, token_windows_word_lengths)

        ### LSTM ###
        B, W, L = lstm_windows.shape #(B, 96, 32)
        flat_lstm_windows = lstm_windows.reshape(B*W, L)
        flat_lstm_word_masks = lstm_word_masks.reshape(B*W)
        flat_unwordpadded_lstm_windows = flat_lstm_windows[flat_lstm_word_masks] #(N, 32)

        lstm_char_embeddings = self.char_dropout(self.char_embedder(flat_unwordpadded_lstm_windows)) #(N, 32, 32)
        packed_char_embeddings = torch.nn.utils.rnn.pack_padded_sequence(lstm_char_embeddings, lstm_word_lengths.cpu(), batch_first=True, enforce_sorted=False)

        packed_output, (h_n, c_n) = self.lstm(packed_char_embeddings)
        flat_unpadded_word_vectors = torch.cat([h_n[0], h_n[1]], dim=1) #(N, 128)

        combined_final_word_vectors = torch.cat([word_pooled_token_states, flat_unpadded_word_vectors], dim=-1) #(N, 384)

        ### LSTM TAG DECODER ###
        batched_combined_final_word_vectors, batched_pos_window_tensors, batched_morph_tag_window_tensors = self.batchify_flatshit(B, lstm_windows_num_words, combined_final_word_vectors, flat_pos_window_tensors, flat_morph_tag_window_tensors) #(B, Wmax, 384), (B, Wmax), (B, WMax, 10)
        max_window_word_count = batched_pos_window_tensors.shape[1]

        word_lstm_STARTTAG_embedding = self.word_lstm_STARTTAG_embedding.unsqueeze(0).unsqueeze(0).expand(B, 1, -1) #(B, 1, 352)

        if self.training:
            tag_embeddings = [self.gru_tag_slot_embedders[0](batched_pos_window_tensors)] #(B, Wmax) -> (B, Wmax, 32)
            for i in range(0, 10):
                tag_embeddings.append(self.gru_tag_slot_embedders[i+1](batched_morph_tag_window_tensors[:, :, i])) #each slot selected by i has dimensions (B, Wmax), same as the POS tensor, so embedding it also gives (B, Wmax, 32) and they are added to the list for torch.cat
            tag_embeddings = torch.cat(tag_embeddings, dim=2) #(B, Wmax, 352)

            prev_word_tag_embeddings = torch.cat([word_lstm_STARTTAG_embedding, tag_embeddings[:, :-1, :]], dim=1) #(B, Wmax, 352), with the final tag-embedding pushed off the end by appending the STARTTAG embedding to the start

            prev_word_tag_downprojections = self.word_lstm_tag_downprojection(prev_word_tag_embeddings) #(B, Wmax, 128) #could skip

            prev_tag_plus_combined_word_vectors = torch.cat([batched_combined_final_word_vectors, prev_word_tag_downprojections], dim=2) #(B, Wmax, 384) + (B, Wmax, 128) => (B, Wmax, 512)
            packed_tag_plus_word_vectors = torch.nn.utils.rnn.pack_padded_sequence(prev_tag_plus_combined_word_vectors, lstm_windows_num_words.cpu(), batch_first=True, enforce_sorted=False)

            packed_decoder_lstm_output, (h_n, c_n) = self.word_level_decoder_lstm(packed_tag_plus_word_vectors)
            unpacked_decoder_lstm_output, lngths = torch.nn.utils.rnn.pad_packed_sequence(packed_decoder_lstm_output, batch_first=True, total_length=max_window_word_count) #(B, Wmax, 256)

            unpacked_decoder_lstm_output_loss_mask = (unpacked_decoder_lstm_output != 0.0).any(dim=2) #(B, Wmax)

            flattened_final_word_vectors = unpacked_decoder_lstm_output[unpacked_decoder_lstm_output_loss_mask] #(N, 256)

            output_logits = self.gru_decode_training(flattened_final_word_vectors, flat_pos_window_tensors, flat_morph_tag_window_tensors)

            return output_logits #[(N, slot_possibilities)*11]

        else:
            full_prev_word_tag_embedding = word_lstm_STARTTAG_embedding.clone() #(B, 1, 352)
            full_batch_lstm_hidden = batched_combined_final_word_vectors.new_zeros(1, B, self.decoder_lstm_hidden_size)
            full_batch_lstm_cell = batched_combined_final_word_vectors.new_zeros(1, B, self.decoder_lstm_hidden_size) #(1, B, 256)

            batched_output_logits = [batched_combined_final_word_vectors.new_zeros(B, max_window_word_count, len(pos_dict))]
            for i in range(0, 10):
                batched_output_logits.append(batched_combined_final_word_vectors.new_zeros(B, max_window_word_count, len(morph_slots_dicts[i]))) #[(B, Wmax, slot_possibilities)*11]
            batched_predicted_idcs = batched_combined_final_word_vectors.new_zeros(B, max_window_word_count, 11, dtype=torch.int64) #(B, Wmax, 11)

            active_windows_masks_for_each_word_pos = batched_combined_final_word_vectors.new_zeros(max_window_word_count, B, dtype=torch.bool)

            for word_pos in range(max_window_word_count):
                active_windows_mask = word_pos < lstm_windows_num_words #(B) with True for windows that still have words at word_pos
                active_windows_masks_for_each_word_pos[word_pos] = active_windows_mask

                active_batched_combined_final_word_vectors = batched_combined_final_word_vectors[active_windows_mask]
                lstm_hidden = full_batch_lstm_hidden[:, active_windows_mask, :] #(1, Bactive, 256)
                lstm_cell = full_batch_lstm_cell[:, active_windows_mask, :] #(1, Bactive, 256)
                prev_word_tag_embedding = full_prev_word_tag_embedding[active_windows_mask] #(Bactive, 1, 352)

                prev_word_tag_downprojection = self.word_lstm_tag_downprojection(prev_word_tag_embedding) #(Bact, 1, 128) #could skip
                prev_tag_plus_combined_word_vec = torch.cat([active_batched_combined_final_word_vectors[:, word_pos:word_pos+1, :], prev_word_tag_downprojection], dim=2) #(Bact, 1, 384) + (Bact, 1, 128) -> (Bact, 1, 512)

                _, (lstm_hidden, lstm_cell) = self.word_level_decoder_lstm(prev_tag_plus_combined_word_vec, (lstm_hidden, lstm_cell)) #h_n and c_n are (1, Bact, 256)

                output_logits, predicted_idcs = self.gru_decode_inference(lstm_hidden[0]) #[(Bact, num_slot_options)*11], (Bact, 11)

                tag_embeddings = []
                batched_predicted_idcs[active_windows_mask, word_pos] = predicted_idcs
                for i in range(0, 11):
                    tag_embeddings.append(self.gru_tag_slot_embedders[i](predicted_idcs[:, i])) #(Bact) -> (Bact, 32)       
                    batched_output_logits[i][active_windows_mask, word_pos] = output_logits[i] #[(B, Wmax, slot_possibilities)*11]

                prev_word_tag_embedding = torch.cat(tag_embeddings, dim=1).unsqueeze(1) #(Bact, 1, 352)
                full_prev_word_tag_embedding.zero_()
                full_prev_word_tag_embedding[active_windows_mask, :, :] = prev_word_tag_embedding #(B, 1, 352), with only Bact non-zero rows

                full_batch_lstm_hidden.zero_()
                full_batch_lstm_cell.zero_()

                full_batch_lstm_hidden[:, active_windows_mask] = lstm_hidden #I need to scatter these hidden and cell states back out across the full B number of batches so that selection by the activity mask (which is of length B) still works
                full_batch_lstm_cell[:, active_windows_mask] = lstm_cell

            return batched_output_logits, batched_predicted_idcs, active_windows_masks_for_each_word_pos #[(B, Wmax, slot_possibilities)*11], (B, Wmax, 11), (Wmax, B)

        ### GRU DECODER ###
        # if self.training:
        #     return self.gru_decode_training(combined_final_word_vectors, flat_pos_window_tensors, flat_morph_tag_window_tensors)
        # else:
        #     return self.gru_decode_inference(combined_final_word_vectors)


# In[ ]:


pos_lgts = torch.randn(5, 3)
pred_idcs = torch.argmax(pos_lgts, dim=1)
pos_lgts, pred_idcs


# In[ ]:


class textWindowsDataset(torch.utils.data.Dataset):
    def __init__(self, token_windows, token_window_loss_masks, token_window_word_lengths, lstm_windows, lstm_word_masks, lstm_word_lengths, lstm_windows_num_words, pos_window_tensors, morph_tag_window_tensors):
        self.token_windows = token_windows
        self.token_window_loss_masks = token_window_loss_masks
        self.token_window_word_lengths = token_window_word_lengths
        self.lstm_windows = lstm_windows
        self.lstm_word_masks = lstm_word_masks
        self.lstm_word_lengths = lstm_word_lengths
        self.lstm_windows_num_words = lstm_windows_num_words
        self.pos_window_tensors = pos_window_tensors
        self.morph_tag_window_tensors = morph_tag_window_tensors

    def __len__(self):
        return len(self.token_windows)

    def __getitem__(self, idx):

        return {'token_windows': self.token_windows[idx], 'token_window_loss_masks': self.token_window_loss_masks[idx], 'token_window_word_lengths': self.token_window_word_lengths[idx], 'lstm_windows': self.lstm_windows[idx], 'lstm_word_masks': self.lstm_word_masks[idx], 'lstm_word_lengths': self.lstm_word_lengths[idx], 'lstm_windows_num_words': self.lstm_windows_num_words[idx], 'pos_window_tensors': self.pos_window_tensors[idx], 'morph_tag_window_tensors': self.morph_tag_window_tensors[idx]}


# In[ ]:


def data_loader_collate_fn(samples):
    return {
        "token_windows" : torch.stack([sample["token_windows"] for sample in samples]),
        "token_window_loss_masks" : torch.stack([sample["token_window_loss_masks"] for sample in samples]),
        "token_window_word_lengths" : torch.stack([sample["token_window_word_lengths"] for sample in samples]),
        "lstm_windows" : torch.stack([sample["lstm_windows"] for sample in samples]),
        "lstm_word_masks" : torch.stack([sample["lstm_word_masks"] for sample in samples]),
        "lstm_word_lengths" : torch.cat([sample["lstm_word_lengths"] for sample in samples]),
        "lstm_windows_num_words" : torch.stack([sample["lstm_windows_num_words"] for sample in samples]),
        "pos_window_tensors" : torch.cat([sample["pos_window_tensors"] for sample in samples]),
        "morph_tag_window_tensors" : torch.cat([sample["morph_tag_window_tensors"] for sample in samples])      
    }


# In[ ]:


# mydataset = textWindowsDataset(flat_subtext_window_tensors, flat_token_loss_mask_tensors, flat_window_word_token_lengths_padded_tensor, lstm_windows, lstm_word_masks, lstm_word_lengths, pos_window_tensors, morph_tag_window_tensors)

train_dataset = textWindowsDataset(*train_dataset_input)

# def data_loader_collate_fn(samples):
#     return samples

train_data_loader = torch.utils.data.DataLoader(train_dataset, batch_size=32, shuffle=True, collate_fn=data_loader_collate_fn)

validation_dataset = textWindowsDataset(*validation_dataset_input)

validation_data_loader = torch.utils.data.DataLoader(validation_dataset, batch_size=32, shuffle=False, collate_fn=data_loader_collate_fn)


# In[ ]:


network = MorphologyLSTMTransformerModel()
cross_entropy_loss = torch.nn.modules.loss.CrossEntropyLoss()
adamw_optimiser = torch.optim.AdamW(network.parameters(), lr=1e-4)
network.to(device)
#network.load_state_dict(torch.load("MorphologyLSTMTransformerModel_POS_only_18epochs.pt", map_location=device))


# In[ ]:


train_data_loader_iter = iter(train_data_loader)
network.train()


# In[ ]:


try:
    batch = next(train_data_loader_iter)
except StopIteration:
    print("Reached end of dataset")    
tkn_wndw = batch['token_windows'].to(device)
tkn_msks = batch['token_window_loss_masks'].to(device)
tkn_lngths = batch['token_window_word_lengths'].to(device)
lstm_wndws = batch['lstm_windows'].to(device)
lstm_msks = batch['lstm_word_masks'].to(device)
lstm_lngths = batch['lstm_word_lengths'].to(device) #this is a flattened list of the lengths of all the full words in the batch
lstm_wndws_num_wrds = batch['lstm_windows_num_words'].to(device) #this is a flattened list of the number of words in each window in the batch
flat_pos_window_tensors = batch['pos_window_tensors'].to(device)
flat_morph_tag_tensors = batch['morph_tag_window_tensors'].to(device)

#print(lstm_wndws_num_wrds)


output_logits = network(tkn_wndw, tkn_msks, tkn_lngths, lstm_wndws, lstm_msks, lstm_lngths, lstm_wndws_num_wrds, flat_pos_window_tensors, flat_morph_tag_tensors)

losses = [cross_entropy_loss(output_logits[0], flat_pos_window_tensors)]
for i in range(1, 11):
    losses.append(cross_entropy_loss(output_logits[i], flat_morph_tag_tensors[:, i -1]))
loss = torch.stack(losses).mean()
adamw_optimiser.zero_grad()
loss.backward()
adamw_optimiser.step()
print(loss)


# In[ ]:


#torch.save(obj=network.state_dict(), f="decoder_lstm_1epoch.pt")
network.load_state_dict(torch.load("google_20epochs_lstm_decoder.pt", map_location=device))


# In[ ]:


network.eval()
validation_dataloader_iter = iter(validation_data_loader)


# In[ ]:





# In[ ]:


batched_output_logits[0][active_windows_masks_for_each_word_pos.T].shape, flat_pos_window_tensors.shape


# In[ ]:


training_loss_values = []
batches_counts = []
training_epochs = []
per_epoch_loss_values = []
per_epoch_tagslot_loss_values = []


# In[ ]:


validation_average_per_epoch_loss_values = []
validation_per_epoch_tagslot_loss_values = []


# In[ ]:


network.train()

batches_count = 0
best_validation_loss = 99999.9
for epoch_no in range(40):
    train_data_loader_iter = iter(train_data_loader)
    network.train()

    epoch_loss_values = []
    epoch_tagslot_loss_values = []
    for batch in train_data_loader_iter:
        tkn_wndw = batch['token_windows'].to(device)
        tkn_msks = batch['token_window_loss_masks'].to(device)
        tkn_lngths = batch['token_window_word_lengths'].to(device)
        lstm_wndws = batch['lstm_windows'].to(device)
        lstm_msks = batch['lstm_word_masks'].to(device)
        lstm_lngths = batch['lstm_word_lengths'].to(device)
        lstm_wndws_num_wrds = batch['lstm_windows_num_words'].to(device)
        flat_pos_window_tensors = batch['pos_window_tensors'].to(device)
        flat_morph_tag_tensors = batch['morph_tag_window_tensors'].to(device)

        output_logits = network(tkn_wndw, tkn_msks, tkn_lngths, lstm_wndws, lstm_msks, lstm_lngths, lstm_wndws_num_wrds, flat_pos_window_tensors, flat_morph_tag_tensors)

        losses = [cross_entropy_loss(output_logits[0], flat_pos_window_tensors)]
        for i in range(1, 11):
            losses.append(cross_entropy_loss(output_logits[i], flat_morph_tag_tensors[:, i -1]))
        loss = torch.stack(losses).mean()
        adamw_optimiser.zero_grad()
        loss.backward()
        adamw_optimiser.step()


        training_loss_values.append(loss.item())
        epoch_loss_values.append(loss.detach())
        epoch_tagslot_loss_values.append(torch.stack(losses).detach())

        batches_counts.append(batches_count)
        batches_count += 1

    epoch_training_loss = torch.stack(epoch_loss_values).mean().item()
    per_epoch_loss_values.append(epoch_training_loss)
    per_epoch_tagslot_loss_values.append(torch.stack(epoch_tagslot_loss_values, dim=0).mean(dim=0).detach().cpu())

    # if len(per_epoch_loss_values) > 5 and per_epoch_loss_values[-1] < per_epoch_loss_values[-2]:
    #     torch.save(obj=network.state_dict(), f="MorphologyLSTMTransformerModel_bestcheckpoint.pt")

    network.eval()
    validation_dataloader_iter = iter(validation_data_loader)
    validation_per_window_loss_values = []
    validation_per_window_tagslot_loss_values = []
    with torch.inference_mode():
        for batch in validation_dataloader_iter:
            tkn_wndw = batch['token_windows'].to(device)
            tkn_msks = batch['token_window_loss_masks'].to(device)
            tkn_lngths = batch['token_window_word_lengths'].to(device)
            lstm_wndws = batch['lstm_windows'].to(device)
            lstm_msks = batch['lstm_word_masks'].to(device)
            lstm_lngths = batch['lstm_word_lengths'].to(device)
            lstm_wndws_num_wrds = batch['lstm_windows_num_words'].to(device)
            flat_pos_window_tensors = batch['pos_window_tensors'].to(device)
            flat_morph_tag_tensors = batch['morph_tag_window_tensors'].to(device)

            batched_output_logits, batched_predicted_idcs, active_windows_masks_for_each_word_pos = network(tkn_wndw, tkn_msks, tkn_lngths, lstm_wndws, lstm_msks, lstm_lngths, lstm_wndws_num_wrds, flat_pos_window_tensors, flat_morph_tag_tensors) #[(B, Wmax, slot_possibilities)*11], (B, Wmax, 11), (Wmax, B)

            losses = [cross_entropy_loss(batched_output_logits[0][active_windows_masks_for_each_word_pos.T], flat_pos_window_tensors)]
            for i in range(1, 11):
                losses.append(cross_entropy_loss(batched_output_logits[i][active_windows_masks_for_each_word_pos.T], flat_morph_tag_tensors[:, i-1]))
            loss = torch.stack(losses).mean()
            # loss = losses[0] #test only part-of-speech training
            validation_per_window_loss_values.append(loss)
            validation_per_window_tagslot_loss_values.append(torch.stack(losses)) #11
        mean_validation_per_batch_loss = torch.stack(validation_per_window_loss_values).mean().item()
        validation_average_per_epoch_loss_values.append(mean_validation_per_batch_loss)

        #print(validation_per_window_tagslot_loss_values)

        mean_validation_per_batch_tagslot_loss = torch.stack(validation_per_window_tagslot_loss_values, dim=0).mean(dim=0).detach().cpu()
        validation_per_epoch_tagslot_loss_values.append(mean_validation_per_batch_tagslot_loss)

        if epoch_no > 9:
          print(f"Epoch no. {epoch_no}\n    Training loss: {epoch_training_loss}\n    Validation loss: {mean_validation_per_batch_loss}")
          if mean_validation_per_batch_loss < best_validation_loss:
            torch.save(obj=network.state_dict(), f="lstm_decoder_tokeniser_2000_windowsize_96_best_checkpoint.pt")
            print(f"Saving model at epoch no. {epoch_no} because its validation loss was lower than the previous best validation-loss of {best_validation_loss}")
            best_validation_loss = mean_validation_per_batch_loss
    training_epochs.append(epoch_no)



# In[ ]:


network.train()

for param in network.transformer.parameters():
    param.requires_grad = False
for param in network.token_embedder.parameters():
    param.requires_grad = False
for param in network.positional_embedder.parameters():
    param.requires_grad = False

batches_count = batches_counts[-1]
for epoch_no in range(15, 30):
    train_data_loader_iter = iter(train_data_loader)
    network.train()
    network.transformer.eval()

    epoch_loss_values = []
    epoch_tagslot_loss_values = []
    for batch in train_data_loader_iter:
        tkn_wndw = batch['token_windows'].to(device)
        tkn_msks = batch['token_window_loss_masks'].to(device)
        tkn_lngths = batch['token_window_word_lengths'].to(device)
        lstm_wndws = batch['lstm_windows'].to(device)
        lstm_msks = batch['lstm_word_masks'].to(device)
        lstm_lngths = batch['lstm_word_lengths'].to(device)
        flat_pos_window_tensors = batch['pos_window_tensors'].to(device)
        flat_morph_tag_tensors = batch['morph_tag_window_tensors'].to(device)

        output_logits = network(tkn_wndw, tkn_msks, tkn_lngths, lstm_wndws, lstm_msks, lstm_lngths, flat_pos_window_tensors, flat_morph_tag_tensors)

        losses = [cross_entropy_loss(output_logits[0], flat_pos_window_tensors)]
        for i in range(1, 11):
            losses.append(cross_entropy_loss(output_logits[i], flat_morph_tag_tensors[:, i -1]))
        weighted_losses = losses.copy()
        weighted_losses[0] = 4*weighted_losses[0]
        loss = torch.stack(weighted_losses).mean()
        # loss = losses[0] #test only part-of-speech training
        adamw_optimiser.zero_grad()
        loss.backward()
        adamw_optimiser.step()

        actual_loss = torch.stack(losses).mean()
        training_loss_values.append(actual_loss.item())
        epoch_loss_values.append(actual_loss.detach())
        epoch_tagslot_loss_values.append(torch.stack(losses).detach())

        batches_counts.append(batches_count)
        batches_count += 1

    per_epoch_loss_values.append(torch.stack(epoch_loss_values).mean().item())
    per_epoch_tagslot_loss_values.append(torch.stack(epoch_tagslot_loss_values, dim=0).mean(dim=0).detach().cpu())

    # if len(per_epoch_loss_values) > 5 and per_epoch_loss_values[-1] < per_epoch_loss_values[-2]:
    #     torch.save(obj=network.state_dict(), f="MorphologyLSTMTransformerModel_bestcheckpoint.pt")

    network.eval()
    validation_dataloader_iter = iter(validation_data_loader)
    validation_per_window_loss_values = []
    validation_per_window_tagslot_loss_values = []
    for batch in validation_dataloader_iter:
        tkn_wndw = batch['token_windows'].to(device)
        tkn_msks = batch['token_window_loss_masks'].to(device)
        tkn_lngths = batch['token_window_word_lengths'].to(device)
        lstm_wndws = batch['lstm_windows'].to(device)
        lstm_msks = batch['lstm_word_masks'].to(device)
        lstm_lngths = batch['lstm_word_lengths'].to(device)
        flat_pos_window_tensors = batch['pos_window_tensors'].to(device)
        flat_morph_tag_tensors = batch['morph_tag_window_tensors'].to(device)

        lgts, idcs = network(tkn_wndw, tkn_msks, tkn_lngths, lstm_wndws, lstm_msks, lstm_lngths, flat_pos_window_tensors, flat_morph_tag_tensors)

        losses = [cross_entropy_loss(lgts[0], flat_pos_window_tensors)]
        for i in range(1, 11):
            losses.append(cross_entropy_loss(lgts[i], flat_morph_tag_tensors[:, i -1]))
        loss = torch.stack(losses).mean()
        # loss = losses[0] #test only part-of-speech training
        validation_per_window_loss_values.append(loss)
        validation_per_window_tagslot_loss_values.append(torch.stack(losses)) #11
    mean_validation_per_batch_loss = torch.stack(validation_per_window_loss_values).mean().item()
    validation_average_per_epoch_loss_values.append(mean_validation_per_batch_loss)

    #print(validation_per_window_tagslot_loss_values)

    mean_validation_per_batch_tagslot_loss = torch.stack(validation_per_window_tagslot_loss_values, dim=0).mean(dim=0).detach().cpu()
    validation_per_epoch_tagslot_loss_values.append(mean_validation_per_batch_tagslot_loss)

    training_epochs.append(epoch_no)



# In[ ]:


validation_per_epoch_tagslot_loss_values, validation_average_per_epoch_loss_values, per_epoch_loss_values, per_epoch_tagslot_loss_values


# In[ ]:





# In[ ]:


plt.plot(batches_counts, training_loss_values, label="training loss")
plt.ylabel("Loss")
plt.xlabel("batches processed")
plt.legend()
print(training_loss_values[batches_counts[-1]])
plt.show()


# In[ ]:


per_epoch_loss_values, per_epoch_tagslot_loss_values, validation_average_per_epoch_loss_values


# In[ ]:


plt.plot(training_epochs, validation_average_per_epoch_loss_values)


# In[ ]:


plt.plot(training_epochs, per_epoch_loss_values)


# In[ ]:


network.load_state_dict(torch.load("google_colab_40epochs.pt", map_location=device))


# In[ ]:


#torch.save(obj=network.state_dict(), f="MorphologyLSTMTransformerModel_15epochs_joint_15epochs_LSTM_only.pt")


# In[ ]:


network.eval()
validation_dataloader_iter = iter(validation_data_loader)


# In[ ]:


try:
    batch = next(validation_dataloader_iter)
except StopIteration:
    print("Reached end of dataset")
tkn_wndw = batch['token_windows'].to(device)
tkn_msks = batch['token_window_loss_masks'].to(device)
tkn_lngths = batch['token_window_word_lengths'].to(device)
lstm_wndws = batch['lstm_windows'].to(device)
lstm_msks = batch['lstm_word_masks'].to(device)
lstm_lngths = batch['lstm_word_lengths'].to(device)
lstm_wndws_num_wrds = batch['lstm_windows_num_words'].to(device)
flat_pos_window_tensors = batch['pos_window_tensors'].to(device)
flat_morph_tag_tensors = batch['morph_tag_window_tensors'].to(device)

with torch.inference_mode():
    batched_output_logits, batched_predicted_idcs, active_windows_masks_for_each_word_pos = network(tkn_wndw, tkn_msks, tkn_lngths, lstm_wndws, lstm_msks, lstm_lngths, lstm_wndws_num_wrds, flat_pos_window_tensors, flat_morph_tag_tensors) #[(B, Wmax, slot_possibilities)*11], (B, Wmax, 11), (Wmax, B)

losses = [cross_entropy_loss(batched_output_logits[0][active_windows_masks_for_each_word_pos.T], flat_pos_window_tensors)]
for i in range(1, 11):
    losses.append(cross_entropy_loss(batched_output_logits[i][active_windows_masks_for_each_word_pos.T], flat_morph_tag_tensors[:, i-1]))
loss = torch.stack(losses).mean()
print(loss)

idcs = batched_predicted_idcs[active_windows_masks_for_each_word_pos.T]


# In[ ]:


idcs.shape


# In[ ]:


lstm_wndws[lstm_msks][1]


stringifyLSTMWindowEntry(lstm_wndws[lstm_msks][2001])


# In[ ]:


lstm_wndws[lstm_msks].shape[0:2]


# In[ ]:


#stringifyPosTensor(flat_pos_window_tensors[1300:1400]), stringifyPosTensor(idcs[0][1300:1400])



for i in range(1100,1200):
    actual_pos = stringifyPosTensor(flat_pos_window_tensors[i:i+1])
    predicted_pos = stringifyPosTensor(idcs[i:i+1, 0])
    actual_morph_tag = stringifyMorphTagsTensor(flat_morph_tag_tensors[i:i+1])
    predicted_morph_tag = stringifyMorphTagsTensor(idcs[i:i+1, 1:])
    word = stringifyLSTMWindowEntry(lstm_wndws[lstm_msks][i])

    if actual_pos != predicted_pos:
        predicted_pos = Fore.RED+predicted_pos+Style.RESET_ALL
    if actual_morph_tag != predicted_morph_tag:
        predicted_morph_tag = Fore.RED+predicted_morph_tag+Style.RESET_ALL

    print(actual_pos, predicted_pos, actual_morph_tag, predicted_morph_tag, word)


# In[ ]:


#just crap to understand the loss-functions
loss = torch.nn.CrossEntropyLoss()
sft_mx = torch.nn.Softmax(dim=0)
inp = torch.tensor([-1.5, 1.4, 0.1, 3.2], requires_grad=True)
print(inp)
print(sft_mx(inp))
targ = torch.empty(1, dtype=torch.long).random_(4)
print(targ)
output = loss(inp, targ)
print(output)

