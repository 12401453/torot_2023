#include <iostream>
#include <string>
#include <fstream>
#include <unicode/unistr.h>
#include <unicode/brkiter.h>
#include <unordered_set>

int main(int argc, char** argv)
{
    if(argc != 2) {
        std::cout << "Usage: ./unique_chars <input_file>\n";
        return -1;
    }

    std::string input_filename(argv[1]);

    std::unordered_set<std::string> uchar_set;
    UErrorCode status = U_ZERO_ERROR;

    icu::UnicodeString ocs_word;

    icu::BreakIterator *char_brkiter = icu::BreakIterator::createCharacterInstance(icu::Locale::getUS(), status);

    std::ifstream inFile(input_filename);
    std::ofstream outFile(input_filename.substr(0, input_filename.length() - 4) + "_unique_letters.csv");
    std::string line;
    while(std::getline(inFile, line)) {

        ocs_word = ocs_word.fromUTF8(line);

        icu::UnicodeString ocs_word_copy;
        
        char_brkiter->setText(ocs_word);

        int32_t start_offset = 0;
        int32_t end_offset = char_brkiter->first();

        while(end_offset != icu::BreakIterator::DONE) {
            ocs_word_copy = ocs_word;
            start_offset = end_offset;
            end_offset = char_brkiter->next();

            if(end_offset == -1) break;

            ocs_word_copy.retainBetween(start_offset, end_offset);
            std::string uchar;
            ocs_word_copy.toUTF8String(uchar);
            
            // std::string byte_seq = "";
            // for(auto ch : uchar) byte_seq += "0x" + std::to_string((int)(unsigned char)ch) + " ";

            uchar_set.insert(uchar);
        }

        ocs_word.setTo("");
    }
    
    
    inFile.close();

    std::cout << "std::unordered_map<std::string, int> base_vocab {\n";
    int i = 0;

    for(auto ch: uchar_set) {
        //std::cout << ch << " | ";
        std::cout << "    {\"" << ch << "\", " << i << "},\n";
        outFile << ch << "\n";
        i++;
    }

    std::cout << "}\n";
    outFile.close();

    return 0;
}
