#include <iostream>
#include <string>
#include <fstream>
//#include <unicode/unistr.h>
//#include <unicode/brkiter.h>
#include <unordered_map>

std::unordered_map<std::string, int> base_vocab {
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
