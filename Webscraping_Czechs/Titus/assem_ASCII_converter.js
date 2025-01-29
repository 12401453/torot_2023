#!/usr/bin/node
import fs from 'fs';
import readline from 'readline';

const script = process.argv[2];

const ascii_file_stream = fs.createReadStream("assemanianus_ASCII_encoded_version.txt");
ascii_file_stream.on('error', () => {
    console.log("first file doesn't exist");
    process.exit(-1);
});

const capitalisation_regex = new RegExp(/^\*[\/`~\(]*/u);
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

const punctuation_regex = new RegExp(/[~\(`\/]+/u);

const punctuation_map = {
    "~": "̆",
    "(": "҅",
    "`": "̀",
    "/": "̄"
};

const applyPunctuationAfter = (word) => {
    let match_array;
    
    while((match_array = punctuation_regex.exec(word)) !== null) {

        const bullshit = match_array[0];
        const bullshit_pos = word.indexOf(bullshit);

        let word_copy = word;

        word = word_copy.slice(0, bullshit_pos) + word_copy.slice(bullshit_pos + bullshit.length)[0];
        for(const key of bullshit) {
            word += punctuation_map[key];
        }
        word += word_copy.slice(bullshit_pos + bullshit.length + 1);
    }
    return word;
};

const cyr_map = new Map([
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
    ["x","х"],
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
    ["h", "x"], //one instance of хлъмъ spelt with Latin 'h', that is also present in the TITUS Cyrillic and Glag.
    ["q","щ"],
    ["G","ꙉ"], //this is different to the ђ letter used in TITUS, but that letter doesn't render differently in the OCS fonts so it looks worse.
    ["T","ѳ"],
    ["z","з"],
    ["p", "п"],
    ["e", "е"],
    ["b", "б"],
    ["f", "ф"],

    //<!> immediately before a whole word means just that a titlo is placed somehwere over the word, usually near the middle
    //<!> immediately before a letter in the middle of a word on the other hand means that the letter is supralinear
    
]);

const toCyr = (text) => {
    const cyr_map_iter = cyr_map.entries();
    for(const cyr_map_entry of cyr_map_iter) {
        text = text.replaceAll(cyr_map_entry[0], cyr_map_entry[1]);
        // for(const word of text.split(" ")) {
        //     if()
        // }
    }
    return text;
}

// const applyPunctuation = (text) => {
//     const punct_map_iter = punctuation_map.entries();

//     for(const punct_map_entry of punct_map_iter) {
//         text = text.replaceAll(punct_map_entry[0], punct_map_entry[1]);
//     }

//     let slash_pos;
//     while((slash_pos = text.indexOf("/")) != -1) {
//         text = text.slice(0, slash_pos) + text.slice(slash_pos + 1, slash_pos + 2) + "̄" + text.slice(slash_pos + 2);
//     }
//     return text;
// }


let converted_text = "";
async function convertASCII(script="cyr") {

    const ascii_file = readline.createInterface({input: ascii_file_stream});

    for await(const line of ascii_file) {
        const cyr_line = toCyr(line.slice(7)) + "\n";
        let capitalised_line = "";
        for(const word of cyr_line.split(" ")) {
            capitalised_line += applyCapitalisation(word).trim() + " ";
        }
        capitalised_line = capitalised_line.trim();
        
        capitalised_line = applyPunctuationAfter(capitalised_line);

        converted_text += capitalised_line + "\n";
    }

}

await convertASCII();
fs.writeFileSync("assem_converted.txt", converted_text);