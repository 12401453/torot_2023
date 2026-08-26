#!/usr/bin/node
//This script is for running on the "chu_words_full_with_titles_untagged.csv" file to extract the apparently "unannotated" Zographensis words which seem to in reality have had their morphology-tags and parts-of-speech corrected, so I can use them as a validation-set.

import fs from 'node:fs';

import readline from 'node:readline';

class CsvReader {

  constructor(separator=",") {
    this.m_separator = separator;
  }
  
  setHeaders(first_line) {
    this.m_header_index_map.clear();
    const headers_arr = first_line.split(this.m_separator);
    for(const header_idx in headers_arr) {
      this.m_header_index_map.set(headers_arr[header_idx], header_idx);
    }
  }
 
  setLine(line) {
    this.m_raw_line = line;
    this.m_fields_array = this.m_raw_line.split(this.m_separator);
  }

  getField(header) {
    return this.m_fields_array[this.m_header_index_map.get(header)];
  }

  setField(header, new_value) {
    if(this.m_header_index_map.has(header)) {
      this.m_fields_array[this.m_header_index_map.get(header)] = new_value;
      this.m_raw_line = this.m_fields_array.join(m_separator);
    }
    else {
      console.log("CsvReader.setField() failed because the header-value is wrong");
    }    
  }

  getRawLine(){
    return this.m_raw_line;
  }

  getFieldsArray() {
    return this.m_fields_array;
  }

  m_header_index_map = new Map();
  m_raw_line = "";
  m_fields_array = new Array();
  m_separator = "";
};

const chu_deepClean_map = {
    "꙽" : "",
    "j" : "і",
    "\uF002" : "",
    "\uF102" : "",
    "$" : "", //these four are characters which I may or may not use to indicate supralinears in the database
    "@" : "",
    "—" : "",
    "·" : "",
    "̇" : "",
    "\u0308" : "",
    "Ѿ" : "от",
    "ѿ" : "от",
    "оⷮ" : "от",
    "⁛" : "",
    "῾" : "",
    "᾽" : "",
    "̅" : "",
    "̄" : "",
    "̀" : "",
    ">" : "",
    "/" : "",
    "\"" : "",
    "͡" : "",
    "·" : "",
    "̏" : "",
    //" " : "",
    "+" : "",
    "⁜" : "",
    "͠" : "",
    "!" : "",
    "҅" : "",
    "҆" : "",
    "҄" : "",
    "͑" : "",
    "͗" : "",
    "̆" : "",
    "̈" : "",
    "̑" : "",
    "̒" : "",
    "̓" : "",
    "̔" : "",
    "̕" : "",
    "͆" : "",
    "͛" : "",
    "͞" : "",
    "ͨ" : "",
    "҃" : "",
    "҇" : "",
    "ꙿ" : "",
    "꙯" : "",
    "'" : "",
    "(" : "",
    ")" : "",
    "-" : "",
    "." : "",
    ":" : "",
    "=" : "",
    "?" : "",
    "[" : "",
    "]" : "",
    "{" : "",
    "}" : "",
    "̂" : "",
    "Ꙋ" : "оу",
    "ОУ" : "оу",
    "о҄у" : "оу",
    "Ꙑ" : "ъі",
    "ꙑ" : "ъі",
    "Оу" : "оу",
    "ѹ" : "оу",
    "о̑у" : "оу",
    "ꙋ" : "оу",
    "A" : "а",
    "O" : "о",
    "E" : "е",
    "C" : "с",
    "a" : "а",
    "o" : "о",
    "e" : "е",
    "c" : "с",
    "ы" : "ьі",
    "ѵ" : "у",
    "Ꙃ" : "ѕ",
    "Ћ" : "ꙉ",
    "y" : "у",
    "ꙃ" : "ѕ",
    "ћ" : "ꙉ",
    "Ⱕ" : "ѧ",
    "Я" : "ꙗ",
    "ⱕ" : "ѧ",
    "я" : "ꙗ",
    "Ҍ" : "ѣ",
    "ҍ" : "ѣ",
    "Ї" : "і",
    "ї" : "і",
    "X" : "х",
    "x" : "х",
    "ѩ" : "ѧ",
    "Ѩ" : "ѧ",
    "щ" : "шт",
    "Щ" : "шт",
    "и" : "і",
    "И" : "і",
    "ꙇ" : "і",
    "Ꙇ" : "і",
    "ⰹ" : "і",
    "ѡ" : "о",
    "Ѡ" : "о",
    "ꙙ" : "ѧ",
    "Ꙙ" : "ѧ",
    "А" : "а",
    "Б" : "б",
    "Ц" : "ц",
    "Г" : "г",
    "Д" : "д",
    "Е" : "е",
    "Ж" : "ж",
    "Ѕ" : "ѕ",
    "З" : "з",
    "І" : "і",
    "Ꙉ" : "ꙉ",
    "ђ" : "г",
    "Ђ" : "г",
    "К" : "к",
    "Л" : "л",
    "М" : "м",
    "Н" : "н",
    "О" : "о",
    "П" : "п",
    "Р" : "р",
    "С" : "с",
    "Т" : "т",
    "Ѹ" : "оу",
    "Ф" : "ф",
    "Х" : "х",
    "Ч" : "ч",
    "Ш" : "ш",
    "Ъ" : "ъ",
    "Ь" : "ь",
    "Ѣ" : "ѣ",
    "Ю" : "ю",
    "Ѫ" : "ѫ",
    "Ѭ" : "ѭ",
    "В" : "в",
    "Ѵ" : "у",
    "Ѳ" : "ѳ",
    "Ѧ" : "ѧ",
    "ꙁ" : "з",
    "Ꙁ" : "з",
    "ѭ̑" : "ѭ",
    "ѥ" : "е",
    "Ѥ" : "е",
    "ꙉ" : "г",
    "ӱ" : "у",
    "ӑ" : "а",
    "У" : "у",
    "ѿ" : "от",
    "ѱ" : "пс",
    "Ѱ" : "пс",
    "ѻ" : "о",
    "ⷠ" : "б",
    "ⷡ" : "в",
    "ⷢ" : "г",
    "ⷣ" : "д",
    "ⷦ" : "к",
    "ⷧ" : "л",
    "ⷩ" : "н",
    "ⷪ" : "о",
    "ⷫ" : "п",
    "ⷬ" : "р",
    "ⷭ" : "с",
    "ⷮ" : "т",
    "ⷯ" : "х",
    "ⷰ" : "ц",
    "ⷱ" : "ч",
    "ⷸ" : "г",
    "ȥ" : "з",
    "ӡ" : "з",
    "Ⱒ" : "х",
    "ⱒ" : "х",
    "Ӡ" : "з",
    "й" : "і",
    "ѷ" : "у",
    "ⱔ" : "ѧ",
    "Ⱉ" : "о",
    "Ө" : "ѳ",
    "є" : "е",
    "ʼ" : "",
    "ⸯ" : "",
    "’" : "",
    "ꙗ" : "ѣ",
    "ѕ" : "з",
    "шю" : "шоу",
    "чю" : "чоу",
    "жю" : "жоу",
    "ждю" : "ждоу",
    "штю" : "штоу",
    "цю" : "цоу",
    "шѭ" : "шѫ",
    "чѭ" : "чѫ",
    "жѭ" : "жѫ",
    "ждѭ" : "ждѫ",
    "цѭ" : "цѫ",
    "штѭ" : "штѫ",

    " " : "", //get rid of token-internal whitespace
};

const deepClean = (dirty_word, deepClean_map=chu_deepClean_map) => {
    let cleaned_word = dirty_word;
    for(const key in deepClean_map) {
        cleaned_word = cleaned_word.replaceAll(key, deepClean_map[key]);
    }
    return cleaned_word;
};

const csv_reader = new CsvReader('|');
const readline_interface = readline.createInterface({input: fs.createReadStream("chu_words_full_with_titles_untagged.csv")});
const lines_iterator = readline_interface[Symbol.asyncIterator]();
csv_reader.setHeaders((await lines_iterator.next()).value);

let csv_string = "torot_word|deep_cleaned|pos|morph_tag|lemma|text_id|subtitle_id|sentence_no\n";
let tokeniser_input_string = "";

for await (const line of lines_iterator) {
  csv_reader.setLine(line);
  
  const text_id = csv_reader.getField("text_id");

  if(text_id == "9") {
    const autotagged = csv_reader.getField("autotagged") == "1" ? true : false; 

    if(autotagged){
      const pos = csv_reader.getField("pos"); 
      const morph_tag = csv_reader.getField("morph_tag");
      const torot_word = csv_reader.getField("torot_word");
      const lemma = csv_reader.getField("lemma");
      const text_id = csv_reader.getField("text_id");
      const subtitle_id = csv_reader.getField("subtitle_id");
      const sentence_no = csv_reader.getField("sentence_no");

      const cleaned_word = deepClean(torot_word);

      csv_string += torot_word + "|" + cleaned_word + "|" + pos + "|" + morph_tag + "|" + lemma + "|" + text_id + "|" + subtitle_id + "|" + sentence_no + "\n";

      tokeniser_input_string += cleaned_word + "\n";
    }
  }  
}

fs.writeFileSync("zogr_unannotated_validation.csv", csv_string);
fs.writeFileSync("zogr_validation_words_deepcleaned.csv", tokeniser_input_string);