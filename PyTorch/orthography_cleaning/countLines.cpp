#include <iostream>
#include <fstream>
#include <algorithm>
#include <string>

int countLines(std::string cleaned_text_path) {
    std::ifstream cleanedTextFile(cleaned_text_path);
    
    char buffer[65536];

    int line_count = 0;

    while(cleanedTextFile) {
        cleanedTextFile.read(buffer, sizeof(buffer));
        std::streamsize bytes_read = cleanedTextFile.gcount();
        line_count += std::count(buffer, buffer+bytes_read, '\n');
    }

    return line_count;

}

int main(int argc, char** argv) {

    if(argc < 2) {
        std::cout << "Must provide filename\n";
        return 0;
    }

    std::string cleaned_text_path = argv[1];

    std::cout << countLines(cleaned_text_path) << "\n";

    return 0;
} 