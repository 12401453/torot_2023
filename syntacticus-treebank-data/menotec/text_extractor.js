#!/usr/bin/node

const sax = require('sax');
const fs = require('node:fs');

let list_of_xml_files = fs.readdirSync(".").filter(x => x.slice(-4) == ".xml");

const xml_file = process.argv[2];
if(list_of_xml_files.includes(xml_file) == false) {
    console.log("That file isn't in this directory. Repent!")
    return;
}

const saxParser = sax.createStream(true);

let lemma_count = 1
let csv_string = "";
const key_set = new Set();
const lemmas_map = new Map();
//let lemmas_counts_array = [];
let lemma_id = 0;

saxParser.on('opentag', function(node) {
 
    if(node.name == "token") {
        const lemma_form = node.attributes.lemma;
        const lemma_pos = node.attributes['part-of-speech'];
        const text_word = node.attributes.form;
        const morph_tag = node.attributes.morphology;

        if(lemma_form != undefined) {
            

            const stringified_combo = lemma_form.concat(lemma_pos);
            if(key_set.has(stringified_combo) == false){
                
                lemmas_map.set(stringified_combo, lemma_count);
              //  lemmas_counts_array.push(1);
                
                lemma_count++;
                key_set.add(stringified_combo);
                
            }
           /* else {
                lemmas_counts_array[lemmas_map.get(stringified_combo) - 1]++;
            } */
            lemma_id = lemmas_map.get(stringified_combo);
            csv_string += lemma_form + "," + String(lemma_id)+ "," + text_word + "," + lemma_pos + "," + morph_tag + "\n";      
        }
    }
});

saxParser.on('end', () => {

    fs.writeFileSync(`${xml_file.slice(0, -4)}_text.csv`, csv_string);


});

const xml_stream = fs.createReadStream(xml_file);
xml_stream.pipe(saxParser);
