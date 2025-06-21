#!/usr/bin/node

function conj_type_Trunc(conj_type) {

  if (conj_type == "byti")
    return 4;
  if (conj_type == "pref_byti")
    return 4;
  if (conj_type == "nebyti")
    return 6;
  if (conj_type == "dati")
    return 4;
  if (conj_type == "have")
    return 6;
  if (conj_type == "eat")
    return 5;
  if (conj_type == "pref_eat")
    return 4;
  if (conj_type == "wote")
    return 6;
  if (conj_type == "will")
    return 6;
  if (conj_type == "stati")
    return 5;
  if (conj_type == "dovleti")
    return 8;
  if (conj_type == "dedj")
    return 4;
  if (conj_type == "sleep")
    return 6;

  if (conj_type == "čuti")
    return 2;
  if (conj_type == "17")
    return 3;
  if (conj_type == "18")
    return 3;
  if (conj_type == "19")
    return 3;
  if (conj_type == "jьti")
    return 4;
  if (conj_type == "13")
    return 4;

  if (conj_type == "21")
    return 4;
  if (conj_type == "22")
    return 3;
  if (conj_type == "ьt")
    return 4;
  if (conj_type == "ьz")
    return 4;
  if (conj_type == "uti")
    return 3;
  if (conj_type == "rti")
    return 4;
  if (conj_type == "rěsti")
    return 5;

  if (conj_type == "31")
    return 3;
  if (conj_type == "viděti")
    return 3;
  if (conj_type == "jaxati")
    return 4;
  if (conj_type == "32")
    return 3;
  if (conj_type == "40")
    return 3;
  if (conj_type == "51")
    return 3;
  if (conj_type == "51_abl")
    return 3;
  if (conj_type == "52_abl")
    return 3;
  if (conj_type == "iskati")
    return 3;
  if (conj_type == "52")
    return 3;
  if (conj_type == "53")
    return 3;
  if (conj_type == "53_abl")
    return 3;
  if (conj_type == "54")
    return 2;
  if (conj_type == "61")
    return 5;
  if (conj_type == "62")
    return 5;


  if (conj_type == "adj_soft")
    return 1;
  if (conj_type == "adj_hard")
    return 1;
  if (conj_type == "adj_soft_ord")
    return 1;
  if (conj_type == "adj_hard_ord")
    return 1;
  if (conj_type == "adj_ij")
    return 1;
  if (conj_type == "masc_o")
    return 1;
  if (conj_type == "masc_u")
    return 1;
  if (conj_type == "masc_i")
    return 1;
  if (conj_type == "masc_jo")
    return 1;
  if (conj_type == "masc_jo_foreign")
    return 1;
  if (conj_type == "masc_ju")
    return 1;
  if (conj_type == "masc_o_u")
    return 1;
  if (conj_type == "masc_a")
    return 1;
  if (conj_type == "masc_ja")
    return 1;
  if (conj_type == "masc_ji")
    return 1;
  if (conj_type == "masc_N")
    return 1;
  if (conj_type == "masc_tel")
    return 5;
  if (conj_type == "masc_ar")
    return 1;
  if (conj_type == "masc_o_PV3")
    return 1;
  if (conj_type == "fem_a")
    return 1;
  if (conj_type == "fem_a_PV3")
    return 1;
  if (conj_type == "masc_a_PV3")
    return 1;
  if (conj_type == "fem_ja")
    return 1;
  if (conj_type == "fem_ji")
    return 1;
  if (conj_type == "fem_R")
    return 1;
  if (conj_type == "fem_uu")
    return 1;
  if (conj_type == "fem_i")
    return 1;
  if (conj_type == "tri")
    return 1;
  if (conj_type == "nt_o")
    return 1;
  if (conj_type == "nt_S")
    return 1;
  if (conj_type == "nt_o_S")
    return 1;
  if (conj_type == "four")
    return 1;
  if (conj_type == "nt_jo")
    return 1;
  if (conj_type == "nt_N")
    return 1;
  if (conj_type == "nt_NT")
    return 1;
  if (conj_type == "nt_o_PV3")
    return 1;
  if (conj_type == "kamene")
    return 3;
  if (conj_type == "oko")
    return 1;

  if (conj_type == "den")
    return 4;   //extend to include all the conj_types
  if (conj_type == "masc_anin")
    return 4;
  if (conj_type == "pron_soft")
    return 1;
  if (conj_type == "pron_hard")
    return 1;
  if (conj_type == "kъto")
    return 4;
  if (conj_type == "kъtože")
    return 6;
  if (conj_type == "čьto")
    return 4;
  if (conj_type == "čьtože")
    return 6;
  if (conj_type == "kъjь")
    return 3;
  if (conj_type == "kъjьže")
    return 5;
  if (conj_type == "vьxь")
    return 1;
  if (conj_type == "sь")
    return 2;
  if (conj_type == "jь")
    return 2;
  if (conj_type == "jьže")
    return 4;
  if (conj_type == "pron_hard_ђe")
    return 4;
  if (conj_type == "pron_hard_že")
    return 3;
  if (conj_type == "kъžьdo")
    return 5;
  if (conj_type == "long_adj_noun")
    return 1;
  if (conj_type == "azъ")
    return 3;
  if (conj_type == "ty")
    return 2;
  if (conj_type == "sę")
    return 2;
  if (conj_type == "adj_ьj")
    return 1;
  if (conj_type == "dъva")
    return 1;
  if (conj_type == "adj_soft_comp")
    return 1;
  if (conj_type == "ten")
    return 1;
  if (conj_type == "1.1_PRAP")
    return 1;

  else return 0;
}

const dl_tl_regex = /[dt][ĺl][^̥]/;
const ORT_regex = /[eo][rl]([tŕrpsšdfgћђklĺzžxčvbnńmǯ\+]|$)/
const PV2_regex = /(?<!s)[kgx]v?([ěęeiь]|ŕ̥|ĺ̥)/;
const PV3_regex = /[ьię][kgx][auǫ]/;
const tense_jer_regex = /[ьъ]j[Ǣeiьęǫu]/;

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
    const velar = lcs_form.at(PV3_pos + 1);
    lcs_form = lcs_form.slice(0, PV3_pos + 1) + PV2_map.get(velar) + lcs_form.slice(PV3_pos + 2);
    PV3_pos = lcs_form.search(PV3_regex);
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

const polnoGlasie = (lcs_word) => {
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
const metaThesis = (lcs_word) => {
  let ORT_pos =  lcs_word.search(ORT_regex);

  while(ORT_pos != -1) {
    const ort_vowel = lcs_word.at(ORT_pos);
    const ort_liquid = lcs_word.at(ORT_pos + 1);
    const lengthened_vowel = ort_vowel == 'e' ? 'ě' : 'a';
    lcs_word = lcs_word.slice(0, ORT_pos) + ort_liquid + lengthened_vowel + lcs_word.slice(ORT_pos + 2);
    ORT_pos = lcs_word.search(ORT_regex);
  }
  return lcs_word;
}

const applyPV2 = (lcs_word) => {
  let PV2_pos = lcs_word.search(PV2_regex);
  while(PV2_pos != -1) {
    const PV2_cons = lcs_word.at(PV2_pos);
    lcs_word = lcs_word.slice(0, PV2_pos) + PV2_map.get(PV2_cons) + lcs_word.slice(PV2_pos + 1);
    PV2_pos = lcs_word.search(PV2_regex);
  }
  return lcs_word;
};

const orv_torot_mappings = {
  'egъd' : 'egd',
  'ъgъd' : 'ъgd',
  'ьgъd' : 'ьgd',
  'sš' : 'ш',
  'bv' : 'б',
  'ŕǢ' : 'ря',
  'ńǢ' : 'ня',
  'ĺǢ' : 'ля',
  'śa' : 'ся',
  'jǢ' : 'я',
  'ŕu' : 'рю',
  'ńu' : 'ню',
  'ĺu' : 'лю',
  'śu' : 'сю',
  'ju' : 'ю',
  'ŕǫ' : 'рю',
  'ńǫ' : 'ню',
  'ĺǫ' : 'лю',
  'jǫ' : 'ю',
  'śǫ' : 'сю',
  'ŕe' : 'ре',
  'ŕi' : 'ри',
  'ŕь' : 'рь',
  'ŕę' : 'ря',
  'ńe' : 'не',
  'ńi' : 'ни',
  'ńь' : 'нь',
  'ńę' : 'ня',
  'ĺe' : 'ле',
  'ĺi' : 'ли',
  'ĺь' : 'ль',
  'ĺę' : 'ля',
  'ję' : 'я',
  'je' : 'е',
  'ji' : 'и',
  'jь' : 'и',
  'ьj' : 'и',
  'jo' : 'о',
  'jě' : 'ѣ',
  'čę' : 'čǢ',
  'šę' : 'šǢ',
  'žę' : 'žǢ',
  'ћę' : 'ћǢ',
  'ђę' : 'ђǢ',
  '' : '',
  'ŕ̥' : 'ьр',
  'r̥' : 'ър',
  'ĺ̥' : 'ьл',
  'l̥' : 'ъл',
  'šč' : 'щ',
  'šћ' : 'щ',
  'žǯ' : 'жж',
  'žђ' : 'жж',
  'zr' : 'здр',
  'dn' : 'n',
  'ǵ' : 'г',
  'ḱ' : 'к',
  'x́' : 'х',
  'ћ' : 'ч',
  'ђ' : 'ж',
  'b' : 'б',
  'p' : 'п',
  'v' : 'в',
  'f' : 'ф',
  't' : 'т',
  'd' : 'д',
  's' : 'с',
  'z' : 'з',
  'ʒ' : 'з',
  'ś' : 'с',
  'c' : 'ц',
  'k' : 'к',
  'g' : 'г',
  'x' : 'х',
  'ü' : 'ѵ',
  'y' : 'ы',
  'č' : 'ч',
  'š' : 'ш',
  'ž' : 'ж',
  'Ǣ' : 'а',
  'a' : 'а',
  'e' : 'е',
  'ę' : 'я',
  'ě' : 'ѣ',
  'i' : 'и',
  'ь' : 'ь',
  'ъ' : 'ъ',
  'o' : 'о',
  'ǫ' : 'у',
  'u' : 'у',
  'l' : 'л',
  'n' : 'н',
  'm' : 'м',
  'r' : 'р',
  '+' : '',
  'ń' : 'н',
  'ĺ' : 'л',
  'ŕ' : 'р',
}
const orv_chSl_torot_mappings = {
  'egъd' : 'egd',
  'ъgъd' : 'ъgd',
  'ьgъd' : 'ьgd',
  'sš' : 'ш',
  'bv' : 'б',
  'ŕǢ' : 'ря',
  'ńǢ' : 'ня',
  'ĺǢ' : 'ля',
  'śa' : 'ся',
  'jǢ' : 'я',
  'ŕu' : 'рю',
  'ńu' : 'ню',
  'ĺu' : 'лю',
  'śu' : 'сю',
  'ju' : 'ю',
  'ŕǫ' : 'рю',
  'ńǫ' : 'ню',
  'ĺǫ' : 'лю',
  'jǫ' : 'ю',
  'śǫ' : 'сю',
  'ŕe' : 'ре',
  'ŕi' : 'ри',
  'ŕь' : 'рь',
  'ŕę' : 'ря',
  'ńe' : 'не',
  'ńi' : 'ни',
  'ńь' : 'нь',
  'ńę' : 'ня',
  'ĺe' : 'ле',
  'ĺi' : 'ли',
  'ĺь' : 'ль',
  'ĺę' : 'ля',
  'ję' : 'я',
  'je' : 'е',
  'ji' : 'и',
  'jь' : 'и',
  'ьj' : 'и',
  'jo' : 'о',
  'jě' : 'ѣ',
  'čę' : 'čǢ',
  'šę' : 'šǢ',
  'žę' : 'žǢ',
  'ћę' : 'ћǢ',
  'ђę' : 'ђǢ',
  '' : '',
  'ŕ̥' : 'ьр',
  'r̥' : 'ър',
  'ĺ̥' : 'ьл',
  'l̥' : 'ъл',
  'šč' : 'щ',
  'šћ' : 'щ',
  'žǯ' : 'жд',
  'žђ' : 'жд',
  'zr' : 'здр',
  'dn' : 'n',
  'ǵ' : 'г',
  'ḱ' : 'к',
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
  'ʒ' : 'з',
  'ś' : 'с',
  'c' : 'ц',
  'k' : 'к',
  'g' : 'г',
  'x' : 'х',
  'ü' : 'ѵ',
  'y' : 'ы',
  'č' : 'ч',
  'š' : 'ш',
  'ž' : 'ж',
  'Ǣ' : 'а',
  'a' : 'а',
  'e' : 'е',
  'ę' : 'я',
  'ě' : 'ѣ',
  'i' : 'и',
  'ь' : 'ь',
  'ъ' : 'ъ',
  'o' : 'о',
  'ǫ' : 'у',
  'u' : 'у',
  'l' : 'л',
  'n' : 'н',
  'm' : 'м',
  'r' : 'р',
  '+' : '',
  'ń' : 'н',
  'ĺ' : 'л',
  'ŕ' : 'р',
}

const torotOldRus = (lcs_lemma, ch_sl=false) => {
  
  lcs_lemma = lcs_lemma.replaceAll("ĺ̥", "l̥"); //East Slav backs everything before /l/

  if(lcs_lemma.includes("čьlově")) {
    lcs_lemma = lcs_lemma.replaceAll("čьlově", "čelově");
  }
  if(lcs_lemma.startsWith("jedin")) {
    lcs_lemma = lcs_lemma.replace("jedin", "odin");
  }
  else if(lcs_lemma.startsWith("jezer")) {
    lcs_lemma = lcs_lemma.replace("jezer", "ozer");
  }

  lcs_lemma = lcs_lemma.replace(/^ak/, "jǢk").replace(/^av/, "jǢv");
  lcs_lemma = yeetTlDl(lcs_lemma);
  //PV3 should be dealt with before the lcs_lemma is passed in

  const ort_group_converter = ch_sl ? metaThesis : polnoGlasie;

  lcs_lemma = lengthenTenseJers(applyPV2(ort_group_converter(lcs_lemma)));

  const orv_mappings = ch_sl ? orv_chSl_torot_mappings : orv_torot_mappings;

  for(const key in orv_mappings) {
    lcs_lemma = lcs_lemma.replaceAll(key, orv_mappings[key]);
  }

  return lcs_lemma;
}
/////////////////////////////////////////////////////////////////////////OLD RUSSIAN CONVERSION SHIT////////////////////////////////////////^^^^^^^^

const fs = require('node:fs');

const readline = require('readline');

const read_stream1 = fs.createReadStream("lemmas_with_text_occurence_gdrive.csv");
const read_stream2 = fs.createReadStream("all_orv_lemmas.csv");
read_stream1.on('error', () => {
  console.log("first file doesn't exist");
  process.exit(-1);
})
read_stream2.on('error', () => {
  console.log("second file doesn't exist");
  process.exit(-1);
})

const output_filename = "orv_ocs_lemma_matches.csv";

let csv_string = "";

const ocs_lemma_form_map = new Map();
const lcs_to_OR_torot_lemma_map = new Map();
const lcs_to_OR_ChSl_torot_lemma_map = new Map();



async function readLemmasSpreadsheet() {
  const lemma_spreadsheet_file = readline.createInterface({input: read_stream1});
  for await(const line of lemma_spreadsheet_file) {
    const row = line.split("|");
    const pos = row[2];
    const ocs_pos_lemma_combo = pos+row[0];
    const ocs_id = Number(row[1]);
    const original_ocs_lemma_lcs = row[3];
    let ocs_lemma_lcs = original_ocs_lemma_lcs;
    const pv3_lemma_form = row[5];

    const pre_jot = row[11];
    const root_1 = row[18];
    const root_2 = row[19];
    const conj_type = row[20];
    const noun_verb = Number(row[21]);

    let lemma_stem = "";

    if(conj_type == "11" || conj_type == "12" || conj_type == "15" || conj_type == "16" || conj_type == "infix_11" || conj_type == "infix_12") {
      lemma_stem = root_2;
    }
    else if(conj_type == "14") {
      lemma_stem = root_1;
    }
    else if(pre_jot == "") {
      lemma_stem = original_ocs_lemma_lcs.slice(0, original_ocs_lemma_lcs.length-conj_type_Trunc(conj_type));
    }
    else {
      lemma_stem = pre_jot.slice(0, pre_jot.length-conj_type_Trunc(conj_type));
    }
    
    
    if(ocs_lemma_lcs.trim() !== "") {
      if(pv3_lemma_form.trim() !== "") ocs_lemma_lcs = row[5];
      else if(conj_type.includes("PV3")) ocs_lemma_lcs = applyPV3(ocs_lemma_lcs);
      if(row[2] == "A-" && (ocs_lemma_lcs.slice(-1) == "ь" || ocs_lemma_lcs.slice(-1) == "ъ")) ocs_lemma_lcs = ocs_lemma_lcs + "jь";

      ocs_lemma_form_map.set(ocs_pos_lemma_combo, [ocs_id, original_ocs_lemma_lcs, conj_type, noun_verb, lemma_stem]);
      lcs_to_OR_torot_lemma_map.set(pos+torotOldRus(ocs_lemma_lcs), [ocs_id, original_ocs_lemma_lcs, conj_type, noun_verb, lemma_stem]);
      lcs_to_OR_ChSl_torot_lemma_map.set(pos+torotOldRus(ocs_lemma_lcs, true), [ocs_id, original_ocs_lemma_lcs, conj_type, noun_verb, lemma_stem]);
    }

  };
  lemma_spreadsheet_file.close();
}

async function readORVLemmasFile() {
  const lemmas_file = readline.createInterface({input: read_stream2});

  for await(const line of lemmas_file) {
    const row = line.split(",");
    const orv_lemma_form = row[1];
    const orv_pos = row[2];

    if(lcs_to_OR_torot_lemma_map.has(orv_pos+orv_lemma_form)) {
      csv_string += orv_lemma_form + "|" + orv_pos + "|" + lcs_to_OR_torot_lemma_map.get(orv_pos+orv_lemma_form).join("|") + "|e_sl" + "\n";
    }
    else if(lcs_to_OR_ChSl_torot_lemma_map.has(orv_pos+orv_lemma_form)) {
      csv_string += orv_lemma_form + "|" + orv_pos + "|" + lcs_to_OR_ChSl_torot_lemma_map.get(orv_pos+orv_lemma_form).join("|") + "|ch_sl" + "\n";
    }
    else if(ocs_lemma_form_map.has(orv_pos+orv_lemma_form)) {
      csv_string += orv_lemma_form + "|" + orv_pos + "|" + ocs_lemma_form_map.get(orv_pos+orv_lemma_form).join("|") + "|ch_sl" + "\n";
    }
  }
  lemmas_file.close();
}




async function createLemmaIdMap() {
  await readLemmasSpreadsheet();
  await readORVLemmasFile();
  fs.writeFileSync(output_filename, csv_string);

}

createLemmaIdMap();


