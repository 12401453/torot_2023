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

const hard_sign_regex = /([kgxtdnlrpbmfv])j/g; //the g flag is so I can use capturing-groups and .replaceAll()

const hardened_cluster_softsign_regex_cyr = /(?<=[тднрпбмвфсзцшжч])ь(?=[тднрлпбмвсзцшжчгкх])/g;

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

const denasalise = (lcs_form) => {
  lcs_form = lcs_form.replaceAll("ǫ", "u").replaceAll("ę", "ä");
  return lcs_form;
};

const nasalisedJatORV = (word) => {
  return word.replaceAll("ę̌", "ě");  
};
const nasalisedJatOCS = (word) => {
  return word.replaceAll("ę̌", "ä");
};

const nasalisedYORV = (word) => {
  return word.replaceAll("y̨", "a");
};
const nasalisedYOCS = (word) => {
  return word.replaceAll("y̨", "y");
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
  //I use /šč/ rather than /št/ so the Cyrillicisation is easier later on
  return lcs_form.replaceAll("šћ", "šč").replaceAll("žђ", "žd").replaceAll("žǯ", "žd").replaceAll("ћ", "šč").replaceAll("ђ", "žd");
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
  else if(lcs_form.startsWith("bezakon")) {
    lcs_form = lcs_form.replaceAll("bezakon", "bezъzakon");
  }
  
  return lcs_form;
};

const jotifyInitialA = (lcs_form) => {
  return lcs_form.replace(/^a/, "ja");
}

const shortenFemInstrSg = (word) => {
  return word.replace(/([ое])ю$/, "$1й");
};

const PV4 = (word) => {
  return word.replaceAll("ky", "ki").replaceAll("xy", "xi").replaceAll("gy", "gi");
}

const cyr_map = new Array(
  ["šč'u", "щу"],
  ["šč'j", "щьj"],
  ["š'j", "шьj"],
  ["ž'j", "жьj"],
  ["č'j", "чьj"],
  ["c'j", "цьj"],
  ["ŕ'j", "рьj"],
  ["ĺ'j", "льj"],
  ["ń'j", "ньj"],

  ["ščä", "ща"],

  ["č'u", "чу"],
  ["š'u", "шу"],
  ["ž'u", "жу"],

  ["z'a", "зя"],
  ["z'u", "зю"],
  ["z'e", "зе"],
  ["z'ě", "зе"],
  ["s'a", "ся"],
  ["s'u", "сю"],
  ["s'e", "се"],
  ["s'ě", "се"],
  ["r'u", "рю"],
  ["l'u", "лю"],
  ["n'u", "ню"],
  ["t'u", "тю"],
  ["d'u", "дю"],
  ["s'u", "сю"],
  ["p'u", "пю"],
  ["b'u", "бю"],
  ["v'u", "вю"],
  ["f'u", "фю"],
  
  
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

  // ["št", "šč"],
  
  // ["š'", "š"],
  //["ž'", "ž"],
  //["č'", "č"],
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
  ["m", "м"],
  ["ьь", "ь"],
  ["@", "ъ"],
  ["Q", ""]

);

const cyrillicise = (word) => {
  for(const pair of cyr_map) {
    word = word.replaceAll(pair[0], pair[1]);
  }
  return word;
};

const removeFinalShipyashiJer = (word) => {
  return word.replace(/([шжчщ])ь$/, "$1");
};

const shortenInfinitive = (infinitive) => {
  return infinitive.replace(/([тчщ])и$/, "$1ь");
}

//the changeFunctions passed into these helper-functions have to be ones where the input and output are both just a single string
const applyChangeToSet = (variants_set, changeFunction) => {
  const initial_set_size = variants_set.size;
  for(const variant of variants_set) {
    variants_set.add(changeFunction(variant));
    if(initial_set_size < variants_set.size) variants_set.delete(variant);
  }
};

const applyOptionalChangeToSet = (variants_set, changeFunction) => {
  for(const variant of variants_set) {
    variants_set.add(changeFunction(variant));
  }
};

const applyAlternateChangesToSet = (variants_set, changeFunctionFirst, changeFunctionSecond) => {
  let initial_set_size = variants_set.size;
  for(const variant of variants_set) {
    variants_set.add(changeFunctionFirst(variant));
    variants_set.add(changeFunctionSecond(variant));
    if(initial_set_size < variants_set.size) variants_set.delete(variant);
    initial_set_size = variants_set.size;
  }
};

const hardenClusters = (jer_shifted_form) => {
  return jer_shifted_form.replaceAll(hardened_cluster_softsign_regex_cyr, "");
};

const hardenFinalM = (word) => {
  return word.replace(/m'$/, "m");
};

const churchSlavoniciseNomMascSgLongAdj = (participle) => {
  if(participle.endsWith("ей")) {
    participle = participle.slice(0, -2) + "ий";
  }
  else if(participle.endsWith("ой")) {
    participle = participle.slice(0, -2) + "ый";
  }
  return participle;
};

const orvToCSR = (torot_pos, infl_idx, converted_variants_set) => {

  applyChangeToSet(converted_variants_set, PV4);
  applyChangeToSet(converted_variants_set, hardenFinalM);
  applyChangeToSet(converted_variants_set, cyrillicise);
  applyChangeToSet(converted_variants_set, hardenClusters);

  if(infl_idx == "43") {
    applyOptionalChangeToSet(converted_variants_set, shortenInfinitive);
  }

  if(torot_pos != "V-" && infl_idx != "2") {
    applyOptionalChangeToSet(converted_variants_set, removeFinalShipyashiJer);
  }

  if(infl_idx == "27") {
    applyOptionalChangeToSet(converted_variants_set, shortenFemInstrSg);
  }

  //these two shouldn't really be included because they are jer-changes
  if(infl_idx == "145" || infl_idx == "152" ||infl_idx == "151" ||infl_idx == "150") {
    applyOptionalChangeToSet(converted_variants_set, churchSlavoniciseNomMascSgLongAdj);
  }
  if(torot_pos == "A-" && infl_idx == "1" || infl_idx == "2") {
    applyOptionalChangeToSet(converted_variants_set, churchSlavoniciseNomMascSgLongAdj);
  }
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
  //!!!REMEMBER WHEN YOU ADD STUFF TO THE END OF THIS FUNCTION THAT THE STRING IS BACKWARDS
  orv_form = orv_form.replaceAll("ś", "s'").replaceAll("ʒ", "z'");
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
  
  jer_shifted_backwards = jer_shifted_backwards.replaceAll("''", "'");
  let jer_shifted_unreversed = reverseStr(jer_shifted_backwards);
  jer_shifted_unreversed = jer_shifted_unreversed.replaceAll(hard_sign_regex, "$1@j").replaceAll("~", "\'");

  return jer_shifted_unreversed;
};

const convertToORV = (lcs_word, pv2_3_exists, ch_sl, converted_variants_set) => {

  lcs_word = lcs_word.replaceAll("O", "ъ").replaceAll("E", "ь");
  lcs_word = lcs_word.replaceAll("ḹ", "ḷ");

  
  lcs_word = yeetTlDl(lcs_word);

  lcs_word = lcs_word.replaceAll("Ǣ", "ä");

  if(pv2_3_exists) {
    lcs_word = applyPV3(lcs_word);
    lcs_word = applyPV2(lcs_word, PV2_regex_PV3);
    lcs_word = applyPV2(lcs_word, PV2_regex_CSR); //this does it only for non-word-final *ě, *i which hopefully will leave most of the Russian levelled forms
  }

  //has to be after PV2 etc. because these are post-PV2/3 loans and often the only source of velar+front-vowel in the old languages
  lcs_word = lcs_word.replaceAll("ḱ", "k").replaceAll("x́", "x").replaceAll("ǵ", "g");

  lcs_word = lcs_word.replaceAll("cěsaŕ", "caŕ");
  
  lcs_word = denasalise(lcs_word);
  lcs_word = russifyDoublets(lcs_word);



  converted_variants_set.add(TOROT(lcs_word));
  converted_variants_set.add(TRAT(lcs_word));

  applyOptionalChangeToSet(converted_variants_set, jotifyInitialA);
  applyAlternateChangesToSet(converted_variants_set, dejotateORV, dejotateOCS);
  applyAlternateChangesToSet(converted_variants_set, nasalisedJatOCS, nasalisedJatORV);
  applyAlternateChangesToSet(converted_variants_set, nasalisedYOCS, nasalisedYORV);
};




/******************************************THE BELOW IS WHERE THE ACTUAL PROCESSING STARTS; ABOVE IS ALL HELPER-FUNCTIONS**************************/

const json_str= fs.readFileSync("lcs_inflections_indexed.json", 'utf-8');
const lcs_json = JSON.parse(json_str);

for(let word_obj of lcs_json) {
  const pv2_3_exists = Boolean(word_obj[0]);
  const ch_sl = word_obj[1];
  const torot_pos = word_obj[5].slice(0, 2);
  for(let i = 2; i < 5; i++) {
    for(const idx in word_obj[i]) {
      const unconverted_form = word_obj[i][idx];
      const converted_variants_set = new Set();

      convertToORV(unconverted_form, pv2_3_exists, ch_sl, converted_variants_set);
      
      applyChangeToSet(converted_variants_set, applyHavlik);

      orvToCSR(torot_pos, idx, converted_variants_set);

      const final_converted_variants_array = Array.from(converted_variants_set);

      word_obj[i][idx] = [final_converted_variants_array, unconverted_form];
    }
  }
}
fs.writeFileSync("lcs_converted.json", JSON.stringify(lcs_json, null, 2));