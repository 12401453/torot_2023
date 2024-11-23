#!/usr/bin/node


const fs = require('node:fs');

const https = require('http');




const json_ocs = new Array();
const json_eng_trans = new Array();

let record_id = 1;

function makeRequest(record_id) {
    const req_url = "http://castor.gorazd.org:8080/gorazd/show_record_id;jsessionid=CC2E5311CE705F8E1F7780DD9095BF4F?value="+record_id+"&xslFile=0&fields=&_=1732327903110";
    https.get(req_url, dict_response => {

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
            const ocs_headwords_arr = json.response.result.HeaderAll
        
            if(eng_trans_arr != undefined && ocs_headwords_arr != undefined) {
        
                json_ocs.push(ocs_headwords_arr);
                json_eng_trans.push(eng_trans_arr);

                console.log("found record with id number: ", record_id);
        
            }
            else {
                console.log("Record with id number", record_id, "did not contain either any english_trans or any ocs headwords");
            }
            record_id++;
            if(record_id < 10) makeRequest(record_id);
            else {
                fs.writeFileSync("ocs_dict_headwords.json", JSON.stringify(json_ocs));
                fs.writeFileSync("ocs_dict_engtrans.json", JSON.stringify(json_eng_trans));
            }
        })
    });
}

makeRequest(record_id);

