#!/usr/bin/node

const fs = require('node:fs');

const https = require('https');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const start_url = "https://ru.wiktionary.org/w/index.php?title=%D0%9A%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F:%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B5_%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%BC%D1%8B&pageuntil=%D0%B0%D0%B1%D0%B1%D1%80%D0%B5%D0%B2%D0%B8%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C#mw-pages";

const whole_dict_json = new Array();
let whole_dict_csv = "";

const punct_shit = /[\s,—\)\()]+/;

https.get(start_url, response => {
    response.setEncoding('utf-8');

    let response_data_string = "";
    response.on('error', e => console.log(e));

    response.on('data', piece_of_data => response_data_string += piece_of_data);

    response.on('end', () => {
        const contents_page = new JSDOM(response_data_string).window.document;
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

            console.log(entry_names);
            console.log(entry_links);
            console.log("Next page url: ", next_page_url);
        }
        else {
            console.log("Error finding page-links");
        }
    })

});

const scrapeEntry = (entry_page) => {
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

    for(const morph_table of morph_tables) {
        morph_table.querySelectorAll("td").forEach(td => {
            const td_bgcolor = td.getAttribute("bgcolor");
            if(td_bgcolor == null || td_bgcolor == "#ffffff") {
                td.childNodes.forEach(node => {
                    if(node.nodeType == 3 || node.nodeName == "A" || (node.nodeName == "SPAN" && node.getAttribute("typeof") != "mw:Entity")) {
                       !punct_shit.test(node.textContent) && console.log(node.textContent);
                    }
                    // else if(node.nodeName == "A") console.log(node.textContent);
                    // else if(node.nodeName == "SPAN" && node.getAttribute("typeof") != "mw:Entity") {
                    //     console.log(node.textContent);
                    // }
                })
            }
            }); 
    }
};
