#!/usr/bin/python

from nltk.tag import tnt
from nltk.tag import UnigramTagger, BigramTagger, TrigramTagger, DefaultTagger
import csv
tagged_chu = []

with open("chu_words_POS.csv") as chu_pos_file:
    csvreader = csv.reader(chu_pos_file, delimiter=",")
    sentence_counter = -1
    for line in csvreader:
        if(line[0][0:2] == "%%"):
            sentence_counter += 1
            tagged_chu.append([])
        else:
            tagged_chu[sentence_counter].append((line[0], line[1]))
#print(tagged_chu)
default_tagger = DefaultTagger('Unk')
unigram_tagger = UnigramTagger(tagged_chu, backoff=default_tagger)
bigram_tagger = BigramTagger(tagged_chu, backoff=unigram_tagger)
trigram_tagger = TrigramTagger(tagged_chu, backoff=bigram_tagger)

tnt_tagger = tnt.TnT()


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
trigram_guesses = trigram_tagger.tag_sents(untagged_sentences)

# guessed_tagged_string = ""
# for sent in guessed_tagged_sentences:
#     guessed_tagged_string += "\n"
#     for tagged_word in sent:
#         guessed_tagged_string += tagged_word[0] + "," + tagged_word[1] + "\n"

guessed_tagged_string = ""
unk_count = 0
for i in range(len(guessed_tagged_sentences)):
    guessed_tagged_string += "\n"
    for j in range(len(guessed_tagged_sentences[i])):
        guessed_tag = guessed_tagged_sentences[i][j][1]
        if(guessed_tag) == "Unk":
            guessed_tag = trigram_guesses[i][j][1]
            print(f"{guessed_tagged_sentences[i][j][0]}trigram guess is: {guessed_tag}")
            unk_count += 1

print(f"Unguessed words: {unk_count}")

# guessed_POS_file = open("guessed_POS_sentences.csv", "w")
# guessed_POS_file.write(guessed_tagged_string)
# guessed_POS_file.close()

#print(guessed_tagged_sentences)