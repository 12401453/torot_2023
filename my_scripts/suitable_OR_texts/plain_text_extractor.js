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
let text_string = "";
let lemmas_string = "";
let morph_tag_string = "";

const key_set = new Set();
const lemmas_map = new Map();
//let lemmas_counts_array = [];
let lemma_id = 0;

let new_sentence = false;

saxParser.on('opentag', function(node) {

    if(node.name == "sentence") {
        const sentence_id = node.attributes['id'];
        lemmas_string += "\n" + sentence_id + "\n";
        text_string += "\n" + sentence_id + "\n";
        morph_tag_string += "\n" + sentence_id + "\n";
    }
 
    if(node.name == "token") {
        const lemma_form = node.attributes.lemma;
        const lemma_pos = node.attributes['part-of-speech'];
        const text_word = node.attributes.form;
        const morph_tag = node.attributes.morphology;

        if(lemma_form != undefined) {
            
            lemmas_string += lemma_form + " ";
            text_string += text_word + " ";
            morph_tag_string += morph_tag +  "|";
        }
    }
});

saxParser.on('end', () => {

    fs.writeFileSync(`usp_text.txt`, text_string);
    fs.writeFileSync(`usp_lemmas.txt`, lemmas_string);
    fs.writeFileSync(`usp_morphs.txt`, morph_tag_string);


});

const xml_stream = fs.createReadStream(xml_file);
xml_stream.pipe(saxParser);
