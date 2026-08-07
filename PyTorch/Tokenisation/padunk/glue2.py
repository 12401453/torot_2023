#!/usr/bin/env python
# coding: utf-8

# In[452]:


import torch
import bisect
import numpy as np
from numpy.dtypes import StringDType
import csv
from random import randrange
import subprocess
import mmap


# In[453]:


def countLines (file_path) -> int:
  line_count = 0
  with open(file_path, "r") as python_filehandle:
    with mmap.mmap(python_filehandle.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_filehandle:
        while mmap_filehandle.readline():
            line_count += 1

  return line_count


# In[454]:


def retrieveSentence (sentence_idx, tokens_list, sentence_offsets) -> str:
    end_idx = len(tokens_list) if sentence_idx+1 == len(sentence_offsets) else sentence_offsets[sentence_idx+1]
    print(end_idx)
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[sentence_offsets[sentence_idx]:end_idx]).strip()


# In[455]:


def retrieveSubtext(subtext_idx, tokens_list, subtext_offsets) -> str:
    end_idx = len(tokens_list) if subtext_idx+1 == len(subtext_offsets) else subtext_offsets[subtext_idx+1]
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[subtext_offsets[subtext_idx]:end_idx]).strip()


# In[456]:


def retrieveSubtextBeginning(subtext_idx, tokens_list, subtext_offsets) -> str:
    end_idx = subtext_offsets[subtext_idx] + 15
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[subtext_offsets[subtext_idx]:end_idx]).strip()


# In[457]:


def stringifyTokensTensor(tokens_tensor, token_boundaries=False) -> str:
    token_separator = "" if token_boundaries == False else "|"
    return token_separator.join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_tensor.tolist()).strip()


# In[458]:


def sortedListFind(sorted_list, sought_after_value) -> int:
    'Locate the leftmost value exactly equal to x'
    i = bisect.bisect_left(sorted_list, sought_after_value)
    if i != len(sorted_list) and sorted_list[i] == sought_after_value:
        return i
    else:
        return -1


# In[828]:


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


# In[903]:


batch_size = 32


# In[880]:


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


# In[459]:


token_vocab_length = countLines("bpe_token_indices.csv")


# In[460]:


bpe_token_indices_file = open("bpe_token_indices.csv", "r")
tokenised_chu_words_training_file = open("tokenised_chu_words_training_deepcleaned.csv", "r")


# In[461]:


tokens_list = []
word_offsets = []
with mmap.mmap(tokenised_chu_words_training_file.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_tokens_file:
  word_token_count = 0
  for line in iter(mmap_tokens_file.readline, b""):
    word_offsets.append(word_token_count)
    for token_no in line.decode("utf-8").strip().split(",")[0].split(" "):
      tokens_list.append(int(token_no))
      word_token_count += 1


# In[463]:


sentence_offsets = []
subtext_offsets = []
text_offsets = []
row_no = 0
sentence_no_prev = 0
subtext_no_prev = 0
text_id_prev = 0
token_count = 0
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
    row_no += 1


# In[464]:


len(tokens_list), len(word_offsets), len(sentence_offsets), len(subtext_offsets), len(text_offsets)


# In[698]:


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


# In[824]:


sentence_offsets_tensor = torch.tensor(sentence_offsets, dtype=torch.int64)
tensor_snt_lngths = torch.diff(sentence_offsets_tensor)
print("Max sentence length:", tensor_snt_lngths.max())
print("Median sentence length:", tensor_snt_lngths.median())


# In[470]:


tokens_tensor = torch.tensor(tokens_list, dtype=torch.int64)


# In[902]:


subtext_windows = []
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
    subtext_windows.append(torch.stack(subtext_chunks, dim=0))

subtext_window_sizes = []
for subtext_tensors in subtext_windows:
    subtext_window_sizes.append(subtext_tensors.size(0))


# In[900]:


subtext_window_loss_masks = []
for s in range(len(subtext_windows)):
    loss_mask_chunks = []
    for w in range(subtext_windows[s].size(0)):
        loss_mask, start_word_offset, end_word_offset = getWindowLossMask(s, w)
        loss_mask_chunks.append((loss_mask, start_word_offset, end_word_offset))
        #print(f"s: {s}, w: {w}, start_word_offset: {start_word_offset}, end_word_offset: {end_word_offset}")
    subtext_window_loss_masks.append(loss_mask_chunks)


# In[901]:


char_lstm_window_tuples = []
for s in range(len(subtext_windows)):
    subtext_char_lstm_window_tuples = []
    for w in range(subtext_windows[s].size(0)):
        loss_mask, start_word_offset, end_word_offset = subtext_window_loss_masks[s][w]
        subtext_char_lstm_window_tuples.append(getCharLSTMInputWindow(subtext_windows[s][w], loss_mask, start_word_offset, end_word_offset))
    char_lstm_window_tuples.append(subtext_char_lstm_window_tuples)


# In[899]:


char_lstm_window_tuples[20][17]


# In[830]:


subtext_windows[20][17], stringifyTokensTensor(subtext_windows[20][17]), subtext_window_loss_masks[20][17]


# In[696]:


class MorphologyLSTMTransformerModel(torch.nn.Module):
    def __init__(self, token_vocab_size=4539, token_embedding_dim=256, token_seq_length=64, attention_heads=4, trans_layers=4, char_vocab_size=38, char_embedding_dim=32, lstm_hidden_size=64, lstm_layers=1):
        super().__init__()


        self.token_embedder = torch.nn.Embedding(num_embeddings=token_vocab_size, embedding_dim=token_embedding_dim, padding_idx=0)
        self.positional_embedder = torch.nn.Embedding(num_embeddings=token_seq_length, embedding_dim=token_embedding_dim)
        transformer_encoder_layer = torch.nn.TransformerEncoderLayer(d_model=token_embedding_dim, nhead=attention_heads, dim_feedforward=4*token_embedding_dim, batch_first=True)
        self.transformer = torch.nn.TransformerEncoder(transformer_encoder_layer, trans_layers)

        self.char_embedder = torch.nn.Embedding(num_embeddings=char_vocab_size, embedding_dim=char_embedding_dim)
        self.char_dropout = torch.nn.Dropout(0.1)
        self.lstm = torch.nn.LSTM(input_size=char_embedding_dim, hidden_size=lstm_hidden_size, num_layers=lstm_layers, batch_first=True, bidirectional=True)

        self.register_buffer("position_ids", torch.arange(token_seq_length).unsqueeze_(0))
        self.register_buffer("word_offsets", torch.tensor(word_offsets))

    def poolWorkTokenVectors(self, token_window: torch.Tensor, loss_mask: torch.Tensor, start_word_offset: int, end_word_offset: int) -> torch.Tensor:

        word_tokens_tensor = token_window[loss_mask]

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

        final_pooled_tensor = word_tokens_tensor[final_start_idx:final_one_past_end_idx].mean(dim=0)
        pooled_tensors_list.append(final_pooled_tensor)

        pooled_window_tensors = torch.stack(pooled_tensors_list, dim=0)
        return torch.nn.functional.pad(pooled_window_tensors, (0, 0, 0, 32-pooled_window_tensors.size(0)), value=0)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        token_embeddings = self.token_embedder(x)
        positional_embeddings = self.positional_embedder(self.position_ids.expand(token_embeddings.size(0), -1))
        padding_mask = (x == 0)

        token_states = self.transformer(token_embeddings + positional_embeddings, src_key_padding_mask=padding_mask)

        #transformer_loss_mask, start_word_offset, end_word_offset = subtext_window_loss_masks[s][w]

        #word_pooled_states = [self.poolWorkTokenVectors(x)
        return token_states


# In[ ]:





# In[768]:


torch.zeros(32, 32, dtype=torch.int64)


# In[ ]:





# In[882]:


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



# In[831]:


s = randrange(0, 407)
# s = 406
w = randrange(0, subtext_windows[s].size(0))

print(f"s: {s}, w: {w}")

token_offset_at_window_start = subtext_offsets[s] + w*32


loss_mask, start_word_offset, end_word_offset = getWindowLossMask(s, w)
first, last = loss_mask.nonzero()[0].item(), loss_mask.nonzero()[-1].item()
print(token_offset_at_window_start, tokens_dict[tokens_list[token_offset_at_window_start+first]], tokens_dict[tokens_list[token_offset_at_window_start+last]])
print(stringifyTokensTensor(subtext_windows[s][w], token_boundaries=True))
print(first, last)
print(loss_mask)

print(start_word_offset, end_word_offset)
print(tokens_dict[tokens_list[word_offsets[start_word_offset]]], tokens_dict[tokens_list[word_offsets[end_word_offset]]])

random_window = subtext_windows[s][w]

# subtext_offsets[x], tokens_list[subtext_offsets[x]]


# In[887]:


network = MorphologyLSTMTransformerModel()
win = subtext_windows[406][7]
output = network(win.unsqueeze(dim=0))
loss_mask, start_word_offset, end_word_offset = getWindowLossMask(406, 7)
output.shape, stringifyTokensTensor(win)


# In[889]:


word_pooled_output_tensor = poolWorkTokenVectors(output[0], loss_mask, start_word_offset, end_word_offset)
#word_pooled_raw_indices = poolWorkTokenVectors(random_window, loss_mask, start_word_offset, end_word_offset)
#print(word_pooled_raw_indices)
print(word_pooled_output_tensor.shape)
print(word_pooled_output_tensor[:10])


# In[890]:


test_window = subtext_windows[12][1]
loss_mask, start_word_offset, end_word_offset = getWindowLossMask(12, 1)
char_lstm_window, lstm_word_mask, word_lengths_list = getCharLSTMInputWindow(test_window, loss_mask, start_word_offset, end_word_offset)


# In[891]:


char_lstm_window.shape, stringifyTokensTensor(test_window[loss_mask]), char_lstm_window, lstm_word_mask, word_lengths_list


# In[839]:


char_lstm_window[lstm_word_mask]

