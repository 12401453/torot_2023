#!/usr/bin/node

const zlib = require("node:zlib");
const fs = require('node:fs');
const readline = require('node:readline');
const { json } = require("node:stream/consumers");

const zstd_decompr = zlib.createZstdDecompress();
const zst_input = fs.createReadStream("eng_ru_raw_lemmas.jsonl.zst");

zst_input.pipe(zstd_decompr);

const rl = readline.createInterface({input: zstd_decompr});

let line_no = 0;
let lemmas_csv = "lemma|pos\n";
let kept_lemmas_csv = "lemma|pos\n";
let excluded_lemmas = "lemma|pos\n";
let kept_lemmas_and_forms = "lemma|pos|forms\n";

const containsOnly = (arr, test_string) => {
    if(arr === undefined) return false;
    return (arr[0] === test_string && arr.length === 1);
};

const shit = /[†*\^⟐▽¹²⁸]/g;
const irredeemable = /[ѣ\.іA-Za-z]|ъ$/;

const excluded_poses = [
    'character',
    'prefix',
    'name',
    'symbol',
    'punct',
    'infix',
    'phrase',
    'proverb',
    'suffix',
    'interfix',
    'combining_form',
    'prep_phrase'
];

const chars_set = new Set();

rl.on('line', line => {
    line_no++;

    const json_entry = JSON.parse(line);

    let both_category_arrays = new Array();
    if(json_entry.categories) {
        both_category_arrays = both_category_arrays.concat(json_entry.categories);
    }
    if(json_entry.senses[0]?.categories) {
        both_category_arrays = both_category_arrays.concat(json_entry.senses[0]?.categories);
    }

    if(/\s+/.test(json_entry.word) || json_entry.word.includes(".") || both_category_arrays.includes("Russian initialisms") || both_category_arrays.includes("Russian pre-1918 spellings") || both_category_arrays.includes("Russian abbreviations") || excluded_poses.includes(json_entry.pos)) {
        excluded_lemmas += json_entry.word + "|" + json_entry.pos + "\n";
        //continue;
    }
    else {
        kept_lemmas_csv += json_entry.word + "|" + json_entry.pos + "\n";

        kept_lemmas_and_forms += json_entry.word + "|" + json_entry.pos + "|";

        if(!json_entry.forms){
            console.log(json_entry.word);
            kept_lemmas_and_forms += "\n";
        }
        else {

            const forms_set = new Set();
            for(const form_obj of json_entry.forms) {
                if(form_obj.tags?.includes("table-tags") || form_obj.tags?.includes("inflection-template") || form_obj.tags?.includes("class") || form_obj.tags?.includes("romanization") || form_obj.tags?.includes("error-unknown-tag") || form_obj.form == "-" || /\s+/.test(form_obj.form) || containsOnly(form_obj.tags, "perfective") || containsOnly(form_obj.tags, "imperfective")) {

                }
                else {
                    let form = form_obj.form.replaceAll(shit, "").replaceAll("(по)", "");
                    if(irredeemable.test(form)) {
                        form = "";
                        //console.log(form);
                    }
                    for(const char of form) {
                        chars_set.add(char);
                    }
                    if(form.trim() != "") forms_set.add(form);
                }
            }

            let forms_str = "";
            for(const form of Array.from(forms_set)) {
                forms_str += form + ",";
            }
            kept_lemmas_and_forms += forms_str.slice(0, -1) + "\n";
        }         
    }
});

rl.on('close', () => {
    fs.writeFileSync("excluded_en_ru_lemmas.csv", excluded_lemmas);
    fs.writeFileSync("kept_en_ru_lemmas.csv", kept_lemmas_csv);
    fs.writeFileSync("kept_lemmas_and_forms.csv", kept_lemmas_and_forms);

    fs.writeFileSync("chars_used.txt", JSON.stringify(Array.from(chars_set)));
});