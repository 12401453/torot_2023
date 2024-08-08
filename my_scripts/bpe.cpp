#include <iostream>
#include <string>
#include <fstream>
//#include <unicode/unistr.h>
//#include <unicode/brkiter.h>
#include <unordered_map>

std::unordered_map<std::string, int> base_vocab {
    {"4", 0},
    {"ѭ", 1},
    {"ѳ", 2},
    {"s", 3},
    {"ъ", 4},
    {"ю", 5},
    {"ч", 6},
    {"х", 7},
    {"н", 8},
    {"е", 9},
    {"о", 10},
    {"к", 11},
    {"м", 12},
    {"ж", 13},
    {"і", 14},
    {"а", 15},
    {"в", 16},
    {"з", 17},
    {"ф", 18},
    {"р", 19},
    {"҂", 20},
    {"с", 21},
    {"ѧ", 22},
    {"ь", 23},
    {"ц", 24},
    {"ѯ", 25},
    {"г", 26},
    {"ⱖ", 27},
    {"ѫ", 28},
    {"б", 29},
    {"P", 30},
    {"ѣ", 31},
    {"д", 32},
    {"у", 33},
    {"л", 34},
    {"п", 35},
    {"т", 36},
    {"ш", 37},
};

int main(int argc, char** argv)
{
    if(argc != 2) {
        std::cout << "Usage: ./bpe <input_file>\n";
        return -1;
    }

    std::string input_filename(argv[1]);

    std::ifstream inFile(input_filename);
    std::ofstream outFile(input_filename + "numbers.csv");
    std::string line;

    std::string base_char;
    base_char.reserve(3);
    base_char.clear();
    std::string numerified_line;
    numerified_line.reserve(100);
    numerified_line.clear();

    while(std::getline(inFile, line)) {

        //reconstruct multibyte-chars byte-by-byte from the string-bytes until it matches one in our base_vocab      
        for(auto ch : line) {
            base_char += ch;
            if(base_vocab.contains(base_char)) {
                numerified_line += std::to_string(base_vocab.at(base_char)) + " ";
                base_char.clear();
            }
        }
        outFile << numerified_line << "\n";
        numerified_line.clear();
    }
    
    
    inFile.close();

    outFile.close();

    return 0;
}
