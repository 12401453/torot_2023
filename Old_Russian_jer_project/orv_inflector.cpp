#include <iostream>
#include <string>
#include <array>
#include <unordered_map>
#include <fstream>
#include <sstream>
#include "LcsFlecter.h"

//regex for non-final jers: [ьъ](?!$)

//JS to filter the JSON array of all inflected forms to contain only those with inflections that contain non-final jers:
/* 
let jer_infls = new Array();
lcs_infl.forEach(arr => {
  const jer_arr = arr.filter(x => Number.isInteger(x) || typeof(x) == "boolean" || x.search(/[ьъ](?!$)/) != -1);
  if(jer_arr.length > 2) jer_infls.push(jer_arr);
}); 
*/

const icu::UnicodeString tl_dl_regex = "[dt][ĺl][^̥]";
const icu::UnicodeString ORT_regex = "[eo][rl]([tŕrpsšdfgћђklĺzžxčvbnńmǯ\+]|$)";
const icu::UnicodeString PV2_regex = "[kgx]v?([ěęeiь]|ŕ̥|ĺ̥)";
const icu::UnicodeString PV3_regex = "[ьię][kgx][auǫ]";
const icu::UnicodeString tense_jer_regex = "[ьъ]j[Ǣeiьęǫuě]";

void convertToORV(std::string& lcs_form) {
  // UErrorCode status = U_ZERO_ERROR;
  // icu::UnicodeString regex = "[ьъ](?!$)";
  // icu::RegexMatcher matcher(regex, 0, status);
}

UErrorCode status = U_ZERO_ERROR;
const icu::UnicodeString m_non_final_jer_regex = "[ьъ](?!$)";
icu::RegexMatcher non_final_jer_matcher(m_non_final_jer_regex, 0, status);

bool containsNonFinalJer(const icu::UnicodeString& lcs_form_unicode) {
  non_final_jer_matcher.reset(lcs_form_unicode);
  if(non_final_jer_matcher.find()) return true;
  else return false;
}

int main() {

  LcsFlecter noun_flecter(NOUN);
  LcsFlecter verb_flecter(VERB);
  
  std::vector<std::pair<int, std::array<std::string, 3>>> nouns_pairs_vec;
  std::vector<std::pair<int, std::array<std::string, 3>>> verbs_pairs_vec;

  nouns_pairs_vec.reserve(2048);
  verbs_pairs_vec.reserve(2048);
  
  std::ostringstream inflected_forms_json_oss;
  inflected_forms_json_oss << "[\n";

  std::ifstream orv_ocs_lemma_matches("orv_ocs_lemma_matches.csv");
  if(orv_ocs_lemma_matches.good()) {

    std::string line;
    while(std::getline(orv_ocs_lemma_matches, line)) {
      std::stringstream ss_line(line);
      
      
      std::string orv_torot_lemma, lcs_lemma, lcs_stem, conj_type;
      int old_lemma_id = 0;
      int noun_verb = 0;
      std::string ch_sl;
      
      std::string field;
      int row_number = 1;
      while(std::getline(ss_line, field, '|')) {
            switch(row_number) {
                case 1:
                    orv_torot_lemma = field;
                    break;
                case 3:
                    //I want this to break if the field has a non-valid number
                    old_lemma_id = std::stoi(field);
                    break;
                case 4:
                    lcs_lemma = field;
                    break;
                case 5:
                    conj_type = field;
                    break;
                case 6:
                    noun_verb = std::stoi(field);
                    break;
                case 7:
                    lcs_stem = field;
                    break;
                case 8:
                    ch_sl = field == "ch_sl" ? "true" : "false";
                    break;
                default:
                    ;
            }
          
        row_number++;  
      }
      if(noun_verb == 2) {
            nouns_pairs_vec.emplace_back(old_lemma_id, std::array<std::string, 3>{lcs_stem, conj_type, ch_sl});
        }
        else if(noun_verb == 1) {
            verbs_pairs_vec.emplace_back(old_lemma_id, std::array<std::string, 3>{lcs_stem, conj_type, ch_sl});
        }
        else {
            inflected_forms_json_oss << "[" << old_lemma_id << "," << ch_sl << ",\"" << lcs_lemma << "\"],\n"; 
      }
      
      
    }
    orv_ocs_lemma_matches.close();
  }

  icu::UnicodeString lcs_form_unicode;
  for(const auto& noun : nouns_pairs_vec) {
    noun_flecter.setStem(noun.second[0]);
    noun_flecter.setConjType(noun.second[1]);
    
    noun_flecter.produceUniqueInflections();

    for(auto inflections_iter = noun_flecter.m_unique_inflections.begin(); inflections_iter != noun_flecter.m_unique_inflections.end();) {
      lcs_form_unicode.setTo((*inflections_iter).c_str());
      if(!containsNonFinalJer(lcs_form_unicode)) {
        inflections_iter = noun_flecter.m_unique_inflections.erase(inflections_iter);
      }
      else {
        ++inflections_iter;
      }
    }
    if(noun_flecter.m_unique_inflections.size() > 0) {
      inflected_forms_json_oss << "[" << noun.first << "," << noun.second[2] << ",";
      for(const auto& infl : noun_flecter.m_unique_inflections) {
        inflected_forms_json_oss << "\"" << infl << "\",";
      }
      inflected_forms_json_oss.seekp(-1, std::ios_base::cur);
      inflected_forms_json_oss << "],\n";
    }
  }

  for(const auto& verb : verbs_pairs_vec) {
    verb_flecter.setStem(verb.second[0]);
    verb_flecter.setConjType(verb.second[1]);
    
    verb_flecter.produceUniqueInflections();

    for(auto inflections_iter = verb_flecter.m_unique_inflections.begin(); inflections_iter != verb_flecter.m_unique_inflections.end();) {
      lcs_form_unicode.setTo((*inflections_iter).c_str());
      if(!containsNonFinalJer(lcs_form_unicode)) {
        inflections_iter = verb_flecter.m_unique_inflections.erase(inflections_iter);
      }
      else {
        ++inflections_iter;
      }
    }
    if(verb_flecter.m_unique_inflections.size() > 0) {
      inflected_forms_json_oss << "[" << verb.first << "," << verb.second[2] << ",";
      for(const auto& infl : verb_flecter.m_unique_inflections) {
        inflected_forms_json_oss << "\"" << infl << "\",";
      }
      inflected_forms_json_oss.seekp(-1, std::ios_base::cur);
      inflected_forms_json_oss << "],\n";
    }
  }


//std::cout << nouns_map.at(65090)[0] << " : " << nouns_map.at(65090)[1] << "\n";
  inflected_forms_json_oss.seekp(-2, std::ios_base::cur);
  inflected_forms_json_oss << "\n]";
  // std::cout << inflected_forms_json_oss.str() << "\n"; 

  std::ofstream lcs_inflections_file("lcs_inflections.json");

  if(lcs_inflections_file.good()) {
    lcs_inflections_file << inflected_forms_json_oss.str();

    lcs_inflections_file.close();
  }


  return 0;
}
