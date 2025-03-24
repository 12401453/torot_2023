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

std::unordered_map<std::string, std::uint16_t> base_vocab {
    {"ш", 1},
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
    {"т", 31},
    {"ѣ", 32},
    {"д", 33},
    {"у", 34},
    {"л", 35},
    {"п", 36}
};
std::unordered_map<std::uint16_t, std::string> base_vocab_reversed {
    {1, "ш"},
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
    {31, "т"},
    {32, "ѣ"},
    {33, "д"},
    {34, "у"},
    {35, "л"},
    {36, "п"},
};

std::vector<std::vector<std::uint16_t>> numerifyWords(std::string cleaned_text_path) {
    std::string line;
    std::ifstream cleanedTextFile(cleaned_text_path);
    std::string base_char;
    base_char.reserve(3);
    base_char.clear();
    std::vector<std::vector<std::uint16_t>> numerifiedWords;
    numerifiedWords.reserve(65536);
    std::vector<std::uint16_t> word_vector;
    word_vector.reserve(8);
    while(std::getline(cleanedTextFile, line)) {
        for(const auto ch : line) {
            base_char += ch;
            if(base_vocab.contains(base_char)) {
                std::uint16_t char_code = base_vocab.at(base_char);
                word_vector.push_back(char_code);
                base_char.clear();
            }
        }
        numerifiedWords.emplace_back(word_vector);
        word_vector.clear();
    }
    cleanedTextFile.close();
    return numerifiedWords;
}

int main(int argc, char** argv) {

    if(argc != 2) {
        std::cout << "Usage: ./tokenise <deep-cleaned word-per-line textfile>\n";
        return -1;
    }

    std::string cleaned_text_path = argv[1];

    std::vector<std::vector<std::uint16_t>> numerifiedWords = numerifyWords(cleaned_text_path);

    for(const auto &word_vec : numerifiedWords) {
        for(const std::uint16_t char_code : word_vec) {
            std::cout << char_code << " ";
        }
        std::cout << "\n";
    }
    return 0;
} 