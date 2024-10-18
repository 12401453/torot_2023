#!/usr/bin/node
console.log("work");
const fs = require('node:fs');

const read_stream = fs.createReadStream("mar_lcs.csv");

async function logChunks(readable) {
    for await (const chunk of readable) {
      console.log(chunk);
    }
  }

logChunks(read_stream);



// fs.appendFileSync(morph_tags_filename, csv_string);
// fs.writeFileSync(`${lang_name}_morph_tag_counts.csv`, tags_counts_array.join('\n'));


