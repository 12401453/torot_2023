#!/usr/bin/node


const fs = require('node:fs');

const https = require('https');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const verses = new Array();

let cyr_text = "";
let glag_text = "";

const makeRequest = (record_id, script, text) => {
    const req_url = 'https://titus.uni-frankfurt.de/texte/etcs/slav/aksl/asseman/assem'+ String(record_id).padStart(3, '0') +  '.htm'
    https.get(req_url, page_response => {

        page_response.setEncoding('utf8'); //forces the data to come back as strings instead of node.js Buffer objects, which prevents some possibly problems of weird characters being read as random ? bytes

        let response_data_string = "";
        //const response_array = new Array();
        // const response_buffer = new ArrayBuffer(1000000);
        // const response_buffer_view = new DataView(response_buffer);

        page_response.on('error', (e) => {
            console.log(e);
        });

        page_response.on('data', response_data => {
            response_data_string += response_data;
            //response_array.push(response_data);
        });
        
        page_response.on('end', () => {
            //console.log("Reached end of response-data");

            const document = new JSDOM(response_data_string).window.document;

            let selector_str = script == "glag" ? "span#rgabx16" : "span#cyab16";

            const book_header = document.getElementById("h2");
            const chapt_header = document.getElementById("h3");

            if(book_header !== null) {
                text += "%%%%%%" + book_header.textContent + "\n";
            }
            if(chapt_header !== null) {
                text += "%%%%" + chapt_header.textContent + "\n";
            }

            document.querySelectorAll(selector_str).forEach((verse, i) => {
                
                let verse_number = "";
                if(i == 0) {
                    //the html on the first chapter of each book is slightly different on the first verse, so I'm just going to manually select the first verse from all the pages
                    verse_number = document.querySelector("#h4").textContent;
                }
                else {
                    if(script == "cyr") {
                        // console.log(i, verse.outerHTML);
                        verse_number = verse.previousElementSibling.querySelector("#h4").textContent;
                    }
                    else {
                        // console.log(i, verse.previousElementSibling.previousElementSibling.previousElementSibling);
                        verse_number = verse.previousElementSibling.previousElementSibling.previousElementSibling.querySelector("#h4").textContent;
                    }
                }
                //  
                
                text += "%%" + verse_number + "\n";
                text += verse.textContent + "\n";
            });
            //text += "\n";

            if(record_id < 91) {
                makeRequest(record_id+1, script, text);
            }
            else {
                fs.writeFileSync(`assem_${script}_with_headers.txt`, text);
                console.log(script, "scraping finished");
            }
            
            
            
        });
    });
};

makeRequest(1, "glag", glag_text);
console.log("glag scraping started");
makeRequest(1, "cyr", cyr_text);
console.log("cyr scraping started");