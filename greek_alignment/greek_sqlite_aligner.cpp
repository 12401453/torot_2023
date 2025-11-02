#include <iostream>
#include <sqlite3.h>
#include <string>
#include <sstream>
#include <fstream>
#include <unordered_map>
#include <map>
#include <vector>
#include <array>
#include <utility>




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

int safeStrToInt(const std::string &string_number, int default_result=0) {
    int converted_int = default_result;
    if(string_number.empty()) return default_result;
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

class CsvReader {
  public:
    CsvReader(char separator=',') {
      m_separator = separator;
      m_fields_vec.reserve(32);
    }

    void setHeaders(const std::string& first_line) {
      m_header_index_map.clear();

      std::stringstream first_line_ss(first_line);
      std::string header;
      int header_idx = 0;
      while(std::getline(first_line_ss, header, m_separator)) {
        m_header_index_map.emplace(header, header_idx);
        ++header_idx;
      }
    }
   
    void setLine(const std::string& line) {
      m_fields_vec.clear();

      m_raw_line = line;
      // std::stringstream line_ss(line);
      // std::string field;
      // while(std::getline(line_ss, field, m_separator)){
      //   m_fields_vec.emplace_back(field);
      // }
      
      std::size_t start_pos = 0;
      while(true) {
        auto sep_pos = line.find(m_separator, start_pos);
        if(sep_pos == std::string::npos) {
            m_fields_vec.emplace_back(line.substr(start_pos));
            break;
        }
        m_fields_vec.emplace_back(line.substr(start_pos, sep_pos-start_pos));
        start_pos = sep_pos + 1;
      }
    }
  
    std::string getField(const std::string& header) {
      return m_fields_vec[m_header_index_map.at(header)];
    }

  private:
    char m_separator;
    std::string m_raw_line;
    std::vector<std::string> m_fields_vec;
    std::unordered_map<std::string, int> m_header_index_map;
};

void readGreekFile(std::string greek_filename, std::unordered_map<int, std::array<std::string, 4>>& greek_token_map) {
  std::ifstream greek_file(greek_filename);

  if(greek_file.good()) {
    CsvReader csv_reader('|');

    std::string line;
    std::getline(greek_file, line);
    csv_reader.setHeaders(line);

    //tokno|grc_word|pos|morph_tag|grc_lemma_id|sentence_id|text_id|subtitle_id

    while(std::getline(greek_file, line)) {
      csv_reader.setLine(line);
      int grc_tokno = safeStrToInt(csv_reader.getField("tokno"));
      std::string grc_form = csv_reader.getField("grc_word");
      std::string grc_pos = csv_reader.getField("pos");
      std::string grc_morph = csv_reader.getField("morph_tag");
      std::string grc_lemma_id_str = csv_reader.getField("grc_lemma_id");

      greek_token_map.emplace(grc_tokno, std::array<std::string, 4>{grc_form, grc_pos, grc_morph, grc_lemma_id_str});

    }
    greek_file.close();
  }
}

void readAlignmentFile(std::string alignment_filename, const std::vector<std::pair<int, int>>& incipit_tokno_bounds, int db_tokno_offset, const std::unordered_map<int, std::array<std::string, 4>>& greek_token_map, std::map<int, std::array<std::string, 4>>& chu_db_grc_alignment_map) {
  std::ifstream alignment_file(alignment_filename);

  if(alignment_file.good()){

    CsvReader csv_reader;

    std::string line;
    std::getline(alignment_file, line);
    csv_reader.setHeaders(line);

    int row_no = 0;
    while(std::getline(alignment_file, line)) {
      csv_reader.setLine(line);

      int torot_tokno = safeStrToInt(csv_reader.getField("torot_tokno"));
      int grc_tokno = safeStrToInt(csv_reader.getField("grc_tokno"));

      
      //the incipits aren't included in the alignment files I was given so I need to skip past those toknos
      for(const auto& incipit_pair : incipit_tokno_bounds) {
        if(db_tokno_offset + row_no == incipit_pair.first) {
          row_no += (incipit_pair.second - incipit_pair.first) + 1;
          std::cout << "incipit detected, shifting tokno forward by " << (incipit_pair.second - incipit_pair.first) + 1 << "\n";
        }
      }
      int chu_db_tokno = db_tokno_offset + row_no;
      
      if(grc_tokno != 0 && greek_token_map.contains(grc_tokno)) {
        chu_db_grc_alignment_map.emplace(chu_db_tokno, greek_token_map.at(grc_tokno));
      }
      else if(grc_tokno != 0) {
        std::cout << "the gk tokno with number " << grc_tokno << " has no equivalent in the greek xml files apparenlty\n";
      }
      row_no++;
    }
  }
  alignment_file.close();
}


int main(int argc, char *argv[]) {
  if(argc < 2) {
    std::cout << "Must specify database-file to add allignments to\n";
    return -1;
  }
    //std::cout.setstate(std::ios_base::failbit);
  sqlite3* DB;
  if(!sqlite3_open(argv[1], &DB)) {

    sqlite3_stmt* statement;
    const char* sql = "SELECT tokno_start, tokno_end FROM subtitles WHERE subtitle_text LIKE '%Incipit'";
    sqlite3_prepare_v2(DB, sql, -1,  &statement, nullptr);
    std::vector<std::pair<int, int>> incipit_tokno_bounds;
    while(sqlite3_step(statement) == SQLITE_ROW) {
      int incipit_tokno_start = sqlite3_column_int(statement, 0);
      int incipit_tokno_end = sqlite3_column_int(statement, 1);
      incipit_tokno_bounds.emplace_back(incipit_tokno_start, incipit_tokno_end);
    }
    sqlite3_finalize(statement);

    for(const auto& pair : incipit_tokno_bounds) {
      std::cout << "Incipt start: " << pair.first << " | Incipt end: " << pair.second << "\n";
    }

    std::unordered_map<int, std::array<std::string, 4>> greek_token_map;

    readGreekFile("grc_words_full_with_titles.csv", greek_token_map);

    std::cout << greek_token_map.size()<< "\n";

    std::map<int, std::array<std::string, 4>> chu_db_grc_alignment_map;

    readAlignmentFile("zographensis_alignments.csv", incipit_tokno_bounds, 204018, greek_token_map, chu_db_grc_alignment_map);
    readAlignmentFile("marianus_alignments.csv", incipit_tokno_bounds, 2715, greek_token_map, chu_db_grc_alignment_map);
    readAlignmentFile("new_psal_alignments.csv", incipit_tokno_bounds, 60974, greek_token_map, chu_db_grc_alignment_map);

    std::cout << chu_db_grc_alignment_map.size()<< "\n";

    //writing the alignment-file to disk is not strictly necessary as I am adding the data straight to the DB from the maps
    std::ofstream chu_db_grc_file("chu_db_gk_align_cpp.csv");
    for(const auto& chu_db_row : chu_db_grc_alignment_map)  {
      chu_db_grc_file << chu_db_row.first << "|" << chu_db_row.second[0] << "|" << chu_db_row.second[1] << "|" << chu_db_row.second[2] << "|" << chu_db_row.second[3] << "\n";
    }
    chu_db_grc_file.close();
    


    sqlite3_exec(DB, "DROP TABLE IF EXISTS greek_alignments;CREATE TABLE greek_alignments (chu_tokno INTEGER PRIMARY KEY, gk_word TEXT, gk_lemma_id INTEGER, gk_morph_tag TEXT, gk_pos INTEGER)", nullptr, nullptr, nullptr);
    sqlite3_exec(DB, "DROP TABLE IF EXISTS greek_lemmas;CREATE TABLE greek_lemmas (gk_lemma_id INTEGER PRIMARY KEY, gk_lemma_pos INTEGER, gk_lemma_form TEXT)", nullptr, nullptr, nullptr);

    const char* sql_BEGIN = "BEGIN IMMEDIATE";
    const char* sql_COMMIT = "COMMIT";

    sqlite3_exec(DB, sql_BEGIN, nullptr, nullptr, nullptr);

    

    sql = "INSERT INTO greek_alignments (chu_tokno, gk_word, gk_lemma_id, gk_morph_tag, gk_pos) VALUES (?,?,?,?,?)";

    sqlite3_prepare_v2(DB, sql, -1, &statement, nullptr);

    for(const auto& chu_db_aligned_row : chu_db_grc_alignment_map) {

      int chu_tokno = chu_db_aligned_row.first;
      std::string gk_word = chu_db_aligned_row.second[0];
      int gk_pos = pos_map.at(chu_db_aligned_row.second[1]);
      std::string gk_morph_tag = chu_db_aligned_row.second[2];
      int gk_lemma_id = safeStrToInt(chu_db_aligned_row.second[3]);

      sqlite3_bind_int(statement, 1, chu_tokno);
      sqlite3_bind_text(statement, 2, gk_word.c_str(), -1, SQLITE_TRANSIENT);
      sqlite3_bind_int(statement, 3, gk_lemma_id);
      sqlite3_bind_text(statement, 4, gk_morph_tag.c_str(), -1, SQLITE_TRANSIENT);
      sqlite3_bind_int(statement, 5, gk_pos);

      sqlite3_step(statement);


      sqlite3_reset(statement);
      sqlite3_clear_bindings(statement);
    }
    sqlite3_finalize(statement);

    std::ifstream gk_lemmas_file("grc_lemmas.csv");
    sql = "INSERT INTO greek_lemmas (gk_lemma_id, gk_lemma_pos, gk_lemma_form) VALUES (?,?,?)";
    sqlite3_prepare_v2(DB, sql, -1, &statement, nullptr);
    std::string lemma_line;
    std::vector<std::string> lemma_row;
    while(std::getline(gk_lemmas_file, lemma_line)) {
      std::string field;
      std::stringstream lemma_line_ss(lemma_line);
      while(std::getline(lemma_line_ss, field, '|')) {
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
    std::cout << "THUS FAR\n";
    sqlite3_finalize(statement);


    gk_lemmas_file.close();

    std::cout << sqlite3_exec(DB, sql_COMMIT, nullptr, nullptr, nullptr);

    sqlite3_close(DB);

    return 0;
  }
  else std::cout << "DB opening failed\n";

    
  return 0;
}
