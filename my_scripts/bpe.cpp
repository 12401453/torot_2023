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

std::unordered_map<std::string, u_int16_t> base_vocab {
    {"4", 1},
    {"ѭ", 2},
    {"ѳ", 3},
    {"s", 4},
    {"ъ", 5},
    {"ю", 6},
    {"ч", 7},
    {"х", 8},
    {"н", 9},
    {"е", 10},
    {"о", 11},
    {"к", 12},
    {"м", 13},
    {"ж", 14},
    {"і", 15},
    {"а", 16},
    {"в", 17},
    {"з", 18},
    {"ф", 19},
    {"р", 20},
    {"҂", 21},
    {"с", 22},
    {"ѧ", 23},
    {"ь", 24},
    {"ц", 25},
    {"ѯ", 26},
    {"г", 27},
    {"ⱖ", 28},
    {"ѫ", 29},
    {"б", 30},
    {"P", 31},
    {"ѣ", 32},
    {"д", 33},
    {"у", 34},
    {"л", 35},
    {"п", 36},
    {"т", 37},
    {"ш", 38},
};
std::unordered_map<u_int16_t, std::string> base_vocab_reversed {
    {1, "4"},
    {2, "ѭ"},
    {3, "ѳ"},
    {4, "s"},
    {5, "ъ"},
    {6, "ю"},
    {7, "ч"},
    {8, "х"},
    {9, "н"},
    {10, "е"},
    {11, "о"},
    {12, "к"},
    {13, "м"},
    {14, "ж"},
    {15, "і"},
    {16, "а"},
    {17, "в"},
    {18, "з"},
    {19, "ф"},
    {20, "р"},
    {21, "҂"},
    {22, "с"},
    {23, "ѧ"},
    {24, "ь"},
    {25, "ц"},
    {26, "ѯ"},
    {27, "г"},
    {28, "ⱖ"},
    {29, "ѫ"},
    {30, "б"},
    {31, "P"},
    {32, "ѣ"},
    {33, "д"},
    {34, "у"},
    {35, "л"},
    {36, "п"},
    {37, "т"},
    {38, "ш"},
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



int main(int argc, char** argv)
{
    if(argc != 3) {
        std::cout << "Usage: ./bpe <input_file> <iterations>\n";
        return -1;
    }

    int num_iterations = std::stoi(argv[2]);

    std::string input_filename(argv[1]);

    std::ifstream inFile(input_filename);
    std::ofstream outFile("merge_rules.csv");

    std::string line;

    std::unordered_map<std::list<std::uint16_t>, int, ListHash, ListEqual> word_lists_map;
    word_lists_map.reserve(35275);

    std::string base_char;
    base_char.reserve(3);
    base_char.clear();

    std::uint16_t base_vocab_count = 38;
    
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
        outFile << most_freq_first << "|" << most_freq_second << "," << base_vocab_count << "\n";
        
        base_vocab.insert({merged_char, base_vocab_count});
        base_vocab_reversed.insert({base_vocab_count, merged_char});

        updateWordCodes(word_lists_vec, most_freq_first, most_freq_second, base_vocab_count);
    }

    /*calculatePairFrequencies(word_lists_vec, pair_frequencies);
    
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
    //outFile << most_freq_first << "|" << most_freq_second << "," << base_vocab_count << "\n";
    
    base_vocab.insert({merged_char, base_vocab_count});
    base_vocab_reversed.insert({base_vocab_count, merged_char});

    updateWordCodes(word_lists_vec, most_freq_first, most_freq_second, base_vocab_count);

    
    ////////////////////
    calculatePairFrequencies(word_lists_vec, pair_frequencies);
    
    highest_count_pf_it = pair_frequencies.begin();
    highest_pair_freq_so_far = 0;
    for(auto pf_it = pair_frequencies.begin(); pf_it != pair_frequencies.end(); ++pf_it) {
        int pair_freq = pf_it->second;
        if(pair_freq > highest_pair_freq_so_far) {
            highest_pair_freq_so_far = pair_freq;
            highest_count_pf_it = pf_it;
        }
    }
    most_freq_first = unmergeShortsFirst(highest_count_pf_it->first);
    most_freq_second = unmergeShortsSecond(highest_count_pf_it->first);
    merged_char = base_vocab_reversed.at(most_freq_first) + base_vocab_reversed.at(most_freq_second);

    std::cout << "Highest frequency pair is: " << most_freq_first << "|" << most_freq_second << " corresponding to: " << merged_char << " which occurs " << highest_count_pf_it->second << " times.\n";

*/










   /* std::ostringstream pair_freqs_oss;
    for(auto pair_freq : pair_frequencies) {
        std::uint16_t char1 = static_cast<std::uint16_t>(pair_freq.first >> 16);
        std::uint16_t char2 = static_cast<std::uint16_t>(pair_freq.first & 65535); //this zeroes-out the biggest 16-bits where the first char was stored

        pair_freqs_oss << char1 << "|" << char2 << "," << pair_freq.second << "\n";
    }
    outFile << pair_freqs_oss.str(); */

    outFile.close();

    return 0;
}
