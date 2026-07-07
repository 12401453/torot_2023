#!/usr/bin/node

const zlib = require("node:zlib");
const { pipeline } = require('node:stream');
const fs = require('node:fs');
const http = require("node:http");

const zstd = zlib.createZstdCompress();
const output_file_stream = fs.createWriteStream("gorazd.jsonl.zst");
zstd.pipe(output_file_stream);

const start_record_id = 1;
const end_record_id = 38911;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async() => {for(let i = start_record_id; i <= end_record_id; i++) {
  await sleep(500+Math.floor(500*Math.random()));
  if(i % 500 == 0) {
    await sleep(600);
    console.log(`sleeping for 1 minute every 500 requests (current request: ${i})`);
  }
  const req_url = "http://castor.gorazd.org:8080/gorazd/show_record_id;jsessionid=CC2E5311CE705F8E1F7780DD9095BF4F?value="+i+"&xslFile=0&fields=&_=1732327903110";
  http.get(req_url, response => {
    
    const chunks = [];
    
    response.on('data', (chunk) => {
      chunks.push(chunk);
    });

    response.on('end', () => {
      const response_string = Buffer.concat(chunks).toString("utf-8").trim();
      const json_entry = JSON.parse(response_string);

      const error = json_entry.response.error;

      if(error !== 0 || error == undefined) {
        console.log("invalid record");
        return;
      }

      const dict_no = Number(json_entry.response.result.Dictionary);
      let dictionary = "n/a";
      switch(dict_no) {
        case 1:
          dictionary = "SJS";
          break;
        case 2:
          dictionary = "SNSP";
          break;
        case 3:
            dictionary = "some greek bullshit";
            break;
        default:
          dictionary = "n/a";
      }

      const headword = json_entry.response.result.Header;
      console.log("recordID:", i, "Headword:", headword, "Dictionary:", dictionary, "Error:", error);

      zstd.write(response_string+"\n");

      if(i == end_record_id) {
        zstd.end();
      }

    });

  });
}
})();


