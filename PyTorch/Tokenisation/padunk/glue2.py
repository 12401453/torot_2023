#!/usr/bin/env python
# coding: utf-8

# In[372]:


import torch
import numpy as np
from numpy.dtypes import StringDType
import csv
from random import randrange
import subprocess
import mmap


# In[373]:


def countLines (file_path) -> int:
  line_count = 0
  with open(file_path, "r") as python_filehandle:
    with mmap.mmap(python_filehandle.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_filehandle:
        while mmap_filehandle.readline():
            line_count += 1

  return line_count


# In[374]:


def retrieveSentence (sentence_idx, tokens_list, sentence_offsets) -> str:
    end_idx = len(tokens_list) if sentence_idx+1 == len(sentence_offsets) else sentence_offsets[sentence_idx+1]
    print(end_idx)
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[sentence_offsets[sentence_idx]:end_idx]).strip()


# In[375]:


def retrieveSubtext(subtext_idx, tokens_list, subtext_offsets) -> str:
    end_idx = len(tokens_list) if subtext_idx+1 == len(subtext_offsets) else subtext_offsets[subtext_idx+1]
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[subtext_offsets[subtext_idx]:end_idx]).strip()


# In[376]:


def retrieveSubtextBeginning(subtext_idx, tokens_list, subtext_offsets) -> str:
    end_idx = subtext_offsets[subtext_idx] + 15
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_list[subtext_offsets[subtext_idx]:end_idx]).strip()


# In[377]:


def stringifyTokensTensor(tokens_tensor) -> str:
    return "".join(tokens_dict[tokno].replace("<wb>", " ") for tokno in tokens_tensor.tolist()).strip()


# In[378]:


token_vocab_length = countLines("bpe_token_indices.csv")


# In[379]:


bpe_token_indices_file = open("bpe_token_indices.csv", "r")
tokenised_chu_words_training_file = open("tokenised_chu_words_training_deepcleaned.csv", "r")


# In[380]:


tokens_list = []
word_offsets = []
with mmap.mmap(tokenised_chu_words_training_file.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_tokens_file:
  word_token_count = 0
  for line in iter(mmap_tokens_file.readline, b""):
    word_offsets.append(word_token_count)
    for token_no in line.decode("utf-8").strip().split(",")[0].split(" "):
      tokens_list.append(int(token_no))
      word_token_count += 1


# In[381]:


tokens_tensor = torch.tensor(tokens_list, dtype=torch.float32)


# In[382]:


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


# In[383]:


len(tokens_list), len(word_offsets), len(sentence_offsets), len(subtext_offsets), len(text_offsets)


# In[384]:


tokens_dict = {}
tokens_dict_reversed = {}
with mmap.mmap(bpe_token_indices_file.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_bpe_file:
    for bin_line in iter(mmap_bpe_file.readline, b""):
        line = bin_line.decode("utf-8").strip()
        split_line = line.split(",")
        tokens_dict[int(split_line[0])] = split_line[1].strip()
        tokens_dict_reversed[split_line[1]] = int(split_line[0])


# In[385]:


retrieveSentence(27239, tokens_list, sentence_offsets)


# In[386]:


tokens_list[0:10], word_offsets[0:10], sentence_offsets[0:10]


# In[387]:


sentence_offsets_tensor = torch.tensor(sentence_offsets, dtype=torch.int64)
tensor_snt_lngths = torch.diff(sentence_offsets_tensor)
print("Max sentence length:", tensor_snt_lngths.max())
print("Median sentence length:", tensor_snt_lngths.median())
tensor_snt_lngths[3299] = 0
tensor_snt_lngths[14044] = 0
tensor_snt_lngths[21318] = 0
print(tensor_snt_lngths.max())


# In[388]:


tensor_snt_lngths = torch.diff(sentence_offsets_tensor)
for i in range(len(tensor_snt_lngths)):
    if tensor_snt_lngths[i] == 167:
        print(i)


# In[389]:


tokens_tensor = torch.tensor(tokens_list, dtype=torch.int64)


# In[390]:


subtext_offsets[0:2]


# In[391]:


token_embedder = torch.nn.Embedding(num_embeddings=4539, embedding_dim=256, padding_idx=0)
positional_embedder = torch.nn.Embedding(num_embeddings=64, embedding_dim=256)


# In[392]:


position_embeddings = positional_embedder(torch.tensor(range(64)))


# In[393]:


for i in range(0, 9, 4):
    print(i)


# In[394]:


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


# In[395]:


subtext_windows[1][1], stringifyTokensTensor(subtext_windows[1][1])


# In[400]:


print(retrieveSubtext(1, tokens_list, subtext_offsets))


# In[397]:


subtext_windows[405][5], stringifyTokensTensor(subtext_windows[405][5])


# In[398]:


transformer_encoder = torch.nn.TransformerEncoderLayer(d_model=256, nhead=8)
print(transformer_encoder)

