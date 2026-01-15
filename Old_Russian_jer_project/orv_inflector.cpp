//COMPILATION (LINUX):
//g++ -O3 -std=c++20 orv_inflector.cpp LcsFlecterJerProj.cpp -licui18n -licuuc -licudata -o orv_inflector
//OR compile the LcsFlecterJerProj.cpp bit separately, as that is what takes fuckin ages because of the inflection-maps
//g++ -O3 -std=c++20 -c LcsFlecterJerProj.cpp -licui18n -licuuc -licudata -o LcsFlecterJerProj.o
//g++ -O3 -std=c++20 orv_inflector.cpp LcsFlecterJerProj.o -licui18n -licuuc -licudata -o orv_inflector
//on debian-based distros one might need to install libicu-dev or some similarly-named package before compilation
#include <iostream>
#include <string>
#include <array>
#include <unordered_map>
#include <fstream>
#include <sstream>
#include <cstdint>
#include "LcsFlecterJerProj.h"

struct LemmaInfo {
  bool pv2_3_exists;
  std::string ch_sl;
  std::string conj_type;
  std::string lcs_stem;
  std::string pos_lemma_combo;
};

const icu::UnicodeString PV2_regex = "[kgx]v?(?:[ěęeiь]|ŕ̥|ĺ̥)";
UErrorCode status = U_ZERO_ERROR;
icu::RegexMatcher pv2_full_matcher(PV2_regex, 0, status);

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

std::string unicodeSyllabicLiquids(std::string lcs_form) {
  LcsFlecter::replaceAll(lcs_form, "ŕ̥", "ṝ");
  LcsFlecter::replaceAll(lcs_form, "r̥", "ṛ");
  LcsFlecter::replaceAll(lcs_form, "ĺ̥", "ḹ");
  LcsFlecter::replaceAll(lcs_form, "l̥", "ḷ");
  return lcs_form;
}

#include "CsvReader.cpp"

consteval std::uint64_t compileTimeHashString(std::string_view sv) {
  uint64_t hash = 1469598103934665603ULL;
  for(char c : sv) {
      hash = hash ^ static_cast<unsigned char>(c);
      hash = hash * 1099511628211ULL;
  }
  return hash;
}

std::uint64_t runTimeHashString(std::string_view sv) {
  uint64_t hash = 1469598103934665603ULL;
  for(char c : sv) {
      hash = hash ^ static_cast<unsigned char>(c);
      hash = hash * 1099511628211ULL;
  }
  return hash;
}

int safeStrToInt(const std::string &string_number, int default_result) {
  int converted_int = default_result;
  try {
      converted_int = std::stoi(string_number);
  }
  catch (std::invalid_argument const& ex) {
      std::cout << "std::stoi failed with an invalid_argument exception; defaulting it to " << default_result << "\n";
  }
  catch (std::out_of_range const& ex) {
      std::cout << "std::stoi failed with an out_of_range exception; defaulting it to " << default_result << "\n";
  }
  return converted_int;
}

#include "data/conj_type_trunc_hash.cpp"
std::string makeLcsStem(icu::UnicodeString& unicode_lemma_lcs, const std::string& lcs_lemma, const std::string& conj_type, const std::string& stem1, const std::string& stem2, const std::string& pre_jot) {
  
  std::string stem_lcs = "";

  if(conj_type == "11" || conj_type == "12" || conj_type == "15" || conj_type == "16" || conj_type == "infix_11" || conj_type == "infix_12") {
    stem_lcs = stem2;
  }
  else if(conj_type == "14") {
    stem_lcs = stem1;
  }
  else if(pre_jot == "") {
    stem_lcs = "";
    unicode_lemma_lcs = unicode_lemma_lcs.fromUTF8(lcs_lemma);
    unicode_lemma_lcs.truncate(unicode_lemma_lcs.length() - conj_type_Trunc(conj_type));
    unicode_lemma_lcs.toUTF8String(stem_lcs);
  }
  else {
    stem_lcs = "";
    unicode_lemma_lcs = unicode_lemma_lcs.fromUTF8(pre_jot);
    unicode_lemma_lcs.truncate(unicode_lemma_lcs.length() - conj_type_Trunc(conj_type));
    unicode_lemma_lcs.toUTF8String(stem_lcs);
  }
  return stem_lcs;
}

int main() {

  LcsFlecter noun_flecter(NOUN);
  LcsFlecter verb_flecter(VERB);
  
  std::vector<LemmaInfo> nouns_pairs_vec;
  std::vector<LemmaInfo> verbs_pairs_vec;

  nouns_pairs_vec.reserve(2048);
  verbs_pairs_vec.reserve(2048);
  
  std::ostringstream indexed_inflected_lcs_json_oss;
  indexed_inflected_lcs_json_oss << "[\n";

  std::cout << "reading orv_lemmas_master.csv file...\n";
  std::ifstream orv_lemmas_file("orv_lemmas_master.csv");
  if(orv_lemmas_file.good()) {

    CsvReader csv_reader('|');
    std::string line;
    std::getline(orv_lemmas_file, line);
    csv_reader.setHeaders(line);
    while(std::getline(orv_lemmas_file, line)) {
      
      csv_reader.setLine(line);
      int noun_verb = safeStrToInt(csv_reader.getField("noun_verb"), 99);
      bool jer_proj = csv_reader.getField("jer_project") == "1" ? true : false;
      if(jer_proj == false || noun_verb == 99) {
        continue;
      }
      std::string orv_torot_lemma = csv_reader.getField("orv_lemma");
      std::string torot_pos = csv_reader.getField("pos");
      std::string lcs_lemma = csv_reader.getField("lcs_lemma");
      std::string conj_type= csv_reader.getField("conj_type");
      std::string stem1 = csv_reader.getField("stem1");
      std::string stem2 = csv_reader.getField("stem2");
      std::string pre_jot = csv_reader.getField("pre_jot");
      bool pv2_3_exists = csv_reader.getField("PV2/3") == "" ? false : true;
      std::string ch_sl = csv_reader.getField("ch_sl") == "ch_sl" ? "true" : "false";
      
      icu::UnicodeString lcs_lemma_unicode;

      std::string lcs_stem = makeLcsStem(lcs_lemma_unicode, lcs_lemma, conj_type, stem1, stem2, pre_jot);
      
      if(noun_verb == 2) {
          nouns_pairs_vec.emplace_back(pv2_3_exists, ch_sl, conj_type, lcs_stem, torot_pos+orv_torot_lemma);
        }
        else if(noun_verb == 1) {
          verbs_pairs_vec.emplace_back(pv2_3_exists, ch_sl, conj_type, lcs_stem, torot_pos+orv_torot_lemma);
        }
        else {
          lcs_lemma_unicode.setTo(lcs_lemma.c_str());

          indexed_inflected_lcs_json_oss << "[" << pv2_3_exists << "," << ch_sl << ",{\"0\":\"" << unicodeSyllabicLiquids(applyPV2Stem(lcs_lemma.c_str(), pv2_full_matcher)) << "\"},{},{},\"" << torot_pos << orv_torot_lemma << "\",\"non_infl\"],\n";
      }
      
      
    }
    orv_lemmas_file.close();
  }

  icu::UnicodeString lcs_form_unicode;
  std::cout << "inflecting nouns...\n";
  for(const auto& noun : nouns_pairs_vec) {
    noun_flecter.setStem(noun.lcs_stem);
    noun_flecter.setConjType(noun.conj_type);
    
    //noun_flecter.produceUniqueInflections();
    noun_flecter.produceAllInflections();

    if(noun_flecter.m_inflections.size() > 0) {
      
      indexed_inflected_lcs_json_oss << "[" << noun.pv2_3_exists << "," << noun.ch_sl << ",";
      
      for(const auto& infl_vec : noun_flecter.m_inflections) {
        indexed_inflected_lcs_json_oss << "{";
        bool empty_paradigm = true;
        for(const auto& infl : infl_vec) {
          if(!infl.flected_form.empty()) {
            indexed_inflected_lcs_json_oss << "\"" << infl.desinence_ix << "\":\"" << unicodeSyllabicLiquids(infl.flected_form) << "\",";
            empty_paradigm = false;
          }
        }
        if(!empty_paradigm) indexed_inflected_lcs_json_oss.seekp(-1, std::ios_base::cur);
        indexed_inflected_lcs_json_oss << "},";
      }    
      indexed_inflected_lcs_json_oss << "\"" << noun.pos_lemma_combo << "\",\"" << noun.conj_type << "\"";
      indexed_inflected_lcs_json_oss << "],\n";
    }
  }

  std::cout << "inflecting verbs...\n";
  for(const auto& verb : verbs_pairs_vec) {
    verb_flecter.setStem(verb.lcs_stem);
    verb_flecter.setConjType(verb.conj_type);
    
    verb_flecter.produceUniqueInflections();
    verb_flecter.produceAllInflections();

    if(verb_flecter.m_inflections.size() > 0) {
      
      indexed_inflected_lcs_json_oss << "[" << verb.pv2_3_exists << "," << verb.ch_sl << ",";
      
      for(const auto& infl_vec : verb_flecter.m_inflections) {
        indexed_inflected_lcs_json_oss << "{";
        bool empty_paradigm = true;
        for(const auto& infl : infl_vec) {
          if(!infl.flected_form.empty()) {
            indexed_inflected_lcs_json_oss << "\"" << infl.desinence_ix << "\":\"" << unicodeSyllabicLiquids(infl.flected_form) << "\",";
            empty_paradigm = false;
          }
        }
        if(!empty_paradigm) indexed_inflected_lcs_json_oss.seekp(-1, std::ios_base::cur);
        indexed_inflected_lcs_json_oss << "},";
      }    
      indexed_inflected_lcs_json_oss << "\"" << verb.pos_lemma_combo << "\",\"" << verb.conj_type << "\"";
      indexed_inflected_lcs_json_oss << "],\n";
    }
  }

  indexed_inflected_lcs_json_oss.seekp(-2, std::ios_base::cur);
  indexed_inflected_lcs_json_oss << "\n]";

  std::ofstream indexed_lcs_inflections_file("lcs_inflections_indexed.json");

  if(indexed_lcs_inflections_file.good()) {
    indexed_lcs_inflections_file << indexed_inflected_lcs_json_oss.str();

    indexed_lcs_inflections_file.close();
  }


  return 0;
}
