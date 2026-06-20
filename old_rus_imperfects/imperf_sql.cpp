#include <sqlite3.h>
#include <iostream>
#include <string>
#include <vector>
#include <unordered_set>

struct LemmaInfo {
    int lemma_id;
    std::string lemma_ocs;
    std::string lemma_ocs_no_hashtag;
};

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

        for(const auto& lemma_struct : lemma_verbs_vec) {
            // if(lemma_strings_set.contains(lemma_struct.lemma_ocs_no_hashtag)) {
            //     std::cout << lemma_struct.lemma_id << " | " << lemma_struct.lemma_ocs << " | " << lemma_struct.lemma_ocs_no_hashtag << "\n";
            // }

            


            std::pair<std::string, std::string> class4ified_verb_pair = class4ifyAtiVerb(lemma_struct.lemma_ocs_no_hashtag);
            if(!class4ified_verb_pair.first.empty()) {

                if(lemma_strings_set.contains(class4ified_verb_pair.first) || lemma_strings_set.contains(class4ified_verb_pair.second)) {
                    std::cout << lemma_struct.lemma_id << "|" << lemma_struct.lemma_ocs_no_hashtag << "|" << class4ified_verb_pair.first << "|" << class4ified_verb_pair.second << "\n";
                }

                //std::cout << lemma_struct.lemma_id << " | " << lemma_struct.lemma_ocs_no_hashtag << " | " << class4ified_verb_pair.first << " / " << class4ified_verb_pair.second << "\n";
            }

        }

        sqlite3_close(DB);
    }
    else {
        sqlite3_close(DB);
        std::cout << "Failed to open db\n";
    }
    return 0;
}