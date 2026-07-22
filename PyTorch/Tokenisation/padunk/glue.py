#!/usr/bin/python

#import torch
import numpy as np
from numpy.dtypes import StringDType
import csv
import subprocess

#print(torch.accelerator.is_available())

#subprocess.run(["./bpe", "chu_corpus_words_bpe_training.csv", "5000"])

bpe_token_indices_file = open("bpe_token_indices_padunk.csv", "r")
tokenised_chu_words_training_file = open("tokenised_chu_words_training_deepcleaned.csv", "r")

token_vocab_list = []
for line in bpe_token_indices_file.readlines():
    token_vocab_list.append(line.split(",")[1].strip())
token_vocab = tuple(token_vocab_list)

token_vocab_dict = {token: i for (i, token) in enumerate(token_vocab_list)}

words_tokens_list = []
for line in tokenised_chu_words_training_file.readlines():
    token_idxs = list(map(int, line.split(",")[0].split(" ")))
    words_tokens_list.append(token_idxs)

my_idx = 140000
# print(words_tokens_list[my_idx])
# word_str = "".join(token_vocab_list[i] for i in words_tokens_list[my_idx])
# print(word_str)

sentence_tokens_list = [[]]
sentence_no_prev = 0
i, j = 0, 0
for row in csv.DictReader(open("../../chu_words_tagged.csv", "r"), delimiter="|"):
    
    sentence_no = int(row["sentence_no"])
    if sentence_no != sentence_no_prev:
        sentence_tokens_list.append([])
        j = j + 1
        sentence_no_prev = sentence_no
    for tokno in words_tokens_list[i]:
        sentence_tokens_list[j].append(tokno)
    i = i + 1


print(sentence_tokens_list[3])
sentence = " ".join(token_vocab_list[tokno] for tokno in sentence_tokens_list[3])
# for tokno in sentence_tokens_list[3]:
#     sentence += token_vocab_list[tokno]
print(sentence)