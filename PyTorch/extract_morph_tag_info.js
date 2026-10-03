#!/usr/bin/node

const fs = require('node:fs')
const sax = require('sax')

const saxParser = sax.createStream(true);
saxParser.destroy = function (err) {
    if (err) this.emit('error', err);
    this.emit('close');
};
saxParser.on('error', (e) => {
    console.log("Error: ", e);
});

let pos_csv_str = "pos_tag|pos_tag_description|pos_tag_id\n";
let morph_csv_str = "field_name|field_values|field_value_descriptions\n";

let morph_values = "";
let morph_value_descriptions = "";

const pos_set = new Set();

const tag_stack = [];

saxParser.on('closetag', (node_name) => {
    //console.log(node_name);
    if(node_name == "field" && tag_stack[tag_stack.length -2] == "morphology") {
        morph_csv_str += "|" + morph_values.slice(0, -1) + "|" + morph_value_descriptions.slice(0, -1) + "\n";
        morph_values = "";
        morph_value_descriptions = "";
    }
    tag_stack.pop();
});

saxParser.on('opentag', (node) => {
    tag_stack.push(node.name)
    prev_tag = tag_stack[tag_stack.length -2];

    if(node.name == "value" && prev_tag == "parts-of-speech") {
        pos_tag = node.attributes.tag;
        pos_tag_description = node.attributes.summary;

        pos_set.add(pos_tag);
        pos_id = Array.from(pos_set).length - 1;

        pos_csv_str += pos_tag + "|" + pos_tag_description + "|" + pos_id + "\n";
    }

    if(node.name == "field" && prev_tag == "morphology") {
        morph_csv_str +=  node.attributes.tag;
    }

    if(node.name == "value" && prev_tag == "field") {
        morph_values +=  node.attributes.tag + ";";
        morph_value_descriptions += node.attributes.summary + ";";
    }

});

saxParser.on('end', () => {
    //console.log(pos_csv_str);
    fs.writeFileSync("torot_pos.csv", pos_csv_str);
    //console.log(morph_csv_str);
    fs.writeFileSync("torot_morphtags.csv", morph_csv_str);
})



const xml_stream = fs.createReadStream("empty_torot.xml");
xml_stream.pipe(saxParser);
