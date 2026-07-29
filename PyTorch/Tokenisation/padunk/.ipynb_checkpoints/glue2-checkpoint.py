#!/usr/bin/python

import torch
import numpy as np
from numpy.dtypes import StringDType
import csv
from random import randrange
import subprocess
import mmap

def countLines (file_path) -> int:
  line_count = 0
  with open(file_path, "r") as python_filehandle:
    with mmap.mmap(python_filehandle.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_filehandle:
        while mmap_filehandle.readline():
            line_count += 1

  return line_count
#print(torch.accelerator.is_available())

num_training_words = countLines("tokenised_chu_words_training_deepcleaned.csv")
token_vocab_length = countLines("bpe_token_indices.csv")
print(num_training_words)
print(token_vocab_length)


#subprocess.run(["./bpe", "chu_corpus_words_bpe_training.csv", "5000"])

bpe_token_indices_file = open("bpe_token_indices.csv", "r")
tokenised_chu_words_training_file = open("tokenised_chu_words_training_deepcleaned.csv", "r")

tokens_list = []
words_token_length = []
with mmap.mmap(tokenised_chu_words_training_file.fileno(), length=0, access=mmap.ACCESS_READ) as mmap_tokens_file:
  for line in iter(mmap_tokens_file.readline, b""):
    word_token_count = 0
    for token_no in line.decode("utf-8").strip().split(",")[0].split(" "):
      tokens_list.append(int(token_no))
      word_token_count += 1
    words_token_length.append(word_token_count)

tokens_tensor = torch.tensor(tokens_list, dtype=torch.float32)

print(tokens_tensor)
print(words_token_length)

bpe_token_indices_file.close()
tokenised_chu_words_training_file.close()


#tokens_tensor = torch.tensor()

#np_sentences = np.array(sentence_tokens_list, dtype=np.float32)

# sentence = "".join(" ".join(token_vocab_list[tokno] for tokno in sentence_tokens_list[3]))
# print(sentence)