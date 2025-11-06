#!/usr/bin/node

const fs = require('node:fs');

const https = require('https');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const {URL} = require('url');


if(process.argv.length < 3) {
    console.log("Must specify test-page url");
    process.exit(1);
}
const test_page_url = process.argv[2];

let failure_csv = "";

const punct_shit = /[-\s,—\)\()\/△\.]+/;

async function startScraping() {  
        const entry_name = decodeURIComponent(new URL(test_page_url).pathname.slice(6));
        await scrapeURL(test_page_url, entry_name); 
        
        fs.writeFileSync(`test_page.json`, JSON.stringify(unordered_words_arr, null, 2));
        unordered_words_arr.length = 0;

        fs.appendFileSync("test_page_failures.csv", failure_csv);
        failure_csv = "";

    //fs.writeFileSync("russian_lemmas.json", JSON.stringify(unordered_words_arr, null, 2));
    //fs.writeFileSync("failed_scrapes.csv", failure_csv);
}

async function processLemmas(entry_links) {
    for(const entry_link of entry_links) {
        const entry_page = await domifyPage("https://ru.wiktionary.org" + entry_link);
        scrapeEntry(entry_page);
    }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeURL(url, entry_name) {
    const entry_page = await domifyPage(url);
    scrapeEntry(entry_page, entry_name);
}

async function getHTML(url) {
    const parsed_url = new URL(url);
    return new Promise((resolve, reject) => {
        const request = https.get({protocol:parsed_url.protocol, hostname:parsed_url.hostname, path:parsed_url.pathname, headers:{"User-Agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}}, response => {

            
            if(response.statusCode !== 200) {
                reject(new Error(`https.get() did not return status-code 200, but ${response.statusCode}`));
            }
            
            response.setEncoding('utf-8');
            let response_data_string = "";

            response.on('error', e => reject(e));
            

            response.on('data', piece_of_data => response_data_string += piece_of_data);

            response.on('end', () => resolve(response_data_string));
        });

        request.on('error', e => reject(e));
    });
}

async function domifyPage(url, retries = 500) {
    for(let i = 0; i < retries; i++) {
        try {
            const html_string = await getHTML(url);
            return new JSDOM(html_string).window.document;
        }
        catch (e) {
            if(/*e.code == "ECONNRESET" && */i < retries - 1) {
                console.log(e.message,`retry attempt no. ${i + 2}...`);
                await sleep(500 + Math.floor(Math.random()*1000));
                continue;
            }
            
            throw e;
        }
    }
}

class UnorderedWord {
    constructor(lemma_form) {
        this.lemma = lemma_form;
        this.pos = "";

        this.inflections = [];
    }
}


class VerbInflections {
    constructor() {
        this.lemma = "";
        this.pos = "verb";

        this.present = ["", "", "", "", "", ""];
        this.past = ["", "", "", ""];
        this.imper = ["", "", ""];
        this.prap = "";
        this.pap = "";
        this.ger_pres = "";
        this.ger_past = "";
        this.prp_pp = "";
        this.ppp = "";
    }
};
class NounInflections {
    constructor() {
        this.lemma = "";
        this.pos = "noun";

        this.sing = [];
        this.plural = [];
    }
};
class AdjInflections {
    constructor() {
        this.lemma = "";
        this.pos = "adjective";

        this.sing = [];
        this.plural = [];
        this.shorts = [];
    }
};
class PronInflections {
    constructor() {
        this.lemma = "";
        this.pos = "pronominal";

        this.sing = [];
        this.plural = [];
    }
};
class Uninflected {
    constructor() {
        this.lemma = "";
        this.pos = "uninflected";
    }
}
class UnclearInflections {
    constructor() {
        this.lemma = "";
        this.pos = "unclear";

        this.forms = [];
    }
}

const normaliseString = (str) => {
    if(str) return str.trim().replaceAll(' ', ' '); //non-breaking space, not normal space
    else return null;
} 

const getInflectionType = (tbody) => {
    const first_cell = tbody.querySelector("th");
    const table_rows = tbody.getElementsByTagName("tr");

    //wiktionary seems to have changed so that now on most verbs there is only one <th> element here, so `table_rows[0].getElementsByTagName("th")[1]` is undefined
    const first_row_header_cells = table_rows[0].getElementsByTagName("th");

    if(first_row_header_cells.length > 1) {
        const row1_cell2_text = normaliseString(table_rows[0].getElementsByTagName("th")[1].textContent);
        if(first_cell.textContent.trim() == "" && (row1_cell2_text == "наст." || row1_cell2_text == "будущ." || row1_cell2_text == "наст./будущ.")) {
            return "verb";
        }
    }
    else if(first_row_header_cells.length == 1) {
        const first_row_header_text = normaliseString(first_cell.textContent);
        if(first_row_header_text == "Будущее время" || first_row_header_text == "Настоящее время" || first_row_header_text == "Настоящее/будущее время") {
            return "verb";
        }
    }
    
    if(first_cell.textContent.trim() == "падеж") {
        
        const num_rows = table_rows.length;
        const td_shortform_cell = table_rows[num_rows - 1].querySelector("td");
        const th_shortform_cell = table_rows[num_rows - 1].querySelector("th");
        if(normaliseString(td_shortform_cell.textContent) == "Кратк. форма") {
            return "adjective";
        }
        if(th_shortform_cell && normaliseString(table_rows[num_rows - 1].querySelector("th").textContent) == "Кратк. форма") {
            return "adjective";
        }
        if(normaliseString(table_rows[1].querySelector("th") != null && table_rows[1].querySelector("th").textContent) == 'муж. р.') {
            return "pronominal";
        }
        if(normaliseString(table_rows[0].getElementsByTagName("th")[1].textContent) == 'ед. ч.') {
            return "noun";
        }

        return "unclear";
    }
    return "unclear";

};

let inflection_type_str = "";

const scrapeEntry = (entry_page, entry_name) => {
    let russian_section = "";
    entry_page.querySelectorAll(".mw-parser-output > section").forEach( section => {
        //if(section.querySelector(".mw-heading.mw-heading1 > h1").id == "Русский") console.log("Found russian");
        const header_elem = section.querySelector(".mw-heading.mw-heading1 > h1");
        if(header_elem !== null && header_elem.id == "Русский") {
            russian_section = section;
        }
    });
    if(russian_section == "") {
        console.log("Scraper failed on", entry_name, "because it thinks there's no Russian section on the page. Sometimes the contents-page entries will be false.");
        failure_csv += entry_name + "\n";
        return;
    }

    const page_lemmas = [];
    const morph_tables = [];

    if(russian_section.querySelector("section > div.mw-heading.mw-heading2") !== null) {
        russian_section.querySelectorAll(":scope > section").forEach(section => page_lemmas.push(section));
    }
    else page_lemmas.push(russian_section);

    for(const page_lemma of page_lemmas) {
        //this doesn't work for pronouns because the tables for them are retarded and indistinguishable from loads of other shite
        page_lemma.querySelectorAll(".morfotable.ru").forEach(section => {
            const tbody = section.querySelector("tbody");
            morph_tables.push(tbody); //even if null we add it so the index aligns with the page_lemmas index
        })
    }

    if(morph_tables.length == 0) {
        const unordered_word = new UnorderedWord(entry_name);
        unordered_word.pos = "uninflected";
        unordered_words_arr.push(unordered_word);

        console.log(unordered_word.lemma, unordered_word.pos);
    }
    else for(const morph_table of morph_tables) {
        const unordered_word = new UnorderedWord(entry_name);
        const inflections_set = new Set();
        morph_table.querySelectorAll("td").forEach(td => {
            const td_bgcolor = td.getAttribute("bgcolor");
            if(td_bgcolor == null || td_bgcolor == "#ffffff") {
                td.childNodes.forEach(node => {
                    if(node.nodeType == 3 || node.nodeName == "A" || (node.nodeName == "SPAN" && node.getAttribute("typeof") != "mw:Entity")) {
                       !punct_shit.test(node.textContent) && inflections_set.add(node.textContent);
                    }
                })
            }
            });
        const inflection_type = getInflectionType(morph_table);
        unordered_word.pos = inflection_type;
        unordered_word.inflections = Array.from(inflections_set);
        unordered_words_arr.push(unordered_word);

        console.log(unordered_word.lemma, unordered_word.pos);
    }
};

const unordered_words_arr = new Array();
startScraping();
