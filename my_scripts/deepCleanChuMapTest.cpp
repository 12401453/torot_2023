#include <iostream>
#include <string>
#include <fstream>
#include <unordered_map>

//there's no way to do char-by-char rebuilding of the string without using ICU
#include "repl_map.cpp"

std::string deep_clean_Cyr(std::string& dirty_text)
{
    std::string str1;
    std::string str2;
    int x = 0;
    //  int q = 0;
    int y;

    for(const auto& repl_pair : deepCleanMap){
        str1.assign(repl_pair.first);
        str2.assign(repl_pair.second);
        
        do
        {
            x = dirty_text.find(str1);
            if (x == -1)
            {
                break;
            }
            y = str1.length();
            dirty_text.replace(x, y, str2);
        } while (x != -1);
        //std::cout << letno << "\n";
    }
    return dirty_text;
}

int main(int argc, char** argv)
{
    if(argc != 2) {
        std::cout << "Usage: ./deepCleanChuMapTest <file_to_clean>\n";
        return 0;
    }
    std::string infileName = argv[1];
    std::ifstream inFile(infileName);
    int in_len = infileName.size();
    std::ofstream outFile(infileName.substr(0, in_len-4) + "_deepCleanedMapTest" + infileName.substr(in_len-4, 4));
    std::string line;
    while(std::getline(inFile, line)) {
        outFile << deep_clean_Cyr(line) << "\n";
    }
    outFile.close();
    inFile.close();
    return 0;
}
