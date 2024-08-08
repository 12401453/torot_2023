#include <iostream>
#include <string>
#include <fstream>
#include <sstream>

int main()
{
    std::ifstream inFile("repl.txt");
    std::ofstream outFile("repl_map.cpp");
    std::string line;

    std::ostringstream map_oss;

    map_oss << "std::unordered_map<const char*, const char*> deepCleanMap {\n    ";

    int line_num = 1;
    while(std::getline(inFile, line)) {

        if(line_num % 4 == 2) {
            size_t start_offset = line.find("ign(\"") + 5;
            size_t end_offset = line.find("\");");

            map_oss << "{\"" << line.substr(start_offset, end_offset - start_offset) << "\", ";
        }
        if(line_num % 4 == 3) {
            size_t start_offset = line.find("ign(\"") + 5;
            size_t end_offset = line.find("\");");
            
            map_oss << "\"" << line.substr(start_offset, end_offset - start_offset) << "\"},\n    ";
        }       

        line_num++;
    }
    map_oss << "\n};";
    
    outFile << map_oss.str();

    outFile.close();
    inFile.close();
    return 0;
}