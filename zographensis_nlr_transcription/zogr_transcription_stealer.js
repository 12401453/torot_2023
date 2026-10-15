#!/usr/bin/node

const fs = require('node:fs');
const https = require("node:https");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function asyncGetHTML(url, code_list) {
    return new Promise((FINSIHED, FAILED) => {
        https.get(url, response => {
            const chunks = [];
            response.on('data', (chunk) => {
                chunks.push(chunk);
            });
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                console.log(
                    code_list,
                    (buffer.length / 1024).toFixed(1),
                    "KB"
                );
                FINSIHED([buffer.toString("utf-8").trim(), code_list]);
            });
        }
    )});
}

async function cunt_main(csv_array, text_array) {   

    const replace_brackets_regex = /\([^)]*\)/g;


    const requests = [];
    for(let code_list = 1; code_list < 608; code_list++){
        const req_url = "https://expositions.nlr.ru/ex_manus/Zograph_Gospel/_Project/page_Manuscripts.php?izo=D2D92E28-51F6-4085-B3D7-B2AAB8DA9BDD&nCodeList=" + String(code_list);

        requests.push(asyncGetHTML(req_url, code_list));

        if(code_list % 20 == 0) {
            console.log("PROCESSING 20 PAGES");
            const page_pairs = await Promise.all(requests);

            for(const page_pair of page_pairs) {
                const zogr_page = new JSDOM(page_pair[0]).window.document;
                const code_list = page_pair[1];

                const page_name = zogr_page.getElementById("list_nav").querySelector("select").options[code_list - 1].textContent;

                let page_text = "";
                let page_text_no_brackets = "";
                const translit = zogr_page.getElementById("translit").querySelector("pre").childNodes.forEach(node => {
                    if(node.nodeName == "#text") {
                        page_text += node.textContent;
                        page_text_no_brackets += node.textContent.replaceAll(replace_brackets_regex, "");
                    }
                    else if(node.nodeName == "BR") {
                        page_text += "\n";
                        page_text_no_brackets += "\n";
                    }
                });
                
                let nlr_transcription = page_name + "\n" + page_text + "\n\n";
                let nlr_no_brackets = page_name + "\n" + page_text_no_brackets + "\n\n";
                let nlr_csv = code_list + "|" + page_name + "|\"" + page_text + "\"|\"" + page_text_no_brackets + "\"\n";

                csv_array.push({entry_no: code_list, entry: nlr_csv});
                text_array.push({entry_no: code_list, entry: nlr_transcription, entry_no_brackets: nlr_no_brackets});
            }
            requests.length = 0;
        }
        
    }

    
};

(async() => {

    let nlr_transcription = "";
    let nlr_transcription_no_brackets = "";
    let nlr_csv = "code_list|page_name|page_text|page_text_no_brackets\n";
    const csv_array = [];
    const text_array = [];
    
    await cunt_main(csv_array, text_array);
    console.log("CUNT");
    csv_array.sort((a, b) => a.entry_no - b.entry_no);
    text_array.sort((a, b) => a.entry_no - b.entry_no);

    for(const csv_entry of csv_array) {
        nlr_csv += csv_entry.entry;
    }
    for(const text_entry of text_array) {
        nlr_transcription += text_entry.entry;
        nlr_transcription_no_brackets += text_entry.entry_no_brackets;
    }

    fs.writeFileSync("zogr_nlr.txt", nlr_transcription);
    fs.writeFileSync("zogr_nlr_no_brackets.txt", nlr_transcription_no_brackets);
    fs.writeFileSync("zogr_nlr.csv", nlr_csv);
})();

