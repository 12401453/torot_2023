#include <iostream>
#include <sqlite3.h>
#include <string>
#include <sstream>
#include <fstream>

int main () {
    sqlite3* DB;
    if(!sqlite3_open("chu_corpus.db", &DB)) {

        sqlite3_stmt* statement;

        std::ifstream chu_words_file("chu_words_full.csv");
        const char* sql_BEGIN = "BEGIN IMMEDIATE";
        const char* sql_COMMIT = "COMMIT";

        sqlite3_exec(DB, sql_BEGIN, nullptr, nullptr, nullptr);

        sqlite3_exec(DB, "DROP TABLE IF EXISTS tagged_corpus;CREATE TABLE tagged_corpus (tokno INTEGER PRIMARY KEY, chu_word_torot TEXT, chu_word_normalised TEXT, pos TEXT, morph_tag TEXT, lemma_id INTEGER, sentence_no INTEGER);CREATE INDEX lemma_id_index on tagged_corpus(lemma_id);CREATE INDEX sentence_id_index on tagged_corpus(sentence_id);", nullptr, nullptr, nullptr);

        const char *sql_text = "INSERT INTO tagged_corpus (chu_word_torot, pos, morph_tag, chu_word_normalised, lemma_id, sentence_no) VALUES (?, ?, ?, ?, ?, ?)";

        sqlite3_prepare_v2(DB, sql_text, -1, &statement, NULL);
               
        std::string line;
        std::string field;
        while(std::getline(chu_words_file, line)) {
            std::stringstream ss_line(line);
            int parameter_no = 1;
            while(std::getline(ss_line, field, ',')) {
                if(parameter_no < 5) sqlite3_bind_text(statement, parameter_no, field.c_str(), -1, SQLITE_TRANSIENT); //SQLITE_STATIC doesnt work and makes every field get filled with some permutation of the sentence_id
                else sqlite3_bind_int(statement, parameter_no, std::stoi(field));
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
