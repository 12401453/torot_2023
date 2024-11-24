#!/usr/bin/node


const fs = require('node:fs');

const http = require('http');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const json_ocs = new Array();
const json_eng_trans = new Array();

let record_id = 1;

function makeRequest(record_id) {
    const req_url = "http://castor.gorazd.org:8080/gorazd/show_record_id;jsessionid=CC2E5311CE705F8E1F7780DD9095BF4F?value="+record_id+"&xslFile=0&fields=&_=1732327903110";
    http.get(req_url, dict_response => {

        let response_data_string = "";

        dict_response.on('error', (e) => {
            console.log(e);
        });

        dict_response.on('data', response_data => {
            response_data_string += response_data;
        });
        
        dict_response.on('end', () => {
            console.log("Reached end of response-data");

            const json = JSON.parse(response_data_string.trim());

            const eng_trans_arr = json.response.result.EnTrl;
            const ocs_headwords_arr = json.response.result.HeaderAll;

            //const ocs_entry_html = json.response.result.SourceD;
            //const ocs_title_html = json.response.result.TitleD;
            const dict_no = json.response.result.Dictionary;

            //const ocs_dict_entry_doc = new JSDOM(ocs_entry_html).window.document;

        
            if(eng_trans_arr != undefined && ocs_headwords_arr != undefined && dict_no == 1) {
        
                json_ocs.push(ocs_headwords_arr);
                json_eng_trans.push(eng_trans_arr);

                console.log("found record with id number: ", record_id);
        
            }
            else {
                if(dict_no != 1 && eng_trans_arr == undefined && ocs_headwords_arr == undefined) console.log("Record with id number", record_id, "is from the other dictionary");
                else if(eng_trans_arr == undefined && ocs_headwords_arr == undefined) console.log("Record with id number", record_id, "is from the right dictionary but doesn't contain both an english definition and an ocs head entry");
                
            }
            record_id++;
            if(record_id < 50) makeRequest(record_id);
            else {
                fs.writeFileSync("ocs_dict_headwords.json", JSON.stringify(json_ocs));
                fs.writeFileSync("ocs_dict_engtrans.json", JSON.stringify(json_eng_trans));
            }
        })
    });
}

makeRequest(record_id);

