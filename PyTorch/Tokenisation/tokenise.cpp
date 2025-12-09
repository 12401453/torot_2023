//compile: g++ -O3 -std=c++20 tokenise.cpp -o tokenise

#include <iostream>
#include <string>
#include <fstream>
#include <sstream>
//#include <unicode/unistr.h>
//#include <unicode/brkiter.h>
#include <vector>
#include <unordered_map>
#include <map>
#include <cstdint>
#include <thread>
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

std::unordered_map<std::uint16_t, std::string> total_vocab_reversed = base_vocab_reversed;

std::vector<std::pair<std::uint32_t, std::uint16_t>> merge_rules_vec;

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

std::vector<std::uint16_t> tokeniseWord(const std::vector<std::uint16_t> &source_word_vec) {
    std::vector<std::uint16_t> word_vec = source_word_vec;
    std::vector<std::uint16_t> merged_word_vec;
    merged_word_vec.reserve(8);
    for(const auto &merge_rule : merge_rules_vec) {
        int word_vec_index_second = 1;
        int word_vec_length = word_vec.size();
        bool merger_happened = false;
        while(word_vec_index_second < word_vec_length) {
            std::uint16_t first_charcode = word_vec[word_vec_index_second - 1];
            std::uint16_t second_charcode = word_vec[word_vec_index_second];
            std::uint32_t merged_charcode_pair = shortIntPair(first_charcode, second_charcode);
            
            if(merge_rule.first == merged_charcode_pair) {
                merged_word_vec.push_back(merge_rule.second);
                word_vec_index_second++;
                merger_happened = true;
            }
            else {
                merged_word_vec.push_back(first_charcode);
                merger_happened = false;
            }
            word_vec_index_second++;
        }

        if(!merger_happened) merged_word_vec.push_back(word_vec.back());
        else if(word_vec_index_second == word_vec_length) merged_word_vec.push_back(word_vec.back());
        word_vec = merged_word_vec;
        merged_word_vec.clear();
        if(word_vec.size() == 1) break;
    }
    return word_vec;
}

void tokenisePart(const std::vector<std::uint16_t>& numerified_word, std::ostringstream& csv_text, int& worker_token_count) {
    std::ostringstream charcode_tokenised, text_tokenised;
    for(const auto& charcode : tokeniseWord(numerified_word)) {
        charcode_tokenised << charcode << ' ';
        text_tokenised << total_vocab_reversed.at(charcode) << '|';
        ++worker_token_count;
    }
    charcode_tokenised.seekp(-1, std::ios_base::cur);
    charcode_tokenised << '\0';
    text_tokenised.seekp(-1, std::ios_base::cur);
    text_tokenised << '\0';
    //std::cout << charcode_tokenised.str().c_str() << ',' << text_tokenised.str().c_str() << '\n';
    csv_text << charcode_tokenised.str().c_str() << ',' << text_tokenised.str().c_str() << '\n';
}

void worker(decltype(std::vector<std::vector<std::uint16_t>>().begin()) start, decltype(std::vector<std::vector<std::uint16_t>>().begin()) end, std::ostringstream& csv_text_oss, int i, int& total_token_count) {
    std::cout << "thread " << i + 1 << " has started\n";
    int worker_token_count = 0;

    for(auto iter = start; iter != end; ++iter) {
        tokenisePart(*iter, csv_text_oss, worker_token_count);
    }
    std::cout << "thread " << i + 1 << " has finished\n";
    // std::cout << "Token count for thread " << i + 1 << ": " << worker_token_count << "\n";
    total_token_count += worker_token_count;
}

int main(int argc, char** argv) {

    if(argc != 2) {
        std::cout << "Usage: ./tokenise <deep-cleaned word-per-line textfile>\n";
        return -1;
    }

    std::string cleaned_text_path = argv[1];

    std::ifstream mergeRulesFile("merge_rules.csv");
    std::string line;
    while(std::getline(mergeRulesFile, line)) {
        int pipe_pos = line.find('|');
        int comma_pos = line.find(',');

        std::uint16_t merge_pair_first, merge_pair_second, merged_new;

        merge_pair_first = std::uint16_t(std::stoi(line.substr(0, pipe_pos)));
        merge_pair_second = std::uint16_t(std::stoi(line.substr(pipe_pos + 1, comma_pos - pipe_pos - 1)));
        merged_new = std::uint16_t(std::stoi(line.substr(comma_pos + 1))); //no second-argument in .substr() defaults to just the whole rest

        merge_rules_vec.emplace_back(std::make_pair(shortIntPair(merge_pair_first, merge_pair_second), merged_new));
        total_vocab_reversed.emplace(std::make_pair(merged_new, total_vocab_reversed.at(merge_pair_first) + total_vocab_reversed.at(merge_pair_second)));
    }
    std::cout << "total_vocab size after adding all the merges: " << total_vocab_reversed.size() << "\n";
    mergeRulesFile.close();

    std::vector<std::vector<std::uint16_t>> numerifiedWords = numerifyWords(cleaned_text_path);
    int num_words = numerifiedWords.size();

    int num_hardware_threads = std::thread::hardware_concurrency();
    int vec_portion_size = num_words / num_hardware_threads;
    

    std::vector<std::thread> tokeniser_threads;
    std::vector<std::ostringstream> csv_text_portions;
    
    auto start_iter = numerifiedWords.begin();
    auto end_iter = numerifiedWords.end();

    int total_token_count = 0;
    
    std::cout << "Words processed by each thread: " << vec_portion_size << "\n";

    for(int i = 0; i < num_hardware_threads; i++) {
        csv_text_portions.emplace_back(std::ostringstream());
    }
    std::cout << "csv_vec size: " << csv_text_portions.size() << "\n";

    for(int i = 0; i < num_hardware_threads - 1; i++) {
        tokeniser_threads.emplace_back(worker, start_iter+(vec_portion_size*i), start_iter+(vec_portion_size*(i+1)), std::ref(csv_text_portions[i]), i, std::ref(total_token_count));
    }
    tokeniser_threads.emplace_back(worker, start_iter+(vec_portion_size*(num_hardware_threads - 1)), end_iter, std::ref(csv_text_portions[num_hardware_threads - 1]), num_hardware_threads - 1, std::ref(total_token_count));

    for(auto& thread : tokeniser_threads) {
        thread.join();
    }
    std::cout << "\ntotal_token_count: " << total_token_count << "\n";
    double tokens_per_word = double(total_token_count)/num_words;
    std::cout << "tokens-per-word: " << tokens_per_word << "\n";

    std::ofstream tokenisedFile("tokenised_" + cleaned_text_path);

    for(const auto& csv_oss : csv_text_portions) {
        tokenisedFile << csv_oss.str();
    }
    tokenisedFile.close();

    return 0;
} 
