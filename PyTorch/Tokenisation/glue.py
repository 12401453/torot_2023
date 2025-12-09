#!/usr/bin/python

#import torch
import numpy as np
from numpy.dtypes import StringDType
import csv
import subprocess

#print(torch.accelerator.is_available())

#subprocess.run(["./bpe", "chu_corpus_words_bpe_training.csv", "50"])

bpe_token_indices_file = open("bpe_token_indices.csv", "r")
tokenised_chu_words_training_file = open("tokenised_chu_words_training_deepcleaned.csv", "r")

token_vocab_list = []
for line in bpe_token_indices_file.readlines():
    token_vocab_list.append(line.split(",")[1].strip())
token_vocab = tuple(token_vocab_list)

words_tokens_list = []
for line in tokenised_chu_words_training_file.readlines():
    token_idxs = line.split(",")[0].split(" ")
    words_tokens_list.append(token_idxs)


sentence_tokens_list = []
sentence_no_prev = 0
i = 0
for row in csv.DictReader(open("../chu_words_tagged.csv", "r"), delimiter="|"):
    sentence_no = row["sentence_no"]
    if sentence_no != sentence_no_prev:
        sentence_tokens_list[i] = []
    sentence_tokens_list[i].append(words_tokens_list)