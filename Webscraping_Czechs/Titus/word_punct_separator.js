#!/usr/bin/node


import { createInterface } from 'readline';
import { createReadStream, writeFileSync } from 'node:fs';

const read_stream1 = createReadStream("assem_words_raw.txt");
read_stream1.on('error', () => {
  console.log("first file doesn't exist");
  process.exit(-1);
})

const chu_deepClean_map = {
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
const deepClean = (dirty_word) => {
    let cleaned_word = dirty_word;
    for(const key in chu_deepClean_map) {
        cleaned_word = cleaned_word.replaceAll(key, chu_deepClean_map[key]);
    }
    return cleaned_word;
};



async function writeWordsString() {
    let tnt_file_string = "";
    const assem_file = createInterface({input: read_stream1});
    for await(const line of assem_file) {
        
        let presentation_after = " ";
        let presentation_before = "";
        let non_word_count = 1;
        let first_word_index = 0;
        const split_line = line.split(/\s+/);
        while(split_line[first_word_index] !== undefined && deepClean(split_line[first_word_index]).trim() == "") {
            presentation_before += split_line[first_word_index] + " ";
            first_word_index++;
        }      
        for(let i = first_word_index + 1 /*have to move it ahead of the first word because we always write the word only after having built the entire sequence of bullshit that comes after it and arriving at the subsequent word*/; i < split_line.length; i++) {
            const chunk = split_line[i];
            if(chunk.trim() == "") continue;
            if(deepClean(chunk) != "") {
                tnt_file_string += split_line[i - non_word_count] + "|" + presentation_before + "|" + presentation_after + "\n";
                //console.log(split_line[i - non_word_count] + "|" + presentation_after + "|" + non_word_count);
                presentation_after = " ";
                presentation_before = "";
                non_word_count = 1;
            }
            else {
                presentation_after += chunk + " ";
                non_word_count++;
            }
        }
        if(split_line[split_line.length - 1].trim() == "") {;} 
        else if(deepClean(split_line[split_line.length - non_word_count]) != "") {
            tnt_file_string += split_line[split_line.length - non_word_count] + "|" + presentation_before + "|" + presentation_after + "\n";
            //console.log(split_line[split_line.length - non_word_count] + "|" + presentation_after + "|" + non_word_count);
            presentation_after = " ";
            non_word_count = 1;
        }
        else {
            presentation_after += split_line[split_line.length - 1] + " ";
            non_word_count++;
            console.log(split_line[split_line.length - 1] + "|" + presentation_before + "|" + presentation_after + "|" + non_word_count);
            tnt_file_string += split_line[split_line.length - 1] + "|" + presentation_before + "|" + presentation_after + "\n";
        }
        //console.log(split_line);
    }

    assem_file.close();
    return tnt_file_string;
}


const file_string = await writeWordsString();
writeFileSync("assem_words_presentation_after.csv", file_string);
