#include <iostream>
#include <sqlite3.h>
#include <string>
#include <sstream>
#include <fstream>
#include <unordered_map>
#include <vector>




std::unordered_map <std::string, int> pos_map = {
  {"A-", 1},
  {"Df", 2},
  {"S-", 3},
  {"Ma", 4},
  {"Nb", 5},
  {"C-", 6},
  {"Pd", 7},
  {"F-", 8},
  {"Px", 9},
  {"N-", 10},
  {"I-", 11},
  {"Du", 12},
  {"Pi", 13},
  {"Mo", 14},
  {"Pp", 15},
  {"Pk", 16},
  {"Ps", 17},
  {"Pt", 18},
  {"R-", 19},
  {"Ne", 20},
  {"Py", 21},
  {"Pc", 22},
  {"Dq", 23},
  {"Pr", 24},
  {"G-", 25},
  {"V-", 26},
  {"X-", 27}
};


int main(int argc, char *argv[]) {
    //std::cout.setstate(std::ios_base::failbit);
    sqlite3* DB;
    if(!sqlite3_open("chu_corpus_untagged_including_autorecon_autotagged_and_assemanianus.db", &DB)) {


      sqlite3_exec(DB, "DROP TABLE IF EXISTS greek_alignments;CREATE TABLE greek_alignments (chu_tokno INTEGER PRIMARY KEY, gk_word TEXT, gk_lemma_id INTEGER, gk_morph_tag TEXT, gk_pos INTEGER)", nullptr, nullptr, nullptr);
      sqlite3_exec(DB, "DROP TABLE IF EXISTS greek_lemmas;CREATE TABLE greek_lemmas (gk_lemma_id INTEGER PRIMARY KEY, gk_lemma_pos INTEGER, gk_lemma_form TEXT)", nullptr, nullptr, nullptr);

      const char* sql_BEGIN = "BEGIN IMMEDIATE";
      const char* sql_COMMIT = "COMMIT";

      sqlite3_exec(DB, sql_BEGIN, nullptr, nullptr, nullptr);

      sqlite3_stmt* statement;

      const char* sql = "INSERT INTO greek_alignments (chu_tokno, gk_word, gk_lemma_id, gk_morph_tag, gk_pos) VALUES (?,?,?,?,?)";

      sqlite3_prepare_v2(DB, sql, -1, &statement, nullptr);

      std::ifstream aligned_greek_file(argv[1]);
      std::ifstream gk_lemmas_file(argv[2]);
      std::string greek_line;
      std::vector<std::string> greek_row;
      greek_row.reserve(5);
      while(std::getline(aligned_greek_file, greek_line)) {
        std::string field;
        std::stringstream greek_line_ss(greek_line);
        while(std::getline(greek_line_ss, field, '|')) {
          greek_row.push_back(field);
        }

        int chu_tokno = std::stoi(greek_row[0]);
        std::string gk_word = greek_row[1];
        int gk_pos = pos_map.at(greek_row[2]);
        std::string gk_morph_tag = greek_row[3];
        int gk_lemma_id = std::stoi(greek_row[4]);

        sqlite3_bind_int(statement, 1, chu_tokno);
        sqlite3_bind_text(statement, 2, gk_word.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(statement, 3, gk_lemma_id);
        sqlite3_bind_text(statement, 4, gk_morph_tag.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(statement, 5, gk_pos);

        sqlite3_step(statement);

        greek_row.clear();
        sqlite3_reset(statement);
        sqlite3_clear_bindings(statement);
      }
      sqlite3_finalize(statement);

      sql = "INSERT INTO greek_lemmas (gk_lemma_id, gk_lemma_pos, gk_lemma_form) VALUES (?,?,?)";
      sqlite3_prepare_v2(DB, sql, -1, &statement, nullptr);
      std::string lemma_line;
      std::vector<std::string> lemma_row;
      greek_row.reserve(3);
      while(std::getline(gk_lemmas_file, lemma_line)) {
        std::string field;
        std::stringstream lemma_line_ss(lemma_line);
        while(std::getline(lemma_line_ss, field, ',')) {
          lemma_row.push_back(field);
        }

        int gk_lemma_id = std::stoi(lemma_row[0]);
        std::string gk_lemma_form = lemma_row[1];
        int gk_lemma_pos = pos_map.at(lemma_row[2]);

        sqlite3_bind_int(statement, 1, gk_lemma_id);
        sqlite3_bind_int(statement, 2, gk_lemma_pos);
        sqlite3_bind_text(statement, 3, gk_lemma_form.c_str(), -1, SQLITE_TRANSIENT);

        sqlite3_step(statement);

        lemma_row.clear();
        sqlite3_reset(statement);
        sqlite3_clear_bindings(statement);
      }
      sqlite3_finalize(statement);


      aligned_greek_file.close();
      gk_lemmas_file.close();

      std::cout << sqlite3_exec(DB, sql_COMMIT, nullptr, nullptr, nullptr);

      sqlite3_close(DB);

      return 0;
  }
  else std::cout << "DB opening failed\n";

    
    return 0;
}
