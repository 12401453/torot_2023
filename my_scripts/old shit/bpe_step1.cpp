#include <iostream>
#include <string>
#include <fstream>
#include <sstream>
//#include <unicode/unistr.h>
//#include <unicode/brkiter.h>
#include <vector>
#include <unordered_set>
#include <unordered_map>
#include <cstdint>

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

//these are both from ChatGPT
// Hash function for std::vector<int>
struct VectorHash {
    std::size_t operator()(const std::vector<std::uint16_t>& v) const {
        std::size_t seed = 0;
        for (int i : v) {
            seed ^= std::hash<int>()(i) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
        }
        return seed;
    }
};

// Equality comparison for std::vector<int>
struct VectorEqual {
    bool operator()(const std::vector<std::uint16_t>& lhs, const std::vector<std::uint16_t>& rhs) const {
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




int main(int argc, char** argv)
{
    if(argc != 2) {
        std::cout << "Usage: ./bpe <input_file>\n";
        return -1;
    }

    std::string input_filename(argv[1]);

    std::ifstream inFile(input_filename);
    std::ofstream outFile("merge_rules.csv");
    std::string line;

    std::unordered_map<std::vector<std::uint16_t>, int, VectorHash, VectorEqual> word_vecs_map;
    word_vecs_map.reserve(5000);

    std::string base_char;
    base_char.reserve(3);
    base_char.clear();

    std::vector<std::uint16_t> word_vector;
    word_vector.reserve(20);


    while(std::getline(inFile, line)) {

        //reconstruct multibyte-chars byte-by-byte from the string-bytes until it matches one in our base_vocab      
        for(auto ch : line) {
            base_char += ch;
            if(base_vocab.contains(base_char)) {
               
                std::uint16_t char_code = base_vocab.at(base_char);
                word_vector.push_back(char_code);
                base_char.clear();
            }
        }
        auto iter = word_vecs_map.find(word_vector);
        if(iter != word_vecs_map.end()) iter->second++; //increment the count of the found word-vector
        else word_vecs_map.insert({word_vector, 1});
        word_vector.clear();

    }

    std::unordered_map<std::uint32_t, int> pair_frequencies;

   /* std::uint16_t fst = 31;
    std::uint16_t scd = 11;


    std::uint32_t char_code_pair = shortIntPair(fst, scd);
    pair_frequencies.insert({char_code_pair, 23}); */


    /*std::ostringstream word_counts_oss;
    for(auto map_pair : word_vecs_map) {
        for(auto num : map_pair.first) {
            word_counts_oss << num << "|";
        }
        word_counts_oss << "," << map_pair.second << "\n";
    }
    outFile << word_counts_oss.str(); */

    for(auto vecs_map_pair : word_vecs_map) {
        std::uint16_t char_code_first = 0;
        std::uint16_t char_code_second = 0;
        int word_frequency = vecs_map_pair.second;
        for(auto char_code : vecs_map_pair.first) {
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
    
    inFile.close();

    std::ostringstream pair_freqs_oss;
    for(auto pair_freq : pair_frequencies) {
        std::uint16_t char1 = static_cast<std::uint16_t>(pair_freq.first >> 16);
        std::uint16_t char2 = static_cast<std::uint16_t>(pair_freq.first & 65535); //this zeroes-out the biggest 16-bits where the first char was stored

        pair_freqs_oss << char1 << "|" << char2 << "," << pair_freq.second << "\n";
    }
    outFile << pair_freqs_oss.str();

    outFile.close();

    return 0;
}
