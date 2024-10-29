#!/usr/bin/node

const sax = require('sax');
const fs = require('node:fs');

let list_of_xml_files = fs.readdirSync(".").filter(x => x.slice(-4) == ".xml");
const number_of_files = list_of_xml_files.length;

let current_file_number = 0;
let word_count = 0;

const lang_id = process.argv[2];

const words_filename = lang_id+"_words_POS.csv";

const saxParser = sax.createStream(true);

let can_parse = false;

const pos_set = new Set();


let csv_string = "";

saxParser.on('opentag', function(node) {

    if(node.name == "source") {
        console.log("reading xml file");
	can_parse = node.attributes.language == lang_id ? true : false;
        if(!can_parse) console.log(list_of_xml_files[current_file_number], `is not a ${lang_id.toUpperCase()} text, ignoring...`);
    }
    
 
    if(node.name == "token" && can_parse) {
        const text_word = node.attributes.form;
        //const morph_tag = node.attributes.morphology;
        const pos = node.attributes['part-of-speech'];

        
        


        if(text_word != undefined) {
            pos_set.add(pos);
            
            csv_string += text_word + "," + pos + "\n";
            word_count++;
            if(pos == undefined) console.log(text_word, "apparently doesn't have any assigned POS.");
        }
    }
});

saxParser.on('end', () => {

    if(can_parse) {
        console.log(`${word_count} words were found in ${list_of_xml_files[current_file_number]}`);
        fs.appendFileSync(words_filename, csv_string);
    }
    
    csv_string = "";
    word_count = 0;
    current_file_number++;

    if(current_file_number < number_of_files) {
        const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
        xml_stream.pipe(saxParser);
    }
    else {
        console.log("No more xml files to parse\n\nPOSes which occur in the OCS texts are:\n");

        for(let pos of pos_set) {
            console.log(pos);
        }
        console.log("Number of unique POSes: ", pos_set.size);
    }


});

const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
xml_stream.pipe(saxParser);
