#!/usr/bin/python

from nltk.tag import tnt
from nltk.tag.sequential import UnigramTagger, BigramTagger, TrigramTagger
import csv

default_tagger = DefaultTagger('Unk')
unigram_tagger = UnigramTagger(train_data, backoff=default_tagger)
bigram_tagger = BigramTagger(train_data, backoff=unigram_tagger)
trigram_tagger = TrigramTagger(train_data, backoff=bigram_tagger)

tnt_tagger = tnt.TnT(backoff=trigram_tagger)
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

guessed_tagged_string = ""
for sent in guessed_tagged_sentences:
    guessed_tagged_string += "\n"
    for tagged_word in sent:
        guessed_tagged_string += tagged_word[0] + "," + tagged_word[1] + "\n"

guessed_morph_file = open("guessed_morph_sentences.csv", "w")
guessed_morph_file.write(guessed_tagged_string)
guessed_morph_file.close()

#print(guessed_tagged_sentences)