#!/usr/bin/node

const sax = require('sax');
const fs = require('node:fs');



let list_of_xml_files = fs.readdirSync(".").filter(x => x.slice(-4) == ".xml");
const number_of_files = list_of_xml_files.length;
console.log(list_of_xml_files);

const saxParser = sax.createStream(true);
let lang_name = process.argv[2];
const morph_tags_filename = lang_name + "_morph_tags.csv";
let can_parse = false;

let csv_string = "";
const key_set = new Set();
const morph_tag_map = new Map();

let morph_tag_count = 1;
let tags_per_text_count = 0;
let current_file_number = 0;

let tags_counts_array = [];

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
        //const lemma_form = node.attributes.lemma;
        const lemma_pos = node.attributes['part-of-speech'];
        const morph_tag = node.attributes.morphology;

        if(morph_tag != undefined) {
    
            if(key_set.has(morph_tag) == false){
                csv_string += morph_tag + "\n";
                morph_tag_map.set(morph_tag, morph_tag_count);
                tags_counts_array.push(1);
                
                morph_tag_count++;
                key_set.add(morph_tag);
                
                tags_per_text_count++;
                
            }
            else {
                tags_counts_array[morph_tag_map.get(morph_tag) - 1]++;
            }      
        }
    }
});

saxParser.on('end', () => {

    if(can_parse) {
        console.log(`${tags_per_text_count} new tags were found in ${list_of_xml_files[current_file_number]}`);
        fs.appendFileSync(morph_tags_filename, csv_string);
    }
    
    csv_string = "";
    tags_per_text_count = 0;

    current_file_number++;

    if(current_file_number < number_of_files) {
        const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
        xml_stream.pipe(saxParser);
    }
    else {
        console.log("No more xml files to parse");
        fs.writeFileSync(`${lang_name}_morph_tag_counts.csv`, tags_counts_array.join('\n'));
    }

});

const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
xml_stream.pipe(saxParser);
