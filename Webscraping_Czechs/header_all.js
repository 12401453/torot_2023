#!/usr/bin/node

const zlib = require("node:zlib");
const fs = require('node:fs');
const readline = require('node:readline');

const zstd_decompr = zlib.createZstdDecompress();
const gorazd_input = fs.createReadStream("gorazd.jsonl.zst");

gorazd_input.pipe(zstd_decompr);

const rl = readline.createInterface({input: zstd_decompr});

rl.on('line', line => {
    const dict_json_entry = JSON.parse(line);
    const header_all = dict_json_entry.response.result.HeaderAll;
    const header = dict_json_entry.response.result.Header;
    const dict_no = dict_json_entry.response.result.Dictionary;
    const rec_type = dict_json_entry.response.result.RecType;
    if(dict_no == 2 && rec_type == "odkazove") {
      console.log(dict_no, header, header_all);
    }
    // if(header == "пламенъ") console.log(dict_json_entry.response.result);
});

rl.on('close', () => {
   gorazd_input.close();

});