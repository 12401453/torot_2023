#!/usr/bin/python

from nltk.tag import tnt
import csv

tnt_tagger = tnt.TnT()
tagged_chu = []

with open("chu_words_morph.csv") as chu_pos_file:
    csvreader = csv.reader(chu_pos_file, delimiter=",")
    sentence_counter = -1
    for line in csvreader:
        if(line[0][0:2] == "%%"):
            sentence_counter += 1
            tagged_chu.append([])
        else:
            tagged_chu[sentence_counter].append((line[0], line[1]))
#print(tagged_chu)
tnt_tagger.train(tagged_chu)

untagged_sentences = []

with open("untagged_sentences.csv") as untagged_file:
    sentence_counter = -1
    for line in untagged_file:
        if(line[0:2] == "%%"):
            sentence_counter += 1
            untagged_sentences.append([])
        else:
            untagged_sentences[sentence_counter].append(line.strip())

guessed_tagged_sentences = tnt_tagger.tagdata(untagged_sentences)

print(guessed_tagged_sentences)