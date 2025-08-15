#!/usr/bin/node

const fs = require('node:fs');

const readline = require('readline');

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

const read_stream1 = fs.createReadStream("jer_proj_matched_lemmas.csv");
const read_stream2 = fs.createReadStream("orv_lemmas_master.csv");
read_stream1.on('error', () => {
  console.log("first file doesn't exist");
  process.exit(-1);
})
read_stream2.on('error', () => {
  console.log("second file doesn't exist");
  process.exit(-1);
})

let csv_string = "";
const csv_lines_map = new Map();

const orv_reconstr_set = new Set();
async function readORVLemmasFile() {
  const orv_lemmas_file = readline.createInterface({input: read_stream2});

  const csv_reader = new CsvReader("|");
  let line_index = 0;

  for await(const line of orv_lemmas_file) {
    if(line_index == 0) {
      csv_reader.setHeaders(line);
      csv_string += line + "|" + "jer_project\n";
      line_index++;
      continue;
    }
    csv_reader.setLine(line);
    const pos = csv_reader.getField("pos");
    const lemma = csv_reader.getField("orv_lemma");

    const noun_verb = Number(csv_reader.getField("noun_verb"));
    if(noun_verb == 1 || noun_verb == 2 || noun_verb == 0) {
      orv_reconstr_set.add(pos+lemma);
    }
    csv_lines_map.set(pos+lemma, line+"|0");
    
  }
  orv_lemmas_file.close();
}

async function readJerMatchesSheet() {
  const jer_matches_file = readline.createInterface({input: read_stream1});
  let line_index = 0;

  let match_count = 0;

  const csv_reader = new CsvReader("|");
  for await(const line of jer_matches_file) {
    if(line_index == 0) {
      csv_reader.setHeaders(line);
      line_index++;
      continue;
    }

    csv_reader.setLine(line);

    const pos = csv_reader.getField("pos");
    const lemma = csv_reader.getField("lemma");
    
    if(orv_reconstr_set.has(pos+lemma)) {
      match_count++;
      console.log("Match for: ", lemma, " | ", pos);
    }
    else console.log("No Match for: ", lemma, " | ", pos);

    if(csv_lines_map.has(pos+lemma)) {
      csv_lines_map.set(pos+lemma, csv_lines_map.get(pos+lemma).slice(0, -2)+"|1");
    }
    

  }
  console.log()
  jer_matches_file.close();
  console.log("\n\nMatch count: ", match_count);
}




async function countMatches() {
  await readORVLemmasFile();
  await readJerMatchesSheet();

  for(const pair of csv_lines_map) {
    csv_string += pair[1] + "\n";
  }

  fs.writeFileSync("orv_lemmas_master_jer_proj.csv", csv_string);
}

countMatches();