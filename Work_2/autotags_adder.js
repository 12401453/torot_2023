#!/usr/bin/node

import fs from 'fs';
import readline from 'readline';

const read_stream1 = fs.createReadStream("chu_words_full_with_titles_untagged.csv");
const read_stream3 = fs.createReadStream("zogr_untagged_autolemmatised_improved.csv");
read_stream1.on('error', () => {
  console.log("first file doesn't exist");
  process.exit(-1);
})
read_stream3.on('error', () => {
  console.log("second file doesn't exist");
  process.exit(-1);
})

const output_filename = "chu_words_full_with_titles_untagged_autotags_added.csv";

let csv_string = "";

const autotagged_map = new Map();

async function readAutotaggedFile() {
  const autotagged_file = readline.createInterface({input: read_stream3});

  for await(const line of autotagged_file) {
    const row = line.split(",");
    const tokno_index = Number(row[5])
    const auto_morph_tag = row[4];
    const auto_pos = row[1];
    const auto_lemma_id = row[2];
    const autotags_arr = [auto_pos, auto_morph_tag, auto_lemma_id];
    autotagged_map.set(tokno_index, autotags_arr);
  }
  autotagged_file.close();
}

async function readCorpusFile() {
  const corpus_file = readline.createInterface({input: read_stream1});
  let tokno = 1;
  for await(const line of corpus_file) {
    const row = line.split("|");
    
    if(autotagged_map.has(tokno)) {
      const autotagged_arr = autotagged_map.get(tokno);
      csv_string += row[0] + "|" + autotagged_arr[0] + "|" + autotagged_arr[1] + "|" + row[3] + "|" + autotagged_arr[2] + "|" + row[5] + "|" + row[6] + "|" + row[7] + "|" + row[8] + "|" + row[9] + "|" + "1" + "\n";   
    }
    else {
      csv_string += line + "|" + "0" + "\n";
    }

    tokno++;
    
  };
  corpus_file.close();
}




async function addAutoTagInfo() {
  await readAutotaggedFile();
  await readCorpusFile();
  fs.writeFileSync(output_filename, csv_string);

}

addAutoTagInfo();


