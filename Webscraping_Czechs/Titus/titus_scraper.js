#!/usr/bin/node


const fs = require('node:fs');

const https = require('https');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const verses = new Array();

let record_id = 91;

const makeRequest = (record_id) => {
    const req_url = 'https://titus.uni-frankfurt.de/texte/etcs/slav/aksl/asseman/assem'+ String(record_id).padStart(3, '0') +  '.htm'
    https.get(req_url, page_response => {

        let response_data_string = "";

        page_response.on('error', (e) => {
            console.log(e);
        });

        page_response.on('data', response_data => {
            response_data_string += response_data;
        });
        
        page_response.on('end', () => {
            //console.log("Reached end of response-data");

            const document = new JSDOM(response_data_string).window.document;

            
            

            console.log(document.getElementById("rgabx16").textContent);
        
            
            
        });
    });
};

makeRequest(record_id);
