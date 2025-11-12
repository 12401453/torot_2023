#!/usr/bin/node

const fs = require("node:fs");


const dl_tl_regex = /[dt][ĺl]/;
const ORT_regex = /[eo][rl](?:[tŕrpsšdfgћђklĺzžxčvbnńmǯ\+]|$)/
const PV2_regex = /[kgx]v?[ěęeiьṝḹ]/;
const PV3_pure_regex = /[ьięṝḹ][kgx][auǫ]/;
const PV3_regex = /[ьięṝḹ][kgx][auǫěęeiь]/;
const tense_jer_regex = /[ьъ]j[Ǣeiьęǫuě]/; //I know that /ě/ cannot follow /j/ etymologically but my current analysis (probably wrong) of dealing with glagoĺěte etc. imperatives after palatal consonants is to assume analogy with the hard-stems, so the alternative 2pl. imperative of покръіти has a theoretical deviant form *pokrъjěte that needs to have its tense back-jer lengthened in accordance with my orthographic policy for normalised OCS
const PV2_regex_PV3 = /[kgx]v?[ęeьṝḹ]/;
const PV2_regex_CSR = /[kgx]v?[ěi](?!$)/;

const PV2_map = new Map();
PV2_map.set('k', 'c');
PV2_map.set('g', 'ʒ');
PV2_map.set('x', 'ś');

const yeetTlDl = (lcs_form) => {
  let dl_tl_pos = lcs_form.search(dl_tl_regex);
  while(dl_tl_pos != -1) {
    lcs_form = lcs_form.slice(0, dl_tl_pos) + lcs_form.slice(dl_tl_pos + 1);
    dl_tl_pos = lcs_form.search(dl_tl_regex);
  }
  return lcs_form;
}

const applyPV3 = (lcs_form) => {
  let PV3_pos = lcs_form.search(PV3_regex);
  while(PV3_pos != -1) {
    const pre_velar_unicode_char = lcs_form.slice(lcs_form.search(PV3_regex)).slice(0, 1);
    const velar = lcs_form.at(PV3_pos + 1);
    lcs_form = lcs_form.slice(0, PV3_pos + 1) + PV2_map.get(velar) + lcs_form.slice(PV3_pos + 1 + 1);
    PV3_pos = lcs_form.search(PV3_regex);
  }
  return lcs_form;
};

const applyPV2 = (lcs_form, regex) => {
  let PV2_pos = lcs_form.search(regex);
  while(PV2_pos != -1) {
    const velar = lcs_form.at(PV2_pos);
    lcs_form = lcs_form.slice(0, PV2_pos) + PV2_map.get(velar) + lcs_form.slice(PV2_pos + 1);
    
    PV2_pos = lcs_form.search(regex);
  }
  return lcs_form;
};


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

const hardening_clusters = new Array(
  ["z'd", "zd"],
  ["s'd", "sd"],
  ["v'n", "vn"],
  ["v's", "vs"],
  ["t's", "ts"],
  ["n'n", "nn"],
  ["r'n", "rn"]

);

const orv_shipyashi_nasal_regex = new RegExp(/[ščžћђǯj]ę/ug);
const orv_shipyashi_a_regex = new RegExp(/[ščžћђǯjʒś]Ǣ/ug);
const orv_bare_nasal_regex = new RegExp(/[^ščžћђǯj]ę/ug);

const denasalise = (lcs_form) => {
  lcs_form = lcs_form.replaceAll("ǫ", "u").replaceAll("ę", "ä");
  return lcs_form;
};

const nasalisedJat = (word, ch_sl) => {
  if(!ch_sl) return word.replaceAll("ę̌", "ě");
  else return word.replaceAll("ę̌", "ä");
};
const nasalisedY = (word, ch_sl) => {
  if(!ch_sl) return word.replaceAll("y̨", "a");
  else return word.replaceAll("y̨", "y");
};
const TOROT = (lcs_word) => {
  let ORT_pos =  lcs_word.search(ORT_regex);
  while(ORT_pos != -1) {
    let ort_vowel = lcs_word.at(ORT_pos);
    let ort_liquid = lcs_word.at(ORT_pos + 1);
    if(ort_vowel == "e" && ort_liquid == "l") {
      ort_vowel = "o";
    }
    if(ORT_pos == 0) lcs_word = lcs_word.slice(0, ORT_pos) + ort_liquid + ort_vowel + lcs_word.slice(ORT_pos + 2);
    else lcs_word = lcs_word.slice(0, ORT_pos) + ort_vowel + ort_liquid + ort_vowel + lcs_word.slice(ORT_pos + 2);
    ORT_pos = lcs_word.search(ORT_regex);
  }
  return lcs_word;
};
const TRAT = (lcs_word) => {
  let ORT_pos =  lcs_word.search(ORT_regex);
  while(ORT_pos != -1) {
    const ort_vowel = lcs_word.at(ORT_pos);
    const ort_liquid = lcs_word.at(ORT_pos + 1);
    const lengthened_vowel = ort_vowel == 'e' ? 'ě' : 'a';
    lcs_word = lcs_word.slice(0, ORT_pos) + ort_liquid + lengthened_vowel + lcs_word.slice(ORT_pos + 2);
    ORT_pos = lcs_word.search(ORT_regex);
  }
  return lcs_word;
};

const dejotateORV = (lcs_form) => {
 return lcs_form.replaceAll("šћ", "šč").replaceAll("žђ", "žž").replaceAll("žǯ", "žž").replaceAll("ћ", "č").replaceAll("ђ", "ž");
};
const dejotateOCS = (lcs_form) => {
  return lcs_form.replaceAll("šћ", "št").replaceAll("žђ", "žd").replaceAll("žǯ", "žd").replaceAll("ћ", "št").replaceAll("ђ", "žd");
};

const russifyDoublets = (lcs_form) => {

  if(lcs_form.includes("čьlově")) {
    lcs_form = lcs_form.replaceAll("čьlově", "čelově");
  }
  if(lcs_form.startsWith("jedin")) {
    lcs_form = lcs_form.replace("jedin", "odin");
  }
  else if(lcs_form.startsWith("jezer")) {
    lcs_form = lcs_form.replace("jezer", "ozer");
  }
  
  return lcs_form;
};


const PV4 = (word) => {
  return word.replaceAll("ky", "ki").replaceAll("xy", "xi").replaceAll("gy", "gi");
}

const cyr_map = new Array(

  ["š'j", "шьj"],
  ["ž'j", "жьj"],
  ["č'j", "чьj"],
  ["c'j", "цьj"],
  ["ŕ'j", "рьj"],
  ["ĺ'j", "льj"],
  ["ń'j", "ньj"],



  ["ʒa", "зя"],
  ["ʒu", "зю"],
  ["ʒe", "зе"],
  ["ʒě", "зе"],
  ["śa", "ся"],
  ["śu", "сю"],
  ["śe", "се"],
  ["śě", "се"],
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
  ["ŕi", "ри"],
  ["ĺi", "ли"],
  ["ńi", "ни"],

  ["ja", "я"],
  ["ju", "ю"],
  ["je", "е"],
  ["jě", "е"],
  ["ji", "и"],
  ["jä", "я"],

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
  ["ьь", "ь"]

);


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

const convertToORV = (lcs_word, pv2_3_exists, ch_sl) => {

  lcs_word = lcs_word.replaceAll("O", "ъ").replaceAll("E", "ь");
  lcs_word = lcs_word.replaceAll("ḹ", "ḷ");

  lcs_word = lcs_word.replace(/^ak/, "jǢk").replace(/^av/, "jǢv");
  lcs_word = yeetTlDl(lcs_word);

  lcs_word = lcs_word.replaceAll("Ǣ", "ä");

  if(pv2_3_exists) {
    lcs_word = applyPV3(lcs_word);
    lcs_word = applyPV2(lcs_word, PV2_regex_PV3);
    lcs_word = applyPV2(lcs_word, PV2_regex_CSR); //this does it only for non-word-final *ě, *i which hopefully will leave most of the Russian levelled forms
  }

  //has to be after PV2 etc. because these are post-PV2/3 loans and often the only source of velar+front-vowel in the languages
  lcs_word = lcs_word.replaceAll("ḱ", "k").replaceAll("x́", "x").replaceAll("ǵ", "g");

  lcs_word = lcs_word.replaceAll("cěsaŕ", "caŕ");
  
  lcs_word = denasalise(lcs_word);
  lcs_word = russifyDoublets(lcs_word);

  if(!ch_sl) {
    lcs_word = TOROT(lcs_word);
    lcs_word = dejotateORV(lcs_word);
  }
  else {
    lcs_word = TRAT(lcs_word);
    lcs_word = dejotateOCS(lcs_word);
  }
  lcs_word = nasalisedJat(lcs_word, ch_sl);
  lcs_word = nasalisedY(lcs_word, ch_sl);

  return lcs_word;
};

const json_str= fs.readFileSync("lcs_inflections_indexed.json", 'utf-8');
const lcs_json = JSON.parse(json_str);

for(let word_obj of lcs_json) {
  const obj_length = word_obj.length;
  const pv2_3_exists = Boolean(word_obj[0]);
  const ch_sl = word_obj[1];
  for(let i = 2; i < 5; i++) {
    for(const idx in word_obj[i]) {
      //console.log(orvToCSR(applyHavlik(convertToORV(word_obj[i][idx], pv2_3_exists, ch_sl))));
      const unconverted_form = word_obj[i][idx];
      word_obj[i][idx] = [orvToCSR(applyHavlik(convertToORV(unconverted_form, pv2_3_exists, ch_sl))), unconverted_form];
      
    }
  }
}
fs.writeFileSync("lcs_converted.json", JSON.stringify(lcs_json, null, 2));