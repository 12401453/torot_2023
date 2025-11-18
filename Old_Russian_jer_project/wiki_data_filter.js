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

const cyr_arr = new Array(

  ["а́", "а"],
  ["е́", "е"],
  ["и́", "и"],
  ["о́", "о"],
  ["у́", "у"],
  ["я́", "я"],
  ["ю́", "ю"],
  ["ё", "е"],
  ["ы́", "ы"]

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


async function jsonifyCSV(csr_matches) {
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
  fs.writeFileSync("csr_matches.json", JSON.stringify(csr_matches, null, 2)); 
}

function readWiktionaryData(matched_wiki_forms, csr_matches) {
  const csr_matches_lemmas = csr_matches.map(x => x[0]);
  const csr_matches_lemmas_leftover = [...csr_matches_lemmas];
  for(let i = 10; i < 1521; i+=10) {
    const filename = `ru_wiktionary_data_2/russian_lemmas_pg${String(i - 9).padStart(5, "0")}-${String(i).padStart(5, "0")}.json`;
    const wiki_file_str = fs.readFileSync(filename, "utf-8");
    const wiki_file_json = JSON.parse(wiki_file_str);
    wiki_file_json.forEach(entry => {
      const csr_match_idx = csr_matches_lemmas.indexOf(deStress(entry.lemma));
      const csr_leftover_idx = csr_matches_lemmas_leftover.indexOf(deStress(entry.lemma));
      if(csr_match_idx != -1) {
        if(entry.pos == "verb") {
          entry.inflections.push(entry.lemma) //add infinitive to wiktionary paradigms, because it is not included for some reason
        }
        matched_wiki_forms.push([csr_matches[csr_match_idx][1], entry]);
        csr_matches_lemmas_leftover.splice(csr_leftover_idx, 1);
      }
    });
  }
  const last_filename = "ru_wiktionary_data_2/russian_lemmas_pg1521-01526.json";
  const wiki_file_str = fs.readFileSync(last_filename, "utf-8");
  const wiki_file_json = JSON.parse(wiki_file_str);
  wiki_file_json.forEach(entry => {
    const csr_match_idx = csr_matches_lemmas.indexOf(deStress(entry.lemma));
    const csr_leftover_idx = csr_matches_lemmas_leftover.indexOf(deStress(entry.lemma));
    if(csr_match_idx != -1) {
      if(entry.pos == "verb") {
        entry.inflections.push(entry.lemma) //add infinitive to wiktionary paradigms, because it is not included for some reason
      }
      matched_wiki_forms.push([csr_matches[csr_match_idx][1], entry]);
      csr_matches_lemmas_leftover.splice(csr_leftover_idx, 1);
    }
  });

  fs.writeFileSync("matched_wiki_forms.json", JSON.stringify(matched_wiki_forms, null, 2));
  fs.writeFileSync("missing_wiki_forms.json", JSON.stringify(csr_matches_lemmas_leftover, null, 2));
}


function compareGeneratedLCSWithWikiForms(matched_wiki_forms, generated_forms, flat_results_csv) {
  let paradigmless_lemmas_csv = "";
  let result_csv = "wiki_form|generated_match|lcs_match|match_desinence_idx|lcs_infl_class|match_code\n";
  const generated_forms_keys = generated_forms.map(x => x[5]);
  for(const wiki_paradigm of matched_wiki_forms) {
    //const wiki_generated_key_match = generated_keys.indexOf(wiki_paradigm[0]);
    //if(wiki_generated_key_match != -1) console.log(wiki_paradigm[1].lemma, generated_forms[wiki_generated_key_match][5]);
    const pos_lemma_combo = wiki_paradigm[0];
    const generated_forms_key_idx = generated_forms_keys.indexOf(pos_lemma_combo);
    if(generated_forms_key_idx == -1) {
      //should write these forms out somehow, since they are forms from the Google Drive spreadsheet that have checked CSR matches but were deemed unreconstructable to LCS, or post-Jer Shift derivations or the like
      continue;
    }
    
    const generated_form_entry = generated_forms[generated_forms_key_idx];

    if(wiki_paradigm[1].inflections.length == 0) {
      const wiki_infl = wiki_paradigm[1].lemma;
      result_csv += wiki_infl + "|";
      paradigmless_lemmas_csv += wiki_infl + "\n";
      let wiki_matched_with_generated_form = false;

        outer: for(let i = 2; i < 5; i++) {

          for(const idx in generated_form_entry[i]) {
            const generated_inflected_forms = generated_form_entry[i][idx][0];
            
            for(const generated_inflected_form of generated_inflected_forms) {
              if(generated_inflected_form == deStressDownCase(wiki_infl)) {
                result_csv += generated_inflected_form + "|" + generated_form_entry[i][idx][1] + "|" + idx + "|" + generated_form_entry[6] + "|1\n";
                wiki_matched_with_generated_form = true;
                //console.log(generated_inflected_form, wiki_infl);
                break outer; 
              }
            }
          }   
        }
        if(!wiki_matched_with_generated_form) {
          result_csv += "||||0\n";
        }
    }
    else {
      for(const wiki_infl of wiki_paradigm[1].inflections) {
        result_csv += wiki_infl + "|";
        let wiki_matched_with_generated_form = false;

        outer: for(let i = 2; i < 5; i++) {

          for(const idx in generated_form_entry[i]) {
            const generated_inflected_forms = generated_form_entry[i][idx][0];

            for(const generated_inflected_form of generated_inflected_forms) {
              if(generated_inflected_form == deStressDownCase(wiki_infl)) {
                result_csv += generated_inflected_form + "|" + generated_form_entry[i][idx][1] + "|" + idx + "|" + generated_form_entry[6] + "|1\n";
                wiki_matched_with_generated_form = true;
                //console.log(generated_inflected_form, wiki_infl);
                break outer; 
              }
            }
          }   
        }
        if(!wiki_matched_with_generated_form) {
          result_csv += "|||" + generated_form_entry[6] + "|0\n";
        }
        //console.log(generated_form_entry[4]);
      }
    }
  }

  fs.writeFileSync("paradigmless_wiki_lemmas.csv", paradigmless_lemmas_csv);
  fs.writeFileSync("results.csv", result_csv);

}

async function runAsyncBullshitBecauseNodeIsRetarded() {
  const csr_matches = new Array();
  await jsonifyCSV(csr_matches);
  console.log(csr_matches.length);

  const matched_wiki_forms = new Array();
  readWiktionaryData(matched_wiki_forms, csr_matches);
  console.log(matched_wiki_forms.length);

  const generated_forms = JSON.parse(fs.readFileSync("lcs_converted.json"));

  console.log(generated_forms.length);

  let flat_results_csv = "";
  
  compareGeneratedLCSWithWikiForms(matched_wiki_forms, generated_forms, flat_results_csv);
}



runAsyncBullshitBecauseNodeIsRetarded();

