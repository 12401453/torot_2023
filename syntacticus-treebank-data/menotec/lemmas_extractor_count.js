#!/usr/bin/node

const sax = require('sax');
const fs = require('node:fs');



let list_of_xml_files = fs.readdirSync(".").filter(x => x.slice(-4) == ".xml");
const number_of_files = list_of_xml_files.length;
console.log(list_of_xml_files);

const saxParser = sax.createStream(true);
let lang_name = process.argv[2];
const lemmas_filename = lang_name + "_lemmas.csv";
let can_parse = false;

let csv_string = "";
const key_set = new Set();
const lemmas_map = new Map();

let lemma_count = 1;
let lems_per_text_count = 0;
let current_file_number = 0;

let lemmas_counts_array = [];

saxParser.on('error', function(e) {
    console.log('error: ', e);
    this._parser.error = null;
    this._parser.resume();
    
});

saxParser.on('opentag', function(node) {
    if(node.name == "source") {
        can_parse = node.attributes.language == lang_name ? true : false;
        if(!can_parse) console.log(list_of_xml_files[current_file_number], `is not a ${lang_name.toUpperCase()} text, ignoring...`);
    }
    
    if(can_parse && node.name == "token") {
        const lemma_form = node.attributes.lemma;
        const lemma_pos = node.attributes['part-of-speech'];

        if(lemma_form != undefined) {
            const stringified_combo = lemma_form.concat(lemma_pos);
            if(key_set.has(stringified_combo) == false){
                csv_string += String(lemma_count) + "," + lemma_form + "," + lemma_pos + "\n";
                lemmas_map.set(stringified_combo, lemma_count);
                lemmas_counts_array.push(1);
                
                lemma_count++;
                key_set.add(stringified_combo);
                
                lems_per_text_count++;
                
            }
            else {
                lemmas_counts_array[lemmas_map.get(stringified_combo) - 1]++;
            }      
        }
    }
});

saxParser.on('end', () => {

    if(can_parse) {
        console.log(`${lems_per_text_count} new lemmas were found in ${list_of_xml_files[current_file_number]}`);
        fs.appendFileSync(lemmas_filename, csv_string);
    }
    
    csv_string = "";
    lems_per_text_count = 0;

    current_file_number++;

    if(current_file_number < number_of_files) {
        const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
        xml_stream.pipe(saxParser);
    }
    else {
        console.log("No more xml files to parse");
        fs.writeFileSync(`${lang_name}_lemma_counts.csv`, lemmas_counts_array.join('\n'));
    }

});

const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
xml_stream.pipe(saxParser);
