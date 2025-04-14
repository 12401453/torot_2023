#!/usr/bin/node

const fs = require('node:fs');

const https = require('https');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

//const start_url = "https://ru.wiktionary.org/w/index.php?title=%D0%9A%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F:%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B5_%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%BC%D1%8B&pageuntil=%D0%B0%D0%B1%D0%B1%D1%80%D0%B5%D0%B2%D0%B8%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C#mw-pages";
const start_url = "https://ru.wiktionary.org/w/index.php?title=%D0%9A%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F:%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B5_%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%BC%D1%8B&from=%D0%BE%D0%B6%D0%B8";

const whole_dict_json = new Array();
let whole_dict_csv = "";

const punct_shit = /[-\s,—\)\()]+/;

async function startScraping() {
    const contents_page = await domifyPage(start_url);
    const links_block = contents_page.getElementById("mw-pages");
    let next_page_url = "";
    let page_links;
    const entry_links = new Array();
    const entry_names = new Array();
    if(links_block) {
        for(const category of links_block.querySelector("div > div").getElementsByClassName("mw-category-group")) {
            
            Array.from(category.getElementsByTagName("li")).forEach(li => {
                entry_names.push(li.textContent);
                entry_links.push(li.firstElementChild.href);
            });
        };



        page_links = links_block.querySelectorAll(":scope > a");
        for(const a_href of page_links) {
            if(a_href.textContent == "Следующая страница") {
                next_page_url = "https://ru.wiktionary.org" + a_href.href;
                break;
            }
        }

        const entries_per_page = entry_names.length;

        // (async () => {for(let i = 0; i < entries_per_page; i++) {
        //     const entry_page = await domifyPage("https://ru.wiktionary.org" + entry_links[i]);
        //    scrapeEntry(entry_page, entry_names[i]);

        // }
        // })();

        // for(let i = 0; i < entries_per_page; i++) {
        //     const entry_page = await domifyPage("https://ru.wiktionary.org" + entry_links[i]);
        //     scrapeEntry(entry_page, entry_names[i]);
        // }

        const promises = entry_links.map((link, i) => scrapeURL("https://ru.wiktionary.org" + link, entry_names[i]));
        await Promise.all(promises);
    }
    else {
        console.log("Error finding page-links");
    }
    fs.writeFileSync("russian_lemmas.json", JSON.stringify(unordered_words_arr));
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
    return new Promise((resolve, reject) => {
        const request = https.get(url, response => {
            response.setEncoding('utf-8');
            let response_data_string = "";

            response.on('error', e => reject(e));

            response.on('data', piece_of_data => response_data_string += piece_of_data);

            response.on('end', () => resolve(response_data_string));
        });

        request.on('error', e => reject(e));
    })
}

async function domifyPage(url, retries = 5) {
    for(let i = 0; i < retries; i++) {
        try {
            const html_string = await getHTML(url);
            return new JSDOM(html_string).window.document;
        }
        catch (e) {
            if(/*e.code == "ECONNRESET" && */i < retries - 1) {
                console.log(`Connection reset, retry attempt no. ${i + 2}...`);
                await sleep(1000);
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

    const row1_cell2_text = normaliseString(table_rows[0].getElementsByTagName("th")[1].textContent);
    if(first_cell.textContent.trim() == "" && (row1_cell2_text == "наст." || row1_cell2_text == "будущ.")) return "verb";
    
    if(first_cell.textContent.trim() == "падеж") {
        
        const num_rows = table_rows.length;
        if(normaliseString(table_rows[num_rows - 1].querySelector("td").textContent) == "Кратк. форма") return "adjective";
        if(normaliseString(table_rows[1].querySelector("th") != null && table_rows[1].querySelector("th").textContent) == 'муж. р.') return "pronominal";
        if(normaliseString(table_rows[0].getElementsByTagName("th")[1].textContent) == 'ед. ч.') return "noun";

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
        if(header_elem !== null && header_elem.id == "Русский") russian_section = section;
    });

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