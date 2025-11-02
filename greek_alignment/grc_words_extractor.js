#!/usr/bin/node

const sax = require('sax');
const fs = require('node:fs');

if(process.argv.length < 3) {
    console.log("Must specify lang-code");
    process.exit(0);
}

let list_of_xml_files = fs.readdirSync(".").filter(x => x.slice(-4) == ".xml");
const number_of_files = list_of_xml_files.length;

let current_file_number = 0;
let word_count = 0;

const lang_id = process.argv[2];

const words_filename = lang_id+"_words_full_with_titles.csv";
fs.writeFileSync(words_filename, "tokno|grc_word|pos|morph_tag|grc_lemma_id|sentence_id|text_id|subtitle_id\n");

const saxParser = sax.createStream(true);

const pos_set = new Set();
const morph_set = new Set();
const lemma_map = new Map();
let lemma_count = 1;

const deepClean = (dirty_word) => {
    let cleaned_word = dirty_word;
    for(const key in chu_deepClean_map) {
        cleaned_word = cleaned_word.replaceAll(key, chu_deepClean_map[key]);
    }
    return cleaned_word;
};

const tag_stack = [];

let can_parse = false;
let annotated = false;
let sentence_id = 0;
let main_title_id = 0;
let main_title_text = "";
let sub_title_id = 0;
let sub_title_text = "";

let title_text_flag = false;

const main_title_map = new Map();
//const sub_title_map = new Map();

let subtitles_list = "";

let words_csv_string = "";
let lemma_csv_string = "";

saxParser.on('text', function(t) {
    if(can_parse && tag_stack[tag_stack.length -1] == "title" && tag_stack[tag_stack.length -2] == "source") {
        if(main_title_text != t) main_title_id++;
        main_title_text = t;
        title_text_flag = false;

        main_title_map.set(main_title_id, main_title_text);
        sub_title_id = 0;
    }
    else if(can_parse && tag_stack[tag_stack.length -1] == "title" && tag_stack[tag_stack.length -2] == "div") {
        if(sub_title_text != t) sub_title_id++;
        sub_title_text = t;

        subtitles_list += main_title_id + "|" + sub_title_text + "\n";
        //sub_title_map.set(sub_title_id, sub_title_text);
    }
});

saxParser.on('closetag', function(node) {
    tag_stack.pop();
});

saxParser.on('error', (e) => {
    console.log("Error: ", e);
})

saxParser.on('opentag', function(node) {

    tag_stack.push(node.name);

    if(node.name == "source") {
        can_parse = node.attributes.language == lang_id ? true : false;
        if(!can_parse) {
            console.log(list_of_xml_files[current_file_number], `is not a ${lang_id.toUpperCase()} text, ignoring...`);
        }
        else console.log(list_of_xml_files[current_file_number], `is a ${lang_id.toUpperCase()} text, extracting words...`);
    }
    if(node.name == 'title' && can_parse) title_text_flag = true;
    else title_text_flag = false;

    if(node.name == 'sentence' && can_parse) {
        annotated = node.attributes.status == 'unannotated' ? false : true;
        sentence_id = node.attributes.id;
    }
    
 
    if(can_parse && node.name == "token") {
        const text_word = node.attributes.form;
        let morph_tag = "";
        let pos = "";
        let lemma_id = 0;
        
        if(text_word != undefined) {

            const token_id = node.attributes["id"];

            if(annotated) {
                morph_tag = node.attributes.morphology;
                pos = node.attributes['part-of-speech'];
                const lemma = node.attributes.lemma;
                const lemma_pos_combo = lemma.concat(pos);
                pos_set.add(pos);
                morph_set.add(morph_tag);
                if(lemma_map.has(lemma_pos_combo)) {
                    lemma_id = lemma_map.get(lemma_pos_combo);
                }
                else {
                    lemma_map.set(lemma_pos_combo, lemma_count);
                    lemma_csv_string += lemma_count + "|" + lemma + "|" + pos + "\n";
                    lemma_id = lemma_count;
                    lemma_count++;
                }
            }
            else {
                morph_tag = node.attributes.morphology ?? "";
                pos = node.attributes['part-of-speech'] ?? "";
                const lemma = node.attributes.lemma ?? "";
                const lemma_pos_combo = lemma.concat(pos);

                if(lemma != "" && pos != "") {
                    if(lemma_map.has(lemma_pos_combo)) {
                        lemma_id = lemma_map.get(lemma_pos_combo);
                    }
                    else {
                        lemma_map.set(lemma_pos_combo, lemma_count);
                        lemma_csv_string += lemma_count + "|" + lemma + "|" + pos + "\n";
                        lemma_id = lemma_count;
                        lemma_count++;
                    }
                }
            }
            
            words_csv_string += token_id + "|" + text_word + "|" + pos + "|" + morph_tag + "|" + lemma_id + "|" + sentence_id + "|" + main_title_id + "|" + sub_title_id + "\n";

        
            word_count++;
            if(pos == undefined) console.log(text_word, "apparently doesn't have any assigned POS.");
        }
    }
});

saxParser.on('end', () => {

    if(can_parse) {
        console.log(`${word_count} words were found in ${list_of_xml_files[current_file_number]}`);
        console.log(`${lemma_map.size} lemmas found so far`);
        fs.appendFileSync(words_filename, words_csv_string);
    }
    
    words_csv_string = "";
    word_count = 0;
    current_file_number++;

    if(current_file_number < number_of_files) {
        const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
        xml_stream.pipe(saxParser);
    }
    else {
        console.log("No more xml files to parse\n");

        console.log("Number of unique POSes: ", pos_set.size);
        console.log("Number of unique morphology-tags: ", morph_set.size);
        console.log("Number of unique lemmas: ", lemma_map.size);

        console.log(main_title_map);

        fs.writeFileSync("grc_subtitles.csv", subtitles_list);
        fs.writeFileSync("grc_lemmas.csv", lemma_csv_string);
    }


});


const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
xml_stream.pipe(saxParser);
