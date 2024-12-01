#!/usr/bin/node


const fs = require('node:fs');

const https = require('https');



let page_no = 1;

function makeRequest(page_no) {
    const req_url = 'https://www.hf.ntnu.no/SofiaTrondheimCorpus/pdf/izb/izb_'+page_no.toString().padStart(2, '0')+'.pdf';
    https.get(req_url, response => {

        response.setEncoding('binary');

        let pdf_chunks = [];

        response.on('error', (e) => {
            console.log(e);
        });

        console.log("Fetching page number", page_no, "of the Izborniki 1076");

        response.on('data', chunk => {
            pdf_chunks.push(Buffer.from(chunk, 'binary'));
        });
        
        response.on('end', () => {

            let binary_file = Buffer.concat(pdf_chunks);
            fs.writeFileSync(page_no.toString().padStart(2, '0')+"izborniki_1076.pdf", binary_file);

            if(page_no < 14) {
                page_no++;
                makeRequest(page_no);
            }

        })
    });
}

makeRequest(page_no);
