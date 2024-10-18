#!/usr/bin/node
const fs = require('node:fs');
const readline = require('readline');
const read_stream = fs.createReadStream("mar_lcs.csv");

const input_file = readline.createInterface({input: read_stream});

const front_vowels = ['i', 'e', 'ę', 'ь', 'ŕ̥', 'ĺ̥'];

const mappings = {
  'omъjimъ' : 'ъіимъ',
  'emъjimъ' : 'иимъ',
  'omьjimь' : 'ъіимь',
  'emьjimь' : 'иимь',
  'ěxъjixъ' : 'ъіихъ',
  'ixъjixъ' : 'иихъ',
  'omajima' : 'ъіима',
  'emajima' : 'иима',
  'amajima' : 'ъіима',
  'Ǟmajima' : 'иима',
  'amъjimъ' : 'ъіимъ',
  'Ǟmъjimъ' : 'иимъ',
  'axъjixъ' : 'ъіихъ',
  'Ǟxъjixъ' : 'иихъ',
  'amijimi' : 'ъіими',
  'Ǟmijimi' : 'иими',
  'šč' : 'щ',
  'šћ' : 'щ',
  'žǯ' : 'жд',
  'žђ' : 'жд',
  'ћ' : 'щ',
  'ђ' : 'жд'
}

const convertToOCS = (lcs_word) => {
  for(const key in mappings) {
    lcs_word = lcs_word.replaceAll(key, mappings[key]);
  }
  return lcs_word;
};

// input_file.on('line', line => fs.appendFileSync("copy.csv", line+'\n'));
input_file.on('line', line => console.log(convertToOCS(line)));

// let line = "";
// read_stream.on('data', chunk => {
//   console.log(chunk.toString());
// });

// async function logChunks(readable) {
//     for await (const chunk of readable) {
//       console.log(chunk.toString());
//     }
//   }

// logChunks(read_stream);



// fs.appendFileSync(morph_tags_filename, csv_string);
// fs.writeFileSync(`${lang_name}_morph_tag_counts.csv`, tags_counts_array.join('\n'));


