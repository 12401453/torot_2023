#!/usr/bin/node



import { createInterface } from 'readline';
import { createReadStream, writeFileSync } from 'node:fs';

const read_stream1 = createReadStream("zographensis_alignments.csv");
const read_stream2 = createReadStream("grc_words_full_untagged.csv");
// const read_stream3 = fs.createReadStream("chu_lemmas.csv");
read_stream1.on('error', () => {
  console.log("first file doesn't exist");
  process.exit(-1);
})
// read_stream2.on('error', () => {
//   console.log("second file doesn't exist");
//   process.exit(-1);
// })

const output_filename = "zogr_db_gk_align.csv";

const greek_token_map = new Map();

async function readGreekFile() {
  const greek_file = createInterface({input: read_stream2});
  let rowno = 0;
  let my_db_tokno;
  for await(const line of greek_file) {
    rowno++;
    const row = line.split("|");
    const gk_tokno = Number(row[0]);
    const gk_form = row[1];
    const gk_pos = row[2];
    const gk_morph = row[3];
    const gk_lemma_id = row[4];

    const gk_array = [gk_form, gk_pos, gk_morph, gk_lemma_id];

    greek_token_map.set(gk_tokno, gk_array);

  };
  greek_file.close();
}

async function readAlignmentFile() {
  let csv_string = "";
  const zogr_alignment_file = createInterface({input: read_stream1});
  let rowno = 0;
  let my_db_tokno;
  for await(const line of zogr_alignment_file) {
    rowno++;
    const row = line.split(",");
    const gk_form = row[2];
    const gk_tokno = Number(row[3]);
    my_db_tokno = 201941 + rowno;

    if(gk_tokno !== 0 && greek_token_map.has(gk_tokno)){
      const greek_data_row = greek_token_map.get(gk_tokno);
      csv_string += String(my_db_tokno) + "|" + greek_data_row[0] + "|" + greek_data_row[1] + "|" + greek_data_row[2] + "|" + greek_data_row[3] + "\n";
    }
    else if (gk_tokno !== 0) {
      console.log("the gk tokno with number", gk_tokno, "has no equivalent in the greek xml files apparently");
    }

  };
  zogr_alignment_file.close();
  return csv_string;
}

await readGreekFile();
const csv_string = await readAlignmentFile();



writeFileSync(output_filename, csv_string);
