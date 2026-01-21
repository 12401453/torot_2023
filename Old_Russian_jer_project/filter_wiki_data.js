#!/bin/node

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

const cyr_arr = new Array(

  ["а́", "а"],
  ["е́", "е"],
  ["и́", "и"],
  ["о́", "о"],
  ["у́", "у"],
  ["я́", "я"],
  ["ю́", "ю"],
  ["ё", "е"],
  ["ы́", "ы"],
  ["ѐ", "е"]

);

const deStressDownCase = (word) => {

  for(const pair of cyr_arr) {
      word = word.toLocaleLowerCase().replaceAll(pair[0], pair[1]);
  }
  return word;
};
const deStress = (word) => {

  for(const pair of cyr_arr) {
      word = word.replaceAll(pair[0], pair[1]);
  }
  return word;
};

async function jsonifyJerLemmasCSV(csr_matches) {
  const csv_reader = new CsvReader('|');
  let first_line = true;

  for await(const line of readline.createInterface({input: fs.createReadStream("jer_lemmas_CSR.csv")})) {

    if(first_line) {
      csv_reader.setHeaders(line);
      first_line = false;
      continue;
    }

    csv_reader.setLine(line);

    const csr_lemma = csv_reader.getField('match');
    const annotated = csv_reader.getField('annotated');
    const torot_lemma = csv_reader.getField('lemma');
    const pos = csv_reader.getField('pos');
    if(annotated != "" && csr_lemma.trim() != "") {
      const fields_lemmas = csr_lemma.split(", "); //this line is to deal with variants put in the same cell
      for(const lemma of fields_lemmas) {
        csr_matches.push([lemma, pos+torot_lemma]);
      }
    }
  }
}

const chooseCorrectCSRMatchIndex = (wiki_entry, csr_matches_json, csr_matches_lemmas) => {

  const candidate_idxes = [];
  for(let i = 0; i < csr_matches_lemmas.length; i++) {
    if(csr_matches_lemmas[i] == deStress(wiki_entry.lemma)) {
      candidate_idxes.push(i);
    }
  }

  if(candidate_idxes.length == 0) {
    return -1;
  }
  else if(candidate_idxes.length == 1) {
    return candidate_idxes[0];
  }
  else {
    const wiki_pos = wiki_entry.pos;
    if(wiki_pos == "noun") {
      for(const idx of candidate_idxes) {
        const torot_pos = csr_matches_json[idx][1].slice(0, 2);
        if(torot_pos == "Nb" || torot_pos == "Ne") {
          return idx;
        }
      }
    }
    else if(wiki_pos == "verb") {
      for(const idx of candidate_idxes) {
        const torot_pos = csr_matches_json[idx][1].slice(0, 2);
        if(torot_pos == "V-") {
          return idx;
        }
      }
    }
    return candidate_idxes[0];
  }
};

function readWiktionaryData(matched_wiki_forms, csr_matches) {
  const csr_matches_lemmas = csr_matches.map(x => deStress(x[0]));
  const leftover_csr_match_lemmas = csr_matches.map(x => x[0]);
  for(let i = 10; i < 1521; i+=10) {
    const filename = `ru_wiktionary_data/russian_lemmas_pg${String(i - 9).padStart(5, "0")}-${String(i).padStart(5, "0")}.json`;
    const wiki_file_str = fs.readFileSync(filename, "utf-8");
    const wiki_file_json = JSON.parse(wiki_file_str);
    for(const entry of wiki_file_json){

      if(csr_matches_lemmas.indexOf(deStress(entry.lemma)) == -1) {
        continue;
      }

      const csr_match_idx = chooseCorrectCSRMatchIndex(entry, csr_matches, csr_matches_lemmas);

      if(csr_match_idx != -1) {
        leftover_csr_match_lemmas[csr_match_idx] = "";
        if(entry.pos == "verb") {
          entry.inflections.push(entry.lemma) //adds infinitive to wiktionary paradigms, because it is not included for some reason
        }
        matched_wiki_forms.push([csr_matches[csr_match_idx][1], entry]);
      }
    };
  }
  const last_filename = "ru_wiktionary_data/russian_lemmas_pg1521-01526.json";
  const wiki_file_str = fs.readFileSync(last_filename, "utf-8");
  const wiki_file_json = JSON.parse(wiki_file_str);
  for(const entry of wiki_file_json){
    if(csr_matches_lemmas.indexOf(deStress(entry.lemma)) == -1) {
      continue;
    }
    const csr_match_idx = chooseCorrectCSRMatchIndex(entry, csr_matches, csr_matches_lemmas);
    if(csr_match_idx != -1) {
      leftover_csr_match_lemmas[csr_match_idx] = "";
      if(entry.pos == "verb") {
        entry.inflections.push(entry.lemma) //add infinitive to wiktionary paradigms, because it is not included for some reason
      }
      matched_wiki_forms.push([csr_matches[csr_match_idx][1], entry]);

    }
  };


  // for(const leftover_lemma of leftover_csr_match_lemmas) {
  //   if(leftover_lemma != "") {
  //     console.log(leftover_lemma);
  //   }
  // }

  fs.writeFileSync("target_wiki_paradigms.json", JSON.stringify(matched_wiki_forms, null, 2));
}

async function runAsyncFunctionsSequentially() {
  const csr_matches = new Array();
  await jsonifyJerLemmasCSV(csr_matches);

  const matched_wiki_forms = new Array();
  readWiktionaryData(matched_wiki_forms, csr_matches);
}

runAsyncFunctionsSequentially();