#!/usr/bin/node

const fs = require('node:fs');

const axios = require('axios');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const start_url = "https://ru.wiktionary.org/w/index.php?title=%D0%9A%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F:%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B5_%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%BC%D1%8B&pageuntil=%D0%B0%D0%B1%D0%B1%D1%80%D0%B5%D0%B2%D0%B8%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C#mw-pages";

let failure_csv = "";

const punct_shit = /[-\s,—\)\()\/△\.]+/;

async function startScraping() {  
    let next_page_url = start_url;
    let page_links;
    let page_count = 1;
    if(!fs.existsSync("ru_wiktionary_data_rescrape")) {
        fs.mkdirSync("ru_wiktionary_data_rescrape");
    }
    while(next_page_url != "LAST PAGE"){
        const contents_page = await domifyPage(next_page_url);
        const links_block = contents_page.getElementById("mw-pages");
        const entry_links = new Array();
        const entry_names = new Array();
        if(links_block) {
            for(const category of links_block.querySelector("div > div").getElementsByClassName("mw-category-group")) {
                
                Array.from(category.getElementsByTagName("li")).forEach(li => {
                    if(li.firstElementChild.href != undefined) {
                        entry_names.push(li.textContent);
                        entry_links.push(li.firstElementChild.href);
                    }
                    else {
                        console.log("an entry on the contents-page was some stupid redirect bollocks, skipping");
                    }
                });
            };

            page_links = links_block.querySelectorAll(":scope > a");
            next_page_url = "LAST PAGE";
            for(const a_href of page_links) {
                if(a_href.textContent == "Следующая страница") {
                    next_page_url = "https://ru.wiktionary.org" + a_href.href;
                    break;
                }
            }

            const entries_per_page = entry_names.length;

            const promises = entry_links.map((link, i) => scrapeURL("https://ru.wiktionary.org" + link, entry_names[i]));
            await Promise.all(promises);
        }
        else {
            console.log("Error finding page-links");
        }
        page_count++;

        if(page_count % 10 === 0) {
            fs.writeFileSync(`ru_wiktionary_data_rescrape/russian_lemmas_pg${String(page_count - 9).padStart(5, "0")}-${String(page_count).padStart(5, "0")}.json`, JSON.stringify(unordered_words_arr, null, 2));
            unordered_words_arr.length = 0;


            fs.appendFileSync("failed_scrapes_2_.csv", failure_csv);
            failure_csv = "";
        }
    }
    fs.writeFileSync(`ru_wiktionary_data_rescrape/russian_lemmas_pg1521-${String(page_count).padStart(5, "0")}.json`, JSON.stringify(unordered_words_arr, null, 2));
    fs.appendFileSync("failed_scrapes_2_.csv", failure_csv);
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeURL(url, entry_name) {
    const entry_page = await domifyPage(url);
    scrapeEntry(entry_page, entry_name);
}

async function getHTML(url) {
    const headers = { "User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
      };
    try {
        const request = await axios.get(url, {headers});
        return request.data;
    }
    catch(e) {
        throw e;
    }

}

async function domifyPage(url, retries = 500) {
    for(let i = 0; i < retries; i++) {
        try {
            const html_string = await getHTML(url);
            return new JSDOM(html_string).window.document;
        }
        catch (e) {
            if(/*e.code == "ECONNRESET" && */i < retries - 1) {
                console.log(e.code,`retry attempt no. ${i + 2}...`);
                await sleep(2500 + Math.floor(Math.random()*1000));
                if(i%10 == 0) {
                    console.log("Wiktionary is rate-limiting us, back off for 30 secs...");
                    await sleep(30000);
                }
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
};

const normaliseString = (str) => {
    if(str) return str.trim().replaceAll(' ', ' '); //non-breaking space, not normal space
    else return null;
};

const getInflectionType = (tbody) => {
    const first_cell = tbody.querySelector("th");
    const table_rows = tbody.getElementsByTagName("tr");

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
