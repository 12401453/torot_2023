#!/usr/bin/node

const sax = require('sax');
const fs = require('node:fs');



let list_of_xml_files = fs.readdirSync(".").filter(x => x.slice(-4) == ".xml");
const number_of_files = list_of_xml_files.length;
console.log(list_of_xml_files);

let lemmas_array = [];

const saxParser = sax.createStream(true);
let lang_name = "orv";
let can_parse = false;

let csv_string = "";
const key_set = new Set();
let lemma_count = 1;
let lems_per_text_count = 0;
let current_filename = "";
let current_file_number = 0;

saxParser.on('error', function(e) {
    console.log('error: ', e);
    this._parser.error = null;
    this._parser.resume();
    
});

saxParser.on('opentag', node => {
    if(node.name == "source" && node.attributes.language == lang_name) {
        can_parse = true;
    }
    else if(node.name == "source" && node.attributes.language != lang_name) can_parse = false;
    
    

    if(can_parse && node.name == "token") {
        const lemma_form = node.attributes.lemma;
        const lemma_pos = node.attributes['part-of-speech'];

        if(lemma_form != undefined) {
            const stringified_combo = lemma_form.concat(lemma_pos);
            if(key_set.has(stringified_combo) == false){
                csv_string += String(lemma_count) + "," + lemma_form + "," + lemma_pos + "\n";
                //console.log(String(lemma_count) + "," + lemma_form + "," + lemma_pos);
                lemma_count++;
                key_set.add(stringified_combo);
                lems_per_text_count++;
                
            }
            
        }
        // console.log(String(lemma_count) + "," + lemma_form + "," + lemma_pos);
    }
});

saxParser.on('end', () => {

    if(can_parse == false) console.log(list_of_xml_files[current_file_number], "is not an Old Russian text, ignoring...");
    else {
        console.log(`${lems_per_text_count} new lemmas were found in ${list_of_xml_files[current_file_number]}`);
        fs.appendFileSync("OR_lemmas.csv", csv_string);
    }
    
    csv_string = "";
    lems_per_text_count = 0;

    current_file_number++;

    if(current_file_number < number_of_files) {
        const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
        xml_stream.pipe(saxParser);
    }

});

const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
xml_stream.pipe(saxParser);


//list_of_xml_files.forEach(xml_file_name => {
//     current_filename = xml_file_name;
//     const xml_stream = fs.createReadStream(xml_file_name);
//     xml_stream.pipe(saxParser);


    


// });




