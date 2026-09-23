#!/usr/bin/node
import fs from 'fs';
import readline from 'readline';

const mark_supralinears = process.argv[2];
let script = "cyr";
if(process.argv.length < 3) {
    console.log("Run with <supr> to mark supralinears; defaulting to ignoring them...");
}
else if(mark_supralinears != "supr") {
    console.log("Ignoring supralinears; use <supr> to include them");
}
// console.log(mark_supralinears);
// process.exit(0);

const ascii_file_stream = fs.createReadStream("savvina.txt");
ascii_file_stream.on('error', () => {
    console.log("first file doesn't exist");
    process.exit(-1);
});

const capitalisation_regex = new RegExp(/^\*[\/`~\(\\]*/u);
//const leftover_asterisk_regex = new RegExp(/\*\p{L}/u);

const applyCapitalisation = (word) => {
    let match_array;
    if((match_array = capitalisation_regex.exec(word)) !== null) {
        const bullshit = match_array[0];
        word = bullshit.slice(1) + word.slice(bullshit.length,bullshit.length+1).toUpperCase() + word.slice(bullshit.length+1);
    }
    let asterisk_pos;
    while((asterisk_pos = word.indexOf("*")) != -1) {
        word = word.slice(0, asterisk_pos) + word.slice(asterisk_pos + 1, asterisk_pos + 2).toUpperCase() + word.slice(asterisk_pos + 2);
    }
    return word;
};

const diacritics_regex = new RegExp(/[~\("`'^)\/\\]+/u);

const diacritics_map = {
    "~": "̆",
    "(": "҅",
    "`": "̀",
    "/": "̄",
    "\\": "̇",
    "\"": "\u0308", //combining diaeresis above
    "\'": "ʼ", //modified letter apostrophe, \u02bc
    "^": "҄", //this is combining cyrillic palatalisation \u0484 and I'm not pleased with it because it has a phonemic meaning in Zogr., whereas Kurz is using it just as a decorative thing, but it is consistent with what Eckhoff's done so Lindstedt must've chosen to use ^ for both things with some reason
    ")": "҆"
};

const applyDiacriticsAfter = (word) => {
    let match_array;
    
    while((match_array = diacritics_regex.exec(word)) !== null) {

        const bullshit = match_array[0];
        const bullshit_pos = word.indexOf(bullshit);

        let word_copy = word;

        word = word_copy.slice(0, bullshit_pos) + word_copy.slice(bullshit_pos + bullshit.length)[0];
        for(const key of bullshit) {
            word += diacritics_map[key];
        }
        word += word_copy.slice(bullshit_pos + bullshit.length + 1);
    }
    return word;
};


const titlo_regex = new RegExp(/^!+/u);

const applyTitlo = (word) => {
    word = word.trim();
    let match_array;
    
    if((match_array = titlo_regex.exec(word)) !== null) {
        const bullshit = match_array[0];
        const titlo_number = bullshit.length;

        word = word.slice(titlo_number);
        //word = word.replaceAll("!", ""); //for testing purposes; 
        const word_length = word.length;

        let titloed_word = "";
        //for now I am just adding them starting from the beginning; there surely is an easy solution for putting them 30% of the way into a word but I can't get it right (we assume the titlo number is variable because it can definitely be at least 2)
        for(const char of word.slice(0, titlo_number)) {
            titloed_word += char + "҃";
        }
        titloed_word += word.slice(titlo_number);

        // const title_start_pos = titlo_number*Math.floor(word_length / (2 *titlo_number));
        // const title_end_pos = title_start_pos + titlo_number - 1;

        // //console.log(titlo_number, word_length, title_start_pos, title_end_pos);
        // let titloed_word = "";
        // for(let i = 0; i < word_length; i++) {
        //     if(title_start_pos <= i+1 && i+1 <= title_end_pos) {
        //         titloed_word += word[i] + "҃";
        //     }
        //     else titloed_word += word[i];
        // }
        word = titloed_word;
    }
    else word = word.replaceAll("!", "");
    return word;
};

const supralinear_regex = new RegExp(/(?<!^!*)!/u);

const proiel_superscript_start = mark_supralinears == "supr" ? "\uF002" : "";
const proiel_superscript_end = mark_supralinears == "supr" ? "\uF102" : "";
//const proiel_superscript_start = mark_supralinears == "supr" ? "$" : "";
//const proiel_superscript_end = mark_supralinears == "supr" ? "@" : "";
const applySupralinears = (word) => {

    if(word == "!⁛" || word == "!:" || word == "!???") {
        word = proiel_superscript_start + word.slice(1) + proiel_superscript_end;
        return word;
    }
    
    word = word.trim();
    let match_array;

    while((match_array = supralinear_regex.exec(word)) !== null) {
        const exclam_pos = match_array.index;
        const supralinear_letter = word.slice(exclam_pos + 1, exclam_pos + 2);
        if(supralinear_letter == "[") {
            const supralinear_bracketed_letter = word.slice(exclam_pos + 1, exclam_pos + 4);
            word = word.slice(0, exclam_pos) + proiel_superscript_start + supralinear_bracketed_letter + word.slice(exclam_pos + 4);
        }
        else word = word.slice(0, exclam_pos) + proiel_superscript_start + supralinear_letter + proiel_superscript_end + word.slice(exclam_pos + 2);
    }
    return word;
}

const cyr_map = new Map([
    //first a few general things
    ["::","⁛"],
    ["-","—"],
    ["{",""],
    ["}",""],
    ["%", ""], //this is used by Lindstedt to mark check-needy parts, but its usage seems batshit so I'm just deleting it for now

    ["ju","ю"],
    ["jO","ѭ"],
    ["je","ѥ"],
    ["jE","ѧ"], //This is the same as Suprasliensis
    ["ja","ꙗ"],

    ["\"e", "ѣ"], //batshit decision

    ["y", "&I"], //I take the decision to keep digraph ꙑ as separate ъі
    ["k","к"],
    ["$","ь"],
    ["n","н"],
    ["I","і"],
    ["i","и"],
    ["J","ꙇ"],
    ["g","г"],
    ["&","ъ"],
    ["r","р"],
    ["o","о"],
    ["w", "ѡ"],
    ["d","д"],
    ["s","с"],
    ["t","т"],
    ["v","в"],
    ["a","а"],
    ["U","ꙋ"], 
    ["u", "ѹ"],//this is the single-letter digraph, kept to make capitalisation and glagoliticisation work, but other TOROT texts use оу here and I do as well when deep-cleaning, so a final decision on the cyrillic representation of this letter has yet to be taken
    ["m","м"],
    ["l","л"],
    ["@","ѣ"], //for some mad reason Lindstedt seems to be using `"e` for jat' in this text
    ["S","ш"],
    ["E","ⱑ"], //Shchekpkin's edition uses a grapheme identical to Glagolitic ⱑ for this, and I'm forced to do the same because the Suprasliensis-style ꙙ seems to actually be used 39 times and Lindstedt transcribes it with "X" see for example fn 1 on p.161 of the pdf edition where Shchepkin calls it "sic"
    ["X", "ꙙ"],
    ["O","ѫ"],
    ["D","ѕ"],
    ["c","ц"],
    ["Z","ж"],
    ["C","ч"],
    ["x","х"],
    ["h", "ⱒ"], //Lindstedt used Latin 'h' for Kurz's "spidery <cha> (p.XI)", and there's a Unicode letter for it now, but no Cyrillic equivalent so I will just use the Glag. for both (Kempgen 2016 suggests a Cyrillic form but it is not a separate Unicode letter)
    ["q","щ"],
    ["G","ꙉ"], //this is different to the ђ letter used in TITUS, but that letter doesn't render differently in the OCS fonts so it looks worse.
    ["T","ѳ"], //this letter looks much more like the edition-grapheme in Bukyvede than the font here
    ["z","з"],
    ["p", "п"],
    ["e", "е"],
    ["b", "б"],
    ["f", "ф"],
    ["Y", "ѵ"], //the grapheme used in the edition (first use p.152 of pdf) looks halfway between the Izhitsa grapheme (ѵ) and regular Cyrillic single у, but Lindstedt in his Supr. transcription table calls it izhica so I'll use izhica as well
    ["X", "ѯ"], //think this is "ksi" letter
    
    
    //<!> immediately before a whole word means just that a titlo is placed somehwere over the word, usually near the middle
    //<!> immediately before a letter in the middle of a word on the other hand means that the letter is supralinear
    
]);

const book_name_map = {
    1 : "MATT",
    2 : "MARK",
    3 : "LUKE",
    4 : "JOHN"
};

const book_longname_map = {
    1 : "Matthew",
    2 : "Mark",
    3 : "Luke",
    4 : "John"
};

const citationPartGenerator = (book, chapter, verse) => {
    return book_name_map[book] + " " + chapter + "." + verse;
};
const subtitleGenerator = (book, chapter) => {
    return book_longname_map[book] + " " + chapter;
};

const toTitleCase = (str) => {
    return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
}

const toCyr = (text) => {
    const cyr_map_iter = cyr_map.entries();
    for(const cyr_map_entry of cyr_map_iter) {
        text = text.replaceAll(cyr_map_entry[0], cyr_map_entry[1]);
    }
    return text;
};

const convertFunction = toCyr;

let converted_text = "";
let csv_text = "torot_word|pos|morph_tag|deep_cleaned|lemma|sentence_no|pres_before|pres_after|text_id|subtitle_id|autotagged|subtitle_short|book_no|chapter|verse|variant_no\n";
let tnt_input_text = "";
let sentence_no = 5500000;
let subtitle_id = 0;
let chapter_prev = 0;

let sqlite_subtitles_text = "";

const non_word_regex = new RegExp(/[⁛҅—¥қғ=:·\.\+\$@£¬\s]+/ug);

const punctuationifyCyrKOC = (text) => {
    return text.replaceAll("коц", "$").replaceAll("к҃оц", "@").replaceAll("коц", "£").replaceAll("⁛", "¬").replaceAll(":", "¥").replaceAll("...", "қ").replaceAll("к҃оц", "ғ");
};
const restoreCyrKOC = (text) => {
    return text.replaceAll("$", "коц").replaceAll("@", "к҃оц").replaceAll("£", "коц").replaceAll("¬", "⁛").replaceAll("¥", ":").replaceAll("қ", "...").replaceAll("ғ", "к҃оц");
};
const punctuationifyGlagKOC = (text) => {
    return text.replaceAll("ⰽⱁⱌ", "$").replaceAll("ⰽ҃ⱁⱌ", "@").replaceAll("ⰽⱁⱌ", "£").replaceAll("ⰽ҃ⱁⱌ", "ғ").replaceAll("⁛", "¬").replaceAll(":", "¥").replaceAll("...", "қ");
};
const restoreGlagKOC = (text) => {
    return text.replaceAll("$", "ⰽⱁⱌ").replaceAll("@", "ⰽ҃ⱁⱌ").replaceAll("£", "ⰽⱁⱌ").replaceAll("ғ", "ⰽ҃ⱁⱌ").replaceAll("¬", "⁛").replaceAll("¥", ":").replaceAll("қ", "...");
};

const punctuationifyKOC = script == "glag" ? punctuationifyGlagKOC : punctuationifyCyrKOC;
const restoreKOC = script == "glag" ? restoreGlagKOC : restoreCyrKOC;

const separateWords = (line, bible_index_arr) => {

    tnt_input_text += "%%"+sentence_no+"\n";
    
    const book = bible_index_arr[0];
    const chapter = bible_index_arr[1];
    const verse = bible_index_arr[2];
    const variant = bible_index_arr[3];
    const citation_part = citationPartGenerator(book, chapter, verse);

    line = punctuationifyKOC(line);
    const chunks = line.split(/\s+/ug);

    const chunks_separated = new Array();
    const pure_dogshit_indices = [];
    for(let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const split_chunk = chunk.split(non_word_regex);
        let chunk_shit_before = "";
        let chunk_shit_after = "";
        let stripped_word = chunk;

        if(split_chunk.length == 2 && split_chunk[0] == "" && split_chunk[1] == "") {
            chunks_separated.push([chunk.match(non_word_regex)[0], "", ""]);
            pure_dogshit_indices.push(i);
            continue;
        }
        chunk.matchAll(non_word_regex).forEach(match => {
            if(match.index == 0) {
                chunk_shit_before = match[0];
                stripped_word = stripped_word.slice(chunk_shit_before.length);
            }
            else if(match.index + 1 == chunk.length) {
                chunk_shit_after = match[0];
                stripped_word = stripped_word.slice(0, stripped_word.length - chunk_shit_after.length);
            }
        });
        chunks_separated.push([stripped_word, chunk_shit_before, chunk_shit_after]);
    }

    let final_array = [["", "", ""]];
    
    let final_array_index = 0;
    let i = 0;
    let dogshit;
    while(dogshit = pure_dogshit_indices.includes(i) == true) {
        final_array[0][1] += " " + chunks_separated[i][0];
        i++
    }
    if(chunks_separated[i] !== undefined) {
        final_array[0][0] = chunks_separated[i][0];
        final_array[0][1] += " " + chunks_separated[i][1];
        final_array[0][2] = chunks_separated[i][2];
        i++;
    }
    final_array[0][1] = final_array[0][1];
    while(i < chunks_separated.length) {
        if(pure_dogshit_indices.includes(i)) {
            final_array[final_array_index][2] += " " + chunks_separated[i][0];
        }
        else {
            final_array[final_array_index][2] += " ";
            final_array_index++;
            final_array.push([chunks_separated[i][0], chunks_separated[i][1], chunks_separated[i][2]]);
        }

        i++;
    }
    final_array[final_array_index][2] = final_array[final_array_index][2].trimEnd();
    
    if(chapter != chapter_prev) {
        sqlite_subtitles_text += "10|" + subtitleGenerator(book, chapter) + "\n";
        subtitle_id++;
    }

    for(const word_arr of final_array) {
        const actual_word = word_arr[0];
        const presentation_before = restoreKOC(word_arr[1]);
        const presentation_after = restoreKOC(word_arr[2]);
        const cleaned_actual_word = deepCleanChuWord(actual_word);

        
        csv_text += actual_word/*.replaceAll("\uF002", "$").replaceAll("\uF102", "@")*/ + "|||" + cleaned_actual_word + "||" + sentence_no + "|" + presentation_before + "|" + presentation_after + "|10|" + subtitle_id + "|1|" + citation_part + "|" + book + "|" + chapter + "|" + verse + "|" + variant + "\n";

        tnt_input_text += cleaned_actual_word + "\n";
    }
    chapter_prev = chapter;
    sentence_no++;
};

async function convertASCII() {

    const ascii_file = readline.createInterface({input: ascii_file_stream});
    
    let subtitle_no = 0;
    let book_code_prev = 1;
    let chap_code_prev = 1;
    let verse_code_prev = 1;
    let line_code_prev = 0;
    let variant_code_prev = 0;
    const verse_text_variants = new Array();
    verse_text_variants.push([]);

    for await(const line of ascii_file) {
        //let cyr_line = line.replaceAll("w!t", "ѿ").replaceAll("o!t", "оⷮ");
        if(line.trim() == "") continue;
        let converted_line = "";
        let cyr_line = line;
        const verse_index = cyr_line.slice(0, 7);
        cyr_line = convertFunction(cyr_line.slice(7));
        let capitalised_line = "";
        for(const word of cyr_line.split(" ")) {
            capitalised_line += applyCapitalisation(word).trim() + " ";
        }
        capitalised_line = capitalised_line.trim();
        
        capitalised_line = applyDiacriticsAfter(capitalised_line);


        
        let supralinear_line = "";
        for(const word of capitalised_line.split(" ")) {
            supralinear_line += applySupralinears(word).trim() + " ";
        }
        supralinear_line = supralinear_line.trim();

        let titloed_line = "";
        for(const word of supralinear_line.split(" ")) {
            titloed_line += applyTitlo(word).trim() + " ";
        }
        titloed_line = titloed_line.trim();

        converted_line += titloed_line + "\n";

        converted_line = converted_line.replaceAll(".", "·").replaceAll(",", "·").replaceAll("[", "(").replaceAll("]", ")"); //in Kurz this is a middle-comma, but no similar Unicode symbol exists so I'm replacing with middle-dot;
        converted_line = converted_line.replaceAll("?", "."); //presumably the fullstops in the edition represent unknown characters, so maybe keeping it as ? would be better
    //the plus sign is used for a bunch of weird shit like horizontal lines inbetween dots, not worth bothering to change it

        const book_code = Number(verse_index.slice(0, 1));
        const chap_code = Number(verse_index.slice(1,3));
        const verse_code = Number(verse_index.slice(3,5));
        const line_code = Number(verse_index.slice(5,6));
        const variant_code = Number(verse_index.slice(6, 7));
        let new_verse = false;

        if(book_code != book_code_prev || chap_code != chap_code_prev || verse_code != verse_code_prev) new_verse = true;

        //console.log(line, new_verse, verse_text_variants);
        debugger;
        if(chap_code != chap_code_prev) {
            subtitle_no++;
        }
        if(new_verse) {
            verse_text_variants.forEach((variant, i) => {
                const full_verse_text = variant.join(" ").trim();
                converted_text += full_verse_text + "\n";
                
                separateWords(full_verse_text, [book_code_prev, chap_code_prev, verse_code_prev, i+1]); //for the word-per-line master-file

            });
            verse_text_variants.length = 0;
            verse_text_variants.push([converted_line.trim()]);
        }
        else if(verse_text_variants[variant_code] === undefined) {
            verse_text_variants.push([converted_line.trim()]);
        }
        else {
            verse_text_variants[variant_code].push(converted_line.trim());
        }
        
        

        book_code_prev = book_code;
        chap_code_prev = chap_code;
        verse_code_prev = verse_code;
        line_code_prev = line_code;
        variant_code_prev = variant_code;
    }
    verse_text_variants.forEach((variant, i) => {
        const full_verse_text = variant.join(" ").trim();
        converted_text += full_verse_text + "\n";

        separateWords(full_verse_text, [book_code_prev, chap_code_prev, verse_code_prev, i+1]); //for the word-per-line master-file

    });
    ascii_file.close();
}

const chu_deepClean_map = {
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

const deepCleanChuWord = (dirty_word) => {
    for(const key in chu_deepClean_map) {
        dirty_word = dirty_word.replaceAll(key, chu_deepClean_map[key]);
    }
    return dirty_word;
};

await convertASCII();
fs.writeFileSync("savv_verse_per_line.txt", converted_text);
fs.writeFileSync("savv_full_words.csv", csv_text);
fs.writeFileSync("tnt_input_savv.tt", tnt_input_text);
fs.writeFileSync("savv_subtitles.csv", sqlite_subtitles_text);
