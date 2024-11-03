#!/usr/bin/node

const fs = require('node:fs');

const readline = require('readline');

if(process.argv.length < 4) {
  console.log("Must specify both an existing lemmatised corpus-file and an unlemmatised file");
  exit(-1);
}
const chu_corpus_filename = process.argv[2];
const autotagged_pos_filename = process.argv[3];
const read_stream1 = fs.createReadStream(chu_corpus_filename);
const read_stream2 = fs.createReadStream(autotagged_pos_filename);
read_stream1.on('error', () => {
  console.log("first file doesn't exist");
  exit(-1);
})
read_stream2.on('error', () => {
  console.log("second file doesn't exist");
  exit(-1);
})

const chu_corpus_file = readline.createInterface({input: read_stream1});
const autotagged_pos_file = readline.createInterface({input: read_stream2});

const output_filename = "chu_untagged_autolemmatised.csv";

let csv_string = "";

const existing_normalised_map = new Map();
const existing_raw_map = new Map();

chu_corpus_file.on('line', line => {
  const row = line.split(",");
  const word_form_raw = row[0];
  const word_form_normalised = row[3];
  const pos = row[1];
  const lemma_id = row[4];

  const pos_form_combo_norm = pos+word_form_normalised;
  const pos_form_combo_raw = pos+word_form_raw;
  console.log(pos_form_combo_raw);
  existing_normalised_map.set(pos_form_combo_norm, lemma_id);
  existing_raw_map.set(pos_form_combo_raw, lemma_id);

  console.log(`number of unique normalised POS+form combos: ${existing_normalised_map.size}\nnumber of unique raw POS+form combos:${existing_raw_map.size}`)

});

autotagged_pos_file.on('line', line => {
  const row = line.split(",");
  const word_form_raw = row[2];
  const word_form_normalised = row[0];
  const pos = row[1];
  let auto_lemma_id = 0;

  //console.log(line);

  if(existing_normalised_map.has(pos+word_form_normalised)) {
    auto_lemma_id = existing_normalised_map.get(pos+word_form_normalised);
  }
  else if(existing_raw_map.has(pos+word_form_raw)) {
    auto_lemma_id = existing_raw_map.get(pos+word_form_raw);
  }
  //else console.log("autolemmatisation by comparison with existing tagged forms was impossible");

  csv_string += word_form_raw + "," + pos + "," + auto_lemma_id + "\n";
});


fs.appendFileSync(output_filename, csv_string);

