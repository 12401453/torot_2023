#!/usr/bin/node


import { createInterface } from 'readline';
import { createReadStream, writeFileSync } from 'node:fs';

const input_filename = process.argv[2];
const output_filename = input_filename.slice(-3) +"_TNT_input.txt";

const read_stream1 = createReadStream(process.argv[2]);
read_stream1.on('error', () => {
  console.log("first file doesn't exist");
  process.exit(-1);
})



async function writeTnTString() {
    let tnt_file_string = "";
    const assem_file = createInterface({input: read_stream1});
    let rowno = 1;
    let my_db_tokno;
    for await(const line of assem_file) {
        tnt_file_string += "%%" + String(rowno).padStart(6, '0') + "\n";
        line.split(/\s+/).forEach(word => {
            if(word.trim() != "") tnt_file_string += word.trim() + "\n";
        })
        rowno++;
    }

    assem_file.close();
    return tnt_file_string;
}


const tnt_string = await writeTnTString();
writeFileSync(output_filename, tnt_string);