#!/usr/bin/node

const sax = require('sax');
const fs = require('node:fs');


let annotated_word_count = 0;
if(process.argv.length < 3) {
    console.log("Must specify lang-code");
    process.exit(0);
}

const lang_id = process.argv[2];

let list_of_xml_files = fs.readdirSync(".").filter(x => x.slice(-4) == ".xml");
const number_of_files = list_of_xml_files.length;

let current_file_number = 0;
let word_count = 0;

const output_filename = "tagged_sentences_mergetags.csv";

const saxParser = sax.createStream(true);

const chu_deepClean_map = {
    "·" : "",
    "̇" : "",
    "\u0308" : "",
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



let csv_string = "";
let unannotated = false;
let can_parse = false;

saxParser.on('opentag', function(node) {

    if(node.name == "source") {
        can_parse = node.attributes.language == lang_id ? true : false;
        if(!can_parse) console.log(list_of_xml_files[current_file_number], `is not a ${lang_id.toUpperCase()} text, ignoring...`);
        else console.log(list_of_xml_files[current_file_number], `is a ${lang_id.toUpperCase()} text, extracting words...`);
    }

    if(can_parse && node.name == 'sentence') {
        if(node.attributes["status"] == "unannotated") {
            unannotated = true;
        }
        else {
            unannotated = false;
            const sentence_id = node.attributes['id'];
            csv_string += "%%"+sentence_id+",\n";
        }
        
    }
    
 
    if(can_parse && node.name == "token" && !unannotated) {
        let text_word = node.attributes.form;
        const morph_tag = node.attributes.morphology;
        const POS = node.attributes["part-of-speech"];

        if(text_word != undefined) {
            for(const key in chu_deepClean_map) {
                text_word = text_word.replaceAll(key, chu_deepClean_map[key]);
            }
            
            csv_string += text_word+","+POS+morph_tag+"\n";
            annotated_word_count++;
        }
        word_count++;

    }
});

saxParser.on('end', () => {

    if(can_parse) {
        console.log(`${word_count} annotated words were found in ${list_of_xml_files[current_file_number]}`);
        fs.appendFileSync(output_filename, csv_string);
    }

    csv_string = "";
    word_count = 0;
    current_file_number++;

    if(current_file_number < number_of_files) {
        const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
        xml_stream.pipe(saxParser);
    }
    else {
        console.log("No more xml files to parse\n");
    }

});

const xml_stream = fs.createReadStream(list_of_xml_files[current_file_number]);
xml_stream.pipe(saxParser);
