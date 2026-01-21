#!/usr/bin/node
//this deliberately doesn't match lemmas with #1 #2 etc. because those would risk being inaccurate

const fs = require('node:fs');

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

function compareGeneratedLCSWithWikiForms(target_wiki_paradigms, generated_forms) {
  console.log("Comparing wiktionary-forms with forwards-reconstructed generated LCS forms...")
  let paradigmless_lemmas_csv = "";
  let result_csv = "wiki_form|generated_match|lcs_match|match_desinence_idx|lcs_infl_class|oes_lemma|match_code\n";
  let num_matches = 0;
  let num_misses = 0;
  const unreconstructable_matched_TOROT_forms = new Array();
  const generated_forms_keys = generated_forms.map(x => x[5]);
  for(const wiki_paradigm of target_wiki_paradigms) {
    const pos_lemma_combo = wiki_paradigm[0];
    const oes_lemma = pos_lemma_combo.slice(2);
    const generated_forms_key_idx = generated_forms_keys.indexOf(pos_lemma_combo);
    if(generated_forms_key_idx == -1) {
      //should write these forms out somehow, since they are forms from the Google Drive spreadsheet that have checked CSR matches but were deemed unreconstructable to LCS, or post-Jer Shift derivations or the like
      unreconstructable_matched_TOROT_forms.push(pos_lemma_combo);
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
                result_csv += generated_inflected_form + "|" + generated_form_entry[i][idx][1] + "|" + idx + "|" + generated_form_entry[6] + "|" + pos_lemma_combo + "|1\n";
                wiki_matched_with_generated_form = true;
                num_matches++;
                break outer; 
              }
            }
          }   
        }
        if(!wiki_matched_with_generated_form) {
          result_csv += "||||" + pos_lemma_combo + "|0\n";
          num_misses++;
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
                result_csv += generated_inflected_form + "|" + generated_form_entry[i][idx][1] + "|" + idx + "|" + generated_form_entry[6] + "|" + pos_lemma_combo + "|1\n";
                wiki_matched_with_generated_form = true;
                num_matches++;
                break outer; 
              }
            }
          }   
        }
        if(!wiki_matched_with_generated_form) {
          result_csv += "|||" + generated_form_entry[6] + "|" + pos_lemma_combo + "|0\n";
          num_misses++;
        }
      }
    }
  }

  console.log(num_matches, "wiktionary-forms matched a forwards-reconstructed form, leaving", num_misses, "unmatched ");

  fs.writeFileSync("paradigmless_wiki_lemmas.csv", paradigmless_lemmas_csv);
  fs.writeFileSync("results_unannotated.csv", result_csv);

  console.log("See results_unannotated.csv");
  // console.log("Unreconstructable TOROT lemmas:\nPoS| Lemma\n..........");
  // for(const bad_lemma of unreconstructable_matched_TOROT_forms) {
  //   console.log(bad_lemma.slice(0, 2), "|", bad_lemma.slice(2));
  // }
}


  
const target_wiki_paradigms = JSON.parse(fs.readFileSync("target_wiki_paradigms_deduplicated.json"));

const generated_forms = JSON.parse(fs.readFileSync("lcs_converted.json"));
  
compareGeneratedLCSWithWikiForms(target_wiki_paradigms, generated_forms);


