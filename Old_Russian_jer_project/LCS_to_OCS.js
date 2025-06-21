const dl_tl_regex = /[dt][ĺl][^̥]/;
const ORT_regex = /[eo][rl]([tŕrpsšdfgћђklĺzžxčvbnńmǯ\+]|$)/
const PV2_regex = /[kgx]v?([ěęeiь]|ŕ̥|ĺ̥)/;
const PV3_regex = /[ьię][kgx][auǫ]/;
const tense_jer_regex = /[ьъ]j[Ǣeiьęǫuě]/; //I know that /ě/ cannot follow /j/ etymologically but my current analysis (probably wrong) of dealing with glagoĺěte etc. imperatives after palatal consonants is to assume analogy with the hard-stems, so the alternative 2pl. imperative of покръіти has a theoretical deviant form *pokrъjěte that needs to have its tense back-jer lengthened in accordance with my orthographic policy for normalised OCS

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
  'Ǣmajima' : 'иима',
  'amъjimъ' : 'ъіимъ',
  'Ǣmъjimъ' : 'иимъ',
  'axъjixъ' : 'ъіихъ',
  'Ǣxъjixъ' : 'иихъ',
  'amijimi' : 'ъіими',
  'Ǣmijimi' : 'иими'
}

const simplifyLongAdj = (lcs_form) => {
  for(const key in long_adj_map) {
    lcs_form = lcs_form.replaceAll(key, long_adj_map[key]);
  }
  return lcs_form;
};

const chu_mappings = {
  'sš' : 'ш',
  'ss' : 'с',
  'bv' : 'б',
  'ŕǢ' : 'рꙗ',
  'ńǢ' : 'нꙗ',
  'ĺǢ' : 'лꙗ',
  'śa' : 'сꙗ',
  'jǢ' : 'ꙗ',
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
  'ŕę' : 'р҄ѧ',
  'ńe' : 'н҄е',
  'ńi' : 'н҄и',
  'ńь' : 'н҄ь',
  'ńę' : 'н҄ѧ',
  'ĺe' : 'л҄е',
  'ĺi' : 'л҄и',
  'ĺь' : 'л҄ь',
  'ĺę' : 'л҄ѧ',
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
  'zr' : 'здр',
  //this one is just for *mĺ̥dnьji
  'dn' : 'n',
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
  'Ǣ' : 'а',
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
  '+' : '',
  'ń' : 'н҄',
  'ĺ' : 'л҄',
  'ŕ' : 'р҄',
};

const inflection_class_map = new Map( [
  ["nt_o_PV3", 1013],
  ["masc_o_PV3", 1029],
  ["fem_a_PV3", 1036],
  ["masc_a_PV3", 1057],
  ["vьxь", 1017]
  //and so wider and so forth
]);

const convertToOCS = (lcs_word, inflexion_class_id, lemma_id) => {

  //extremely disgusting jo-stem variants of gospodь possible only under a system with Russian-style secondary palatalisation of dentals
  if(lemma_id == 342) {
    if(lcs_word == "gospoda") return "господꙗ";
    else if(lcs_word == "gospodu") return "господю";
  }

  lcs_word = lcs_word.replaceAll("ę̌", "ę").replaceAll("y̨", "y").replaceAll("Q", "ъ");

  lcs_word = lcs_word.replace(/^ak/, "jǢk"); //not really justified other than by the extreme rarity of ак- spellings in OCS

  lcs_word = yeetTlDl(lcs_word);

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
    const PV2_cons = lcs_word.at(PV2_pos);
    lcs_word = lcs_word.slice(0, PV2_pos) + PV2_map.get(PV2_cons) + lcs_word.slice(PV2_pos + 1);
    PV2_pos = lcs_word.search(PV2_regex);
  }
  if(inflexion_class_id == 1013 || inflexion_class_id == 1017 || inflexion_class_id == 1029 || inflexion_class_id == 1036 || inflexion_class_id == 1057 || lemma_id == 362 || lemma_id == 2608 /*vьxakъ and vьxako*/ || lemma_id == 68 || lemma_id == 2858 || lemma_id == 1576 || lemma_id == 2661 || lemma_id == 3091 || lemma_id == 2960 || lemma_id == 7200 || lemma_id == 7242) {
    //this type of word-level specification would be partly reduced if the lemmas-system was broken down by stem and prefix more
    lcs_word = applyPV3(lcs_word);
  }

  lcs_word = simplifyLongAdj(lcs_word);

  lcs_word = lengthenTenseJers(lcs_word);

  for(const key in chu_mappings) {
    lcs_word = lcs_word.replaceAll(key, chu_mappings[key]);
  }
  return lcs_word;
};

const original_ocs_forms = new Array();

const normaliseOCS = () => {
  original_ocs_forms.length = 0;
  document.querySelectorAll("[data-lcs_recon]").forEach(tt => {
    const ocs_form = tt.firstChild.textContent;
    const lemma_id = Number(tt.dataset.lemma_id);
    original_ocs_forms.push(ocs_form);
    tt.firstChild.textContent = convertToOCS(tt.dataset.lcs_recon, tt.dataset.inflexion, lemma_id);
    tt.classList.add("converted");
  });
  ttPosition();
};

const restoreTextOCS = () => {
  document.querySelectorAll("[data-lcs_recon]").forEach((tt, i) => {
    tt.firstChild.textContent = original_ocs_forms[i];
    tt.classList.remove("converted");
  });
  ttPosition();
};

const orv_shipyashi_nasal_regex = new RegExp(/[ščžћђǯj]ę/ug);
const orv_shipyashi_a_regex = new RegExp(/[ščžћђǯjʒś]Ǣ/ug);
const orv_bare_nasal_regex = new RegExp(/[^ščžћђǯj]ę/ug);

const denasalise = (lcs_form) => {

  lcs_form = lcs_form.replaceAll("ǫ", "u");
  //Russian-specific soft /z'/ and /s'/ retained from PV3 need to be introduced here to get nasal-randomised
  lcs_form = lcs_form.replaceAll("ʒa", "ʒǢ");
  lcs_form = lcs_form.replaceAll("śa", "śǢ");
  let match_counting_string = lcs_form;
  
  let regex_res = lcs_form.match(orv_shipyashi_nasal_regex);
  if(regex_res !== null) {
    for(const regex_match of regex_res) {
      const match_pos = lcs_form.indexOf(regex_match);
      if(Math.floor(Math.random() * 100) > 50) {
        lcs_form = lcs_form.substr(0, match_pos) + lcs_form.substr(match_pos, 1) + "Ǣ" + lcs_form.substr(match_pos + 2);
      }
      match_counting_string = match_counting_string.replace(regex_match, "FF");
    }
  }

  regex_res = match_counting_string.match(orv_shipyashi_a_regex);
  if(regex_res !== null) {
    for(const regex_match of regex_res) {
      const match_pos = lcs_form.indexOf(regex_match);
      if(Math.floor(Math.random() * 100) > 50) {
        lcs_form = lcs_form.substr(0, match_pos) + lcs_form.substr(match_pos, 1) + "ę" + lcs_form.substr(match_pos + 2);
      }
      match_counting_string = match_counting_string.replace(regex_match, "FF");
    };
  }

  regex_res = match_counting_string.match(orv_bare_nasal_regex);
  if(regex_res !== null) {
    for(const regex_match of regex_res) {
      const match_pos = lcs_form.indexOf(regex_match);
      if(Math.floor(Math.random() * 100) > 50) {
        lcs_form = lcs_form.substr(0, match_pos) + lcs_form.substr(match_pos, 1) + "jǢ" + lcs_form.substr(match_pos + 2);
      }
      match_counting_string = match_counting_string.replace(regex_match, "FF");
    }
  }
  return lcs_form;
};

const russifyDoublets = (lcs_form) => {
  switch(lcs_form) {
    case "azъ":
      lcs_form = "jǢzъ";
      return lcs_form;
      break;
    case "tebě":
      lcs_form = "tobě";
      return lcs_form;
      break;
    case "sebě":
      lcs_form = "sobě";
      return lcs_form;
      break;
  }

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

const orv_mappings = {
  'sš' : 'ш',
  'bv' : 'б',
  'ŕǢ' : 'рꙗ',
  'ńǢ' : 'нꙗ',
  'ĺǢ' : 'лꙗ',
  'śǢ' : 'сꙗ', // 'śa' => 'śǢ' is done in the denasalisatin-function
  'jǢ' : 'ꙗ',
  'ŕu' : 'рю',
  'ńu' : 'ню',
  'ĺu' : 'лю',
  'śu' : 'сю',
  'ʒu' : 'зю',
  'ʒǢ' : 'зꙗ', // 'ʒa' => 'ʒǢ' is done in the denasalisation-function
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
  'ŕ̥' : 'ьр',
  'r̥' : 'ър',
  'ĺ̥' : 'ьл',
  'l̥' : 'ъл',
  'šč' : 'щ',
  'šћ' : 'щ',
  'žǯ' : 'жд',
  'žђ' : 'жд',
  'zr' : 'здр',
  //this one is just for *mĺ̥dnьji
  'dn' : 'n',
  'ǵ' : 'ꙉ',
  'ḱ' : 'к҄',
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
  'y' : 'ъі',
  'č' : 'ч',
  'š' : 'ш',
  'ž' : 'ж',
  'Ǣ' : 'а',
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
  '+' : '',
  'ń' : 'н҄',
  'ĺ' : 'л҄',
  'ŕ' : 'р҄',
}

const convertToORV = (lcs_word, inflexion_class_id, lemma_id) => {

  lcs_word = lcs_word.replaceAll("ę̌", "ě").replaceAll("y̨", "a").replaceAll("Q", "ь");
  lcs_word = lcs_word.replaceAll("ĺ̥", "l̥");

  lcs_word = lcs_word.replace(/^ak/, "jǢk").replace(/^av/, "jǢv");
  lcs_word = yeetTlDl(lcs_word);

  if(inflexion_class_id == 1013 || inflexion_class_id == 1029 || inflexion_class_id == 1036 || inflexion_class_id == 1057 || inflexion_class_id == 1017 || lemma_id == 362 || lemma_id == 2608 /*vьxakъ and vьxako*/) lcs_word = applyPV3(lcs_word);
  lcs_word = denasalise(lcs_word);
  lcs_word = russifyDoublets(lcs_word);

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

  let PV2_pos = lcs_word.search(PV2_regex);
  while(PV2_pos != -1) {
    const PV2_cons = lcs_word.at(PV2_pos);
    lcs_word = lcs_word.slice(0, PV2_pos) + PV2_map.get(PV2_cons) + lcs_word.slice(PV2_pos + 1);
    PV2_pos = lcs_word.search(PV2_regex);
  }

  lcs_word = simplifyLongAdj(lcs_word);

  lcs_word = lengthenTenseJers(lcs_word);

  for(const key in orv_mappings) {
    lcs_word = lcs_word.replaceAll(key, orv_mappings[key]);
  }
  return lcs_word;
};

const russifyOCS = () => {
  original_ocs_forms.length = 0;
  document.querySelectorAll("[data-lcs_recon]").forEach(tt => {
    const ocs_form = tt.firstChild.textContent
    const lemma_id = Number(tt.dataset.lemma_id);
    original_ocs_forms.push(ocs_form);
    tt.firstChild.textContent = convertToORV(tt.dataset.lcs_recon, Number(tt.dataset.inflexion), lemma_id);
    tt.classList.add("converted");
  });
  ttPosition();
};
