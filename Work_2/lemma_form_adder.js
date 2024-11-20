#!/usr/bin/node

const fs = require('node:fs');

const readline = require('readline');

const read_stream1 = fs.createReadStream("chu_untagged_autolemmatised.csv");
const read_stream3 = fs.createReadStream("chu_lemmas.csv");
read_stream1.on('error', () => {
  console.log("first file doesn't exist");
  process.exit(-1);
})
read_stream3.on('error', () => {
  console.log("second file doesn't exist");
  process.exit(-1);
})

const output_filename = "chu_untagged_autolemmatised_lemma_forms.csv";

let csv_string = "";

const lemma_code_map = new Map();

async function readLemmasFile() {
  const lemmas_file = readline.createInterface({input: read_stream3});

  for await(const line of lemmas_file) {
    const row = line.split(",");
    lemma_code_map.set(row[0], row[1])
  }
  lemmas_file.close();
}

async function readAutolemmatisedFile() {
  const autolemmatised_file = readline.createInterface({input: read_stream1});
  for await(const line of autolemmatised_file) {
    const row = line.split(",");
    const lemma_form = lemma_code_map.get(row[2]);
    csv_string += row[0] + "," + row[1] + "," + lemma_form + "\n";
    
  };
  autolemmatised_file.close();
}




async function addLemmaForms() {
  await readLemmasFile();
  await readAutolemmatisedFile();
  fs.writeFileSync(output_filename, csv_string);

}

addLemmaForms();


