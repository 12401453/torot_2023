#!/usr/bin/node
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
const orv_deepClean_map = {
    "꙽" : "",
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
    " " : "",
    " ꙽" : "",
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
    // "ѩ" : "ѧ",
    "Ѩ" : "ѩ",
    // "щ" : "шт",
    // "Щ" : "шт",
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
    "Щ" : "щ",
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
    "ѕ" : "з",

    //Old Russian-specific and very aggresive normalisations
    "ѩ" : "ꙗ",
    "ѭ" : "ю",
    "ѫ" : "оу",
    "шю" : "шоу",
    "чю" : "чоу",
    "жю" : "жоу",
    "ждю" : "ждоу",
    "штю" : "штоу",
    "щю" : "щоу",
    "цю" : "цоу",
    "шꙗ" : "ша",
    "чꙗ" : "ча",
    "жꙗ" : "жа",
    "ждꙗ" : "жда",
    "цꙗ" : "ца",
    "штꙗ" : "шта",
    "щꙗ" : "ща",
    "шѧ" : "ша",
    "чѧ" : "ча",
    "жѧ" : "жа",
    "ждѧ" : "жда",
    "цѧ" : "ца",
    "штѧ" : "шта",
    "щѧ" : "ща",
    "ѧ" : "ꙗ",

    " " : "", //get rid of token-internal whitespace

};

const sax = require('sax');
const fs = require('node:fs');

const { execSync } = require('child_process');

const readline = require('readline');

if(process.argv.length < 3) {
    console.log("Must specify lang-code");
    process.exit(0);
}

let list_of_xml_files = fs.readdirSync(".").filter(x => x.slice(-4) == ".xml");
const number_of_files = list_of_xml_files.length;

let current_file_number = 0;
let word_count = 0;

const lang_id = process.argv[2];

const deepClean_map = lang_id == "orv" ? orv_deepClean_map : chu_deepClean_map;

const words_filename = lang_id+"_words_full_with_titles_untagged.csv";

const just_untagged_words_filename = lang_id+"_untagged_words.csv";

fs.writeFileSync(words_filename, "torot_word|pos|lemma|morph_tag|deep_cleaned|lemma_id|sentence_no|pres_before|pres_after|text_id|subtitle_id|autotagged\n");

const saxParser = sax.createStream(true);
saxParser.destroy = function (err) {
    if (err) this.emit('error', err);
    this.emit('close');
};

const pos_set = new Set();
const morph_set = new Set();
const lemma_map = new Map();
let lemma_count = 1;

const deepClean = (dirty_word) => {
    let cleaned_word = dirty_word;
    for(const key in deepClean_map) {
        cleaned_word = cleaned_word.replaceAll(key, deepClean_map[key]);
    }
    return cleaned_word;
};

const tag_stack = [];

let can_parse = false;
let annotated = false;
let sentence_id = 0;
let main_title_id = 0;
let main_title_text = "";
let sub_title_id = 0;
let sub_title_text = "";

let title_text_flag = false;

const main_title_map = new Map();
//const sub_title_map = new Map();

let subtitles_list = "";

let csv_string = "";

let untagged_csv_string = "";
let tagged_tnt_mergetags_string = "";
let tagged_tnt_POStags_string = "";
let tagged_tnt_morphtags_string = "";
let untagged_tnt_string = "";
let tokno = 0;

saxParser.on('text', function(t) {
    if(can_parse && tag_stack[tag_stack.length -1] == "title" && tag_stack[tag_stack.length -2] == "source") {
        if(main_title_text != t) main_title_id++;
        main_title_text = t;
        title_text_flag = false;

        main_title_map.set(main_title_id, main_title_text);
        sub_title_id = 0;
    }
    else if(can_parse && tag_stack[tag_stack.length -1] == "title" && tag_stack[tag_stack.length -2] == "div") {
        if(sub_title_text != t) sub_title_id++;
        sub_title_text = t;

        subtitles_list += main_title_id + "|" + sub_title_text + "\n";
        //sub_title_map.set(sub_title_id, sub_title_text);
    }
});

saxParser.on('closetag', function(node) {
    tag_stack.pop();
});

saxParser.on('error', (e) => {
    console.log("Error: ", e);
})

saxParser.on('opentag', function(node) {

    tag_stack.push(node.name);

    if(node.name == "source") {
        can_parse = node.attributes.language == lang_id ? true : false;
        if(!can_parse) {
            console.log(list_of_xml_files[current_file_number], `is not a ${lang_id.toUpperCase()} text, ignoring...`);
        }
        else console.log(list_of_xml_files[current_file_number], `is a ${lang_id.toUpperCase()} text, extracting words...`);
    }
    if(node.name == 'title' && can_parse) title_text_flag = true;
    else title_text_flag = false;

    if(node.name == 'sentence' && can_parse) {
        annotated = node.attributes.status == 'unannotated' ? false : true;
        sentence_id = node.attributes.id;
        
        if(annotated) {
            tagged_tnt_POStags_string += "%%" + sentence_id + "\n";
            tagged_tnt_mergetags_string += "%%" + sentence_id + "\n";
            tagged_tnt_morphtags_string += "%%" + sentence_id + "\n";
        }
        else {
            untagged_tnt_string += "%%" + sentence_id + "\n";
        }
    }
    
 
    if(can_parse && node.name == "token") {
        const text_word = node.attributes.form;
        let morph_tag = "";
        let pos = "";
        let lemma = "";
        let lemma_id = 0;
        let autotagged = "0";
        
        if(text_word != undefined) {
            tokno++;
            if(annotated) {
                morph_tag = node.attributes.morphology;
                pos = node.attributes['part-of-speech'];
                lemma = node.attributes.lemma;
                const lemma_pos_combo = lemma.concat(pos);
                pos_set.add(pos);
                morph_set.add(morph_tag);


                tagged_tnt_POStags_string += deepClean(text_word).replaceAll(" ", "") + " " + pos + "\n"; //need to get rid of token-internal whitespace so that TnT doesn't view the second half of such words as tags
                tagged_tnt_mergetags_string += deepClean(text_word).replaceAll(" ", "") + " " + pos+morph_tag + "\n";
                tagged_tnt_morphtags_string += deepClean(text_word).replaceAll(" ", "") + " " + morph_tag + "\n";

                if(lemma_map.has(lemma_pos_combo)) {
                    lemma_id = lemma_map.get(lemma_pos_combo);
                }
                else {
                    lemma_map.set(lemma_pos_combo, lemma_count);
                    lemma_id = lemma_count;
                    lemma_count++;
                }
            }
            else {
                morph_tag = node.attributes.morphology == undefined ? "" : node.attributes.morphology;
                pos = node.attributes['part-of-speech'] == undefined ? "" : node.attributes['part-of-speech'];
                lemma = node.attributes.lemma == undefined ? "" : node.attributes.lemma;
                untagged_csv_string += text_word+ "|" + deepClean(text_word) + "|" + String(tokno) + "|" + main_title_text + "|" + sub_title_text + "|" + morph_tag + "|" + lemma + "|" + pos + "\n";
                autotagged = "1";

                untagged_tnt_string += deepClean(text_word).replaceAll(" ", "") + "\n";
            }
            
            csv_string += text_word + "|" + pos + "|" + lemma + "|" + morph_tag + "|" + deepClean(text_word);

            csv_string += "|" + lemma_id;
            
            csv_string += "|" + sentence_id;
            word_count++;
            if(pos == undefined) console.log(text_word, "apparently doesn't have any assigned POS.");

            let presentation_before = "";
            let presentation_after = "";
            csv_string += "|";
            if(node.attributes["presentation-before"] != undefined) csv_string += node.attributes["presentation-before"];
            csv_string += "|";
            if(node.attributes["presentation-after"] != undefined) csv_string += node.attributes["presentation-after"];
            csv_string += "|" + main_title_id + "|" + sub_title_id + "|" + autotagged + "\n";
        }
    }
});

saxParser.on('end', () => {

    if(can_parse) {
        console.log(`${word_count} words were found in ${list_of_xml_files[current_file_number]}`);
        fs.appendFileSync(words_filename, csv_string);

        if(untagged_tnt_string != "") {
            fs.writeFileSync(`TnT_inputs/${list_of_xml_files[current_file_number].slice(0, -4)}_untagged_tnt_input.tt`, untagged_tnt_string);
        }
    }
    
    csv_string = "";
    untagged_tnt_string = "";
    word_count = 0;
    current_file_number++;

    if(current_file_number < number_of_files) {
        const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
        xml_stream.pipe(saxParser);
    }
    else {
        console.log("No more xml files to parse\n");

        console.log("Number of unique POSes: ", pos_set.size);
        console.log("Number of unique morphology-tags: ", morph_set.size);
        console.log("Number of unique lemmas: ", lemma_map.size);

        console.log(main_title_map);

        fs.writeFileSync(lang_id+"_subtitles.csv", subtitles_list);

        fs.writeFileSync(just_untagged_words_filename, untagged_csv_string);

        fs.writeFileSync("TnT_inputs/"+lang_id+"_tnt_POStags.tt", tagged_tnt_POStags_string);
        fs.writeFileSync("TnT_inputs/"+lang_id+"_tnt_morphtags.tt", tagged_tnt_morphtags_string);
        fs.writeFileSync("TnT_inputs/"+lang_id+"_tnt_mergetags.tt", tagged_tnt_mergetags_string);


        const output = execSync("./tnt-para chu_tnt_mergetags.tt", {cwd: "TnT_inputs"});
        execSync("./tnt-para chu_tnt_POStags.tt", {cwd: "TnT_inputs"});
        execSync("./tnt-para chu_tnt_morphtags.tt", {cwd: "TnT_inputs"});
        console.log(output.toString());

        const output2 = execSync("./tnt chu_tnt_mergetags tnt_input_assem.tt > assem_autotagged_mergetags.tts", {cwd: "TnT_inputs"});
        execSync("./tnt chu_tnt_POStags tnt_input_assem.tt > assem_autotagged_POStags.tts", {cwd: "TnT_inputs"});
        execSync("./tnt chu_tnt_morphtags tnt_input_assem.tt > assem_autotagged_morphtags.tts", {cwd: "TnT_inputs"});
        console.log(output2.toString());

        readAssemAutotaggedTnTFiles();


    }


});


async function readAssemAutotaggedTnTFiles() {
  const assem_tnt_pos_file = readline.createInterface({input: fs.createReadStream("TnT_inputs/assem_autotagged_POStags.tts")});
  let sentence_id = 0;
  
  const postag_arr = new Array();
  for await(const line of assem_tnt_pos_file) {
    if(line.startsWith("%% ")) continue;
    else if(line.startsWith("%%")) {
        sentence_id = line.slice(2).trim();
        continue;
    }
    const row = line.split(/\s+/);
    
    const word = row[0].trim();
    const pos = row[1].trim()

    postag_arr.push([sentence_id, word, pos]);

  };
  assem_tnt_pos_file.close();

  const assem_tnt_morphtag_file = readline.createInterface({input: fs.createReadStream("TnT_inputs/assem_autotagged_morphtags.tts")});
  let idx = 0;
  for await(const line of assem_tnt_morphtag_file) {
    if(line.startsWith("%%")) continue;
    const row = line.split(/\s+/);
    
    const word = row[0].trim();
    const morph_tag = row[1].trim()

    postag_arr[idx].push(morph_tag);
    idx++;

  };
  assem_tnt_morphtag_file.close();

  let assem_autotagged_words_csv = "deep_cleaned|pos|morph_tag|word_raw|sentence_id|pres_before|pres_after|text_id|subtitle_id\n";
  const assem_cyr_file = readline.createInterface({input: fs.createReadStream("TnT_inputs/assem_cyr_full_words.csv")});
  idx = 0;
  for await(const line of assem_cyr_file) {
    const row = line.split("|");
    const word_raw = row[0].trim();
    const pres_before = row[6];
    const pres_after = row[7];
    const text_id = row[8];
    const subtitle_id = row[9];
    postag_arr[idx].push(word_raw, pres_before, pres_after, text_id, subtitle_id);
    idx++;
  }

  for(const [sentence_id, word, pos, morph_tag, word_raw, pres_before, pres_after, text_id, subtitle_id] of postag_arr) {
    assem_autotagged_words_csv += word + "|" + pos + "|" + morph_tag + "|" + word_raw + "|" + sentence_id + "|" + pres_before + "|" + pres_after + "|" + text_id + "|" + subtitle_id + "\n";
  }
  
  fs.writeFileSync("TnT_inputs/assem_autotagged.csv", assem_autotagged_words_csv);
}


const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
xml_stream.pipe(saxParser);
