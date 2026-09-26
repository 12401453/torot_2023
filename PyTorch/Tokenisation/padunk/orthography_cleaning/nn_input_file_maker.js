#!/usr/bin/node

const fs = require('node:fs');
const readline = require('readline');
const {nn_deepClean_OCS_ы, nn_deepClean_Russian_ы} = require('./nn_cleaning.js');
const CsvReader = require('./csv_reader.js');

const chu_input_lines = readline.createInterface({input: fs.createReadStream("chu_words_full_with_titles_untagged_autotags_added_with_assem_NEW.csv")})[Symbol.asyncIterator]();

const pandects_of_antioch_csv_lines = readline.createInterface({input: fs.createReadStream("../../../random_old_bulgarian_texts_from_sofia_corpus_to_use_as_pre_training/pandects_of_antioch/pandects_of_antioch.csv")})[Symbol.asyncIterator]();

const usp_sbor_lines = readline.createInterface({input: fs.createReadStream("usp_sbor_words_full_with_titles_untagged.csv")})[Symbol.asyncIterator]();

const yagichev_zlatoust_lines = readline.createInterface({input: fs.createReadStream("yagichev_zlatoust.txt")})[Symbol.asyncIterator]();

const kratuk_zlatostruy_lines = readline.createInterface({input: fs.createReadStream("word_joined_kratuk_zlatostruy.txt")})[Symbol.asyncIterator]();

const chu_csv_reader = new CsvReader('|');
const orv_csv_reader = new CsvReader('|');

(async() => {

    let headers = (await chu_input_lines.next()).value;
    chu_csv_reader.setHeaders(headers);
    let chu_corpus_bpe = "";
    let chu_corpus_words = "";
    let total_BERT_training_words = "deep_cleaned|text_id\n";

    let current_text_id = 0;;
    for await(const line of chu_input_lines) {
        chu_csv_reader.setLine(line);

        const torot_word = chu_csv_reader.getField("torot_word");
        const deep_cleaned = nn_deepClean_OCS_ы(torot_word);
        const text_id = chu_csv_reader.getField("text_id");
        current_text_id = Number(text_id);


        chu_corpus_words += torot_word + "|" + deep_cleaned + "\n";
        chu_corpus_bpe += deep_cleaned + "\n";
        total_BERT_training_words += deep_cleaned + "|" + text_id + "\n";
    }
    // fs.writeFileSync("chu_corpus_words_bpe_training_newnorm.csv", chu_corpus_bpe);
    // fs.writeFileSync("chu_corpus_words_newnorm.csv", chu_corpus_words);



    current_text_id++;
    headers = (await pandects_of_antioch_csv_lines.next()).value;
    orv_csv_reader.setHeaders(headers);

    let word_separated_pandects_of_antioch_csv = "torot_word|deep_cleaned\n";
    let pandects_of_antioch_deepcleaned_words = "";
    for await(const line of pandects_of_antioch_csv_lines) {
        orv_csv_reader.setLine(line);

        const text = orv_csv_reader.getField("page_text");

        const text_words = text.split(/\s+/);
        for(const word of text_words) {
            const deep_cleaned = nn_deepClean_Russian_ы(word);
            if(deep_cleaned.length > 0){
                word_separated_pandects_of_antioch_csv += word + "|" + deep_cleaned + "\n";
                pandects_of_antioch_deepcleaned_words += deep_cleaned + "\n";
                total_BERT_training_words += deep_cleaned + "|" + current_text_id + "\n";
            }
        }    
    }
    
    current_text_id++;
    let usp_sbor_words = "torot_word|deep_cleaned\n";
    let usp_sbor_bpe_training = "";

    headers = (await usp_sbor_lines.next()).value;
    orv_csv_reader.setHeaders(headers);
    for await(const line of usp_sbor_lines) {
        orv_csv_reader.setLine(line);

        const torot_word = orv_csv_reader.getField("torot_word");
        const deep_cleaned = nn_deepClean_Russian_ы(torot_word);
        if(deep_cleaned.length > 0) {
            usp_sbor_words += torot_word + "|" + deep_cleaned + "\n";
            usp_sbor_bpe_training += deep_cleaned + "\n";
            total_BERT_training_words += deep_cleaned + "|" + current_text_id + "\n";
        }
    }


    // fs.writeFileSync("pandects_of_antioch_words.csv", word_separated_pandects_of_antioch_csv);
    // fs.writeFileSync("pandects_of_antioch_bpe_training.csv", pandects_of_antioch_deepcleaned_words);
    // fs.writeFileSync("usp_sbor_words.csv", usp_sbor_words);
    // fs.writeFileSync("usp_sbor_bpe_training.csv", usp_sbor_bpe_training);

    current_text_id++;
    let yagichev_zlatoust_words = "torot_word|deep_cleaned\n";
    let yagichev_zlatoust_bpe_training = "";

    let prev_halfword = "";
    for await(const line of yagichev_zlatoust_lines) {
        if(/[0-9]/.test(line.slice(0)) || line.trim() == "") continue;

        for(const word of line.split(/\s+/)){
            const deep_cleaned_word = nn_deepClean_Russian_ы(word).trim();

            if(deep_cleaned_word.replaceAll("|", "").length == 0) continue;

            if(prev_halfword.length > 0) {
                console.log(prev_halfword.length);
                console.log(prev_halfword+word);

                const rejoined_word = prev_halfword+word;
                const deep_cleaned_rejoined_word = nn_deepClean_Russian_ы(prev_halfword+word);

                yagichev_zlatoust_words += rejoined_word.replaceAll("|", "") + "|" + deep_cleaned_rejoined_word.replaceAll("|", "") + "\n";
                yagichev_zlatoust_bpe_training += deep_cleaned_rejoined_word.replaceAll("|", "") + "\n";

                total_BERT_training_words += deep_cleaned_rejoined_word.replaceAll("|", "") + "|" + current_text_id + "\n";

                prev_halfword = "";
            }
            else {
                if(deep_cleaned_word.slice(-2) == "||" && deep_cleaned_word.length > 2) {
                prev_halfword = word.slice(0, -2);
                console.log(prev_halfword);
            }
                else {
                    yagichev_zlatoust_words += word.replaceAll("|", "") + "|" + deep_cleaned_word.replaceAll("|", "") + "\n";
                    yagichev_zlatoust_bpe_training += deep_cleaned_word.replaceAll("|", "") + "\n";
                    total_BERT_training_words += deep_cleaned_word.replaceAll("|", "") + "|" + current_text_id + "\n";
                    prev_halfword = "";
                }
            }
        }        
    }
    // fs.writeFileSync("yagichev_zlatoust_words.csv", yagichev_zlatoust_words);
    // fs.writeFileSync("yagichev_zlatoust_bpe_training.csv", yagichev_zlatoust_bpe_training);

    
    current_text_id++;
    let kratuk_zlatostruy_words = "torot_word|deep_cleaned\n";
    let kratuk_zlatostruy_bpe_training = "";

    for await(const line of kratuk_zlatostruy_lines) {
        if(line.trim() == "") continue;

        for(const word of line.split(/\s+/)){
            const deep_cleaned_word = nn_deepClean_Russian_ы(word).trim();
            if(deep_cleaned_word.length > 0){
                kratuk_zlatostruy_words += word + "|" + deep_cleaned_word + "\n";
                kratuk_zlatostruy_bpe_training += deep_cleaned_word + "\n";
                total_BERT_training_words += deep_cleaned_word + "|" + current_text_id + "\n";
            }
            
            
        }        
    }
    // fs.writeFileSync("kratuk_zlatostruy_words.csv", kratuk_zlatostruy_words);
    // fs.writeFileSync("kratuk_zlatostruy_bpe_training.csv", kratuk_zlatostruy_bpe_training);
    fs.writeFileSync("total_BERT_corpus.csv", total_BERT_training_words);

    


})();