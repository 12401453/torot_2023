//compile: g++ -O3 -march=native -shared -std=c++20 -fPIC $(python3 -m pybind11 --includes) tokenise_bpe-dropout_python_module.cpp -o bpe_tokeniser$(python3 -m pybind11 --extension-suffix)

#include <iostream>
#include <string>
#include <fstream>
#include <sstream>
#include <vector>
#include <unordered_map>
#include <map>
#include <cstdint>
#include <random>
#include <thread>
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/numpy.h>

namespace py = pybind11;


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
        line_no++;
    }
    return merge_rules_map;
}

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

class Tokeniser {
    public:
        Tokeniser(const std::string& merge_rules_filepath, int num_iterations) {
            merge_rules_map = loadMergeRulesMap(merge_rules_filepath, num_iterations);
        }

        std::pair<std::vector<std::int64_t>, std::vector<std::uint16_t>> tokenise(const std::vector<std::string>& words_str_vector, double dropout_probability=0.1) {
            
            int num_words = words_str_vector.size();

            if(num_words == 0) {
                return {std::vector<std::int64_t>(0), std::vector<std::uint16_t>(0)};
            }

            int num_hardware_threads = std::thread::hardware_concurrency();
            int vec_portion_size = num_words / num_hardware_threads;

            std::vector<std::thread> tokeniser_threads;
            
            auto start_iter = words_str_vector.begin();
            auto end_iter = words_str_vector.end();

            // std::vector<std::vector<std::uint16_t>> token_ids(num_words);
            // auto start_token_ids_iter = token_ids.begin();

            std::vector<std::uint16_t> flat_token_ids;
            flat_token_ids.reserve(num_words*2);

            std::vector<std::int64_t> word_tokenoffsets(num_words);
            auto word_tokenoffsets_iter = word_tokenoffsets.begin();
            auto end_word_tokenoffsets_iter = word_tokenoffsets.end();

            if(vec_portion_size > 0){

                std::vector<std::vector<std::uint16_t>> flat_per_thread_token_ids(num_hardware_threads);
                //std::vector<std::vector<std::uint16_t>> flat_per_thread_word_tokenoffsets(num_hardware_threads);

                for(int i = 0; i < num_hardware_threads; i++) {
                    flat_per_thread_token_ids[i].reserve((num_words/num_hardware_threads)*2);
                    //flat_per_thread_word_tokenoffsets[i].reserve(num_words/num_hardware_threads);
                }

                for(int i = 0; i < num_hardware_threads - 1; i++) {
                    tokeniser_threads.emplace_back(&Tokeniser::worker, this, start_iter+(vec_portion_size*i), start_iter+(vec_portion_size*(i+1)), /*start_token_ids_iter+(vec_portion_size*i),*/ word_tokenoffsets_iter+(vec_portion_size*i) , i, dropout_probability, std::ref(flat_per_thread_token_ids[i]));
                }
                tokeniser_threads.emplace_back(&Tokeniser::worker, this, start_iter+(vec_portion_size*(num_hardware_threads - 1)), end_iter, /*start_token_ids_iter+(vec_portion_size*(num_hardware_threads - 1)),*/ word_tokenoffsets_iter+(vec_portion_size*(num_hardware_threads - 1)), num_hardware_threads - 1, dropout_probability, std::ref(flat_per_thread_token_ids[num_hardware_threads - 1]));
            
                for(auto& thread : tokeniser_threads) {
                    thread.join();
                }
                //for(const auto& per_thread_token_ids : flat_per_thread_token_ids) {
                int first_thread_token_count = flat_per_thread_token_ids[0].size();

                for(int i = 0 ; i < num_hardware_threads; i++){
                    flat_token_ids.insert(flat_token_ids.end(), flat_per_thread_token_ids[i].begin(), flat_per_thread_token_ids[i].end());
                    //use .size() of each per_thread_token_ids vec to add on the right amount to 
                }
            }
            else {
                
                worker(start_iter, end_iter, /*start_token_ids_iter,*/ word_tokenoffsets_iter, 0, dropout_probability, flat_token_ids);
            }
            std::int64_t cumulative_token_count = 0;
            for(std::int64_t& word_tokensize : word_tokenoffsets) {
                std::int64_t word_tokensize_copy = word_tokensize;
                word_tokensize = cumulative_token_count;
                cumulative_token_count += word_tokensize_copy;
            }



            return {std::move(word_tokenoffsets), std::move(flat_token_ids)};
        }

    private:

        std::vector<std::uint16_t> tokeniseStringWord(const std::string &word_str, DropoutChanceGenerator &dropout_chance_generator) {
            std::string untokenised_word = "<wb>"+word_str;
            std::string base_char;
            base_char.reserve(3);
            base_char.clear();
            std::vector<std::uint16_t> word_vec;
            word_vec.reserve(8);
            for(const auto ch : untokenised_word) {
                base_char += ch;
                //this will break spectacularly if it's ever fed with text containing characters beyond the base-vocab, so probably will have to actually replace out-of-vocab chars with <unk>s on the Python side (where I can take advantage of its Unicode support)
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

        void tokenisePart(const std::string& word_str, /*decltype(std::vector<std::vector<std::uint16_t>>().begin()) token_ids_iter,*/ decltype(std::vector<std::int64_t>().begin()) token_offsets_iter, DropoutChanceGenerator &dropout_chance_generator, std::vector<std::uint16_t>& per_thread_token_ids_vec, int& per_thread_token_offsets) {
            
            auto tokenised_string = tokeniseStringWord(word_str, dropout_chance_generator);
            
            //*token_ids_iter = tokenised_string;

            *token_offsets_iter = tokenised_string.size(); //will be accumulated after threads have joined

            //per_thread_token_offsets += tokenised_string.size();

            per_thread_token_ids_vec.insert(per_thread_token_ids_vec.end(), tokenised_string.begin(), tokenised_string.end());
        }

        void worker(std::vector<std::string>::const_iterator start, std::vector<std::string>::const_iterator end, /*decltype(std::vector<std::vector<std::uint16_t>>().begin()) start_token_ids_iter,*/ decltype(std::vector<std::int64_t>().begin()) start_token_offsets_iter, int i, double dropout_probability, std::vector<std::uint16_t>& per_thread_token_ids_vec) {
            //std::cout << "thread " << i + 1 << " has started\n";
        
            DropoutChanceGenerator dropout_chance_generator(dropout_probability);
            int per_thread_token_offsets = 0;
            for(; start != end; ++start, /*++start_token_ids_iter,*/ ++start_token_offsets_iter) {
                tokenisePart(*start, /*start_token_ids_iter,*/ start_token_offsets_iter, dropout_chance_generator, per_thread_token_ids_vec, per_thread_token_offsets);
            }
            //std::cout << "thread " << i + 1 << " has finished\n";
        }

        MergeRulesMap merge_rules_map;
};





PYBIND11_MODULE(bpe_tokeniser, m)
{
    py::class_<Tokeniser>(m, "Tokeniser")
        .def(
            py::init<const std::string&, int>(),
            py::arg("merge_rules_filepath"),
            py::arg("num_iterations")
        )
        .def(
            "tokenise",
            //&Tokeniser::tokenise,
            [](Tokeniser& self, const std::vector<std::string>& words, double dropout_probability) {
                std::pair<std::vector<std::int64_t>, std::vector<std::uint16_t>> tokens_tuple = self.tokenise(words, dropout_probability);
                
                py::array_t<std::uint16_t> numpy_tokens(static_cast<py::ssize_t>(tokens_tuple.second.size()));
                std::memcpy(numpy_tokens.mutable_data(), tokens_tuple.second.data(), tokens_tuple.second.size()*sizeof(std::uint16_t));

                py::array_t<std::int64_t> numpy_wordoffsets(static_cast<py::ssize_t>(tokens_tuple.first.size()));
                std::memcpy(numpy_wordoffsets.mutable_data(), tokens_tuple.first.data(), tokens_tuple.first.size()*sizeof(std::int64_t));

                return py::make_tuple(numpy_tokens, numpy_wordoffsets);
            },

            py::arg("words"),
            py::arg("dropout_probability") = 0.1
        );
}
