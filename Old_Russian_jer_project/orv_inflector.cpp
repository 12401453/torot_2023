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
const icu::UnicodeString ORT_regex = "[eo][rl](?:[tŕrpsšdfgћђklĺzžxčvbnńmǯ\+]|$)";
const icu::UnicodeString PV2_regex = "[kgx]v?(?:[ěęeiь]|ŕ̥|ĺ̥)";
const icu::UnicodeString PV2_regex_PV3 = "[kgx]v?(?:[ęeь]|ŕ̥|ĺ̥)";
const icu::UnicodeString PV2_regex_CSR = "[kgx]v?[ěi](?!$)";
const icu::UnicodeString PV2_regex_stem = "[kgx]v?[ěi]";
const icu::UnicodeString PV3_regex = "[ьię][kgx][auǫ]";
const icu::UnicodeString tense_jer_regex = "[ьъ]j[Ǣeiьęǫuě]";
const icu::UnicodeString m_non_final_jer_regex = "[ьъ](?!$)";

UErrorCode status = U_ZERO_ERROR;
icu::RegexMatcher non_final_jer_matcher(m_non_final_jer_regex, 0, status);
icu::RegexMatcher tl_dl_matcher(tl_dl_regex, 0, status);
icu::RegexMatcher ort_matcher(ORT_regex, 0, status);
icu::RegexMatcher pv3_matcher(PV3_regex, 0, status);
icu::RegexMatcher pv2_full_matcher(PV2_regex, 0, status);
icu::RegexMatcher pv2_pv3_matcher(PV2_regex_PV3, 0, status);
icu::RegexMatcher pv2_csr_matcher(PV2_regex_CSR, 0, status);
icu::RegexMatcher pv2_stem_matcher(PV2_regex_stem, 0, status);
icu::RegexMatcher tense_jer_matcher(tense_jer_regex, 0, status);

void yeetTlDl(icu::UnicodeString& lcs_form_unicode) {
  tl_dl_matcher.reset(lcs_form_unicode);
  while(tl_dl_matcher.find()){
    lcs_form_unicode.replaceBetween(tl_dl_matcher.start(status), lcs_form_unicode.length() , lcs_form_unicode.tempSubString(tl_dl_matcher.start(status) + 1));
    tl_dl_matcher.reset(lcs_form_unicode);
  }
}

void TRAT(icu::UnicodeString& lcs_form_unicode) {
  ort_matcher.reset(lcs_form_unicode);
  while(ort_matcher.find()) {
    int32_t ort_start_pos = ort_matcher.start(status);
    icu::UnicodeString ort_vowel = lcs_form_unicode.tempSubString(ort_start_pos, 1);
    icu::UnicodeString ort_liquid = lcs_form_unicode.tempSubString(ort_start_pos + 1, 1);
    icu::UnicodeString lengthened_vowel = ort_vowel == "e" ? "ě" : "a";
    icu::UnicodeString remainder = lcs_form_unicode.tempSubString(ort_start_pos + 2);

    lcs_form_unicode = lcs_form_unicode.tempSubString(0, ort_start_pos).append(ort_liquid).append(lengthened_vowel).append(remainder);
    ort_matcher.reset(lcs_form_unicode);
  }
}
void TOROT(icu::UnicodeString& lcs_form_unicode) {
  ort_matcher.reset(lcs_form_unicode);
  while(ort_matcher.find()) {
    int32_t ort_start_pos = ort_matcher.start(status);
    icu::UnicodeString ort_vowel = lcs_form_unicode.tempSubString(ort_start_pos, 1);
    icu::UnicodeString ort_liquid = lcs_form_unicode.tempSubString(ort_start_pos + 1, 1);
    if(ort_liquid == "l") ort_vowel.setTo("o");
    icu::UnicodeString remainder = lcs_form_unicode.tempSubString(ort_start_pos + 2);

    if(ort_start_pos == 0) {
      lcs_form_unicode = ort_liquid.append(ort_vowel).append(remainder);
    }
    else lcs_form_unicode = lcs_form_unicode.tempSubString(0, ort_start_pos).append(ort_vowel).append(ort_liquid).append(ort_vowel).append(remainder);

    ort_matcher.reset(lcs_form_unicode);
  }
}

void applyPV3(icu::UnicodeString& lcs_form_unicode) {
  pv3_matcher.reset(lcs_form_unicode);
  while(pv3_matcher.find()) {
    int32_t pv3_start_pos = pv3_matcher.start(status);
    icu::UnicodeString velar = lcs_form_unicode.tempSubString(pv3_start_pos + 1, 1);
    icu::UnicodeString remainder = lcs_form_unicode.tempSubString(pv3_start_pos + 2);

    //making a hash-map out of icu::UnicodeStrings is a pain in the ass and it's only 3 things so I'm just doing it like this
    icu::UnicodeString new_velar;
    if(velar == "k") new_velar = new_velar.fromUTF8("c");
    else if(velar == "g") new_velar = new_velar.fromUTF8("ʒ");
    else if(velar == "x") new_velar = new_velar.fromUTF8("ś");
    
    
    lcs_form_unicode = lcs_form_unicode.tempSubString(0, pv3_start_pos + 1).append(new_velar).append(remainder);

    pv3_matcher.reset(lcs_form_unicode);
  }
}
void applyPV2(icu::UnicodeString& lcs_form_unicode, icu::RegexMatcher& pv2_matcher) {
  pv2_matcher.reset(lcs_form_unicode);
  while(pv2_matcher.find()) {
    int32_t pv2_start_pos = pv2_matcher.start(status);
    icu::UnicodeString velar = lcs_form_unicode.tempSubString(pv2_start_pos, 1);
    icu::UnicodeString remainder = lcs_form_unicode.tempSubString(pv2_start_pos + 1);

    //making a hash-map out of icu::UnicodeStrings is a pain in the ass and it's only 3 things so I'm just doing it like this
    icu::UnicodeString new_velar;
    if(velar == "k") new_velar = new_velar.fromUTF8("c");
    else if(velar == "g") new_velar = new_velar.fromUTF8("ʒ");
    else if(velar == "x") new_velar = new_velar.fromUTF8("ś");
    
    
    lcs_form_unicode = lcs_form_unicode.tempSubString(0, pv2_start_pos).append(new_velar).append(remainder);

    pv2_matcher.reset(lcs_form_unicode);
  }
}
std::string applyPV2Stem(const char* lcs_form_c_str, icu::RegexMatcher& pv2_matcher) {
  icu::UnicodeString lcs_form_unicode;
  lcs_form_unicode.setTo(lcs_form_c_str);
  pv2_matcher.reset(lcs_form_unicode);
  while(pv2_matcher.find()) {
    int32_t pv2_start_pos = pv2_matcher.start(status);
    icu::UnicodeString velar = lcs_form_unicode.tempSubString(pv2_start_pos, 1);
    icu::UnicodeString remainder = lcs_form_unicode.tempSubString(pv2_start_pos + 1);

    //making a hash-map out of icu::UnicodeStrings is a pain in the ass and it's only 3 things so I'm just doing it like this
    icu::UnicodeString new_velar;
    if(velar == "k") new_velar = new_velar.fromUTF8("c");
    else if(velar == "g") new_velar = new_velar.fromUTF8("ʒ");
    else if(velar == "x") new_velar = new_velar.fromUTF8("ś");
    
    
    lcs_form_unicode = lcs_form_unicode.tempSubString(0, pv2_start_pos).append(new_velar).append(remainder);

    pv2_matcher.reset(lcs_form_unicode);
  }
  std::string pv2_stem_applied_str;
  lcs_form_unicode.toUTF8String(pv2_stem_applied_str);
  return pv2_stem_applied_str;
}

void denasaliseORV(std::string& lcs_form) {
  LcsFlecter::replaceAll(lcs_form, "ǫ", "u");

  //I'm assuming that pre-jer shift in idealised OR we had /a/ after palatals and /ä/ after LCS hard-consonants, which post-Jer Shift became /'a/. This isn't necessary if one assumes that denasalisation of front-jer alone was enough to phonemicise the secondarily-soft consonants, rather than jer-falling
  LcsFlecter::replaceAll(lcs_form, "šę", "ša");
  LcsFlecter::replaceAll(lcs_form, "čę", "ča");
  LcsFlecter::replaceAll(lcs_form, "žę", "ža");
  LcsFlecter::replaceAll(lcs_form, "ћę", "ћa");
  LcsFlecter::replaceAll(lcs_form, "ђę", "ћa");
  LcsFlecter::replaceAll(lcs_form, "ǯę", "ǯa");
  LcsFlecter::replaceAll(lcs_form, "ję", "ja");
  LcsFlecter::replaceAll(lcs_form, "ńę", "ńa");
  LcsFlecter::replaceAll(lcs_form, "ŕę", "ŕa");
  LcsFlecter::replaceAll(lcs_form, "ĺę", "ĺa");
  //I don't think the PV3-consonant + /ę/ combos can occur in OR due to them coming exclusively from "ę̌", but I might be wrong
  LcsFlecter::replaceAll(lcs_form, "śę", "śa");
  LcsFlecter::replaceAll(lcs_form, "cę", "ca");
  LcsFlecter::replaceAll(lcs_form, "ʒę", "ʒa");
  
  //nothing in LCS should ever start with "ę" so this should only remain after LCS hard-consonants
  LcsFlecter::replaceAll(lcs_form, "ę", "ä");

}

void dejotationReflexesORV(std::string& lcs_form) {
  //many of these aren't true for Novgorodian/Pksovian/Ukrainian; I'm targeting CSR
  LcsFlecter::replaceAll(lcs_form, "šћ", "šč");
  LcsFlecter::replaceAll(lcs_form, "žђ", "žž");
  LcsFlecter::replaceAll(lcs_form, "žǯ", "žž");
  LcsFlecter::replaceAll(lcs_form, "ћ", "č");
  LcsFlecter::replaceAll(lcs_form, "ђ", "ž");
}
void dejotationReflexesOCS(std::string& lcs_form) {
  //many of these aren't true for Novgorodian/Pksovian/Ukrainian; I'm targeting CSR
  LcsFlecter::replaceAll(lcs_form, "šћ", "št");
  LcsFlecter::replaceAll(lcs_form, "žђ", "žd");
  LcsFlecter::replaceAll(lcs_form, "žǯ", "žd");
  LcsFlecter::replaceAll(lcs_form, "ћ", "št");
  LcsFlecter::replaceAll(lcs_form, "ђ", "žd");
}


std::string convertToORV(std::string lcs_form, const std::string& conj_type, bool ch_sl=false) {
  LcsFlecter::replaceAll(lcs_form, "ę̌", "ě");//should these top two be different for ch_sl words?
  LcsFlecter::replaceAll(lcs_form, "y̨", "a");
  LcsFlecter::replaceAll(lcs_form, "Q", "ь");
  LcsFlecter::replaceAll(lcs_form, "ĺ̥", "l̥");

  LcsFlecter::replaceAll(lcs_form, "dn", "n");

  if(lcs_form.starts_with("ak") || lcs_form.starts_with("av") || lcs_form.starts_with("az")) {
    lcs_form = "jǢ" + lcs_form.substr(1);
  }
  if(lcs_form.find("čьlově") != -1) {
    LcsFlecter::replaceAll(lcs_form, "čьlově", "čelově");
  }
  //need to consult Andersen's shitty book to get a fuller list
  if(!ch_sl && lcs_form.starts_with("jedin")) {
    LcsFlecter::replaceAll(lcs_form, "jedin", "odin");
  }
  else if(lcs_form.starts_with("jezer")) {
    LcsFlecter::replaceAll(lcs_form, "jezer", "ozer");
  }

  LcsFlecter::replaceAll(lcs_form, "Ǣ", "a");

  icu::UnicodeString lcs_form_unicode;
  lcs_form_unicode = lcs_form_unicode.fromUTF8(lcs_form);

  applyPV2(lcs_form_unicode, pv2_full_matcher);

  if(conj_type.find("PV3") != std::string::npos || conj_type == "vьxь" || lcs_form.starts_with("vьxak")) applyPV3(lcs_form_unicode);

  yeetTlDl(lcs_form_unicode);
  ch_sl ? TRAT(lcs_form_unicode) : TOROT(lcs_form_unicode);

  lcs_form = "";
  lcs_form_unicode.toUTF8String(lcs_form); //this appends to a string so need to zero lcs_form first
  denasaliseORV(lcs_form);

  ch_sl ? dejotationReflexesOCS(lcs_form) : dejotationReflexesORV(lcs_form);

  LcsFlecter::replaceAll(lcs_form, "+", "");
  LcsFlecter::replaceAll(lcs_form, "ŕ̥", "ṝ");
  LcsFlecter::replaceAll(lcs_form, "r̥", "ṛ");
  LcsFlecter::replaceAll(lcs_form, "ĺ̥", "ḹ");
  LcsFlecter::replaceAll(lcs_form, "l̥", "ḷ");
  return lcs_form;
  
}

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
  std::ostringstream inflected_forms_orv_oss;
  inflected_forms_json_oss << "[\n";
  inflected_forms_orv_oss << "[\n";

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

      icu::UnicodeString lcs_lemma_unicode;
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
          lcs_lemma_unicode.setTo(lcs_lemma.c_str());
          if(containsNonFinalJer(lcs_lemma_unicode)) {
            inflected_forms_json_oss << "[" << old_lemma_id << "," << ch_sl << ",\"" << lcs_lemma << "\"],\n";
            inflected_forms_orv_oss << "[" << old_lemma_id << "," << ch_sl << ",\"" << convertToORV(lcs_lemma, conj_type, (ch_sl == "true")) << "\"],\n";
          }
      }
      
      
    }
    orv_ocs_lemma_matches.close();
  }

  icu::UnicodeString lcs_form_unicode;
  for(const auto& noun : nouns_pairs_vec) {
    noun_flecter.setStem(noun.second[0]);
    noun_flecter.setConjType(noun.second[1]);
    
    noun_flecter.produceUniqueInflections();

    std::vector<std::string> orv_noun_inflections;
    orv_noun_inflections.reserve(noun_flecter.m_unique_inflections.size());

    for(auto inflections_iter = noun_flecter.m_unique_inflections.begin(); inflections_iter != noun_flecter.m_unique_inflections.end();) {
      lcs_form_unicode.setTo((*inflections_iter).c_str());
      if(!containsNonFinalJer(lcs_form_unicode)) {
        inflections_iter = noun_flecter.m_unique_inflections.erase(inflections_iter);
      }
      else {
        orv_noun_inflections.emplace_back(convertToORV(*inflections_iter, noun.second[1], (noun.second[2] == "true")));
        ++inflections_iter;
      }
    }

    for(const auto& orv_infl : orv_noun_inflections) {
      std::cout << orv_infl << " | ";
    }
    std::cout << "\n";

    if(noun_flecter.m_unique_inflections.size() > 0) {
      inflected_forms_json_oss << "[" << noun.first << "," << noun.second[2] << ",";
      inflected_forms_orv_oss << "[" << noun.first << "," << noun.second[2] << ",";
      for(const auto& infl : noun_flecter.m_unique_inflections) {
        inflected_forms_json_oss << "\"" << infl << "\",";
      }
      for(const auto& orv_infl : orv_noun_inflections) {
        inflected_forms_orv_oss << "\"" << orv_infl << "\",";
      }
      inflected_forms_json_oss.seekp(-1, std::ios_base::cur);
      inflected_forms_json_oss << "],\n";
      inflected_forms_orv_oss.seekp(-1, std::ios_base::cur);
      inflected_forms_orv_oss << "],\n";
    }
  }

  for(const auto& verb : verbs_pairs_vec) {
    verb_flecter.setStem(verb.second[0]);
    verb_flecter.setConjType(verb.second[1]);
    
    verb_flecter.produceUniqueInflections();

    std::vector<std::string> orv_verb_inflections;
    orv_verb_inflections.reserve(verb_flecter.m_unique_inflections.size());

    for(auto inflections_iter = verb_flecter.m_unique_inflections.begin(); inflections_iter != verb_flecter.m_unique_inflections.end();) {
      lcs_form_unicode.setTo((*inflections_iter).c_str());
      if(!containsNonFinalJer(lcs_form_unicode)) {
        //std::set::erase() invalidates the current iterator and returns an iterator to the member after the erased one
        inflections_iter = verb_flecter.m_unique_inflections.erase(inflections_iter);
      }
      else {
        orv_verb_inflections.emplace_back(convertToORV(*inflections_iter, verb.second[1], (verb.second[2] == "true")));
        ++inflections_iter;
      }
    }

    for(const auto& orv_infl : orv_verb_inflections) {
      std::cout << orv_infl << " | ";
    }
    std::cout << "\n";

    if(verb_flecter.m_unique_inflections.size() > 0) {
      inflected_forms_json_oss << "[" << verb.first << "," << verb.second[2] << ",";
      inflected_forms_orv_oss << "[" << verb.first << "," << verb.second[2] << ",";
      for(const auto& infl : verb_flecter.m_unique_inflections) {
        inflected_forms_json_oss << "\"" << infl << "\",";
      }
      for(const auto& orv_infl : orv_verb_inflections) {
        inflected_forms_orv_oss << "\"" << orv_infl << "\",";
      }
      inflected_forms_json_oss.seekp(-1, std::ios_base::cur);
      inflected_forms_json_oss << "],\n";
      inflected_forms_orv_oss.seekp(-1, std::ios_base::cur);
      inflected_forms_orv_oss << "],\n";
    }
  }


//std::cout << nouns_map.at(65090)[0] << " : " << nouns_map.at(65090)[1] << "\n";
  inflected_forms_json_oss.seekp(-2, std::ios_base::cur);
  inflected_forms_json_oss << "\n]";
  inflected_forms_orv_oss.seekp(-2, std::ios_base::cur);
  inflected_forms_orv_oss << "\n]";
  // std::cout << inflected_forms_json_oss.str() << "\n"; 

  std::ofstream lcs_inflections_file("lcs_inflections.json");
  std::ofstream orv_inflections_file("orv_inflections.json");

  if(lcs_inflections_file.good()) {
    lcs_inflections_file << inflected_forms_json_oss.str();

    lcs_inflections_file.close();
  }
  if(orv_inflections_file.good()) {
    orv_inflections_file << inflected_forms_orv_oss.str();

    orv_inflections_file.close();
  }


  return 0;
}
