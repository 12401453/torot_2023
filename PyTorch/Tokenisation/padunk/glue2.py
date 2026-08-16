#!/usr/bin/env python
# coding: utf-8

# In[2]:


import torch
import bisect
import numpy as np
from numpy.dtypes import StringDType
import csv
from random import randrange
import subprocess
import mmap


# In[3]:


batch_size = 32


# In[4]:


def countLines (file_path) -> int:
  line_count = 0
  with open(file_path, "r") as python_filehandle:
    with mmap.mmap(python_filehandle.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_filehandle:
        while mmap_filehandle.readline():
            line_count += 1

  return line_count


# In[5]:


def retrieveSentence (sentence_idx, tokens_list, sentence_offsets) -> str:
    end_idx = len(tokens_list) if sentence_idx+1 == len(sentence_offsets) else sentence_offsets[sentence_idx+1]
    print(end_idx)
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[sentence_offsets[sentence_idx]:end_idx]).strip()


# In[6]:


def retrieveSubtext(subtext_idx, tokens_list, subtext_offsets) -> str:
    end_idx = len(tokens_list) if subtext_idx+1 == len(subtext_offsets) else subtext_offsets[subtext_idx+1]
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[subtext_offsets[subtext_idx]:end_idx]).strip()


# In[7]:


def retrieveSubtextBeginning(subtext_idx, tokens_list, subtext_offsets) -> str:
    end_idx = subtext_offsets[subtext_idx] + 15
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[subtext_offsets[subtext_idx]:end_idx]).strip()


# In[8]:


def stringifyTokensTensor(tokens_tensor, token_boundaries=False) -> str:
    token_separator = "" if token_boundaries == False else "|"
    return token_separator.join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_tensor.tolist()).strip()


# In[9]:


def sortedListFind(sorted_list, sought_after_value) -> int:
    'Locate the leftmost value exactly equal to x'
    i = bisect.bisect_left(sorted_list, sought_after_value)
    if i != len(sorted_list) and sorted_list[i] == sought_after_value:
        return i
    else:
        return -1


# In[10]:


def getWindowLossMask(subtext_idx, window_idx) -> tuple(torch.Tensor, int, int):
    token_offset_at_window_start = subtext_offsets[subtext_idx] + window_idx*32

    first_whole_word_idx = 0
    start_word_offset = 0
    for i in range(0, 32):
        start_word_offset = sortedListFind(word_offsets, token_offset_at_window_start+i)
        if start_word_offset != -1:
            first_whole_word_idx = i
            break
    last_whole_word_idx = 31
    for i in range(31, 64):
        idx_pos_in_word_offsets = sortedListFind(word_offsets, token_offset_at_window_start+i+1)
        if idx_pos_in_word_offsets != -1 or idx_pos_in_word_offsets == len(word_offsets):
            last_whole_word_idx = i
            break

    loss_mask = torch.zeros(64, dtype=torch.bool)
    loss_mask = subtext_windows[subtext_idx][window_idx] != 0 #sets padding token positions to False
    loss_mask[last_whole_word_idx + 1:] = False
    loss_mask[:first_whole_word_idx] = False

    #to account for cases where the window contains only non-initial subword tokens and padding
    if loss_mask.nonzero().size(0) == 0:
        return loss_mask, -1, -1

    post_final_word_token_offset = token_offset_at_window_start + loss_mask.nonzero()[-1].item() + 1
    end_word_offset = 0
    post_final_word_word_offset = sortedListFind(word_offsets, post_final_word_token_offset)
    if post_final_word_word_offset == -1:
        end_word_offset = len(word_offsets) - 1
    else:
        end_word_offset = post_final_word_word_offset - 1

    return loss_mask, start_word_offset, end_word_offset


# In[11]:


def getWindowWordLengths(start_word_offset, end_word_offset, padded=False, max_word_length=32):
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
        return torch.nn.functional.pad(torch.tensor(subtext_window_word_lengths, dtype=torch.int64), (0, max_word_length-len(subtext_window_word_lengths)), value=0) 
    else:
        return torch.tensor(subtext_window_word_lengths, dtype=torch.int64)


# In[12]:


def getTargetTagWindows(start_word_offset, end_word_offset, max_word_length=32):
    if start_word_offset == -1:
        return torch.tensor([-1], dtype=torch.int64).expand(max_word_length), torch.tensor([-1], dtype=torch.int64).expand(max_word_length).unsqueeze(1).expand(-1, 10)

    num_words_in_window = end_word_offset+1 - start_word_offset
    return pos_tensor[start_word_offset:end_word_offset+1], morph_tag_tensors[start_word_offset:end_word_offset+1] 


# In[13]:


def getCharLSTMInputWindow(token_window: torch.Tensor, loss_mask: torch.Tensor, start_word_offset: int, end_word_offset: int, max_word_length=32) -> (torch.Tensor, torch.Tensor, list):

    if start_word_offset == -1:
        return torch.zeros(32, 32, dtype=torch.int64), torch.zeros(32, dtype=torch.bool), []

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

    unpadded_char_lstm_window_tensor = torch.stack(char_lstm_window_word_tensors_list, dim=0)
    char_lstm_window_tensor = torch.nn.functional.pad(unpadded_char_lstm_window_tensor, (0, 0, 0, 32-unpadded_char_lstm_window_tensor.size(0)), value=0)
    lstm_word_mask = (char_lstm_window_tensor != 0).any(dim=1)

    return char_lstm_window_tensor, lstm_word_mask, word_lengths_list


# In[14]:


token_vocab_length = countLines("bpe_token_indices.csv")


# In[15]:


bpe_token_indices_file = open("bpe_token_indices.csv", "r")
tokenised_chu_words_training_file = open("tokenised_chu_words_training_deepcleaned.csv", "r")


# In[16]:


tokens_list = []
word_offsets = []
with mmap.mmap(tokenised_chu_words_training_file.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_tokens_file:
  word_token_count = 0
  for line in iter(mmap_tokens_file.readline, b""):
    word_offsets.append(word_token_count)
    for token_no in line.decode("utf-8").strip().split(",")[0].split(" "):
      tokens_list.append(int(token_no))
      word_token_count += 1


# In[82]:


pos_dict = {}
pos_dict_reversed = {}
for row in csv.DictReader(open("torot_pos.csv", "r"), delimiter="|"):
    pos_tag = row["pos_tag"]
    pos_tag_id = int(row["pos_tag_id"])
    pos_dict[pos_tag_id] = pos_tag
    pos_dict_reversed[pos_tag] = pos_tag_id


# In[83]:


morph_slots_dicts = []
morph_slots_reverse_dicts = []
for row in csv.DictReader(open("torot_morphtags.csv", "r"), delimiter="|"):
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


# In[84]:


len(word_offsets)


# In[85]:


sentence_offsets = []
subtext_offsets = []
text_offsets = []
row_no = 0
sentence_no_prev = 0
subtext_no_prev = 0
text_id_prev = 0
token_count = 0
training_data_wordcount = countLines("../../chu_words_tagged.csv") - 1
pos_tensor = torch.zeros(training_data_wordcount, dtype=torch.int64)
morph_tag_tensors = []
for row in csv.DictReader(open("../../chu_words_tagged.csv", "r"), delimiter="|"):
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


# In[86]:


pos_tensor.shape, morph_tag_tensors.shape


# In[87]:


len(tokens_list), len(word_offsets), len(sentence_offsets), len(subtext_offsets), len(text_offsets)


# In[88]:


tokens_dict = {}
tokens_dict_reversed = {}
char_dict = {}
char_dict_reversed = {}
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


# In[89]:


sentence_offsets_tensor = torch.tensor(sentence_offsets, dtype=torch.int64)
tensor_snt_lngths = torch.diff(sentence_offsets_tensor)
print("Max sentence length:", tensor_snt_lngths.max())
print("Median sentence length:", tensor_snt_lngths.median())


# In[90]:


tokens_tensor = torch.tensor(tokens_list, dtype=torch.int64)


# In[91]:


subtext_windows = []
flat_subtext_window_tensors = []

for i in range(len(subtext_offsets)):
    end_idx = len(tokens_list) if i+1 == len(subtext_offsets) else subtext_offsets[i+1]
    subtext_tokens = tokens_tensor[subtext_offsets[i]:end_idx]
    subtext_token_length = subtext_tokens.size(0)
    # leftover = subtext_token_length
    # window_length = 0
    subtext_chunks = []
    for j in range(0, subtext_token_length, 32):
        window_tokens = subtext_tokens[j:j+64]
        subtext_chunks.append(torch.nn.functional.pad(window_tokens, (0, 64-window_tokens.size(0)), value=0))
        flat_subtext_window_tensors.append(torch.nn.functional.pad(window_tokens, (0, 64-window_tokens.size(0)), value=0))       

    subtext_windows.append(torch.stack(subtext_chunks, dim=0))




flat_subtext_window_tensors = torch.stack(flat_subtext_window_tensors)

subtext_window_sizes = []
for subtext_tensors in subtext_windows:
    subtext_window_sizes.append(subtext_tensors.size(0))


# In[92]:


subtext_window_loss_masks = []
flat_token_loss_mask_tensors = []
flat_window_word_token_lengths = []
flat_window_word_token_lengths_padded_tensor = []
pos_window_tensors = []
morph_tag_window_tensors = []
for s in range(len(subtext_windows)):
    loss_mask_chunks = []
    for w in range(subtext_windows[s].size(0)):
        loss_mask, start_word_offset, end_word_offset = getWindowLossMask(s, w)
        loss_mask_chunks.append((loss_mask, start_word_offset, end_word_offset))
        flat_token_loss_mask_tensors.append(loss_mask)
        flat_window_word_token_lengths.append(getWindowWordLengths(start_word_offset, end_word_offset))
        flat_window_word_token_lengths_padded_tensor.append(getWindowWordLengths(start_word_offset, end_word_offset, padded=True))

        pos_window, morph_tag_window = getTargetTagWindows(start_word_offset, end_word_offset)
        pos_window_tensors.append(pos_window)
        morph_tag_window_tensors.append(morph_tag_window)
    subtext_window_loss_masks.append(loss_mask_chunks)
flat_token_loss_mask_tensors = torch.stack(flat_token_loss_mask_tensors)
flat_window_word_token_lengths_padded_tensor = torch.stack(flat_window_word_token_lengths_padded_tensor)


# In[93]:


lstm_windows = []
lstm_word_masks = []
lstm_word_lengths = []
flat_pos_window_tensors = []
flat_morph_tag_window_tensors = []
for s in range(len(subtext_windows)):
    for w in range(subtext_windows[s].size(0)):
        loss_mask, start_word_offset, end_word_offset = subtext_window_loss_masks[s][w]
        lstm_window, lstm_word_mask, lstm_window_word_lengths = getCharLSTMInputWindow(subtext_windows[s][w], loss_mask, start_word_offset, end_word_offset)
        lstm_windows.append(lstm_window)
        lstm_word_masks.append(lstm_word_mask)
        lstm_word_lengths.append(torch.tensor(lstm_window_word_lengths, dtype=torch.int64))

lstm_windows = torch.stack(lstm_windows)
lstm_word_masks = torch.stack(lstm_word_masks)


# In[94]:


#print(pos_window_tensors[:7])
for i in range(6700,6707):
    tnsr_str = "["
    for pos_id in pos_window_tensors[i].tolist():
        tnsr_str += pos_dict[pos_id] + ", "
    print(tnsr_str[:-2]+"]")
    print(stringifyTokensTensor(flat_subtext_window_tensors[i][flat_token_loss_mask_tensors[i]]))


# In[95]:


print(stringifyTokensTensor(flat_subtext_window_tensors[0]))


# In[96]:


class textWindowsDataset(torch.utils.data.Dataset):
    def __init__(self, token_windows, token_window_loss_masks, token_window_word_lengths, lstm_windows, lstm_word_masks, lstm_word_lengths, pos_window_tensors, morph_tag_window_tensors):
        self.token_windows = token_windows
        self.token_window_loss_masks = token_window_loss_masks
        self.token_window_word_lengths = token_window_word_lengths
        self.lstm_windows = lstm_windows
        self.lstm_word_masks = lstm_word_masks
        self.lstm_word_lengths = lstm_word_lengths
        self.pos_window_tensors = pos_window_tensors
        self.morph_tag_window_tensors = morph_tag_window_tensors

    def __len__(self):
        return len(self.token_windows)

    def __getitem__(self, idx):

        return {'token_windows': self.token_windows[idx], 'token_window_loss_masks': self.token_window_loss_masks[idx], 'token_window_word_lengths': self.token_window_word_lengths[idx], 'lstm_windows': self.lstm_windows[idx], 'lstm_word_masks': self.lstm_word_masks[idx], 'lstm_word_lengths': self.lstm_word_lengths[idx], 'pos_window_tensors': self.pos_window_tensors[idx], 'morph_tag_window_tensors': self.morph_tag_window_tensors[idx]}


# In[97]:


mydataset = textWindowsDataset(flat_subtext_window_tensors, flat_token_loss_mask_tensors, flat_window_word_token_lengths_padded_tensor, lstm_windows, lstm_word_masks, lstm_word_lengths, pos_window_tensors, morph_tag_window_tensors)
mydataset[3000]['pos_window_tensors'], mydataset[3000]['morph_tag_window_tensors'], stringifyTokensTensor(mydataset[3000]['token_windows']), stringifyTokensTensor(mydataset[3000]['token_windows'][mydataset[3000]['token_window_loss_masks']])


# In[155]:


class MorphologyLSTMTransformerModel(torch.nn.Module):
    def __init__(self, token_vocab_size=4539, token_embedding_dim=256, token_seq_length=64, attention_heads=4, trans_layers=4, char_vocab_size=38, char_embedding_dim=32, lstm_hidden_size=64, lstm_layers=1, tag_slots_num=11, tag_slot_embedding_dim=32):
        super().__init__()


        self.token_embedder = torch.nn.Embedding(num_embeddings=token_vocab_size, embedding_dim=token_embedding_dim, padding_idx=0)
        self.positional_embedder = torch.nn.Embedding(num_embeddings=token_seq_length, embedding_dim=token_embedding_dim)
        transformer_encoder_layer = torch.nn.TransformerEncoderLayer(d_model=token_embedding_dim, nhead=attention_heads, dim_feedforward=4*token_embedding_dim, batch_first=True)
        self.transformer = torch.nn.TransformerEncoder(transformer_encoder_layer, trans_layers)

        self.char_embedder = torch.nn.Embedding(num_embeddings=char_vocab_size, embedding_dim=char_embedding_dim, padding_idx=0)
        self.char_dropout = torch.nn.Dropout(0.1)
        self.lstm = torch.nn.LSTM(input_size=char_embedding_dim, hidden_size=lstm_hidden_size, num_layers=lstm_layers, batch_first=True, bidirectional=True)

        self.decoder_gru = torch.nn.GRU(input_size=token_embedding_dim+lstm_hidden_size*2+tag_slot_embedding_dim+16, hidden_size=128, batch_first=True)

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
        self.gru_START_embedding = self.start_embedding = torch.nn.Parameter(torch.randn(32))
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
        self.register_buffer("position_ids", torch.arange(token_seq_length).unsqueeze_(0))
        self.register_buffer("gru_slot_ids", torch.arange(11).unsqueeze_(0))
        self.register_buffer("word_offsets", torch.tensor(word_offsets))

    def poolWordTokens(self, token_windows, token_windows_loss_masks, token_windows_word_lengths):

        B, W, H = token_windows.shape
        L = W//2 #L is the char lstm's max words per window, which is always half of the transformer's token-window size

        flattened_selected_word_tokens = token_windows[token_windows_loss_masks]
        flattened_unpadded_lengths = token_windows_word_lengths[token_windows_word_lengths > 0]

        flattened_pooled_tokens = torch.segment_reduce(flattened_selected_word_tokens, 'mean', lengths=flattened_unpadded_lengths)

        word_counts_per_window = (token_windows_word_lengths > 0).sum(dim=1)

        rebuilt_pooled_windows = token_windows.new_zeros(B, L, H) #new_zeros() just inherits properties like device from the tensor you call it on; it still creates a new tensor and doesn't modify token_windows

        row_idx = torch.arange(B, device=token_windows.device).unsqueeze(1).expand(-1, L)
        col_idx = torch.arange(L, device=token_windows.device).unsqueeze(0).expand(B, -1)

        keep = col_idx < word_counts_per_window.unsqueeze(1) #returns a boolean mask of shape (B, L) that for each row has as many Trues as are in the corresponding entry of word_counts_per_window, with the rest being False

        rebuilt_pooled_windows[row_idx[keep], col_idx[keep]] = flattened_pooled_tokens

        return rebuilt_pooled_windows
    def poolWordTokensKeepFlat(self, token_windows, token_windows_loss_masks, token_windows_word_lengths):

        B, W, H = token_windows.shape
        L = W//2 #L is the char lstm's max words per window, which is always half of the transformer's token-window size

        flattened_selected_word_tokens = token_windows[token_windows_loss_masks]
        flattened_unpadded_lengths = token_windows_word_lengths[token_windows_word_lengths > 0]

        flattened_pooled_tokens = torch.segment_reduce(flattened_selected_word_tokens, 'mean', lengths=flattened_unpadded_lengths)

        return flattened_pooled_tokens

    def forward(self, token_windows, token_windows_loss_masks, token_windows_word_lengths, lstm_windows, lstm_word_masks, lstm_word_lengths, pos_window_tensors, morph_tag_window_tensors) -> torch.Tensor:
        ### TRANSFORMER ###
        token_embeddings = self.token_embedder(token_windows)
        positional_embeddings = self.positional_embedder(self.position_ids.expand(token_embeddings.size(0), -1))
        padding_mask = (token_windows == 0)

        token_states = self.transformer(token_embeddings + positional_embeddings, src_key_padding_mask=padding_mask)
        word_pooled_token_states = self.poolWordTokensKeepFlat(token_states, token_windows_loss_masks, token_windows_word_lengths)

        ### LSTM ###
        B, W, L = lstm_windows.shape
        flat_lstm_windows = lstm_windows.reshape(B*W, L)
        flat_lstm_word_masks = lstm_word_masks.reshape(B*W)
        flat_unwordpadded_lstm_windows = flat_lstm_windows[flat_lstm_word_masks]

        lstm_char_embeddings = self.char_dropout(self.char_embedder(flat_unwordpadded_lstm_windows))
        packed_char_embeddings = torch.nn.utils.rnn.pack_padded_sequence(lstm_char_embeddings, torch.cat(lstm_word_lengths), batch_first=True, enforce_sorted=False)

        packed_output, (h_n, c_n) = self.lstm(packed_char_embeddings)
        flat_unpadded_word_vectors = torch.cat([h_n[0], h_n[1]], dim=1)

        #flat_padded_word_vectors = flat_unpadded_word_vectors.new_zeros(B*W, self.lstm_hidden_size*2)
        #flat_padded_word_vectors[flat_lstm_word_masks] = flat_unpadded_word_vectors

        #final_lstm_word_vectors = flat_padded_word_vectors.reshape(B, W, self.lstm_hidden_size*2)

        #combined_final_word_vectors = torch.cat([word_pooled_token_states, final_lstm_word_vectors], dim=-1)
        combined_final_word_vectors = torch.cat([word_pooled_token_states, flat_unpadded_word_vectors], dim=-1)

        ### GRU DECODER ###
        N = combined_final_word_vectors.shape[0]
        flat_word_vectors_gru_expanded = combined_final_word_vectors.unsqueeze(1).expand(-1, 11, -1)
        slot_embeddings = self.gru_slot_positional_embedder(self.gru_slot_ids.expand(N, -1))
        gru_START_embedding = self.gru_START_embedding.unsqueeze(0).expand(N, -1)

        flat_pos_window_tensors = torch.cat(pos_window_tensors)
        flat_pos_morph_tag_tensors = torch.cat(morph_tag_window_tensors, dim=0)
        prev_tag_embeddings = [gru_START_embedding.unsqueeze(1), self.gru_tag_slot_embedders[0](flat_pos_window_tensors).unsqueeze(1)]
        for i in range(1, 10):
            prev_tag_embeddings.append(self.gru_tag_slot_embedders[i](flat_pos_morph_tag_tensors[:, i-1]).unsqueeze(1))
            #print(self.gru_tag_slot_embedders[i], flat_pos_morph_tag_tensors[:, i])

        prev_tag_embeddings = torch.cat(prev_tag_embeddings, dim=1)
        print(flat_word_vectors_gru_expanded.shape, prev_tag_embeddings.shape, slot_embeddings.shape)

        gru_input = torch.cat([flat_word_vectors_gru_expanded, prev_tag_embeddings, slot_embeddings], dim=2)

        gru_output, h_n = self.decoder_gru(gru_input)

        tag_logits = []
        for j in range(11):
            tag_logits.append(self.gru_classifier_heads[j](gru_output[:, j, :]))

        return tag_logits


# In[156]:


dta = mydataset[0:32]
tkn_wndw = dta['token_windows']
tkn_msks = dta['token_window_loss_masks']
tkn_lngths = dta['token_window_word_lengths']
lstm_wndws = dta['lstm_windows']
lstm_msks = dta['lstm_word_masks']
lstm_lngths = dta['lstm_word_lengths']
poses = dta['pos_window_tensors']
window_morph_tags = dta['morph_tag_window_tensors']

network = MorphologyLSTMTransformerModel()

output = network(tkn_wndw, tkn_msks, tkn_lngths, lstm_wndws, lstm_msks, lstm_lngths, poses, window_morph_tags)




# In[160]:


output[10]


# In[36]:


def poolWorkTokenVectors(token_window: torch.Tensor, loss_mask: torch.Tensor, start_word_offset: int, end_word_offset: int) -> torch.Tensor:

    word_tokens_tensor = token_window[loss_mask]
    #word_tokens_tensor = token_window[loss_mask].float()

    pooled_tensors_list = []
    #deliberately leave off the last word so we can deal with the possibility of it being the last ever word in the set
    i = start_word_offset
    j = start_word_offset
    for i in range(start_word_offset, end_word_offset):
        word_token_length = word_offsets[i + 1] - word_offsets[i]
        start_idx = j - start_word_offset
        one_past_end_idx = start_idx + word_token_length
        pooled_tensor = word_tokens_tensor[start_idx:one_past_end_idx].mean(dim=0)
        #print(start_idx, one_past_end_idx)
        pooled_tensors_list.append(pooled_tensor)
        j += word_token_length

    final_word_token_length = 1
    if len(word_offsets) - 1 == end_word_offset:
        final_word_token_length = len(tokens_list) - word_offsets[end_word_offset]
    else:
        final_word_token_length = word_offsets[end_word_offset + 1] - word_offsets[end_word_offset]
    final_start_idx = j - start_word_offset
    final_one_past_end_idx = final_start_idx + final_word_token_length
    #print(final_start_idx, final_one_past_end_idx)
    final_pooled_tensor = word_tokens_tensor[final_start_idx:final_one_past_end_idx].mean(dim=0)
    pooled_tensors_list.append(final_pooled_tensor)

    pooled_window_tensors = torch.stack(pooled_tensors_list, dim=0)
    return torch.nn.functional.pad(pooled_window_tensors, (0, 0, 0, 32-pooled_window_tensors.size(0)), value=0)
    #return torch.nn.functional.pad(pooled_window_tensors, (0, 32-pooled_window_tensors.size(0)), value=0)


