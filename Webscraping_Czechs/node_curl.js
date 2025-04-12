#!/usr/bin/node


const fs = require('node:fs');

const http = require('http');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const json_ocs = new Array();
const json_eng_trans = new Array();

let record_id = 18080;

const iterations = Number(process.argv[2]);

function makeRequest(record_id) {
    const req_url = "http://castor.gorazd.org:8080/gorazd/show_record_id;jsessionid=CC2E5311CE705F8E1F7780DD9095BF4F?value="+record_id+"&xslFile=0&fields=&_=1732327903110";
    http.get(req_url, dict_response => {
        dict_response.setEncoding('utf8'); //forces the data to come back as strings instead of node.js Buffer objects, which prevents some possibly problems of weird characters being read as random ? bytes

        let response_data_string = "";

        dict_response.on('error', (e) => {
            console.log(e);
        });

        dict_response.on('data', response_data => {
            response_data_string += response_data;
        });
        
        dict_response.on('end', () => {
            //console.log("Reached end of response-data");

            const json = JSON.parse(response_data_string.trim());

            
            const dict_no = json.response.result.Dictionary;
            const eng_trans_arr = json.response.result.EnTrl;
            const ocs_headwords_arr = json.response.result.HeaderAll;

            
            console.log("Dict no: ", dict_no);
        
            if(eng_trans_arr != undefined && ocs_headwords_arr != undefined && dict_no == 2) {

                const ocs_entry_html = json.response.result.SourceD;
                const ocs_title_html = json.response.result.TitleD;
                const ocs_dict_entry_doc = new JSDOM(ocs_entry_html).window.document;

                //console.log(ocs_entry_html);

                const english_entries = [];
                const ocs_entries = [];
                ocs_entries.push(ocs_headwords_arr);

                let single_english_entry = "";
                let single_ocs_entry = "";

                let english_sub_entry = [];
                let ocs_sub_entry = [];

                let english_sub_entry_count = 0;
                let ocs_sub_entry_count = 0

                let english_wordcount = 0;
                let ocs_wordcount = 0;

                let was_just_in_ocs_entry = false;
                //console.log("Number of p elements: ", ocs_dict_entry_doc.getElementsByTagName("p").length);
                ocs_dict_entry_doc.getElementsByTagName("p")[1].childNodes.forEach(node => {
                    const aip_type = node.getAttribute("aip-type");
                    const aip_subtype = node.getAttribute("aip-subtype");
                    const aip_font = node.getAttribute("aip-font");
                    const aip_style = node.getAttribute("aip-style");
                    const aip_size = node.getAttribute("aip-size");

                    if(aip_type == "text_hesla" && aip_font == "CyrillicaBulgarian10U" && aip_style == "bold" && aip_size == "24") {
                        if(!was_just_in_ocs_entry && single_ocs_entry.length > 0) single_ocs_entry = single_ocs_entry.trim() + "; ";
			            single_ocs_entry += node.textContent + " ";
                        ocs_wordcount++;
                        was_just_in_ocs_entry = true;
                    }
                    else if(ocs_wordcount > 0 && node.textContent.trim() == "|" && aip_type == "text_hesla" && aip_subtype == "moderni_jazyky" && aip_font == "FreeSerif" && aip_style == "normal") {
			ocs_sub_entry.push(single_ocs_entry.trim());
                        single_ocs_entry = "";
                        ocs_wordcount = 0;
                        ocs_sub_entry_count++;
                        was_just_in_ocs_entry = false;
                    }
                    //this bullshit exists to try to deal with sub-entries like `имѧрекъ Cf. имѧ; (прѣжде)реченꙑи, рекомꙑи`, where the Cf. elemeent gets in the way

                    if(aip_type == "anglictina") {
                        english_wordcount++;
                        single_english_entry += node.textContent + " ";
                    }
                    else if(english_wordcount > 0) {
                        //english_sub_entry.push(english_wordcount);
                        english_sub_entry.push(single_english_entry.trim());
                        single_english_entry = "";
                        english_wordcount = 0;
                        english_sub_entry_count++;
                    }

                    if(english_sub_entry_count > 0 && aip_type == "text_hesla" && aip_font == "FreeSerif" && aip_style == "bold") {
                        //this *should* find the numerals which separate multiple full sub-entries, but such are only present if more than one sub-entry exists
                        english_entries.push(english_sub_entry);
                        english_sub_entry = [];
                        if(ocs_sub_entry_count > 0) {
                            ocs_entries.push(ocs_sub_entry);
                            ocs_sub_entry = [];
                        }
                    }   
                });
                english_entries.push(english_sub_entry);
                english_sub_entry = [];
                ocs_entries.push(ocs_sub_entry);
                ocs_sub_entry = [];
        
                json_ocs.push(ocs_headwords_arr);
                json_eng_trans.push(english_entries);

                console.log("found record with id number: ", record_id);
        
            }
            else {
                if(dict_no != 2 && eng_trans_arr == undefined && ocs_headwords_arr == undefined) console.log("Record with id number", record_id, "is from the other dictionary");
                else if(eng_trans_arr == undefined && ocs_headwords_arr == undefined) console.log("Record with id number", record_id, "is from the right dictionary but doesn't contain both an english definition and an ocs head entry");
                
            }
            record_id++;
            if(record_id < 18080 + iterations) makeRequest(record_id);
            else {
                fs.writeFileSync("ocs_dict_headwords.json", JSON.stringify(json_ocs));
                fs.writeFileSync("ocs_dict_engtrans.json", JSON.stringify(json_eng_trans));
            }
        })
    });
}

makeRequest(record_id);
