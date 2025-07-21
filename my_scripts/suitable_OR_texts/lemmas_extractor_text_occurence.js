#!/usr/bin/node

const sax = require('sax');
const fs = require('node:fs');
const { text } = require('node:stream/consumers');

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
};

let list_of_xml_files = fs.readdirSync(".").filter(x => x.slice(-4) == ".xml");
let number_of_files = list_of_xml_files.length;
console.log(list_of_xml_files);

const saxParser = sax.createStream(true);
saxParser.destroy = function (err) {
    if (err) this.emit('error', err);
    this.emit('close');
};
let lang_name = process.argv[2];
const lemmas_filename = lang_name + "_lemmas_count_text_occurence.csv";
const deepCleanMap = lang_name == "orv" ? orv_deepClean_map : chu_deepClean_map;
let can_parse = false;
let annotated = false;

let csv_string_arr = new Array();
const key_set = new Set();
const text_occurence_set = new Set();
const lemmas_map = new Map();

let lemma_count = 1;
let lems_per_text_count = 0;
let current_file_number = 0;
let current_filename = "";

let lemmas_counts_array = new Array();

const deepClean = (dirty_word) => {
    let cleaned_word = dirty_word;
    for(const key in deepCleanMap) {
        cleaned_word = cleaned_word.replaceAll(key, deepCleanMap[key]);
    }
    return cleaned_word;
};

saxParser.on('error', function(e) {
    console.log('error: ', e);
    this._parser.error = null;
    this._parser.resume();
    
});

saxParser.on('opentag', function(node) {
    if(node.name == "source") {
        can_parse = node.attributes.language == lang_name ? true : false;
        if(!can_parse) {
            console.log(list_of_xml_files[current_file_number], `is not a ${lang_name.toUpperCase()} text, ignoring...`);
            list_of_xml_files.splice(current_file_number, 1);
            current_file_number--;
            number_of_files--;
        }
        else {
            console.log(list_of_xml_files[current_file_number], `is a ${lang_name.toUpperCase()} text, extracting lemmas...`);
        }
    }

    if(node.name == 'sentence' && can_parse) {
        annotated = node.attributes.status == 'unannotated' ? false : true;
    }
    
    if(can_parse && annotated && node.name == "token") {
        const lemma_form = node.attributes.lemma;
        const lemma_pos = node.attributes['part-of-speech'];

        if(lemma_form != undefined) {
            const stringified_combo = lemma_form.concat(lemma_pos);
            const text_occurence_combo = list_of_xml_files[current_file_number].slice(0, -4)+lemma_form+lemma_pos;

            if(key_set.has(stringified_combo) == false){
                csv_string_arr.push(String(lemma_count) + "," + lemma_form + "," + lemma_pos + "," + deepClean(lemma_form));
                lemmas_map.set(stringified_combo, lemma_count);

                lemma_count++;
                lemmas_counts_array.push([1, 2**current_file_number]);
                key_set.add(stringified_combo);
                text_occurence_set.add(text_occurence_combo);
                lems_per_text_count++;
                
            }
            else {
                lemmas_counts_array[lemmas_map.get(stringified_combo) - 1][0]++;
                
            }
            
            if(text_occurence_set.has(text_occurence_combo) == false) {
                text_occurence_set.add(text_occurence_combo);
                lemmas_counts_array[lemmas_map.get(stringified_combo) - 1][1]+=2**current_file_number;
            }
            else {
            }
        }
    }
});

saxParser.on('end', () => {

    if(can_parse) {
        console.log(`${lems_per_text_count} new lemmas were found in ${list_of_xml_files[current_file_number]}`);
        
    }
    
    lems_per_text_count = 0;

    current_file_number++;

    if(current_file_number < number_of_files) {
        const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
        xml_stream.pipe(saxParser);
    }
    else {
        let header_str = "id,lemma,pos,normalised,count";
        for(const fn of list_of_xml_files) {
            header_str+= "," + fn.slice(0, -4);
        }
        header_str += ",bitflag\n"

        fs.writeFileSync(lemmas_filename, header_str);

        for(let i = 0; i < csv_string_arr.length; i++) {
            csv_string_arr[i] = csv_string_arr[i].concat("," + String(lemmas_counts_array[i][0]));

            const bitflag = lemmas_counts_array[i][1].toString(2).padStart(list_of_xml_files.length, '0');
            let text_occurence_csv = "";
            for(let j = 0; j < bitflag.length; j++){
                text_occurence_csv += ",";
                if(bitflag[bitflag.length - 1 - j] == '1') {
                    //console.log(bitflag);
                    //console.log("j = ", j, "list_of_xml_files.length = ", list_of_xml_files.length);

                    text_occurence_csv += list_of_xml_files[j].slice(0, -4)
                }
            }
            csv_string_arr[i] = csv_string_arr[i].concat(text_occurence_csv + "," + String(lemmas_counts_array[i][1]));
        }

        fs.appendFileSync(lemmas_filename, csv_string_arr.join("\n"));
        csv_string = "";
        console.log("No more xml files to parse");
    }

});

const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
xml_stream.pipe(saxParser);
