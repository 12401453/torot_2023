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
