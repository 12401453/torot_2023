#!/usr/bin/node

const zlib = require("node:zlib");
const fs = require('node:fs');
const readline = require('node:readline');
const sqlite = require('node:sqlite');

const zstd_decompr = zlib.createZstdDecompress();
const gorazd_input = fs.createReadStream("gorazd.jsonl.zst");

gorazd_input.pipe(zstd_decompr);

const rl = readline.createInterface({input: zstd_decompr});

const database_sjs = new sqlite.DatabaseSync("sjs.db");
const database_snsp = new sqlite.DatabaseSync("snsp.db");
const database_greej = new sqlite.DatabaseSync("gorazd_greek.db");


const initiate_dict_tables_sql = "DROP TABLE IF EXISTS snsp; CREATE TABLE snsps (entry_id INTEGER PRIMARY KEY, source_d TEXT, )"
database_sjs.exec()

let record_count = 0;
let SJS_count = 0;
let SNSP_count = 0;
let greek_shit_count = 0;
const lookup_json_sjs = [];
const lookup_json_snsp = [];
const lookup_json_greek = [];
rl.on('line', line => {
    const dict_json_entry = JSON.parse(line);
    // console.log(dict_json_entry.response.result.Header);
    const dict_no = dict_json_entry.response.result.Dictionary;
    switch(dict_no) {
        case 1:
          SJS_count++;
          lookup_json_sjs.push([dict_json_entry.response.result.Header, dict_json_entry.response.result.SourceD]);
          break;
        case 2:
          SNSP_count++;
          lookup_json_snsp.push([dict_json_entry.response.result.Header, dict_json_entry.response.result.SourceD]);
          break;
        case 3:
          greek_shit_count++;
          lookup_json_greek.push([dict_json_entry.response.result.Header, dict_json_entry.response.result.SourceD]);
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

    const lookup_json_sjs_file = fs.createWriteStream("lookup_json_sjs.json");
    const lookup_json_snsp_file = fs.createWriteStream("lookup_json_snsp.json");
    const lookup_json_greek_file = fs.createWriteStream("lookup_json_greek.json");

    lookup_json_sjs_file.write(JSON.stringify(lookup_json_sjs));
    lookup_json_snsp_file.write(JSON.stringify(lookup_json_snsp));
    lookup_json_greek_file.write(JSON.stringify(lookup_json_greek));

    lookup_json_sjs_file.close();
    lookup_json_snsp_file.close();
    lookup_json_greek_file.close();

})