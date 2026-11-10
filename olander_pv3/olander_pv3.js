#!/usr/bin/node

const {DatabaseSync} = require('node:sqlite');
const fs = require('node:fs');

const partial_PV3_regex = /[ьię][kgx]/;

const chu_db = new DatabaseSync("chu.db");

const query = chu_db.prepare('SELECT lemma_ocs, lemma_lcs, stem_lcs, pv2_3_lemma FROM lemmas WHERE lemma_lcs != \'\'');

let result_csv = "lemma_ocs|lemma_lcs|stem_lcs|pv2_3_lemmas\n"

for(const row of query.iterate()) {
    if(partial_PV3_regex.test(row.stem_lcs.replaceAll("ḱ", "Q").replaceAll("x́", "W"))) {
        
        result_csv += `${row.lemma_ocs}|${row.lemma_lcs}|${row.stem_lcs}|${row.pv2_3_lemma}\n`;      
        //console.log(row.stem_lcs, row.lemma_ocs, row.pv2_3_lemma);
    }
}

query.close();

fs.writeFileSync("olander_output_andfinal.csv", result_csv);


