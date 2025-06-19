#!/usr/bin/node

import fs from 'fs';
import readline from 'readline';

if(process.argv.length < 3) {
    console.log("Need to specify filename");
    process.exit(-1);
}

const input_filename = process.argv[2];

const input_stream = fs.createReadStream(input_filename);
input_stream.on('error', () => {
    console.log("first file doesn't exist");
    process.exit(-1);
});

const input_file = readline.createInterface({input: input_stream});

const allowed_punctuation_set = new Set([
    "̆",
    "҅",
    "̀",
    "̄",
    "̇",
    "\u0308",
    "ѿ",
    "оⷮ",
    "⁛",
    "—",
    "·",
    '҃',
    ":",
    "ʼ",
    '҆',
    '҄'


]);

const unique_chars_set = new Set();

const letters_set = new Set();
async function getUniqueLetters() {
    for await (let line of input_file) {
        for(const punct of allowed_punctuation_set) {
            line = line.replaceAll(punct, "").replaceAll(/\s+/g, "");
        }
        line = line.toLowerCase();
        for(const char of line) {
            unique_chars_set.add(char);
        }
    }
}

await getUniqueLetters();
input_file.close();
console.log(unique_chars_set);