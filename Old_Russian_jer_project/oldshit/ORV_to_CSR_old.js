#!/usr/bin/node

const fs = require('node:fs');


const cyr_map = new Array([

  ["š'j", "шьj"],
  ["ž'j", "жьj"],
  ["č'j", "чьj"],
  ["c'j", "цьj"],
  ["ŕ'j", "рьj"],
  ["ĺ'j", "льj"],
  ["ń'j", "ньj"],



  ["ʒa", "зя"],
  ["ʒu", "зю"],
  ["śa", "ся"],
  ["śu", "сю"],
  ["ŕu", "рю"],
  ["ĺu", "лю"],
  ["ńu", "ню"],
  ["ŕa", "ря"],
  ["ĺa", "ля"],
  ["ńa", "ня"],
  ["ŕä", "ря"],
  ["ĺä", "ля"],
  ["ńä", "ня"],
  ["ŕe", "ре"],
  ["ĺe", "ле"],
  ["ńe", "не"],

  ["ja", "я"],
  ["ju", "ю"],
  ["je", "е"],
  ["jě", "е"],
  ["ji", "и"],
  ["jэ", ""],

  ["j'", "j"],
  ["jo", "o"],

  ["št", "šč"],
  
  ["š'", "š"],
  ["ž'", "ž"],
  ["č'", "č"],
  ["c'", "c"],
  ["ŕ'", "ŕ"],
  ["ĺ'", "ĺ"],
  ["ń'", "ń"],

  ["šä", "ша"],
  ["žä", "жа"],
  ["čä", "ча"],
  ["cä", "ца"],


  ["šč", "щ"],

  ["a", "а"],
  ["b", "б"],
  ["ḷ", "ол"],
  ["ʒ", "зь"],
  ["c", "ц"],
  ["x", "х"],
  ["b", "б"],
  ["ṝ", "ер"],
  ["ě", "е"],
  ["ž", "ж"],
  ["y", "ы"],
  ["ń", "нь"],
  ["x́", "х"],
  ["k", "к"],
  ["u", "у"],
  ["n", "н"],
  ["š", "ш"],
  ["i", "и"],
  ["s", "с"],
  ["p", "п"],
  ["ъ", ""],
  ["f", "ф"],
  ["j", "й"],
  ["č", "ч"],
  ["ä", "я"],
  ["ǵ", "г"],
  ["e", "е"],
  ["a", "а"],
  ["ĺ", "ль"],
  ["l", "л"],
  ["g", "г"],
  ["'", "ь"],
  ["z", "з"],
  ["t", "т"],
  ["ṛ", "ор"],
  ["v", "в"],
  ["o", "о"],
  ["r", "р"],
  ["ŕ", "рь"],
  ["d", "д"],
  ["ś", "сь"],
  ["m", "м"],

]);


const orvToCSR = (orv_form) => {
  for(const pair of cyr_map) {
    orv_form = orv_form.replaceAll(pair[0], pair[1]);
  }
  return orv_form;
};


const tsy_regex = /ц[иы]/;
const zd_regex = /[сз]д/;
const zhd_regex = /[жш]д/;
//includes palatal letters because Russian seems to reapply this rule after they have hardened (молодёжь etc.)
//I'm gonna apply the Jer Shift before everything else so don't need to care about strong-jer > /o/
const e_o_regex = /[ščžcj]e(?:[tŕrpsšdfgkx́ḱǵlĺzžxčvbcʒśnńm\++](?:[aouyъ]|$)|$)/;
const bv_regex = /bv/;

const consonants_regex = /[tŕrpsšdfgkx́ḱǵlĺzžxčcʒśvbnńm]+/;
const vowels_regex = /[iyuьъṛṝḷḹeěoäaü]/;
const starting_i_regex = /^jь/g;

const reverseStr = (str) => {
  let reversed = "";
  for(let i = str.length; i > 0; i--) {
    reversed += str[i-1];
  }
  return reversed;
};

const applyHavlik = (orv_form) => {
  orv_form = orv_form.replaceAll("ěa", "ä");
  orv_form = orv_form.replaceAll(starting_i_regex, "i");
  const lngth = orv_form.length;
  let strong_position = false;

  let jer_shifted_backwards = "";

  for(let i = lngth; i > 0; i--) {
    const letter = orv_form[i - 1];
    if(vowels_regex.test(letter)) {
      if(letter == "ь" || letter == "ъ") {
        
        if(strong_position) {
          jer_shifted_backwards += letter == "ь" ? "e" : "o";
          strong_position = false;
        }
        else {
          jer_shifted_backwards += letter == "ь" ? "\'" : "";
          strong_position = true;
        }
      }
      else {
        jer_shifted_backwards += letter;
        strong_position = false;
      }
    }
    else {
      jer_shifted_backwards += letter;
    }
  }
  return reverseStr(jer_shifted_backwards);
};



const json_str= fs.readFileSync("orv_inflections.json", 'utf-8');
const orv_inflections = JSON.parse(json_str);
const orv_forms = orv_inflections.map(arr => arr = arr.slice(2));

let converted_forms = "";
for(const arr of orv_forms) {
  for(const form of arr) {
    converted_forms += form+"|"+orvToCSR(applyHavlik(form)) + " ";
  }
  converted_forms += "\n";
}

fs.writeFileSync("orv_converted.txt", converted_forms);