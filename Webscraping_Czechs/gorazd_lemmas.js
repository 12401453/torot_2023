#!/usr/bin/node

const zlib = require("node:zlib");
const fs = require('node:fs');
const readline = require('node:readline');

const zstd_decompr = zlib.createZstdDecompress();
const gorazd_input = fs.createReadStream("gorazd.jsonl.zst");

gorazd_input.pipe(zstd_decompr);

const rl = readline.createInterface({input: zstd_decompr});

const snsp_lemmas_file = fs.createWriteStream("snsp_lemmas.txt");
const sjs_lemmas_file = fs.createWriteStream("sjs_lemmas.txt");
const greek_lemmas_file = fs.createWriteStream("greek_lemmas.txt");

let record_count = 0;
let SJS_count = 0;
let SNSP_count = 0;
let greek_shit_count = 0;

rl.on('line', line => {
    const dict_json_entry = JSON.parse(line);
    // console.log(dict_json_entry.response.result.Header);
    const dict_no = dict_json_entry.response.result.Dictionary;
    const rec_type = dict_json_entry.response.result.RecType;
    const header = dict_json_entry.response.result.Header;
    if(rec_type.includes("hlavni")) {    
      switch(dict_no) {
        case 1:
          SJS_count++;
          sjs_lemmas_file.write(header+"\n");
          break;
        case 2:
          SNSP_count++;
          snsp_lemmas_file.write(header+"\n");
          break;
        case 3:
          greek_shit_count++;
          greek_lemmas_file.write(header+"\n");
          break;
        default:
          console.log(`Different dictionary with code ${dict_no}`);
      }
    }

    record_count++;
});

rl.on('close', () => {
    console.log(`SJS hlavni entries: ${SJS_count}`);
    console.log(`SNSP hlavni entries: ${SNSP_count}`);
    console.log(`Greek hlavni entries: ${greek_shit_count}`);
    console.log(`Total hlavni entries: ${record_count}`);

   

    snsp_lemmas_file.close();
    sjs_lemmas_file.close();
    greek_lemmas_file.close();

})