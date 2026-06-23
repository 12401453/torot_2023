#include <sqlite3.h>
#include <iostream>
#include <string>
#include <vector>
#include <unordered_set>
#include <unordered_map>
#include <sstream>
#include <fstream>

//g++ -std=c++20 imperf_sql.cpp -lsqlite3 -o imperf_sql

struct LemmaInfo {
    int lemma_id;
    std::string lemma_ocs;
    std::string lemma_ocs_no_hashtag;
};

struct SentenceInfo {
    int sentence_no;
    int lemma_id;
    std::string lemma_ocs;
    std::string sentence_txt;
    sqlite3_int64 imperfect_form_tokno;
    std::string imperfect_form_ocs;
    std::string text_title;
    std::string subtitle;
};

std::pair<std::string, std::string> getTextTitleAndSubtitle(sqlite3* db_connection, sqlite3_int64 tokno) {
    const char* sql_txt = "SELECT subtitle_text, text_id FROM subtitles WHERE tokno_start <= ? AND tokno_end >= ?";
    sqlite3_stmt* stmt;
    sqlite3_prepare_v2(db_connection, sql_txt, -1, &stmt, nullptr);
    sqlite3_bind_int64(stmt, 1, tokno);
    sqlite3_bind_int64(stmt, 2, tokno);
    sqlite3_step(stmt);

    std::string subtitle = (const char*)sqlite3_column_text(stmt, 0);
    int text_id = sqlite3_column_int(stmt, 1);
    sqlite3_finalize(stmt);

    sql_txt = "SELECT text_title FROM texts WHERE text_id = ?";
    sqlite3_prepare_v2(db_connection, sql_txt, -1, &stmt, nullptr);
    sqlite3_bind_int(stmt, 1, text_id);
    sqlite3_step(stmt);

    std::string text_title = (const char*)sqlite3_column_text(stmt, 0);

    sqlite3_finalize(stmt);

    return {text_title, subtitle};

}

std::string replaceEnd(std::string source, const std::string yeeted, const std::string replacement) {
    
    size_t yeeted_length = yeeted.length();
    if(yeeted_length == 0) return source;
    size_t replacement_length = replacement.length();
  
    size_t yeeted_pos = source.find(yeeted);
    if(yeeted_pos + yeeted_length == source.length()) {
        source.replace(yeeted_pos, yeeted_length, replacement); 
    }
    return source;
}

std::string deHashtagLemma(const std::string& lemma_ocs) {

    std::size_t hashtag_pos = lemma_ocs.find('#');
    if(hashtag_pos != std::string::npos) {
        return lemma_ocs.substr(0, hashtag_pos);
    }
    else return lemma_ocs;
}

std::pair<std::string, std::string> class4ifyAtiVerb(const std::string& ati_verb) {
    if(ati_verb.ends_with("ждряти")) {
        return std::pair{replaceEnd(ati_verb, "ждряти", "дрити"), replaceEnd(ati_verb, "ждряти", "здрити")};
    }
    else if(ati_verb.ends_with("ждвляти")) {
        return std::pair{replaceEnd(ati_verb, "ждвляти", "двити"), replaceEnd(ati_verb, "ждвляти", "здвити")};
    }
    else if(ati_verb.ends_with("щвляти")) {
        return std::pair{replaceEnd(ati_verb, "щвляти", "ствити"), replaceEnd(ati_verb, "щвляти", "твити")};
    }
    else if(ati_verb.ends_with("чвляти")) {
        return std::pair{replaceEnd(ati_verb, "чвляти", "твити"), ""};
    }
    else if(ati_verb.ends_with("жвляти")) {
        return std::pair{replaceEnd(ati_verb, "жвляти", "двити"), replaceEnd(ati_verb, "жвляти", "звити")};
    }
    else if(ati_verb.ends_with("щряти")) {
        return std::pair{replaceEnd(ati_verb, "щряти", "трити"), replaceEnd(ati_verb, "щряти", "стрити")};
    }
    else if(ati_verb.ends_with("чряти")) {
        return std::pair{replaceEnd(ati_verb, "чряти", "трити"), ""};
    }
    else if(ati_verb.ends_with("жряти")) {
        return std::pair{replaceEnd(ati_verb, "жряти", "дрити"), replaceEnd(ati_verb, "жряти", "зрити")};
    }
    else if(ati_verb.ends_with("шляти")) {
        return std::pair{replaceEnd(ati_verb, "шляти", "слити"), ""};
    }
    else if(ati_verb.ends_with("жляти")) {
        return std::pair{replaceEnd(ati_verb, "жляти", "злити"), replaceEnd(ati_verb, "жляти", "длити")};
    }
    else if(ati_verb.ends_with("чляти")) {
        return std::pair{replaceEnd(ati_verb, "чляти", "тлити"), ""};
    }
    else if(ati_verb.ends_with("шняти")) {
        return std::pair{replaceEnd(ati_verb, "шняти", "снити"), ""};
    }
    else if(ati_verb.ends_with("жняти")) {
        return std::pair{replaceEnd(ati_verb, "жняти", "знити"), ""};
    }
    else if(ati_verb.ends_with("щяти")) {
        return std::pair{replaceEnd(ati_verb, "щяти", "трити"), replaceEnd(ati_verb, "щяти", "трити")};
    }
    else if(ati_verb.ends_with("жняти")) {
        return std::pair{replaceEnd(ati_verb, "жняти", "знити"), ""};
    }
    
    else if(ati_verb.ends_with("чати")) {
        return std::pair{replaceEnd(ati_verb, "чати", "тити"), ""};
    }
    else if(ati_verb.ends_with("жати")) {
        return std::pair{replaceEnd(ati_verb, "жати", "дити"), replaceEnd(ati_verb, "жати", "зити")};
    }
    else if(ati_verb.ends_with("щати")) {
        return std::pair{replaceEnd(ati_verb, "щати", "стити"), replaceEnd(ati_verb, "щати", "тити")};
    }
    else if(ati_verb.ends_with("ждати")) {
        return std::pair{replaceEnd(ati_verb, "ждати", "здити"), replaceEnd(ati_verb, "ждати", "дити")};
    }
    else if(ati_verb.ends_with("шати")) {
        return std::pair{replaceEnd(ati_verb, "шати", "сити"), ""};
    }
    else if(ati_verb.ends_with("пляти")) {
        return std::pair{replaceEnd(ati_verb, "пляти", "пити"), ""};
    }
    else if(ati_verb.ends_with("бляти")) {
        return std::pair{replaceEnd(ati_verb, "бляти", "бити"), ""};
    }
    else if(ati_verb.ends_with("вляти")) {
        return std::pair{replaceEnd(ati_verb, "вляти", "вити"), ""};
    }
    else if(ati_verb.ends_with("мляти")) {
        return std::pair{replaceEnd(ati_verb, "мляти", "мити"), ""};
    }
    else if(ati_verb.ends_with("няти")) {
        return std::pair{replaceEnd(ati_verb, "няти", "нити"), ""};
    }
    else if(ati_verb.ends_with("ряти")) {
        return std::pair{replaceEnd(ati_verb, "ряти", "рити"), ""};
    }
    else if(ati_verb.ends_with("ляти")) {
        return std::pair{replaceEnd(ati_verb, "ляти", "лити"), ""};
    }
    else return std::pair{"", ""};
}

void getFullSentencesFromSentenceNos(sqlite3* db_connection, std::vector<SentenceInfo>& imperfect_sentences_vec){

    const char* sql_sentence_txt = "SELECT tokno, chu_word_torot, presentation_before, presentation_after, lemma_id FROM corpus WHERE sentence_no = ?";
    sqlite3_stmt *sql_sentence_stmt;
    sqlite3_prepare_v2(db_connection, sql_sentence_txt, -1, &sql_sentence_stmt, NULL);

    std::ostringstream sentence_oss;

    for(SentenceInfo& sentence_struct : imperfect_sentences_vec) {
        sqlite3_bind_int(sql_sentence_stmt, 1, sentence_struct.sentence_no);
        sentence_oss.str(""); //sets underlying string to empty
        while(sqlite3_step(sql_sentence_stmt) == SQLITE_ROW) {
            int tokno = sqlite3_column_int64(sql_sentence_stmt, 0);
            std::string chu_word_torot = (const char*)sqlite3_column_text(sql_sentence_stmt, 1);
            sentence_oss << (const char*)sqlite3_column_text(sql_sentence_stmt, 2) << chu_word_torot << (const char*)sqlite3_column_text(sql_sentence_stmt, 3);
            
            if(tokno == sentence_struct.imperfect_form_tokno) {
                sentence_struct.imperfect_form_ocs = chu_word_torot;
            }
        }
        
        sentence_struct.sentence_txt = sentence_oss.str();

        sqlite3_reset(sql_sentence_stmt);
        sqlite3_clear_bindings(sql_sentence_stmt);
    }
    sqlite3_finalize(sql_sentence_stmt);

}

int main() {
    sqlite3* DB;
    const char* db_path = "/home/joe/Programs/ocs_server/orv.db";
    
    if(!sqlite3_open(db_path, &DB)) {

        // sqlite3_stmt* sql_palatal_ati_stmt;
        // const char* sql_palatal_ati_txt = "select lemma_id, lemma_ocs from lemmas where lemma_ocs LIKE '%чати' OR lemma_ocs LIKE '%жати' OR lemma_ocs LIKE '%шати' OR lemma_ocs LIKE '%щати' OR lemma_ocs LIKE '%ждати' OR lemma_ocs LIKE '%няти' OR lemma_ocs LIKE '%ряти' OR lemma_ocs LIKE '%ляти'";

        sqlite3_stmt* sql_lemmas_stmt;
        const char* sql_lemmas_txt = "select lemma_id, lemma_ocs from lemmas where pos = 26";

        sqlite3_prepare_v2(DB, sql_lemmas_txt, -1, &sql_lemmas_stmt, nullptr);
        
        std::vector<LemmaInfo> lemma_verbs_vec;
        std::unordered_set<std::string> lemma_strings_set;

        lemma_verbs_vec.reserve(1024); 
        while(sqlite3_step(sql_lemmas_stmt) == SQLITE_ROW) {
            int lemma_id = sqlite3_column_int(sql_lemmas_stmt, 0);
            std::string lemma_ocs = (const char*)sqlite3_column_text(sql_lemmas_stmt, 1);
            std::string lemma_ocs_no_hastag = deHashtagLemma(lemma_ocs);


            lemma_verbs_vec.emplace_back(LemmaInfo{lemma_id, lemma_ocs, lemma_ocs_no_hastag});
            lemma_strings_set.insert(lemma_ocs_no_hastag);

        }
        sqlite3_finalize(sql_lemmas_stmt);

        
        std::ostringstream potential_class4_lemmas_csv_oss;
        potential_class4_lemmas_csv_oss << "class_54_lemma_id|class_54_lemma|potential_class4_equivalent_lemma_first|potential_class4_equivalent_lemma_second\n";
        std::unordered_map<int, std::string> potential_class4_lemma_ids_map;
        potential_class4_lemma_ids_map.reserve(512);
        for(const auto& lemma_struct : lemma_verbs_vec) {
             
            std::pair<std::string, std::string> class4ified_verb_pair = class4ifyAtiVerb(lemma_struct.lemma_ocs_no_hashtag);
            if(!class4ified_verb_pair.first.empty()) {

                bool first_class4ified_verb_exists = lemma_strings_set.contains(class4ified_verb_pair.first);
                bool second_class4ified_verb_exists = lemma_strings_set.contains(class4ified_verb_pair.second);
                if(first_class4ified_verb_exists || second_class4ified_verb_exists) {
                    potential_class4_lemma_ids_map.emplace(lemma_struct.lemma_id, lemma_struct.lemma_ocs);

                    potential_class4_lemmas_csv_oss << lemma_struct.lemma_id << "|" << lemma_struct.lemma_ocs_no_hashtag << "|";
                    if(first_class4ified_verb_exists) {
                        potential_class4_lemmas_csv_oss << class4ified_verb_pair.first;
                    }
                    potential_class4_lemmas_csv_oss << "|";
                    if(second_class4ified_verb_exists) {
                        potential_class4_lemmas_csv_oss << class4ified_verb_pair.second;
                    }
                    potential_class4_lemmas_csv_oss << "\n";
                }
            }
        }

        std::cout << potential_class4_lemma_ids_map.size() << "\n";
        
        std::ofstream potential_class4_lemmas_file("potential_class4_class54_lemmas.csv");
        if(potential_class4_lemmas_file.good()) {
            potential_class4_lemmas_file << potential_class4_lemmas_csv_oss.str();
        }
        potential_class4_lemmas_file.close();


        sqlite3_stmt* stmt;
        //25 is the inflexion_class_id for inflexion_class '40'
        const char* sql_non_palatal_class4_lemmas_txt = "SELECT lemma_id, lemma_ocs FROM lemmas WHERE inflexion_class_id = 25 AND lemma_lcs NOT LIKE '%čiti' AND lemma_lcs NOT LIKE '%žiti' AND lemma_lcs NOT LIKE '%šiti' AND lemma_lcs NOT LIKE '%ћiti' AND lemma_lcs NOT LIKE '%ђiti' AND lemma_lcs NOT LIKE '%ŕiti' AND lemma_lcs NOT LIKE '%ĺiti' AND lemma_lcs NOT LIKE '%ńiti' AND lemma_lcs NOT LIKE '%jiti'";
        sqlite3_prepare_v2(DB, sql_non_palatal_class4_lemmas_txt, -1, &stmt, nullptr);
        while(sqlite3_step(stmt) == SQLITE_ROW) {
            int lemma_id = sqlite3_column_int(stmt, 0);
            std::string lemma_ocs = (const char*)sqlite3_column_text(stmt, 1);
            potential_class4_lemma_ids_map.emplace(lemma_id, lemma_ocs);
        }
        sqlite3_finalize(stmt);

        std::cout << potential_class4_lemma_ids_map.size() << "\n";

        const char* sql_extra_imperfect_attestations_txt = "SELECT tokno, sentence_no, lemma_id FROM corpus WHERE morph_tag LIKE '__i_______'";
        sqlite3_prepare_v2(DB, sql_extra_imperfect_attestations_txt, -1, &stmt, nullptr);
        std::vector<SentenceInfo> imperfect_sentences_vec;
        imperfect_sentences_vec.reserve(1024);
        while(sqlite3_step(stmt) == SQLITE_ROW) {
            sqlite3_int64 tokno = sqlite3_column_int64(stmt, 0);
            int sentence_no = sqlite3_column_int(stmt, 1);
            int lemma_id = sqlite3_column_int(stmt, 2);

            if(potential_class4_lemma_ids_map.contains(lemma_id)) {
                auto title_subtitle_pair = getTextTitleAndSubtitle(DB, tokno);
                std::string text_title = title_subtitle_pair.first;
                std::string subtitle = title_subtitle_pair.second;
                imperfect_sentences_vec.emplace_back(SentenceInfo{sentence_no, lemma_id, potential_class4_lemma_ids_map.at(lemma_id), "", tokno, "", text_title, subtitle});
            }
        }
        sqlite3_finalize(stmt);

        getFullSentencesFromSentenceNos(DB, imperfect_sentences_vec);

        std::cout << imperfect_sentences_vec.size() << "\n";

        std::ostringstream imperfect_sentences_csv_oss;
        imperfect_sentences_csv_oss << "tokno|orv_word_torot|lemma_id|lemma_orv|text_title|subtitle|sentence_no|sentence_txt\n";
        for(const SentenceInfo sentence_struct: imperfect_sentences_vec) {
            imperfect_sentences_csv_oss << sentence_struct.imperfect_form_tokno << "|" << sentence_struct.imperfect_form_ocs << "|" << sentence_struct.lemma_id << "|" << sentence_struct.lemma_ocs << "|" << sentence_struct.text_title << "|" << sentence_struct.subtitle << "|" << sentence_struct.sentence_no << "|" << sentence_struct.sentence_txt << "\n";
        }
        std::ofstream imperfect_sentences_csv_file("imperfect_sentences.csv");
        imperfect_sentences_csv_file << imperfect_sentences_csv_oss.str();
        imperfect_sentences_csv_file.close();


        imperfect_sentences_vec.clear();
        

        sqlite3_close(DB);
    }
    else {
        sqlite3_close(DB);
        std::cout << "Failed to open db\n";
    }
    return 0;
}