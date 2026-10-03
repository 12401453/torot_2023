#!/usr/bin/node

const zlib = require("node:zlib");
const { pipeline } = require('node:stream');
const fs = require('node:fs');
const https = require("node:https");

const zstd = zlib.createZstdCompress();
const output_file_stream = fs.createWriteStream("eng_wiktextract_raw.jsonl.zst");
zstd.pipe(output_file_stream);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async() => {
 
  const req_url = "https://kaikki.org/dictionary/raw-wiktextract-data.jsonl";
  https.get(req_url, response => {

    response.pipe(zstd);

  });

})();


