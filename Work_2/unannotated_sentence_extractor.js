#!/usr/bin/node

const sax = require('sax');
const fs = require('node:fs');


let unannotated_word_count = 0;

const input_xml_filename = process.argv[2];

const output_filename = "untagged_sentences.csv";

const saxParser = sax.createStream(true);

const chu_deepClean_map = {
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

saxParser.on('opentag', function(node) {

    if(node.name == 'sentence') {
        if(node.attributes["status"] == "unannotated") {
            unannotated = true;
            const sentence_id = node.attributes['id'];
            csv_string += "%%"+sentence_id+"\n";
        }
        else {
            unannotated = false;
        }
        
    }
    
 
    if(node.name == "token" && unannotated) {
        let text_word = node.attributes.form;

        if(text_word != undefined) {
            for(const key in chu_deepClean_map) {
                text_word = text_word.replaceAll(key, chu_deepClean_map[key]);
            }
            
            csv_string += text_word+"\n";
            unannotated_word_count++;
        }

    }
});

saxParser.on('end', () => {

    console.log(`${unannotated_word_count} unannotated words were found in ${input_xml_filename}`);
    fs.writeFileSync(output_filename, csv_string);
});

const xml_stream = fs.createReadStream(input_xml_filename);
xml_stream.pipe(saxParser);
