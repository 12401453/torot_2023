#!/usr/bin/node

const zlib = require("node:zlib");
const fs = require('node:fs');
const readline = require('node:readline');
const { json } = require("node:stream/consumers");

const zstd_decompr = zlib.createZstdDecompress();
const zst_input = fs.createReadStream("ru_wiktextract_raw.jsonl.zst");

zst_input.pipe(zstd_decompr);

const rl = readline.createInterface({input: zstd_decompr});

//const output_file_stream = fs.createWriteStream("ru_raw_entries.jsonl");

let line_no = 0;
let stop = false;

let ill_formed_entries_count = 0;
let other_errors_count = 0;


let intj_lemmas = "";
let particle_lemmas = "";
let name_lemmas = "";
let num_lemmas = "";
let onomatopeia_lemmas = "";
let abbrev_lemmas = "";
let phrase_lemmas = "";
let suffix_lemmas = "";

let noun_lemmas_noforms = "";
let noun_lemmas_hasforms = "";
rl.on('line', line => {
    line_no++;

    // if(line_no > 20000) {
    //   const json_entry = JSON.parse(line);
    //   if(json_entry.lang_code == "ru") {
    //     output_file_stream.write(line+"\n");
    //   }
    // }
    // if(line_no > 30000) {
    //     output_file_stream.close();
    //     rl.close();
    //     rl.removeAllListeners();
    // }
    //console.log(line_no);
    try {//the entry for аграрно-финансово-промышленный is ill-formed JSON apparently so need to handle this failing
        const json_entry = JSON.parse(line);

        if(json_entry.lang_code == "ru") {
            if(json_entry.categories?.includes("Русские лексемы")) {
                //wiki_pos_set.add(json_entry.pos);

                switch(json_entry.pos) {
                    case('noun'):
                        if(json_entry.forms?.length == 0) {
                            noun_lemmas_noforms += json_entry.word + "\n";
                        }
                        else {
                            noun_lemmas_hasforms += json_entry.word + "\n";
                        }
                        if(json_entry.word == "Вюртемберг-Баден") {
                            console.log(line);
                        }
                        break;
                    case('intj'):
                        intj_lemmas+= json_entry.word + "\n";
                        break;
                    case('adj'):
                        break;
                    case('conj'):
                        break;
                    case('particle'):
                        particle_lemmas+= json_entry.word + "\n";
                        break;
                    case('prep'):
                        break;
                    case('name'):
                        name_lemmas+= json_entry.word + "\n";
                        break;
                    case('pron'):
                        break;
                    case('verb'):
                        break;
                    case('num'):
                        num_lemmas+= json_entry.word + "\n";
                        break;
                    case('adv'):
                        break;
                    case('onomatopeia'):
                        onomatopeia_lemmas+= json_entry.word + "\n";
                        break;
                    case('abbrev'):
                        abbrev_lemmas+= json_entry.word + "\n";
                        break;
                    case('phrase'):
                        phrase_lemmas+= json_entry.word + "\n";
                        break;
                    case('suffix'):
                        suffix_lemmas+= json_entry.word + "\n";
                        break;
                }
            }
            
        }
    }
    catch(err) {
        if(err instanceof SyntaxError) {
            ill_formed_entries_count++;
        }
        else {
            other_errors_count++;
            console.log(err);
            //console.log(JSON.stringify(json_entry));
        }
    }    
});

rl.on('close', () => {

    fs.writeFileSync("pos_lists/intj_lemmas.csv", intj_lemmas);
    fs.writeFileSync("pos_lists/particle_lemmas.csv", particle_lemmas);
    fs.writeFileSync("pos_lists/name_lemmas.csv", name_lemmas);
    fs.writeFileSync("pos_lists/num_lemmas.csv", num_lemmas);
    fs.writeFileSync("pos_lists/onomatopeia_lemmas.csv", onomatopeia_lemmas);
    fs.writeFileSync("pos_lists/abbrev_lemmas.csv", abbrev_lemmas);
    fs.writeFileSync("pos_lists/phrase_lemmas.csv", phrase_lemmas);
    fs.writeFileSync("pos_lists/suffix_lemmas.csv", suffix_lemmas);

    fs.writeFileSync("pos_lists/noun_lemmas_noforms.csv", noun_lemmas_noforms);
    fs.writeFileSync("pos_lists/noun_lemmas_hasforms.csv", noun_lemmas_hasforms);
    
    
    //console.log(`Syntax errors: ${ill_formed_entries_count}\nOther parsing errors: ${other_errors_count}`);
});