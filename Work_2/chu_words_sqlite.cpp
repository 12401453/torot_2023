#include <iostream>
#include <sqlite3.h>
#include <string>
#include <sstream>
#include <fstream>
#include <unordered_map>

std::unordered_map <std::string, int> pos_map = {
  {"A-", 0},
  {"Df", 1},
  {"S-", 2},
  {"Ma", 3},
  {"Nb", 4},
  {"C-", 5},
  {"Pd", 6},
  {"F-", 7},
  {"Px", 8},
  {"N-", 9},
  {"I-", 10},
  {"Du", 11},
  {"Pi", 12},
  {"Mo", 13},
  {"Pp", 14},
  {"Pk", 15},
  {"Ps", 16},
  {"Pt", 17},
  {"R-", 18},
  {"Ne", 19},
  {"Py", 20},
  {"Pc", 21},
  {"Dq", 22},
  {"Pr", 23},
  {"G-", 24},
  {"V-", 25},
  {"X-", 26}
};

int main () {
    sqlite3* DB;
    if(!sqlite3_open("chu_corpus.db", &DB)) {

        sqlite3_stmt* statement;

        std::ifstream chu_words_file("chu_words_full.csv");
        const char* sql_BEGIN = "BEGIN IMMEDIATE";
        const char* sql_COMMIT = "COMMIT";

        sqlite3_exec(DB, sql_BEGIN, nullptr, nullptr, nullptr);

        sqlite3_exec(DB, "DROP TABLE IF EXISTS tagged_corpus;CREATE TABLE tagged_corpus (tokno INTEGER PRIMARY KEY, chu_word_torot TEXT, chu_word_normalised TEXT, pos INTEGER, morph_tag TEXT, lemma_id INTEGER, sentence_no INTEGER);CREATE INDEX lemma_id_index on tagged_corpus(lemma_id);CREATE INDEX sentence_id_index on tagged_corpus(sentence_id);CREATE INDEX pos_index on tagged_corpus(pos)", nullptr, nullptr, nullptr);

        const char *sql_text = "INSERT INTO tagged_corpus (chu_word_torot, pos, morph_tag, chu_word_normalised, lemma_id, sentence_no) VALUES (?, ?, ?, ?, ?, ?)";

        sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
               
        std::string line;
        std::string field;
        int pos_key = 0;
        while(std::getline(chu_words_file, line)) {
            std::stringstream ss_line(line);
            int parameter_no = 1;
            while(std::getline(ss_line, field, ',')) {
                switch(parameter_no) {
                    case 2:
                        pos_key = pos_map.at(field);
                        sqlite3_bind_int(statement, parameter_no, pos_key);		
                        break;
                    case 5:
                        sqlite3_bind_int(statement, parameter_no, std::stoi(field));
                        break;
                    case 6:
                        sqlite3_bind_int(statement, parameter_no, std::stoi(field));
                        break;
                    default:
                        sqlite3_bind_text(statement, parameter_no, field.c_str(), -1, SQLITE_TRANSIENT); //SQLITE_STATIC doesnt work and makes every field get filled with some permutation of sentence_no
		        }
                parameter_no++;
            } 
            sqlite3_step(statement);
            sqlite3_reset(statement);
            sqlite3_clear_bindings(statement);
        }
        sqlite3_finalize(statement);

        chu_words_file.close();

        std::cout << sqlite3_exec(DB, sql_COMMIT, nullptr, nullptr, nullptr);

        sqlite3_close(DB);

        return 0;
    }
    else std::cout << "DB opening failed\n";

    
    return 0;
}
