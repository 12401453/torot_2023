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


# In[462]:


tokens_tensor = torch.tensor(tokens_list, dtype=torch.float32)


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


# In[465]:


tokens_dict = {}
tokens_dict_reversed = {}
with mmap.mmap(bpe_token_indices_file.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_bpe_file:
    for bin_line in iter(mmap_bpe_file.readline, b""):
        line = bin_line.decode("utf-8").strip()
        split_line = line.split(",")
        tokens_dict[int(split_line[0])] = split_line[1].strip()
        tokens_dict_reversed[split_line[1]] = int(split_line[0])


# In[466]:


retrieveSentence(27239, tokens_list, sentence_offsets)


# In[467]:


tokens_list[0:10], word_offsets[0:10], sentence_offsets[0:10]


# In[468]:


sentence_offsets_tensor = torch.tensor(sentence_offsets, dtype=torch.int64)
tensor_snt_lngths = torch.diff(sentence_offsets_tensor)
print("Max sentence length:", tensor_snt_lngths.max())
print("Median sentence length:", tensor_snt_lngths.median())
tensor_snt_lngths[3299] = 0
tensor_snt_lngths[14044] = 0
tensor_snt_lngths[21318] = 0
print(tensor_snt_lngths.max())


# In[469]:


tensor_snt_lngths = torch.diff(sentence_offsets_tensor)
for i in range(len(tensor_snt_lngths)):
    if tensor_snt_lngths[i] == 167:
        print(i)


# In[470]:


tokens_tensor = torch.tensor(tokens_list, dtype=torch.int64)


# In[471]:


subtext_offsets[0:2]


# In[472]:


token_embedder = torch.nn.Embedding(num_embeddings=4539, embedding_dim=256, padding_idx=0)
positional_embedder = torch.nn.Embedding(num_embeddings=64, embedding_dim=256)


# In[473]:


position_embeddings = positional_embedder(torch.tensor(range(64)))


# In[474]:


for i in range(0, 9, 4):
    print(i)


# In[475]:


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


# In[476]:


subtext_windows[1][1], stringifyTokensTensor(subtext_windows[1][1])


# In[477]:


stringifyTokensTensor(subtext_windows[20][17])


# In[478]:


retrieveSubtext(20, tokens_list, subtext_offsets)


# In[479]:


class MorphologyLSTMTransformerModel(torch.nn.Module):
    def __init__(self, token_vocab_size=4539, token_embedding_dim=256, token_seq_length=64, attention_heads=4, trans_layers=4):
        super().__init__()

        transformer_encoder_layer = torch.nn.TransformerEncoderLayer(d_model=token_embedding_dim, nhead=attention_heads, dim_feedforward=4*token_embedding_dim, batch_first=True)

        self.token_embedder = torch.nn.Embedding(num_embeddings=token_vocab_size, embedding_dim=token_embedding_dim, padding_idx=0)
        self.positional_embedder = torch.nn.Embedding(num_embeddings=token_seq_length, embedding_dim=token_embedding_dim)
        self.transformer = torch.nn.TransformerEncoder(transformer_encoder_layer, trans_layers)

        self.register_buffer("position_ids", torch.arange(token_seq_length).unsqueeze_(0))
        self.register_buffer("word_offsets", torch.tensor(word_offsets))

    def word_pooling(self, transformer_output) -> torch.Tensor:
        print(self.word_offsets)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        token_embeddings = self.token_embedder(x)
        positional_embeddings = self.positional_embedder(self.position_ids.expand(token_embeddings.size(0), -1))
        padding_mask = (x == 0)

        return self.transformer(token_embeddings + positional_embeddings, src_key_padding_mask=padding_mask)


# In[516]:


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

    post_final_word_token_offset = token_offset_at_window_start + loss_mask.nonzero()[-1].item() + 1
    end_word_offset = 0
    post_final_word_word_offset = sortedListFind(word_offsets, post_final_word_token_offset)
    if post_final_word_word_offset == -1:
        end_word_offset = len(word_offsets) - 1
    else:
        end_word_offset = post_final_word_word_offset - 1

    return loss_mask, start_word_offset, end_word_offset


# In[690]:


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
    if len(word_offsets) == end_word_offset:
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



# In[691]:


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


# In[692]:


network = MorphologyLSTMTransformerModel()
output = network(subtext_windows[232][1].unsqueeze_(dim=0))
output.shape


# In[693]:


random_window, random_window[loss_mask], word_offsets[start_word_offset+1], word_offsets[end_word_offset+1]


# In[694]:


word_pooled_output_tensor = poolWorkTokenVectors(output[0], loss_mask, start_word_offset, end_word_offset)
#word_pooled_raw_indices = poolWorkTokenVectors(random_window, loss_mask, start_word_offset, end_word_offset)
#print(word_pooled_raw_indices)


# In[695]:


print(word_pooled_output_tensor != 0)
print(word_pooled_output_tensor)

