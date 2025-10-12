#!/usr/bin/node

const fs = require('node:fs');

const https = require('https');
const http = require('http');

const axios = require('axios');
//const {https} = require('follow-redirects');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const {URL} = require('url');

const start_url = "https://ru.wiktionary.org/w/index.php?title=%D0%9A%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F:%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B5_%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%BC%D1%8B&pageuntil=%D0%B0%D0%B1%D0%B1%D1%80%D0%B5%D0%B2%D0%B8%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C#mw-pages";

// const local_url = "http://localhost:6100/texts";

// http.get(local_url, (res) => {

// });

//const start_url = "https://ru.wiktionary.org/w/index.php?title=%D0%9A%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F:%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B5_%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%BC%D1%8B&pagefrom=%D0%BA%D1%80%D0%B0%D1%85%D0%BC%D0%B0%D0%BB%D0%B8%D1%82%D1%8C#mw-pages"; //from крахмалить

const whole_dict_json = new Array();
let failure_csv = "";

const punct_shit = /[-\s,—\)\()△\.]+/;

const entry_links = new Array();
const entry_names = new Array();

async function getHTML(url) {
    try {
        const request = await axios.get(url);
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
                await sleep(500 + Math.floor(Math.random()*1000));
                continue;
            }
            
            throw e;
        }
    }
}

async function startScrapingPageLinks() {  
    let next_page_url = start_url;
    let page_links;
    let page_count = 0;
    while(next_page_url != "LAST PAGE"){
        const contents_page = await domifyPage(next_page_url);
        const links_block = contents_page.getElementById("mw-pages");
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

        }
        else {
            console.log("Error finding page-links");
        }
        page_count++;

        if(page_count % 10 === 0) {
            console.log(page_count);
        }
    }
}

startScrapingPageLinks();