#!/usr/bin/python

#import torch
#import numpy as np
from numpy.dtypes import StringDType
import csv
from random import randrange
import subprocess

#print(torch.accelerator.is_available())

#subprocess.run(["./bpe", "chu_corpus_words_bpe_training.csv", "5000"])

bpe_token_indices_file = open("bpe_token_indices.csv", "r")
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

my_idx = randrange(27000)

sentence_tokens_list = [[]]
sentence_token_word_key = [[]]
sentence_no_prev = 0
i, j = 0, 0
for row in csv.DictReader(open("../../chu_words_tagged.csv", "r"), delimiter="|"):
    
    sentence_no = int(row["sentence_no"])
    if sentence_no != sentence_no_prev:
        sentence_tokens_list.append([])
        sentence_token_word_key.append([])
        j = j + 1
        sentence_no_prev = sentence_no
    
    #sentence_tokens_list[j].append(words_tokens_list[i]) #numpy and torch tensors do not allow variable length inner arrays
    for word_token in words_tokens_list[i]:
        sentence_tokens_list[j].append(word_token)

    sentence_token_word_key[j].append(len(words_tokens_list[i]))
    i = i + 1


print(sentence_tokens_list[my_idx])
print(sentence_token_word_key[my_idx])

sentence = ""
cumulative_idx = 0
for i in range(len(sentence_token_word_key[my_idx])):
    word_token_count = sentence_token_word_key[my_idx][i]
    word = "".join(token_vocab_list[sentence_tokens_list[my_idx][cumulative_idx+word_token_no]] for word_token_no in range(word_token_count))
    cumulative_idx += word_token_count
    sentence += word + " "
print(sentence.strip())

#np_sentences = np.array(sentence_tokens_list, dtype=np.float32)

# sentence = "".join(" ".join(token_vocab_list[tokno] for tokno in sentence_tokens_list[3]))
# print(sentence)