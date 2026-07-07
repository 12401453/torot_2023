#!/usr/bin/node

const zlib = require("node:zlib");
const { pipeline } = require('node:stream');
const fs = require('node:fs');
const readline = require('node:readline');

const zstd_decompr = zlib.createZstdDecompress();
const gorazd_input = fs.createReadStream("gorazd.jsonl.zst");

const SNSP_headwords_file = fs.createWriteStream("headwords_SNSP.txt");
const SJS_headwords_file = fs.createWriteStream("headwords_SJS.txt");
const greek_headwords_file = fs.createWriteStream("headwords_greek.txt");

gorazd_input.pipe(zstd_decompr);

const rl = readline.createInterface({input: zstd_decompr});

let record_count = 0;
let SJS_count = 0;
let SNSP_count = 0;
let greek_shit_count = 0;
rl.on('line', line => {
    const dict_json_entry = JSON.parse(line);
    // console.log(dict_json_entry.response.result.Header);
    const dict_no = dict_json_entry.response.result.Dictionary;
    switch(dict_no) {
        case 1:
          SJS_count++;
          SJS_headwords_file.write(dict_json_entry.response.result.Header+"\n");
          break;
        case 2:
          SNSP_count++;
          SNSP_headwords_file.write(dict_json_entry.response.result.Header+"\n");
          break;
        case 3:
          greek_shit_count++;
          greek_headwords_file.write(dict_json_entry.response.result.Header+"\n");
          break;
        default:
          console.log(`Different dictionary with code ${dict_no}`);
      }

    record_count++;
});

rl.on('close', () => {
    console.log(`SJS entries: ${SJS_count}`);
    console.log(`SNSP entries: ${SNSP_count}`);
    console.log(`Greek entries: ${greek_shit_count}`);
    console.log(`Total entries: ${record_count}`);

    SNSP_headwords_file.close();
    SJS_headwords_file.close();
    greek_headwords_file.close();
})