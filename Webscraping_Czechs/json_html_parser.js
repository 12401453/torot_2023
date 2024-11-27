const ocs_dict_result = new Array();
const ocs_result_header = new Array();
const ocs_result_entry = new Array();

const parser = new DOMParser();

const json = JSON.parse(response_data_string.trim());

const eng_trans_arr = json.response.result.EnTrl;
const ocs_headwords_arr = json.response.result.HeaderAll;

const ocs_entry_html = json.response.result.SourceD;

const ocs_entry = parser.parseFromString(ocs_entry_html, "text/html");

const english_entries = [];
let single_english_entry = "";
let english_sub_entry = [];
let english_sub_entry_count = 0;
let english_wordcount = 0;
ocs_entry.getElementsByTagName("p")[1].childNodes.forEach(node => {
    const aip_type = node.getAttribute("aip-type");
    const aip_font = node.getAttribute("aip-font");
    const aip_style = node.getAttribute("aip-style");
 

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
        //this *should* find the numerals which separate multiple full sub-entries, but such are only present if more than than sub-entry exists
        english_entries.push(english_sub_entry);
        english_sub_entry = [];
    }   
});
english_entries.push(english_sub_entry);
english_sub_entry = [];


ocs_result_header.push(ocs_headwords_arr);


ocs_dict_result.push(ocs_result_header, ocs_result_entry);