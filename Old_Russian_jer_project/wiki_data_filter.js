#!/usr/bin/node
//this deliberately doesn't match lemmas with #1 #2 etc. because those would risk being inaccurate

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

const chu_master_arr = new Array();
const orv_master_arr = new Array();


async function jsonifyCSV() {
  const csv_reader = new CsvReader('|');
  let first_line = true;

  const csr_arr = new Array();
  for await(const line of readline.createInterface({input: fs.createReadStream("jer_lemmas_CSR.csv")})) {

    if(first_line) {
      csv_reader.setHeaders(line);
      first_line = false;
      continue;
    }

    csv_reader.setLine(line);

    const csr_lemma = csv_reader.getField('match');
    const annotated = csv_reader.getField('annotated');
    if(annotated != "" && csr_lemma.trim() != "") csr_arr.push(csr_lemma);
  }
  console.log(csr_arr.length);
  fs.writeFileSync("csr_matches.json", JSON.stringify(csr_arr, null, 2));
  
}


let json_str = "";

jsonifyCSV();


