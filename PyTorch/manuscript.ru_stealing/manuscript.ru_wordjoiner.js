#!/usr/bin/node

const fs = require('node:fs');
const readline = require('readline');
const {nn_deepClean_OCS_ы, nn_deepClean_Russian_ы} = require('../../torot_2023/PyTorch/orthography_cleaning/nn_cleaning.js');


if(process.argv.length < 3) {
    console.log("Must specify source-text path");
    process.exit(0);
}

const input_filepath = process.argv[2];


const msru_usp_sbor_lines = readline.createInterface({input: fs.createReadStream(input_filepath)})[Symbol.asyncIterator]();

(async() => {

   
    let msru_usp_sbor_words = "torot_word|deep_cleaned\n";
    let msru_usp_sbor_bpe_training = "";

    let prev_halfword = "";


    const unique_deepcleaned_letters = new Set();

    for await(const raw_line of msru_usp_sbor_lines) {
        //if(/[0-9]/.test(line.slice(0)) || line.trim() == "") continue;

        const line = raw_line.replace(/^[0-9]+\s*/, "").replaceAll("-", "|"); //necessary to use pipe as the word-break character because hyphen gets cleaned out by the deepcleaning

        for(const word of line.split(/\s+/)){
            const deep_cleaned_word = nn_deepClean_Russian_ы(word).trim();

            if(deep_cleaned_word.replaceAll("|", "").trim().length == 0) continue;

            if(prev_halfword.length > 0) {
                console.log(prev_halfword.length);
                console.log(prev_halfword+word);

                const rejoined_word = prev_halfword+word;
                const deep_cleaned_rejoined_word = nn_deepClean_Russian_ы(prev_halfword+word);

                const final_deepcleaned_rejoined_word = deep_cleaned_rejoined_word.replaceAll("|", "");
                msru_usp_sbor_words += rejoined_word.replaceAll("|", "") + "|" + final_deepcleaned_rejoined_word + "\n";
                msru_usp_sbor_bpe_training += final_deepcleaned_rejoined_word + "\n";

                for(const char of final_deepcleaned_rejoined_word) {
                    unique_deepcleaned_letters.add(char);
                }

                // total_BERT_training_words += deep_cleaned_rejoined_word.replaceAll("|", "") + "|" + current_text_id + "\n";
                // bpe_training_total_BERT_corpus += deep_cleaned_rejoined_word.replaceAll("|", "") + "\n";

                prev_halfword = "";
            }
            else {
                if(deep_cleaned_word.slice(-1) == "|" && deep_cleaned_word.length > 1) {
                    prev_halfword = word.slice(0, -1);
                    console.log(prev_halfword);
                }
                else {
                    const final_deepcleaned_word = deep_cleaned_word.replaceAll("|", "");

                    msru_usp_sbor_words += word.replaceAll("|", "") + "|" + final_deepcleaned_word + "\n";
                    msru_usp_sbor_bpe_training += final_deepcleaned_word + "\n";


                    for(const char of final_deepcleaned_word) {
                        unique_deepcleaned_letters.add(char);
                    }

                    // total_BERT_training_words += final_deepcleaned_word + "|" + current_text_id + "\n";
                    // bpe_training_total_BERT_corpus += final_deepcleaned_word + "\n";
                    prev_halfword = "";
                }
            }
        }        
    }

    output_words_filepath = input_filepath.replace("manuscript.ru", "msru").replace("rawtext_utf8_conversion.txt", "words.csv")
    output_bpe_filepath = input_filepath.replace("manuscript.ru", "msru").replace("rawtext_utf8_conversion.txt", "bpe_training.csv")

    fs.writeFileSync(output_words_filepath, msru_usp_sbor_words);
    fs.writeFileSync(output_bpe_filepath, msru_usp_sbor_bpe_training);
    

    console.log(unique_deepcleaned_letters);


})();
