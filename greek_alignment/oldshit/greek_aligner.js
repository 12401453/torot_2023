#!/usr/bin/node



import { createInterface } from 'readline';
import { createReadStream, writeFileSync } from 'node:fs';

class CsvReader {

  constructor(separator=",") {
    this.m_separator = separator;
  }
  
  setHeaders(first_line) {
    this.m_header_index_map.clear();
    const headers_arr = first_line.split(this.m_separator);
    for(const header_idx in headers_arr) {
      this.m_header_index_map.set(headers_arr[header_idx], header_idx);
    }
  }
 
  setLine(line) {
    this.m_raw_line = line;
    this.m_fields_array = this.m_raw_line.split(this.m_separator);
  }

  getField(header) {
    return this.m_fields_array[this.m_header_index_map.get(header)];
  }

  setField(header, new_value) {
    if(this.m_header_index_map.has(header)) {
      this.m_fields_array[this.m_header_index_map.get(header)] = new_value;
      this.m_raw_line = this.m_fields_array.join(m_separator);
    }
    else {
      console.log("CsvReader.setField() failed because the header-value is wrong");
    }    
  }

  getRawLine(){
    return this.m_raw_line;
  }

  getFieldsArray() {
    return this.m_fields_array;
  }

  m_header_index_map = new Map();
  m_raw_line = "";
  m_fields_array = new Array();
  m_separator = "";
};

const greek_token_map = new Map();

async function readGreekFile() {
  const greek_file = createInterface({input: createReadStream("grc_words_full_with_titles.csv")});

  let first_line = true;
  const csv_reader = new CsvReader("|");
  for await(const line of greek_file) {
    if(first_line) {
      csv_reader.setHeaders(line);
      first_line = false;
      continue;
    }
    csv_reader.setLine(line);

   
    const gk_tokno = Number(csv_reader.getField("tokno"));
    const gk_form = csv_reader.getField("grc_word");
    const gk_pos = csv_reader.getField("pos");
    const gk_morph = csv_reader.getField("morph_tag");
    const gk_lemma_id = csv_reader.getField("grc_lemma_id");

    const gk_array = [gk_form, gk_pos, gk_morph, gk_lemma_id];

    greek_token_map.set(gk_tokno, gk_array);

  };
  greek_file.close();
}

let csv_string = "";
async function readAlignmentFiles() {

  async function readSingleAlignmentFile(my_db_tokno_offset, alignment_filename) {
    const alignment_file = createInterface({input: createReadStream(alignment_filename)});
    let rowno = 0;
    let my_db_tokno;
    for await(const line of alignment_file) {
      
      const row = line.split(",");

      const gk_form = row[2];
      const gk_tokno = Number(row[3]);
      my_db_tokno = my_db_tokno_offset + rowno;

      if(gk_tokno !== 0 && greek_token_map.has(gk_tokno)){
        const greek_data_row = greek_token_map.get(gk_tokno);
        csv_string += String(my_db_tokno) + "|" + greek_data_row[0] + "|" + greek_data_row[1] + "|" + greek_data_row[2] + "|" + greek_data_row[3] + "\n";
      }
      else if (gk_tokno !== 0) {
        console.log("the gk tokno with number", gk_tokno, "has no equivalent in the greek xml files apparently");
      }
      rowno++;
    };
    alignment_file.close();
  }

  await readSingleAlignmentFile(204018, "zographensis_alignments.csv");
  await readSingleAlignmentFile(2715, "marianus_alignments.csv");

  // const zogr_alignment_file = createInterface({input: createReadStream("zographensis_alignments.csv")});
  // let rowno = 0;
  // let my_db_tokno;
  // for await(const line of zogr_alignment_file) {
    
  //   const row = line.split(",");
  //   const gk_form = row[2];
  //   const gk_tokno = Number(row[3]);
  //   my_db_tokno = 204018 + rowno;

  //   if(gk_tokno !== 0 && greek_token_map.has(gk_tokno)){
  //     const greek_data_row = greek_token_map.get(gk_tokno);
  //     csv_string += String(my_db_tokno) + "|" + greek_data_row[0] + "|" + greek_data_row[1] + "|" + greek_data_row[2] + "|" + greek_data_row[3] + "\n";
  //   }
  //   else if (gk_tokno !== 0) {
  //     console.log("the gk tokno with number", gk_tokno, "has no equivalent in the greek xml files apparently");
  //   }
  //   rowno++;
  // };
  // zogr_alignment_file.close();
  // const mar_alignment_file = createInterface({input: createReadStream("marianus_alignments.csv")});
  // rowno = 0;
  // for await(const line of mar_alignment_file) {
  //   const row = line.split(",");

  //   const gk_tokno = Number(row[3]); //will coerce "" to 0
  //   my_db_tokno = 2715;

  //   if(gk_tokno !== 0 && greek_token_map.has(gk_tokno)) {
  //     const greek_data_row = greek_token_map.get(gk_tokno);
  //     csv_string += String(my_db_tokno) + "|" + greek_data_row[0] + "|" + greek_data_row[1] + "|" + greek_data_row[2] + "|" + greek_data_row[3] + "\n";
  //   }

  //   rowno++;
  // }
  // mar_alignment_file.close();
}

await readGreekFile();
await readAlignmentFiles();



writeFileSync("chu_db_gk_align.csv", csv_string);
