#!/usr/bin/node
const fs = require('node:fs');
const readline = require('readline');
const read_stream = fs.createReadStream("mar_lcs.csv");

const input_file = readline.createInterface({input: read_stream});

const front_vowels = ['i', 'e', 'ę', 'ь', 'ŕ̥', 'ĺ̥'];

const ORT_regex = /[eo][rl]([tŕrpsšdfgћђklĺzžxčvbnńmǯ]|$)/

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
  'ŕǞ' : 'рꙗ',
  'ńǞ' : 'нꙗ',
  'ĺǞ' : 'лꙗ',
  'jǞ' : 'ꙗ',
  'ŕu' : 'рю',
  'ńu' : 'ню',
  'ĺu' : 'лю',
  'ju' : 'ю',
  'ŕǫ' : 'рѭ',
  'ńǫ' : 'нѭ',
  'ĺǫ' : 'лѭ',
  'jǫ' : 'ѭ',
  'ŕe' : 'р҄е',
  'ŕi' : 'р҄и',
  'ŕь' : 'р҄ь', 
  'ŕę' : 'рѩ',
  'ńe' : 'н҄е', 
  'ńi' : 'н҄и', 
  'ńь' : 'н҄ь', 
  'ńę' : 'нѩ', 
  'ĺe' : 'л҄е', 
  'ĺi' : 'л҄и',
  'ĺь' : 'л҄ь',
  'ĺę' : 'лѩ',
  'ję' : 'ѩ',
  'ŕ̥' : 'рь',
  'r̥' : 'ръ',
  'ĺ̥' : 'ль',
  'l̥' : 'лъ'
  /*'' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  'šč' : 'щ',
  'šћ' : 'щ',
  'žǯ' : 'жд',
  'žђ' : 'жд',
  'ћ' : 'щ',
  'ђ' : 'жд',
  '' : '', 
  '' : '', 
  '' : '', 
  '' : '', 
  '' : '', 
  '' : '', 
  '' : '', 
  '' : '', 
  '' : '', 
  '' : '', 
  '' : '', 
  '' : '', 
  '' : '', 
  '' : '' */
}

const convertToOCS = (lcs_word) => {
  let ORT_pos =  lcs_word.search(ORT_regex);
  while(ORT_pos != -1) {
    const ort_vowel = lcs_word.at(ORT_pos);
    const ort_liquid = lcs_word.at(ORT_pos + 1);
    const lengthened_vowel = ort_vowel == 'e' ? 'ě' : 'a';

    lcs_word = lcs_word.slice(0, ORT_pos) + ort_liquid + lengthened_vowel + lcs_word.slice(ORT_pos + 2);
    ORT_pos = lcs_word.search(ORT_regex);

  }
  
  for(const key in mappings) {
    lcs_word = lcs_word.replaceAll(key, mappings[key]);
  }
  return lcs_word;
};

// input_file.on('line', line => fs.appendFileSync("copy.csv", line+'\n'));
input_file.on('line', line => {
  if(line.search(ORT_regex) != -1) line += "|TORT-group";
  console.log(convertToOCS(line));
});

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


