#!/usr/bin/node

const fs = require('node:fs');

const readline = require('readline');

if(process.argv.length < 4) {
  console.log("Must specify both an existing lemmatised corpus-file and an unlemmatised file");
  process.exit(-1);
}
const chu_corpus_filename = process.argv[2];
const autotagged_pos_filename = process.argv[3];
const read_stream1 = fs.createReadStream(chu_corpus_filename);
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

const output_filename = "chu_untagged_autolemmatised.csv";

let csv_string = "";

const existing_normalised_map = new Map();
const existing_raw_map = new Map();
const existing_normalised_jersame_map = new Map();
const lemmas_array = new Array();

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
  }
  lemmas_file.close();
}

let unmatched_form_count = 0;
let matched_by_lemmalist_count = 0;

async function readAutotaggedFile() {
  const autotagged_pos_file = readline.createInterface({input: read_stream2});

  for await(const line of autotagged_pos_file) {
    const row = line.split(",");
    const word_form_raw = row[2];
    const word_form_normalised = row[0];
    const pos = row[1];
    let auto_lemma_id = 0;
  
    if(existing_normalised_map.has(pos+word_form_normalised)) {
      auto_lemma_id = existing_normalised_map.get(pos+word_form_normalised);
    }
    else if(existing_raw_map.has(pos+word_form_raw)) {
      auto_lemma_id = existing_raw_map.get(pos+word_form_raw);
    }
    else if(existing_normalised_jersame_map.has(pos+word_form_normalised.replaceAll("ь", "ъ"))) {
      auto_lemma_id = existing_normalised_jersame_map.get(pos+word_form_normalised.replaceAll("ь", "ъ"));
      console.log(`${word_form_raw} was normalised with ${auto_lemma_id} by neutralising the jers and checking in the existing corpus`)
    }
    else {
      unmatched_form_count++;
      let match_found = false;
      let chopped_word_normalised = word_form_normalised.replaceAll("ь", "ъ");

      let filtered_lemmas = lemmas_array.filter(row => row[2] == pos && row[3].replaceAll("ь", "ъ").startsWith(chopped_word_normalised))
      
      //should also check against the unnormalised forms
      //it might be better to first check against the existing forms to catch things like пришьд- which is too dissimilar from прити to ever get correctly lemmatised this way
      while(chopped_word_normalised.length > 3 && filtered_lemmas.length == 0) {
        
        filtered_lemmas = lemmas_array.filter(row => row[2] == pos && row[3].replaceAll("ь", "ъ").startsWith(chopped_word_normalised));

        if(filtered_lemmas.length > 0) {
          auto_lemma_id = filtered_lemmas[0][0];
          match_found = true;
          console.log(`${word_form_raw} was matched against the lemma-list with ${filtered_lemmas[0][1]} with lemma_id ${auto_lemma_id}`);
          matched_by_lemmalist_count++;
          break;
        }
        chopped_word_normalised = chopped_word_normalised.slice(0, -1);
        
      }
    }
    csv_string += word_form_raw + "," + pos + "," + auto_lemma_id + "\n";
  }
  autotagged_pos_file.close();
}

async function guessLemmas() {
  await readCorpusFile();
  await readLemmasFile();
  console.log(lemmas_array.length);
  await readAutotaggedFile();
  
  fs.appendFileSync(output_filename, csv_string);
  
  console.log(unmatched_form_count, `words could not be matched against the existing corpus-words`);
  console.log(matched_by_lemmalist_count, `of those were matched against the lemma-list`);
  console.log('This leaves',unmatched_form_count - matched_by_lemmalist_count, 'words with no lemma-guess at all');
}
guessLemmas();

