//g++ -O3 -std=c++20 orv_inflector.cpp LcsFlecterJerProj.cpp -licui18n -licuuc -licudata -o orv_inflector
//OR compile the LcsFlecterJerProj.cpp bit separately, as that is what takes fockin ages because of the inflection-maps
//g++ -O3 -std=c++20 -c LcsFlecterJerProj.cpp -licui18n -licuuc -licudata -o LcsFlecterJerProj.o
//g++ -O3 -std=c++20 orv_inflector.cpp LcsFlecterJerProj.o -licui18n -licuuc -licudata -o orv_inflector
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
const icu::UnicodeString m_non_final_jer_regex = "[ьъEO](?!$)";

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

std::string unicodeSyllabicLiquids(std::string lcs_form) {
  LcsFlecter::replaceAll(lcs_form, "ŕ̥", "ṝ");
  LcsFlecter::replaceAll(lcs_form, "r̥", "ṛ");
  LcsFlecter::replaceAll(lcs_form, "ĺ̥", "ḹ");
  LcsFlecter::replaceAll(lcs_form, "l̥", "ḷ");
  return lcs_form;
}


std::string convertToORV(std::string lcs_form, const std::string& conj_type, bool ch_sl, bool pv2_3_exists) {
  LcsFlecter::replaceAll(lcs_form, "ę̌", "ě");//should these top two be different for ch_sl words?
  LcsFlecter::replaceAll(lcs_form, "y̨", "a");
  //LcsFlecter::replaceAll(lcs_form, "Q", "ь");
  LcsFlecter::replaceAll(lcs_form, "ĺ̥", "l̥");

  LcsFlecter::replaceAll(lcs_form, "dn", "n");

  LcsFlecter::replaceAll(lcs_form, "E", "ь");
  LcsFlecter::replaceAll(lcs_form, "O", "ъ");

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

  LcsFlecter::replaceAll(lcs_form, "Ǣ", "ä");

  icu::UnicodeString lcs_form_unicode;
  lcs_form_unicode = lcs_form_unicode.fromUTF8(lcs_form);

  //applyPV2(lcs_form_unicode, pv2_full_matcher);

  if(pv2_3_exists) applyPV3(lcs_form_unicode);

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

// class CsvReader {
//   public:
//     CsvReader(char separator=',') {
//       m_separator = separator;
//       m_fields_vec.reserve(32);
//     }

//     void setHeaders(const std::string& first_line) {
//       m_header_index_map.clear();

//       std::stringstream first_line_ss(first_line);
//       std::string header;
//       int header_idx = 0;
//       while(std::getline(first_line_ss, header, m_separator)) {
//         m_header_index_map.emplace(header, header_idx);
//         ++header_idx;
//       }
//     }
   
//     void setLine(const std::string& line) {
//       m_fields_vec.clear();

//       m_raw_line = line;
//       std::stringstream line_ss(line);
//       std::string field;
//       while(std::getline(line_ss, field, m_separator)){
//         m_fields_vec.emplace_back(field);
//       }
//     }
  
//     std::string getField(const std::string& header) {
//       return m_fields_vec[m_header_index_map.at(header)];
//     }

//   private:
//     char m_separator;
//     std::string m_raw_line;
//     std::vector<std::string> m_fields_vec;
//     std::unordered_map<std::string, int> m_header_index_map;
// };
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

#include "conj_type_trunc.cpp"
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
  
  // std::vector<std::pair<int, std::array<std::string, 3>>> nouns_pairs_vec;
  // std::vector<std::pair<int, std::array<std::string, 3>>> verbs_pairs_vec;
  std::vector<LemmaInfo> nouns_pairs_vec;
  std::vector<LemmaInfo> verbs_pairs_vec;

  nouns_pairs_vec.reserve(2048);
  verbs_pairs_vec.reserve(2048);
  
  std::ostringstream inflected_lcs_json_oss;
  std::ostringstream inflected_orv_json_oss;
  std::ostringstream indexed_inflected_lcs_json_oss;
  inflected_lcs_json_oss << "[\n";
  inflected_orv_json_oss << "[\n";
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
      int old_lemma_id = 0;
      
      
      std::string ch_sl = csv_reader.getField("ch_sl") == "ch_sl" ? "true" : "false";
      
      icu::UnicodeString lcs_lemma_unicode;

      std::string lcs_stem = makeLcsStem(lcs_lemma_unicode, lcs_lemma, conj_type, stem1, stem2, pre_jot);
      
      if(noun_verb == 2) {
            //nouns_pairs_vec.emplace_back(pv2_3_exists, std::array<std::string, 3>{lcs_stem, conj_type, ch_sl});
            nouns_pairs_vec.emplace_back(pv2_3_exists, ch_sl, conj_type, lcs_stem, torot_pos+orv_torot_lemma);
        }
        else if(noun_verb == 1) {
            // verbs_pairs_vec.emplace_back(pv2_3_exists, std::array<std::string, 3>{lcs_stem, conj_type, ch_sl});
            verbs_pairs_vec.emplace_back(pv2_3_exists, ch_sl, conj_type, lcs_stem, torot_pos+orv_torot_lemma);
        }
        else {
          lcs_lemma_unicode.setTo(lcs_lemma.c_str());
          //if(containsNonFinalJer(lcs_lemma_unicode)) {
            inflected_lcs_json_oss << "[" << pv2_3_exists << "," << ch_sl << ",\"" << lcs_lemma << "\"],\n";
            inflected_orv_json_oss << "[" << pv2_3_exists << "," << ch_sl << ",\"" << convertToORV(lcs_lemma, conj_type, (ch_sl == "true"), pv2_3_exists) << "\"],\n";
            indexed_inflected_lcs_json_oss << "[" << pv2_3_exists << "," << ch_sl << ",{\"0\":\"" << unicodeSyllabicLiquids(applyPV2Stem(lcs_lemma.c_str(), pv2_full_matcher)) << "\"},{},{},\"" << torot_pos << orv_torot_lemma << "\",\"non_infl\"],\n";
          //}
      }
      
      
    }
    orv_lemmas_file.close();
  }

  icu::UnicodeString lcs_form_unicode;
  std::cout << "inflecting nouns...\n";
  for(const auto& noun : nouns_pairs_vec) {
    noun_flecter.setStem(noun.lcs_stem);
    noun_flecter.setConjType(noun.conj_type);
    
    noun_flecter.produceUniqueInflections();
    noun_flecter.produceAllInflections();


    std::vector<std::string> orv_noun_inflections;
    orv_noun_inflections.reserve(noun_flecter.m_unique_inflections.size());

    for(auto inflections_iter = noun_flecter.m_unique_inflections.begin(); inflections_iter != noun_flecter.m_unique_inflections.end();) {
      lcs_form_unicode.setTo((*inflections_iter).c_str());
      // if(!containsNonFinalJer(lcs_form_unicode)) {
      //   inflections_iter = noun_flecter.m_unique_inflections.erase(inflections_iter);
      // }
      //else {
        orv_noun_inflections.emplace_back(convertToORV(*inflections_iter, noun.conj_type, (noun.ch_sl == "true"), noun.pv2_3_exists));
        ++inflections_iter;
      //}
    }

    // for(const auto& orv_infl : orv_noun_inflections) {
    //   std::cout << orv_infl << " | ";
    // }
    // std::cout << "\n";

    if(noun_flecter.m_unique_inflections.size() > 0) {
      inflected_lcs_json_oss << "[" << noun.pv2_3_exists << "," << noun.ch_sl << ",";
      inflected_orv_json_oss << "[" << noun.pv2_3_exists << "," << noun.ch_sl << ",";
      indexed_inflected_lcs_json_oss << "[" << noun.pv2_3_exists << "," << noun.ch_sl << ",";
      for(const auto& infl : noun_flecter.m_unique_inflections) {
        inflected_lcs_json_oss << "\"" << infl << "\",";
      }
      for(const auto& orv_infl : orv_noun_inflections) {
        inflected_orv_json_oss << "\"" << orv_infl << "\",";
      }
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
      inflected_lcs_json_oss.seekp(-1, std::ios_base::cur);
      inflected_lcs_json_oss << "],\n";
      inflected_orv_json_oss.seekp(-1, std::ios_base::cur);
      inflected_orv_json_oss << "],\n";
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

    std::vector<std::string> orv_verb_inflections;
    orv_verb_inflections.reserve(verb_flecter.m_unique_inflections.size());

    for(auto inflections_iter = verb_flecter.m_unique_inflections.begin(); inflections_iter != verb_flecter.m_unique_inflections.end();) {
      lcs_form_unicode.setTo((*inflections_iter).c_str());
      // if(!containsNonFinalJer(lcs_form_unicode)) {
      //   //std::set::erase() invalidates the current iterator and returns an iterator to the member after the erased one
      //   inflections_iter = verb_flecter.m_unique_inflections.erase(inflections_iter);
      // }
      //else {
        orv_verb_inflections.emplace_back(convertToORV(*inflections_iter, verb.conj_type, (verb.ch_sl == "true"), verb.pv2_3_exists));
        ++inflections_iter;
      //}
    }

    // for(const auto& orv_infl : orv_verb_inflections) {
    //   std::cout << orv_infl << " | ";
    // }
    // std::cout << "\n";

    if(verb_flecter.m_unique_inflections.size() > 0) {
      inflected_lcs_json_oss << "[" << verb.pv2_3_exists << "," << verb.ch_sl << ",";
      inflected_orv_json_oss << "[" << verb.pv2_3_exists << "," << verb.ch_sl << ",";
      indexed_inflected_lcs_json_oss << "[" << verb.pv2_3_exists << "," << verb.ch_sl << ",";
      for(const auto& infl : verb_flecter.m_unique_inflections) {
        inflected_lcs_json_oss << "\"" << infl << "\",";
      }
      for(const auto& orv_infl : orv_verb_inflections) {
        inflected_orv_json_oss << "\"" << orv_infl << "\",";
      }
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
      inflected_lcs_json_oss.seekp(-1, std::ios_base::cur);
      inflected_lcs_json_oss << "],\n";
      inflected_orv_json_oss.seekp(-1, std::ios_base::cur);
      inflected_orv_json_oss << "],\n";
      indexed_inflected_lcs_json_oss << "\"" << verb.pos_lemma_combo << "\",\"" << verb.conj_type << "\"";
      indexed_inflected_lcs_json_oss << "],\n";
    }
  }


//std::cout << nouns_map.at(65090)[0] << " : " << nouns_map.at(65090)[1] << "\n";
  inflected_lcs_json_oss.seekp(-2, std::ios_base::cur);
  inflected_lcs_json_oss << "\n]";
  inflected_orv_json_oss.seekp(-2, std::ios_base::cur);
  inflected_orv_json_oss << "\n]";
  indexed_inflected_lcs_json_oss.seekp(-2, std::ios_base::cur);
  indexed_inflected_lcs_json_oss << "\n]";
  // std::cout << inflected_lcs_json_oss.str() << "\n"; 

  std::ofstream lcs_inflections_file("lcs_inflections.json");
  std::ofstream orv_inflections_file("orv_inflections.json");
  std::ofstream indexed_lcs_inflections_file("lcs_inflections_indexed.json");

  if(lcs_inflections_file.good()) {
    lcs_inflections_file << inflected_lcs_json_oss.str();

    lcs_inflections_file.close();
  }
  if(orv_inflections_file.good()) {
    orv_inflections_file << inflected_orv_json_oss.str();

    orv_inflections_file.close();
  }
  if(indexed_lcs_inflections_file.good()) {
    indexed_lcs_inflections_file << indexed_inflected_lcs_json_oss.str();

    indexed_lcs_inflections_file.close();
  }


  return 0;
}
