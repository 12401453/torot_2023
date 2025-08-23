#!/usr/bin/node


const fs = require('node:fs');

const https = require('https');



let page_no = 1;

function makeRequest(page_no) {
    const req_url = 'https://viewer.rsl.ru/api/v1/document/rsl01003546378/page/' + page_no;
    https.get(req_url, response => {

        response.setEncoding('binary');

        let pdf_chunks = [];

        response.on('error', (e) => {
            console.log(e);
        });

        console.log("Fetching page number", page_no, "of the Izborniki 1073");

        response.on('data', chunk => {
            pdf_chunks.push(Buffer.from(chunk, 'binary'));
        });
        
        response.on('end', () => {

            let binary_file = Buffer.concat(pdf_chunks);
            fs.writeFileSync(page_no.toString().padStart(3, '0')+"izborniki_1073.jpeg", binary_file);

            if(page_no < 552) {
                page_no++;
                makeRequest(page_no);
            }

        })
    });
}

makeRequest(page_no);
