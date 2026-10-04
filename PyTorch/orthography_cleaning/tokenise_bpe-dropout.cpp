//compile: g++ -O3 -std=c++20 -march=native tokenise_bpe-dropout.cpp -o tokenise_bpe-dropout

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
#include <random>
#include <thread>
#include <algorithm>

std::unordered_map<std::string, u_int16_t> base_vocab {
    {"<pad>", 0},
    {"<unk>", 1},
    {"<MASK>", 2},
    {"ш", 3},
    {"ѭ", 4},
    {"ѳ", 5},
    {"ъ", 6},
    {"ю", 7},
    {"ч", 8},
    {"х", 9},
    {"н", 10},
    {"е", 11},
    {"о", 12},
    {"к", 13},
    {"м", 14},
    {"ж", 15},
    {"і", 16},
    {"а", 17},
    {"в", 18},
    {"з", 19},
    {"ф", 20},
    {"р", 21},
    {"҂", 22},
    {"с", 23},
    {"ѧ", 24},
    {"ь", 25},
    {"ц", 26},
    {"ѯ", 27},
    {"г", 28},
    {"ⱖ", 29},
    {"ѫ", 30},
    {"б", 31},
    {"т", 32},
    {"ѣ", 33},
    {"д", 34},
    {"у", 35},
    {"л", 36},
    {"п", 37},
    {"ҁ", 38}, //think it's a numeral so kinda need it
    {"ꙗ", 39},
    {"щ", 40},
    {"҃", 41}, //titlo
    
    {"<wb>", 42}
};
std::unordered_map<u_int16_t, std::string> base_vocab_reversed {
    {0, "<pad>"},
    {1, "<unk>"},
    {2, "<MASK>"},
    {3, "ш"},
    {4, "ѭ"},
    {5, "ѳ"},
    {6, "ъ"},
    {7, "ю"},
    {8, "ч"},
    {9, "х"},
    {10, "н"},
    {11, "е"},
    {12, "о"},
    {13, "к"},
    {14, "м"},
    {15, "ж"},
    {16, "і"},
    {17, "а"},
    {18, "в"},
    {19, "з"},
    {20, "ф"},
    {21, "р"},
    {22, "҂"},
    {23, "с"},
    {24, "ѧ"},
    {25, "ь"},
    {26, "ц"},
    {27, "ѯ"},
    {28, "г"},
    {29, "ⱖ"},
    {30, "ѫ"},
    {31, "б"},
    {32, "т"},
    {33, "ѣ"},
    {34, "д"},
    {35, "у"},
    {36, "л"},
    {37, "п"},
    {38, "ҁ"},
    {39, "ꙗ"},
    {40, "щ"},
    {41, "҃"}, //titlo

    {42, "<wb>"}
};

struct MergeInfo {
    int merge_rules_position;
    std::uint16_t merged_token_id;
};

typedef std::unordered_map<std::uint32_t, MergeInfo> MergeRulesMap;

std::unordered_map<std::uint16_t, std::string> total_vocab_reversed = base_vocab_reversed;

class DropoutChanceGenerator {
    public:
    DropoutChanceGenerator(double desired_probability=0.1) {
        m_mersenne_twister_generator = std::mt19937 (std::random_device{}());
        m_percent_chance = std::bernoulli_distribution(desired_probability);
    }

    bool roll() {
        return m_percent_chance(m_mersenne_twister_generator); //returns true 10% (or desired_probability) of the time
    };

  private:
    std::mt19937 m_mersenne_twister_generator;
    std::bernoulli_distribution m_percent_chance;
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

MergeRulesMap loadMergeRulesMap(const std::string &merge_rules_filepath, int num_iterations) {

    MergeRulesMap merge_rules_map;

    std::ifstream mergeRulesFile(merge_rules_filepath);
    std::string line;
    int line_no = 0;
    while(std::getline(mergeRulesFile, line) && line_no < num_iterations) {
        int pipe_pos = line.find('|');
        int comma_pos = line.find(',');

        std::uint16_t merge_pair_first, merge_pair_second, merged_new;

        merge_pair_first = std::uint16_t(std::stoi(line.substr(0, pipe_pos)));
        merge_pair_second = std::uint16_t(std::stoi(line.substr(pipe_pos + 1, comma_pos - pipe_pos - 1)));
        merged_new = std::uint16_t(std::stoi(line.substr(comma_pos + 1))); //no second-argument in .substr() defaults to just the whole rest
        std::uint32_t merged_charcode_pair = shortIntPair(merge_pair_first, merge_pair_second);

        merge_rules_map.emplace(merged_charcode_pair, MergeInfo{line_no, merged_new});
        total_vocab_reversed.emplace(std::make_pair(merged_new, total_vocab_reversed.at(merge_pair_first) + total_vocab_reversed.at(merge_pair_second)));
        line_no++;
    }
    return merge_rules_map;
}

// std::vector<std::vector<std::uint16_t>> numerifyWords(std::string cleaned_text_path) {
//     std::string line;
//     std::ifstream cleanedTextFile(cleaned_text_path);
//     std::string base_char;
//     base_char.reserve(3);
//     base_char.clear();
//     std::vector<std::vector<std::uint16_t>> numerifiedWords;
//     numerifiedWords.reserve(65536);
//     std::vector<std::uint16_t> word_vector;
//     word_vector.reserve(8);
//     while(std::getline(cleanedTextFile, line)) {
//         std::string untokenised_word = "<wb>"+line;
//         for(const auto ch : untokenised_word) {
//             base_char += ch;
//             if(base_vocab.contains(base_char)) {
//                 std::uint16_t char_code = base_vocab.at(base_char);
//                 word_vector.push_back(char_code);
//                 base_char.clear();
//             }
//         }
//         numerifiedWords.emplace_back(word_vector);
//         word_vector.clear();
//     }
//     cleanedTextFile.close();
//     return numerifiedWords;
// }

std::vector<std::string> getWordsVector(std::string cleaned_text_path) {
    std::ifstream cleanedTextFile(cleaned_text_path);
    std::string line;
    std::vector<std::string> words_vector;
    words_vector.reserve(1048576);
    while(std::getline(cleanedTextFile, line)) {
        words_vector.push_back(line);
    }
    return words_vector;
}

std::vector<std::uint16_t> tokeniseStringWordDropout(const std::string &word_str, DropoutChanceGenerator &dropout_chance_generator, MergeRulesMap &merge_rules_map) {
    std::string untokenised_word = "<wb>"+word_str;
    std::string base_char;
    base_char.reserve(3);
    base_char.clear();
    std::vector<std::uint16_t> word_vec;
    word_vec.reserve(8);
    for(const auto ch : untokenised_word) {
        base_char += ch;
        if(base_vocab.contains(base_char)) {
            std::uint16_t char_code = base_vocab.at(base_char);
            word_vec.push_back(char_code);
            base_char.clear();
        }
    }

    std::vector<uint16_t> merged_word_vec;
    merged_word_vec.reserve(8);
    
    std::vector<MergeRulesMap::const_iterator> possible_merges;
    while(true){
        int word_vec_index_second = 1;
        while(word_vec_index_second < word_vec.size()) {
            std::uint16_t first_charcode = word_vec[word_vec_index_second - 1];
            std::uint16_t second_charcode = word_vec[word_vec_index_second];
            std::uint32_t merged_charcode_pair = shortIntPair(first_charcode, second_charcode);

            if(merge_rules_map.contains(merged_charcode_pair)) {
                possible_merges.emplace_back(merge_rules_map.find(merged_charcode_pair));
            }
            ++word_vec_index_second;
        }
        if(possible_merges.empty()) {
            break;
        }

        MergeRulesMap::const_iterator best_merge = merge_rules_map.end();
        int lowest_merge_rule_position = 999999;
        for(const auto& possible_merge : possible_merges) {
            if(dropout_chance_generator.roll()) {
                //possible_merge = merge_rules_map.end();
                continue;
            }
            else if(possible_merge->second.merge_rules_position < lowest_merge_rule_position) {
                lowest_merge_rule_position =  possible_merge->second.merge_rules_position;
                best_merge = possible_merge;
            }
        }

        //then simply apply the best-merge
        if(best_merge != merge_rules_map.end()) {
            int word_vec_index_second = 1;
            bool merger_just_happened = false;
            while(word_vec_index_second < word_vec.size()) {
                std::uint16_t first_charcode = word_vec[word_vec_index_second - 1];
                std::uint16_t second_charcode = word_vec[word_vec_index_second];
                std::uint32_t merged_charcode_pair = shortIntPair(first_charcode, second_charcode);
                
                if(best_merge->first == merged_charcode_pair) {
                    merged_word_vec.push_back(best_merge->second.merged_token_id);
                    word_vec_index_second++;
                    merger_just_happened = true;
                }
                else {
                    merged_word_vec.push_back(first_charcode);
                    merger_just_happened = false;
                }
                word_vec_index_second++;
            }

            if(!merger_just_happened) merged_word_vec.push_back(word_vec.back()); //we only push first_charcode to the merged_vector if no merge occurs, so if we're at the end of the word we need to add on the final character
            else if(word_vec_index_second == word_vec.size()) merged_word_vec.push_back(word_vec.back()); // there's a chance that this is an impossible condition
            word_vec = merged_word_vec;
            merged_word_vec.clear();
        }
        else {
            break;
        }
        possible_merges.clear();
    }

    return word_vec;
}

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

// std::vector<std::uint16_t> tokeniseWordDropout(const std::vector<std::uint16_t> &source_word_vec, DropoutChanceGenerator &dropout_chance_generator, MergeRulesMap &merge_rules_map) {
//     std::vector<std::uint16_t> word_vec = source_word_vec;
//     std::vector<uint16_t> merged_word_vec;
//     merged_word_vec.reserve(8);
    
//     std::vector<MergeRulesMap::const_iterator> possible_merges;
//     while(true){
//         int word_vec_index_second = 1;
//         while(word_vec_index_second < word_vec.size()) {
//             std::uint16_t first_charcode = word_vec[word_vec_index_second - 1];
//             std::uint16_t second_charcode = word_vec[word_vec_index_second];
//             std::uint32_t merged_charcode_pair = shortIntPair(first_charcode, second_charcode);

//             if(merge_rules_map.contains(merged_charcode_pair)) {
//                 possible_merges.emplace_back(merge_rules_map.find(merged_charcode_pair));
//             }
//             ++word_vec_index_second;
//         }
//         if(possible_merges.empty()) {
//             break;
//         }

//         MergeRulesMap::const_iterator best_merge = merge_rules_map.end();
//         int lowest_merge_rule_position = 999999;
//         for(const auto& possible_merge : possible_merges) {
//             if(dropout_chance_generator.roll()) {
//                 //possible_merge = merge_rules_map.end();
//                 continue;
//             }
//             else if(possible_merge->second.merge_rules_position < lowest_merge_rule_position) {
//                 lowest_merge_rule_position =  possible_merge->second.merge_rules_position;
//                 best_merge = possible_merge;
//             }
//         }

//         //then simply apply the best-merge
//         if(best_merge != merge_rules_map.end()) {
//             int word_vec_index_second = 1;
//             bool merger_just_happened = false;
//             while(word_vec_index_second < word_vec.size()) {
//                 std::uint16_t first_charcode = word_vec[word_vec_index_second - 1];
//                 std::uint16_t second_charcode = word_vec[word_vec_index_second];
//                 std::uint32_t merged_charcode_pair = shortIntPair(first_charcode, second_charcode);
                
//                 if(best_merge->first == merged_charcode_pair) {
//                     merged_word_vec.push_back(best_merge->second.merged_token_id);
//                     word_vec_index_second++;
//                     merger_just_happened = true;
//                 }
//                 else {
//                     merged_word_vec.push_back(first_charcode);
//                     merger_just_happened = false;
//                 }
//                 word_vec_index_second++;
//             }

//             if(!merger_just_happened) merged_word_vec.push_back(word_vec.back()); //we only push first_charcode to the merged_vector if no merge occurs, so if we're at the end of the word we need to add on the final character
//             else if(word_vec_index_second == word_vec.size()) merged_word_vec.push_back(word_vec.back()); // there's a chance that this is an impossible condition
//             word_vec = merged_word_vec;
//             merged_word_vec.clear();
//         }
//         possible_merges.clear();
//     }
//     return word_vec;
// }

void tokenisePart(const std::string& word_str, std::ostringstream& csv_text, int& worker_token_count, DropoutChanceGenerator &dropout_chance_generator, MergeRulesMap & merge_rules_map) {
    std::ostringstream charcode_tokenised, text_tokenised;
    for(const auto& charcode : tokeniseStringWordDropout(word_str, dropout_chance_generator, merge_rules_map)) {
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

void worker(decltype(std::vector<std::string>().begin()) start, decltype(std::vector<std::string>().begin()) end, std::ostringstream& csv_text_oss, int i, int& total_token_count, MergeRulesMap &merge_rules_map) {
    std::cout << "thread " << i + 1 << " has started\n";
    int worker_token_count = 0;

    DropoutChanceGenerator dropout_chance_generator(0.1);

    for(auto iter = start; iter != end; ++iter) {
        tokenisePart(*iter, csv_text_oss, worker_token_count, dropout_chance_generator, merge_rules_map);
    }
    std::cout << "thread " << i + 1 << " has finished\n";
    // std::cout << "Token count for thread " << i + 1 << ": " << worker_token_count << "\n";
    total_token_count += worker_token_count;
}

int safeStrToInt(const std::string &string_number, int default_result=-1) {
    int converted_int = default_result;
    try {
        converted_int = std::stoi(string_number);
    }
    catch (std::invalid_argument const& ex) {
        // std::cout << "std::stoi failed with an invalid_argument exception; defaulting it to " << default_result << "\n";
    }
    catch (std::out_of_range const& ex) {
        // std::cout << "std::stoi failed with an out_of_range exception; defaulting it to " << default_result << "\n";
    }
    return converted_int;
}

int main(int argc, char** argv) {

    if(argc != 3) {
        std::cout << "Usage: ./tokenise <deep-cleaned word-per-line textfile> <bpe iterations>\n";
        return -1;
    }

    std::string cleaned_text_path = argv[1];
    int num_iterations = safeStrToInt(argv[2]);

    //std::vector<std::vector<std::uint16_t>> numerifiedWords = numerifyWords(cleaned_text_path);
    std::vector<std::string> words_str_vector = getWordsVector(cleaned_text_path);
    int num_words = words_str_vector.size();

    int num_hardware_threads = std::thread::hardware_concurrency();
    int vec_portion_size = num_words / num_hardware_threads;
    

    std::vector<std::thread> tokeniser_threads;
    std::vector<std::ostringstream> csv_text_portions;
    
    auto start_iter = words_str_vector.begin();
    auto end_iter = words_str_vector.end();

    int total_token_count = 0;
    
    std::cout << "Words processed by each thread: " << vec_portion_size << "\n";

    MergeRulesMap merge_rules_map = loadMergeRulesMap("merge_rules.csv", num_iterations);
    std::cout << "total vocab size after adding all the merges: " << total_vocab_reversed.size() << "\n";

    for(int i = 0; i < num_hardware_threads; i++) {
        csv_text_portions.emplace_back(std::ostringstream());
    }
    std::cout << "csv_vec size: " << csv_text_portions.size() << "\n";

    for(int i = 0; i < num_hardware_threads - 1; i++) {
        tokeniser_threads.emplace_back(worker, start_iter+(vec_portion_size*i), start_iter+(vec_portion_size*(i+1)), std::ref(csv_text_portions[i]), i, std::ref(total_token_count), std::ref(merge_rules_map));
    }
    tokeniser_threads.emplace_back(worker, start_iter+(vec_portion_size*(num_hardware_threads - 1)), end_iter, std::ref(csv_text_portions[num_hardware_threads - 1]), num_hardware_threads - 1, std::ref(total_token_count), std::ref(merge_rules_map));

    for(auto& thread : tokeniser_threads) {
        thread.join();
    }
    std::cout << "\ntotal_token_count: " << total_token_count << "\n";
    double tokens_per_word = double(total_token_count)/num_words;
    std::cout << "tokens-per-word: " << tokens_per_word << "\n";

    std::ofstream tokenisedFile("tokenised_bpe-dropout" + std::to_string(num_iterations) + "_" + cleaned_text_path);

    for(const auto& csv_oss : csv_text_portions) {
        tokenisedFile << csv_oss.str();
    }
    tokenisedFile.close();

    return 0;
} 
