#!/usr/bin/node
import fs from 'fs';
import readline from 'readline';

const mark_supralinears = process.argv[3];
let script = process.argv[2];

if(process.argv.length < 3) {
    console.log("Must specify script, either 'cyr' or 'glag'");
}
if(script != "glag" && script != "cyr") {
    console.log("Unrecognised script given, defaulting to Cyrillic...");
    script = "cyr";
}

const ascii_file_stream = fs.createReadStream("assemanianus_ASCII_encoded_version.txt");
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

// const proiel_superscript_start = mark_supralinears == "supr" ? "\uF002" : "";
// const proiel_superscript_end = mark_supralinears == "supr" ? "\uF102" : "";
const proiel_superscript_start = mark_supralinears == "supr" ? "$" : "";
const proiel_superscript_end = mark_supralinears == "supr" ? "@" : "";
const applySupralinears = (word) => {

    if(word == "!⁛") {
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
    ["%", ""],

    ["ju","ю"],
    ["jO","ѭ"],
    ["je","ѥ"],
    ["jE","ѩ"],
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
    ["U","ѵ"], 
    ["u", "ѹ"],//this is the single-letter digraph, kept to make capitalisation and glagoliticisation work, but other TOROT texts use оу here and I do as well when deep-cleaning, so a final decision on the cyrillic representation of this letter has yet to be taken
    ["m","м"],
    ["l","л"],
    ["@","ѣ"],
    ["S","ш"],
    ["E","ѧ"],
    ["O","ѫ"],
    ["D","ѕ"],
    ["c","ц"],
    ["Z","ж"],
    ["C","ч"],
    ["x","х"],
    ["h", "ⱒ"], //Lindstedt used Latin 'h' for Kurz's "spidery <cha> (p.XI)", and there's a Unicode letter for it now, but no Cyrillic equivalent so I will just use the Glag. for both (Kempgen 2016 suggests a Cyrillic form but it is not a separate Unicode letter)
    ["q","щ"],
    ["G","ꙉ"], //this is different to the ђ letter used in TITUS, but that letter doesn't render differently in the OCS fonts so it looks worse.
    ["T","ѳ"],
    ["z","з"],
    ["p", "п"],
    ["e", "е"],
    ["b", "б"],
    ["f", "ф"]
    //<!> immediately before a whole word means just that a titlo is placed somehwere over the word, usually near the middle
    //<!> immediately before a letter in the middle of a word on the other hand means that the letter is supralinear
    
]);

const glag_map = new Map([
    //first a few general things
    ["::","⁛"],
    ["-","—"],
    ["{",""],
    ["}",""],
    ["%", ""],

    ["ju","ⱓ"],
    ["jO","ⱙ"],
    ["je","ѥ"],
    ["jE","ⱗ"],
    ["k","ⰽ"],
    ["$","ⱐ"],
    ["n","ⱀ"],
    ["I","ⰹ"],
    ["i","ⰻ"],
    ["J","ⰺ"],
    ["g","ⰳ"],
    ["&","ⱏ"],
    ["r","ⱃ"],
    ["o","ⱁ"],
    ["w", "ⱉ"],
    ["d","ⰴ"],
    ["s","ⱄ"],
    ["t","ⱅ"],
    ["v","ⰲ"],
    ["a","ⰰ"],
    ["U","ⱛ"], 
    ["u", "ⱆ"],//this is the single-letter digraph, kept to make capitalisation and glagoliticisation work, but other TOROT texts use оу here and I do as well when deep-cleaning, so a final decision on the cyrillic representation of this letter has yet to be taken
    ["m","ⰿ"],
    ["l","ⰾ"],
    ["@","ⱑ"],
    ["S","ⱎ"],
    ["E","ⱔ"],
    ["O","ⱘ"],
    ["D","ⰷ"],
    ["c","ⱌ"],
    ["Z","ⰶ"],
    ["C","ⱍ"],
    ["x","ⱈ"],
    ["h", "ⱒ"], //Lindstedt used Latin 'h' for Kurz's "spidery <cha> (p.XI)", and there's a Unicode letter for it now, but no Cyrillic equivalent so I will just use the Glag. for both (Kempgen 2016 suggests a Cyrillic form but it is not a separate Unicode letter)
    ["q","ⱋ"],
    ["G","ⰼ"], //this is different to the ђ letter used in TITUS, but that letter doesn't render differently in the OCS fonts so it looks worse.
    ["T","ⱚ"],
    ["z","ⰸ"],
    ["p", "ⱂ"],
    ["e", "ⰵ"],
    ["b", "ⰱ"],
    ["f", "ⱇ"]
    
]);

const book_name_map = {
    1 : "MATT",
    2 : "MARK",
    3 : "LUKE",
    4 : "JOHN"
};

const toTitleCase = (str) => {
    return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
}

const toCyr = (text) => {
    const cyr_map_iter = cyr_map.entries();
    for(const cyr_map_entry of cyr_map_iter) {
        text = text.replaceAll(cyr_map_entry[0], cyr_map_entry[1]);
        // for(const word of text.split(" ")) {
        //     if()
        // }
    }
    return text;
};
const toGlag = (text) => {
    const glag_map_iter = glag_map.entries();
    for(const glag_map_entry of glag_map_iter) {
        text = text.replaceAll(glag_map_entry[0], glag_map_entry[1]);
        // for(const word of text.split(" ")) {
        //     if()
        // }
    }
    return text;
};

const convertFunction = script == "glag" ? toGlag : toCyr;

const non_word_regex = new RegExp(/[⁛—:·\)\(\.\+\s\$@]+/ug);

const extractPunct = (line, verse_index) => {
    let processed_text = "";
    let presentation_after = "";
    let presentation_before = "";

    line = line.replaceAll("коц", "$").replaceAll("к҃оц", "@"); //I've checked and this sequence doesn't occur outside of the коц end-of-verse indicator, which is excluded in TOROT texts from the actual words
    const words_array = line.split(non_word_regex);
    const words_array_length = words_array.length;
    
    
    let counter = 0;
    for(const match of line.matchAll(non_word_regex)) {
        if(counter == 0 && words_array[0] == "") {
            presentation_before = match[0].replaceAll("$", "коц").replaceAll("@", "к҃оц");
        }
        else if(counter + 1 == words_array_length && words_array[counter] == "") {
            presentation_before = "";
            presentation_after = match[0].replaceAll("$", "коц").replaceAll("@", "к҃оц");
        }
        else {
            const actual_word = words_array[counter];
            presentation_after = match[0].replaceAll("$", "коц").replaceAll("@", "к҃оц");

            processed_text += actual_word + "|" + presentation_before + "|" + presentation_after;
            presentation_before = "";
        }
        counter++;
    }
    if(words_array[counter] != "") {
        processed_text += words_array[counter] + "||";
    }

    

    processed_text += "10|";


    processed_text += "\n";
    return processed_text;
}

let converted_text = "";
let csv_text = "";
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
            verse_text_variants.forEach(variant => {
                const full_verse_text = variant.join(" ").trim();
                converted_text += full_verse_text + "\n";

            });
            verse_text_variants.length = 0;
            verse_text_variants.push([converted_line.trim()]);
        }
        else if(verse_text_variants[variant_code] === undefined) {
            verse_text_variants.push([converted_line.trim()]);
        }
        else {
            //console.log(variant_code, variant_code_prev);
            //console.log(verse_text_variants);
            verse_text_variants[variant_code].push(converted_line.trim());
        }
        

        book_code_prev = book_code;
        chap_code_prev = chap_code;
        verse_code_prev = verse_code;
        line_code_prev = line_code;
        variant_code_prev = variant_code;
    }
    verse_text_variants.forEach(variant => {
        const full_verse_text = variant.join(" ").trim();
        converted_text += full_verse_text + "\n";

    });
    ascii_file.close();
}

await convertASCII();
fs.writeFileSync("assem_"+script+"_verse_per_line.txt", converted_text);
//fs.writeFileSync("assem_"+script+"_presentation_after_titles.csv", csv_text);
