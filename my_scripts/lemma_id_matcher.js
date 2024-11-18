#!/usr/bin/node

const fs = require('node:fs');

const readline = require('readline');

const read_stream1 = fs.createReadStream("lemmas_with_text_occurence_gdrive.csv");
const read_stream2 = fs.createReadStream("chu_lemmas.csv");
read_stream1.on('error', () => {
  console.log("first file doesn't exist");
  process.exit(-1);
})
read_stream2.on('error', () => {
  console.log("second file doesn't exist");
  process.exit(-1);
})

const output_filename = "lemma_id_map.csv";

let csv_string = "";

const new_ids_map = new Map();

async function readLemmasFile() {
  const lemmas_file = readline.createInterface({input: read_stream2});

  for await(const line of lemmas_file) {
    const row = line.split(",");
    new_ids_map.set(row[2]+row[1], Number(row[0]));
  }
  lemmas_file.close();
}

async function readLemmasSpreadsheet() {
  const lemma_spreadsheet_file = readline.createInterface({input: read_stream1});
  for await(const line of lemma_spreadsheet_file) {
    const row = line.split("|");
    const old_pos_lemma_combo = row[2]+row[0];
    const old_id = Number(row[1]);
    let new_id = 0;
    if(new_ids_map.has(old_pos_lemma_combo)) {
        new_id = new_ids_map.get(old_pos_lemma_combo);
    }
    else new_id = old_id;

    csv_string += new_id + "," + old_id + "\n";
    
  };
  lemma_spreadsheet_file.close();
}




async function createLemmaIdMap() {
  await readLemmasFile();
  await readLemmasSpreadsheet();
  fs.appendFileSync(output_filename, csv_string);

}

createLemmaIdMap();


