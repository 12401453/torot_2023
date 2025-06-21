#include <iostream>
#include <string>
#include <array>
#include <unordered_map>
#include <fstream>
#include <sstream>
#include "LcsFlecter.h"

int main() {

  LcsFlecter noun_flecter(NOUN);
  LcsFlecter verb_flecter(VERB);
  
  std::vector<std::pair<int, std::array<std::string, 2>>> nouns_pairs_vec;
  std::vector<std::pair<int, std::array<std::string, 2>>> verbs_pairs_vec;

  nouns_pairs_vec.reserve(2048);
  verbs_pairs_vec.reserve(2048);
  
  std::ostringstream inflected_forms_json_oss;
  inflected_forms_json_oss << "{\n";

  std::ifstream orv_ocs_lemma_matches("orv_ocs_lemma_matches.csv");
  if(orv_ocs_lemma_matches.good()) {

    std::string line;
    while(std::getline(orv_ocs_lemma_matches, line)) {
      std::stringstream ss_line(line);
      
      
      std::string orv_torot_lemma, lcs_lemma, lcs_stem, conj_type;
      int old_lemma_id = 0;
      int noun_verb = 0;
      
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
                default:
                    ;
            }
          
        row_number++;  
      }
      if(noun_verb == 2) {
            nouns_pairs_vec.emplace_back(old_lemma_id, std::array<std::string, 2>{lcs_stem, conj_type});
        }
        else if(noun_verb == 1) {
            verbs_pairs_vec.emplace_back(old_lemma_id, std::array<std::string, 2>{lcs_stem, conj_type});
        }
        else {
            inflected_forms_json_oss << "\"" << old_lemma_id << "\":[\"" << lcs_lemma << "\"],\n"; 
      }
      
      
    }
    orv_ocs_lemma_matches.close();
  }

  for(const auto& noun : nouns_pairs_vec) {
    noun_flecter.setStem(noun.second[0]);
    noun_flecter.setConjType(noun.second[1]);
    
    noun_flecter.produceUniqueInflections();

    inflected_forms_json_oss << "\"" << noun.first << "\":[";
    for(const auto& infl : noun_flecter.m_unique_inflections) {
      inflected_forms_json_oss << "\"" << infl << "\",";
    }
    inflected_forms_json_oss.seekp(-1, std::ios_base::cur);
    inflected_forms_json_oss << "],\n"; 
  }
  for(const auto& verb : verbs_pairs_vec) {
    verb_flecter.setStem(verb.second[0]);
    verb_flecter.setConjType(verb.second[1]);
    
    // std::cout << verb.second[0] << " : " << verb.second[1] << "\n";


    verb_flecter.produceUniqueInflections();
    // std::cout << "after\n";

    inflected_forms_json_oss << "\"" << verb.first << "\":[";
    for(const auto& infl : verb_flecter.m_unique_inflections) {
      inflected_forms_json_oss << "\"" << infl << "\",";
      // std::cout << "\"" << infl << "\",";
    }
    inflected_forms_json_oss.seekp(-1, std::ios_base::cur);
    inflected_forms_json_oss << "],\n";
    // std::cout << "],\n";
  }


//std::cout << nouns_map.at(65090)[0] << " : " << nouns_map.at(65090)[1] << "\n";
  inflected_forms_json_oss.seekp(-2, std::ios_base::cur);
  inflected_forms_json_oss << "\n}";
  // std::cout << inflected_forms_json_oss.str() << "\n"; 

  std::ofstream lcs_inflections_file("lcs_inflections.json");

  if(lcs_inflections_file.good()) {
    lcs_inflections_file << inflected_forms_json_oss.str();

    lcs_inflections_file.close();
  }


  return 0;
}
