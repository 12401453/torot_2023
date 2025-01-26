#!/usr/bin/node

// const fs = require('node:fs');
// const chalk = require('chalk');
// const readline = require('readline');

import chalk from 'chalk';
import fs from 'fs';
import readline from 'readline';

if(process.argv.length < 3) {
  console.log("Must specify an unlemmatised but POS-tagged file");
  process.exit(-1);
}
const autotagged_pos_filename = process.argv[2];
const read_stream1 = fs.createReadStream("chu_words_full.csv");
const read_stream2 = fs.createReadStream(autotagged_pos_filename);
const read_stream3 = fs.createReadStream("chu_lemmas.csv");
read_stream1.on('error', () => {
  console.log("first file doesn't exist");
  process.exit(-1);
})
read_stream2.on('error', () => {
  console.log("second file doesn't exist");
  process.exit(-1);
})

const output_filename = "zogr_untagged_autolemmatised_improved.csv";

let csv_string = "";

const existing_normalised_map = new Map();
const existing_raw_map = new Map();
const existing_normalised_jersame_map = new Map();
const lemmas_array = new Array();

const lemmas_map = new Map();
lemmas_map.set(0, "FIXME"); //so I don't have to bother with bullshit checking before just getting the values out of it

async function readCorpusFile() {
  const chu_corpus_file = readline.createInterface({input: read_stream1});
  for await(const line of chu_corpus_file) {
    const row = line.split(",");
    const word_form_raw = row[0];
    const word_form_normalised = row[3];
    const pos = row[1];
    const lemma_id = row[4];
  
    existing_normalised_map.set(pos+word_form_normalised, lemma_id);
    existing_raw_map.set(pos+word_form_raw, lemma_id);
    existing_normalised_jersame_map.set(pos+word_form_normalised.replaceAll("ь", "ъ"), lemma_id);
  };
  chu_corpus_file.close();
}

async function readLemmasFile() {
  const lemmas_file = readline.createInterface({input: read_stream3});

  for await(const line of lemmas_file) {
    const row = line.split(",");
    //I don't need to remove the hashtags which disamibiguate multiple same-POS lemmas, because I will be checking whether they .startsWith() my form
    lemmas_array.push(row);

    lemmas_map.set(Number(row[0]), row[1]);
  }
  lemmas_file.close();
}

let unmatched_form_count = 0;
let matched_by_lemmalist_count = 0;
let matched_by_chopping_against_corpus_count = 0;

let total_corpus_matches_count = 0;
let normalised_corpus_matches_count = 0;
let raw_corpus_matches_count = 0;
let jersame_normalised_corpus_matches_count = 0;

async function readAutotaggedFile() {
  const autotagged_pos_file = readline.createInterface({input: read_stream2});

  for await(const line of autotagged_pos_file) {
    const row = line.split(",");
    const word_form_raw = row[2];
    const word_form_normalised = row[0];
    const pos = row[1];
    let auto_lemma_id = 0;
  
    
    if(existing_raw_map.has(pos+word_form_raw)) {
      auto_lemma_id = existing_raw_map.get(pos+word_form_raw);
      raw_corpus_matches_count++;
      total_corpus_matches_count++
    }
    else if(existing_normalised_map.has(pos+word_form_normalised)) {
      auto_lemma_id = existing_normalised_map.get(pos+word_form_normalised);

      normalised_corpus_matches_count++;
      total_corpus_matches_count++
    }
    else if(existing_normalised_jersame_map.has(pos+word_form_normalised.replaceAll("ь", "ъ"))) {
      auto_lemma_id = existing_normalised_jersame_map.get(pos+word_form_normalised.replaceAll("ь", "ъ"));
      //console.log(`${word_form_raw} was matched with ${auto_lemma_id} by neutralising the jers and checking in the existing corpus`);
      jersame_normalised_corpus_matches_count++;
      total_corpus_matches_count++
      
    }
    else {
      auto_lemma_id = chopAgainstForms(pos, word_form_normalised, word_form_raw);
      if(auto_lemma_id == 0) {
        auto_lemma_id = chopAgainstLemmas(pos, word_form_normalised, word_form_raw);
      }
    }
    csv_string += word_form_raw + "," + pos + "," + auto_lemma_id + "," + lemmas_map.get(Number(auto_lemma_id)) + "\n";
  }
  autotagged_pos_file.close();
}

async function guessLemmas() {
  await readCorpusFile();
  await readLemmasFile();
  console.log(lemmas_array.length);
  await readAutotaggedFile();
  
  fs.writeFileSync(output_filename, csv_string);
  
  console.log(total_corpus_matches_count, "forms were matched against the existing tagged corpus:\n", raw_corpus_matches_count, "were matched by just raw forms\n", normalised_corpus_matches_count, "were matched by normalising forms\n", jersame_normalised_corpus_matches_count, "were matched by normalising AND neutralising the jers\n");

  console.log(unmatched_form_count, `words could not be matched against the existing corpus-words`);
  console.log(matched_by_chopping_against_corpus_count, "of those were matched by chopping them against the existing corpus-forms");
  console.log(matched_by_lemmalist_count, `of those were matched against the lemma-list`);
  
  console.log('This leaves',unmatched_form_count - matched_by_chopping_against_corpus_count - matched_by_lemmalist_count, 'words with no lemma-guess at all');
}
guessLemmas();


const chopAgainstForms = (pos, word_form_normalised, word_form_raw) => {
  let auto_lemma_id = 0;
  unmatched_form_count++;
  let match_found = false;
  let chopped_word_normalised = word_form_normalised.replaceAll("ь", "ъ");

  const jersame_map_array = Array.from(existing_normalised_jersame_map);
  let filtered_jersame_array = jersame_map_array.filter(form_and_id_pair => form_and_id_pair[0].startsWith(pos+chopped_word_normalised));
    
  while(chopped_word_normalised.length > 3 ) {
        
    filtered_jersame_array = jersame_map_array.filter(form_and_id_pair => form_and_id_pair[0].startsWith(pos+chopped_word_normalised));
    debugger;

    if(filtered_jersame_array.length > 0) {
      filtered_jersame_array.sort((jersame_row_a, jersame_row_b) => jersame_row_a[0].length - jersame_row_b[0].length); //reorder the results array by ascending length so that the first member is most similar in length to the target word (prevents problems like симон being matched to симонидъ instead of симонъ)
      auto_lemma_id = filtered_jersame_array[0][1];
      match_found = true;
      console.log(`${chalk.yellowBright(word_form_raw)} was matched with ${chalk.red(lemmas_map.get(Number(auto_lemma_id)))} by chopping against the jer-neutralised normalised corpus form ${chalk.greenBright(filtered_jersame_array[0][0].slice(2))} with lemma_id ${chalk.redBright(auto_lemma_id)}`);
      matched_by_chopping_against_corpus_count++;
      break;
    }
    chopped_word_normalised = chopped_word_normalised.slice(0, -1);  
  }
  return auto_lemma_id;
};

const chopAgainstLemmas = (pos, word_form_normalised, word_form_raw) => {
  let auto_lemma_id = 0;
  let match_found = false;
  let chopped_word_normalised = word_form_normalised.replaceAll("ь", "ъ");

  let filtered_lemmas = lemmas_array.filter(row => row[2] == pos && row[3].replaceAll("ь", "ъ").startsWith(chopped_word_normalised))

  //should also check against the unnormalised forms
  //it might be better to first check against the existing forms to catch things like пришьд- which is too dissimilar from прити to ever get correctly lemmatised this way
  while(chopped_word_normalised.length > 3 && filtered_lemmas.length == 0) {
    
    filtered_lemmas = lemmas_array.filter(row => row[2] == pos && row[3].replaceAll("ь", "ъ").startsWith(chopped_word_normalised));

    if(filtered_lemmas.length > 0) {
      filtered_lemmas.sort((lemma_row_a, lemma_row_b) => jersame_row_a[1].length - jersame_row_b[1].length); //reorder the results array by ascending length so that the first member is most similar in length to the target word (prevents problems like симон being matched to симонидъ instead of симонъ)
      auto_lemma_id = filtered_lemmas[0][0];
      match_found = true;
      console.log(`${chalk.cyan(word_form_raw)} was matched against the lemma-list with ${chalk.magenta(filtered_lemmas[0][1])} with lemma_id ${chalk.red(auto_lemma_id)}`);
      matched_by_lemmalist_count++;
      break;
    }
    chopped_word_normalised = chopped_word_normalised.slice(0, -1);  
  }
  return auto_lemma_id;
};
