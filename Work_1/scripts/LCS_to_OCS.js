#!/usr/bin/node
const fs = require('node:fs');
const { exit } = require('node:process');
const readline = require('readline');

if(process.argv.length < 3) {
  console.log("Must specify filename");
  exit(-1);
}
const filename = process.argv[2];
const read_stream = fs.createReadStream(filename);
read_stream.on('error', () => {
  console.log("file doesn't exist");
  exit(-1);
})

const input_file = readline.createInterface({input: read_stream});

const front_vowels = ['i', 'e', 'ę', 'ь', 'ŕ̥', 'ĺ̥'];

const ORT_regex = /[eo][rl]([tŕrpsšdfgћђklĺzžxčvbnńmǯ]|$)/
const PV2_regex = /[kgx](?:[ěęeiь]|ŕ̥|ĺ̥)/;
const PV3_regex = /[ьi][kgx][auǫ]/;
const tense_jer_regex = /[ьъ]j[Ǟeiьęǫu]/;

const PV2_map = new Map();
PV2_map.set('k', 'c');
PV2_map.set('g', 'ʒ');
PV2_map.set('x', 'ś');

const applyPV3 = (lcs_form) => {
  let PV3_pos = lcs_form.search(PV3_regex);
  while(PV3_pos != -1) {
    const velar = lcs_form.at(PV3_pos + 1);
    lcs_form = lcs_form.slice(0, PV3_pos + 1) + PV2_map.get(velar) + lcs_form.slice(PV3_pos + 2);
    PV3_pos = lcs_form.search(PV3_regex);
  }
  return lcs_form;
};

//this is a purely orthographic choice to regularise with the long-vowel letters rather than the jer letters; I actually think pre-jer-shift OCS would've had archiphonemes here (see Winslow 2022:314), hence why we still get jer-spellings in the mss. Tense-front-jer in weak position fell completely but continued (even to this day in Ru. ChSl. words) to be written with <и> as a signifier of /j/, and the picture regarding weak-back-jer is pretty murky because everywhere in Mar. we have въіѭ, ѹмъіѭ, ѹмъіи, отъкръіетъ spellings, Ru. моет etc.
const lengthenTenseJers = (lcs_form) => {
  let tense_jer_pos = lcs_form.search(tense_jer_regex);
  while(tense_jer_pos != -1) {
    const jer = lcs_form.at(tense_jer_pos);
    const lengthened_jer = jer == 'ъ' ? 'y' : 'i';
    lcs_form = lcs_form.slice(0, tense_jer_pos) + lengthened_jer + lcs_form.slice(tense_jer_pos + 1);
    tense_jer_pos = lcs_form.search(tense_jer_regex);
  }
  return lcs_form;
};

const long_adj_map = {
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
  'Ǟmijimi' : 'иими'
}

const simplifyLongAdj = (lcs_form) => {
  for(const key in long_adj_map) {
    lcs_form = lcs_form.replaceAll(key, long_adj_map[key]);
  }
  return lcs_form;
};

const mappings = {
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  'sš' : 'ш',  
  'bv' : 'б',
  'ŕǞ' : 'рꙗ',
  'ńǞ' : 'нꙗ',
  'ĺǞ' : 'лꙗ',
  'śa' : 'сꙗ',
  'jǞ' : 'ꙗ',
  'ŕu' : 'рю',
  'ńu' : 'ню',
  'ĺu' : 'лю',
  'śu' : 'сю',
  'ju' : 'ю',
  'ŕǫ' : 'рѭ',
  'ńǫ' : 'нѭ',
  'ĺǫ' : 'лѭ',
  'jǫ' : 'ѭ',
  'śǫ' : 'сѭ',
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
  'je' : 'ѥ',
  'ji' : 'и',
  'jь' : 'и',
  'ьj' : 'и',
  'jo' : 'о',
  'jě' : 'ѣ',
  '' : '',
  'ŕ̥' : 'рь',
  'r̥' : 'ръ',
  'ĺ̥' : 'ль',
  'l̥' : 'лъ',
  'šč' : 'щ',
  'šћ' : 'щ',
  'žǯ' : 'жд',
  'žђ' : 'жд',
  'ǵ' : 'ꙉ',
  'ḱ' : 'к҄',
  'x́' : 'х',
  'ћ' : 'щ',
  'ђ' : 'жд',
  'b' : 'б', 
  'p' : 'п', 
  'v' : 'в', 
  'f' : 'ф', 
  't' : 'т', 
  'd' : 'д', 
  's' : 'с', 
  'z' : 'з', 
  'ʒ' : 'ѕ', 
  'ś' : 'с', 
  'c' : 'ц', 
  'k' : 'к', 
  'g' : 'г', 
  'x' : 'х',
  'ü' : 'ѵ',
  'y' : 'ъі',
  'č' : 'ч',
  'š' : 'ш',
  'ž' : 'ж',
  'Ǟ' : 'а',
  'a' : 'а',
  'e' : 'е',
  'ę' : 'ѧ',
  'ě' : 'ѣ',
  'i' : 'и',
  'ь' : 'ь',  
  'ъ' : 'ъ',
  'o' : 'о',
  'ǫ' : 'ѫ',
  'u' : 'оу',
  'l' : 'л',
  'n' : 'н',
  'm' : 'м',
  'r' : 'р',  
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
  '' : '',  
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
  '' : '',
}

const convertToOCS = (lcs_word) => {
  let ORT_pos =  lcs_word.search(ORT_regex);
  let PV2_pos = lcs_word.search(PV2_regex);
  while(ORT_pos != -1) {
    const ort_vowel = lcs_word.at(ORT_pos);
    const ort_liquid = lcs_word.at(ORT_pos + 1);
    const lengthened_vowel = ort_vowel == 'e' ? 'ě' : 'a';
    lcs_word = lcs_word.slice(0, ORT_pos) + ort_liquid + lengthened_vowel + lcs_word.slice(ORT_pos + 2);
    ORT_pos = lcs_word.search(ORT_regex);
  }
  while(PV2_pos != -1) {
    const PV2_vowel = lcs_word.at(PV2_pos + 1);
    const PV2_cons = lcs_word.at(PV2_pos);
    lcs_word = lcs_word.slice(0, PV2_pos) + PV2_map.get(PV2_cons) + lcs_word.slice(PV2_pos + 1);
    PV2_pos = lcs_word.search(PV2_regex);
  }
  lcs_word = applyPV3(lcs_word);

  lcs_word = simplifyLongAdj(lcs_word);

  lcs_word = lengthenTenseJers(lcs_word);
  
  for(const key in mappings) {
    lcs_word = lcs_word.replaceAll(key, mappings[key]);
  }
  return lcs_word;
};

// input_file.on('line', line => fs.appendFileSync("copy.csv", line+'\n'));
input_file.on('line', line => {
 // if(line.search(ORT_regex) != -1) line += "|TORT";
 // if(line.search(PV2_regex) != -1) line += "|PV2";
  console.log(line + "|" + convertToOCS(line));
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


