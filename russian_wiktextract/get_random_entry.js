#!/usr/bin/node

const zlib = require("node:zlib");
const fs = require('node:fs');
const readline = require('node:readline');

const zstd_decompr = zlib.createZstdDecompress();
const zst_input = fs.createReadStream("eng_ru_raw_lemmas.jsonl.zst");

zst_input.pipe(zstd_decompr);

const rl = readline.createInterface({input: zstd_decompr});

let specific = false;
if(process.argv.length == 3) {
    let selected_line;
    const sought = process.argv[2].trim();
    rl.on("line", line => {
        const json_entry = JSON.parse(line);
        if(json_entry.word == sought) {
            selected_line = line;
            rl.close();
            rl.removeAllListeners();

        }
    });
    rl.on('close', () => {
        console.log(selected_line);
    })
    
    specific = true;
}
else {
    let line_no = 0;
    let selected_line;
    rl.on('line', line => {
        line_no++;
    
        if(Math.random() < (1/line_no)) {
          //const json_entry = JSON.parse(line);
          selected_line = line; //this getting changed on each subsequent line is what ensures that all lines have equal prob. of being selected. The first line will always be selected because 1/1 = 1 which is always higher than Math.random()
        }
    });
    
    rl.on('close', () => {
        console.log(selected_line);
    });
}


