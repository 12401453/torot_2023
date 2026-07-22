#include <iostream>
#include <string>
#include <fstream>
#include <sstream>
//#include <unicode/unistr.h>
//#include <unicode/brkiter.h>
#include <vector>
#include <unordered_map>
#include <cstdint>
#include <list>
#include <algorithm>

std::unordered_map<std::string, u_int16_t> base_vocab {
    {"<pad>", 0},
    {"<unk>", 1},
    {"ш", 2},
    {"ѭ", 3},
    {"ѳ", 4},
    {"s", 5},
    {"ъ", 6},
    {"ю", 7},
    {"ч", 8},
    {"х", 9},
    {"н", 10},
    {"е", 11},
    {"о", 12},
    {"к", 13},
    {"м", 14},
    {"ж", 15},
    {"і", 16},
    {"а", 17},
    {"в", 18},
    {"з", 19},
    {"ф", 20},
    {"р", 21},
    {"҂", 22},
    {"с", 23},
    {"ѧ", 24},
    {"ь", 25},
    {"ц", 26},
    {"ѯ", 27},
    {"г", 28},
    {"ⱖ", 29},
    {"ѫ", 30},
    {"б", 31},
    {"т", 32},
    {"ѣ", 33},
    {"д", 34},
    {"у", 35},
    {"л", 36},
    {"п", 37}
};
std::unordered_map<u_int16_t, std::string> base_vocab_reversed {
    {0, "<pad>"},
    {1, "<unk>"},
    {2, "ш"},
    {3, "ѭ"},
    {4, "ѳ"},
    {5, "s"},
    {6, "ъ"},
    {7, "ю"},
    {8, "ч"},
    {9, "х"},
    {10, "н"},
    {11, "е"},
    {12, "о"},
    {13, "к"},
    {14, "м"},
    {15, "ж"},
    {16, "і"},
    {17, "а"},
    {18, "в"},
    {19, "з"},
    {20, "ф"},
    {21, "р"},
    {22, "҂"},
    {23, "с"},
    {24, "ѧ"},
    {25, "ь"},
    {26, "ц"},
    {27, "ѯ"},
    {28, "г"},
    {29, "ⱖ"},
    {30, "ѫ"},
    {31, "б"},
    {32, "т"},
    {33, "ѣ"},
    {34, "д"},
    {35, "у"},
    {36, "л"},
    {37, "п"},
};

//these are both from ChatGPT
// Hash function for std::vector<int>
struct ListHash {
    std::size_t operator()(const std::list<std::uint16_t>& list) const {
        std::size_t seed = 0;
        for (int i : list) {
            seed ^= std::hash<int>()(i) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
        }
        return seed;
    }
};

// Equality comparison for std::vector<int>
struct ListEqual {
    bool operator()(const std::list<std::uint16_t>& lhs, const std::list<std::uint16_t>& rhs) const {
        return lhs == rhs;
    }
};

bool unknownChars(std::string infile_name, std::uint16_t base_vocab_count)
{
    std::string str1;
    std::string str2;
    int x = 0;
    //  int q = 0;
    int y;

    std::ifstream inFile(infile_name);
    
    std::string line;
    while(std::getline(inFile, line)) {
        
        for(int i = 0; i < base_vocab_count; i++)
        {
            str1.assign(base_vocab_reversed.at(i));
            str2.assign("");

            do
            {
                x = line.find(str1);
                if (x == -1)
                {
                    break;
                }

                y = str1.length();
                line.replace(x, y, str2);
            } while (x != -1);            
        }
        if(line.size() > 0) {
                inFile.close();
                return true;
        }

    }
    inFile.close();
    return false;
}

std::uint32_t shortIntPair(std::uint16_t first, std::uint16_t second) {
    //e.g. first = 4 = 0000000000000100
    //    second = 5 = 0000000000000101
    //casting first to a 32-bit int gives us 0000000000000000|0000000000000100, then we bit-shift it left by 16 to make it occupy the first half of the number:
                    // first << 16 =         0000000000000100|0000000000000000, then we BITWISE OR it with the second number, which is still only 16-bit:
         //           0000000000000100|0000000000000000 |
         //                            0000000000000101   =
         //           0000000000000100|0000000000000101 , which in this case equals the decimal number 262149
    return (static_cast<std::uint32_t>(first) << 16) | second;
}

std::uint16_t unmergeShortsFirst(std::uint32_t merged_shorts) {
    return static_cast<std::uint16_t>(merged_shorts >> 16);
}
std::uint16_t unmergeShortsSecond(std::uint32_t merged_shorts) {
    return static_cast<std::uint16_t>(merged_shorts & 65535);
}

void calculatePairFrequencies(const std::vector<std::pair<std::list<std::uint16_t>, int>>& word_lists_vec, std::unordered_map<std::uint32_t, int>& pair_frequencies) {
    pair_frequencies.clear();
    for(const auto& vec_pair : word_lists_vec) {
        std::uint16_t char_code_first = 0;
        std::uint16_t char_code_second = 0;
        int word_frequency = vec_pair.second;
        for(auto char_code : vec_pair.first) {
            char_code_first = char_code_second;
            char_code_second = char_code;

            if(char_code_first && char_code_second) {
                std::uint32_t char_code_pair = shortIntPair(char_code_first, char_code_second);
                auto iter = pair_frequencies.find(char_code_pair);
                if(iter != pair_frequencies.end()) iter->second += word_frequency;
                else pair_frequencies.insert({char_code_pair, word_frequency});
            }
        }
    }
}

void updateWordCodes(std::vector<std::pair<std::list<std::uint16_t>, int>>& word_lists_vec, std::uint16_t most_freq_first, std::uint16_t most_freq_second, std::uint16_t base_vocab_count) {
    for(auto &vec_pair : word_lists_vec) {
        std::uint16_t char_code_first = 0;
        std::uint16_t char_code_second = 0;
        
        auto list_iter = vec_pair.first.begin();
        auto list_end_iter = vec_pair.first.end();
        
        while(list_iter != list_end_iter) {
            char_code_first = char_code_second;
            char_code_second = *list_iter;

            if(char_code_first == most_freq_first && char_code_second == most_freq_second) {
                //std::cout << "In erase loop\n";
                vec_pair.first.insert(std::next(list_iter, 1), base_vocab_count);
                list_iter++;
                vec_pair.first.erase(std::prev(list_iter, 2), list_iter);
            }
            list_iter++;
        }       
    }
}

int safeStrToInt(const std::string &string_number, int default_result=-1) {
    int converted_int = default_result;
    try {
        converted_int = std::stoi(string_number);
    }
    catch (std::invalid_argument const& ex) {
        // std::cout << "std::stoi failed with an invalid_argument exception; defaulting it to " << default_result << "\n";
    }
    catch (std::out_of_range const& ex) {
        // std::cout << "std::stoi failed with an out_of_range exception; defaulting it to " << default_result << "\n";
    }
    return converted_int;
}



int main(int argc, char** argv)
{
    if(argc != 3) {
        std::cout << "Usage: ./bpe <input_file> <iterations>\n";
        return -1;
    }

    int num_iterations = safeStrToInt(argv[2]);
    if(num_iterations <= 0) {
        std::cout << "Specified number of iterations must be a positive integer\n";
        return -1;
    }

    std::string input_filename(argv[1]);

    std::uint16_t base_vocab_count = (std::uint16_t)base_vocab.size();

    if(unknownChars(input_filename, base_vocab_count)) {
        std::cout << "File contains characters beyond the specified base_vocab, aborting...\n";
        return -1;
    }

    std::ifstream inFile(input_filename);
    std::ostringstream merge_rules_oss;
    std::ofstream merge_rules_file("merge_rules_padunk.csv");

    std::ostringstream token_idx_oss;
    std::vector<std::pair<int, std::string>> base_vocab_vec;
    base_vocab_vec.reserve(64);
    for(const auto &base_vocab_pair : base_vocab_reversed) {
        base_vocab_vec.emplace_back(base_vocab_pair.first, base_vocab_pair.second);
    }
    std::sort(base_vocab_vec.begin(), base_vocab_vec.end());

    // token_idx_oss << "0,<pad>\n1,<unk>\n";
    for(const auto& pair : base_vocab_vec) {
        token_idx_oss << pair.first << "," << pair.second << "\n";
    }

    std::string line;

    std::unordered_map<std::list<std::uint16_t>, int, ListHash, ListEqual> word_lists_map;
    word_lists_map.reserve(35275);

    std::string base_char;
    base_char.reserve(3);
    base_char.clear();
    
    std::list<std::uint16_t> word_list;
    while(std::getline(inFile, line)) {

        //reconstruct multibyte-chars byte-by-byte from the string-bytes until it matches one in our base_vocab
        auto list_pos = word_list.begin(); //since word_list is empty, .begin() also equals .end() and doesn't change when you call insert(), because .insert inserts elements before the given iterator, so basically my list_pos iterator here just continually equals word_list.end() and doesn't need to be incremented   
        for(const auto ch : line) {
            base_char += ch;
            if(base_vocab.contains(base_char)) {
               
                std::uint16_t char_code = base_vocab.at(base_char);
                word_list.insert(list_pos, char_code);
                base_char.clear();
            }
        }
        auto iter = word_lists_map.find(word_list);
        if(iter != word_lists_map.end()) iter->second++; //increment the count of the found word-vector
        else word_lists_map.insert({word_list, 1});

        word_list.clear();

    }

    inFile.close();

    std::size_t map_size = word_lists_map.size();
    // std::cout << "word_lists_map length: " << map_size << "\n";

    std::vector<std::pair<std::list<std::uint16_t>, int>> word_lists_vec;
    word_lists_vec.reserve(map_size);

    for(const auto& word_list_pair : word_lists_map) {
        word_lists_vec.emplace_back(word_list_pair);
    }

    ///////All of the shit above this line takes 0.8s of the total 0.84s which includes two iterations of the actual
    //algorithm, so most of the time is spent in shit that could be worked-out ahead of compile-time///

    std::unordered_map<std::uint32_t, int> pair_frequencies;
    
    for(int i = 0; i < num_iterations; i++) {
        calculatePairFrequencies(word_lists_vec, pair_frequencies);
    
        auto highest_count_pf_it = pair_frequencies.begin();
        int highest_pair_freq_so_far = 0;
        for(auto pf_it = pair_frequencies.begin(); pf_it != pair_frequencies.end(); ++pf_it) {
            int pair_freq = pf_it->second;
            if(pair_freq > highest_pair_freq_so_far) {
                highest_pair_freq_so_far = pair_freq;
                highest_count_pf_it = pf_it;
            }
        }
        std::uint16_t most_freq_first = unmergeShortsFirst(highest_count_pf_it->first);
        std::uint16_t most_freq_second = unmergeShortsSecond(highest_count_pf_it->first);
        std::string merged_char = base_vocab_reversed.at(most_freq_first) + base_vocab_reversed.at(most_freq_second);

        std::cout << "Highest frequency pair is: " << most_freq_first << "|" << most_freq_second << " corresponding to: " << merged_char << " which occurs " << highest_count_pf_it->second << " times.\n";

        base_vocab_count++;
        merge_rules_oss << most_freq_first << "|" << most_freq_second << "," << base_vocab_count - 1 << "\n";

        token_idx_oss << base_vocab_count - 1 << "," << merged_char << "\n";
        
        base_vocab.insert({merged_char, base_vocab_count - 1});
        base_vocab_reversed.insert({base_vocab_count - 1, merged_char});

        updateWordCodes(word_lists_vec, most_freq_first, most_freq_second, base_vocab_count - 1);
    }

    merge_rules_file << merge_rules_oss.str();

    merge_rules_file.close();

    std::ofstream bpe_token_index_file("bpe_token_indices_padunk.csv");
    bpe_token_index_file << token_idx_oss.str();
    bpe_token_index_file.close();
    return 0;
}
