#!/usr/bin/node

const sax = require('sax');
const fs = require('node:fs');
const readline = require('readline');

const saxParser = sax.createStream(true);

const tag_stack = [];


let annotated = false;

let bool_septuagint = false;



const septuagint_keyed_map = new Map();
const psal_sin_keyed_map = new Map();


saxParser.on('error', (e) => {
    console.log("Error: ", e);
})

saxParser.on('opentag', function(node) {

    if(node.name == "source"){
        if(node.attributes.id == "septuagint") bool_septuagint = true;
        else bool_septuagint = false;

    }
   


    if(node.name == 'sentence') {
        annotated = node.attributes.status == 'unannotated' ? false : true;
    }
    
 
    if(node.name == "token") {
        const text_word = node.attributes.form;
        const tokno_id = node.attributes["id"];
                
        if(text_word != undefined && tokno_id != undefined) {

            const token_id = Number(node.attributes["id"]);
            if(bool_septuagint) {
                septuagint_keyed_map.set(token_id, text_word);
            }
            else {
                psal_sin_keyed_map.set(token_id, text_word);
            }
        
        }
    }
});

saxParser.on('end', () => {

   

    if(bool_septuagint) {
        const xml_stream = fs.createReadStream("psal-sin_aligned_old_version_sentence_removed.xml");
        xml_stream.pipe(saxParser);
    }
    else {
        //process the two maps just written and write out the final .csv file
        console.log(septuagint_keyed_map.size);
        console.log(psal_sin_keyed_map.size);

        readPsalAlignmentFile();
    }


});

async function readPsalAlignmentFile() {
    let psal_alignements_csv = "chu_word,torot_tokno,grc_word,grc_tokno\n";
    const chu_grc_alignment_map = new Map();
    for await(const line of readline.createInterface({input: fs.createReadStream("ps_sin_alignments.csv")})) {
        const row = line.split(",");
        const chu_tokno = Number(row[0]);
        const grc_tokno = row[1] == "NULL" ? 0 : Number(row[1]);

        chu_grc_alignment_map.set(chu_tokno, grc_tokno);
    }

    for(const pair of psal_sin_keyed_map) {
        const chu_tokno = pair[0];
        const chu_word = pair[1];
        let aligned_grc_tokno = chu_grc_alignment_map.get(chu_tokno);
        let grc_word = "";
        if(aligned_grc_tokno != 0) grc_word = septuagint_keyed_map.get(aligned_grc_tokno);
        else aligned_grc_tokno = "";

        psal_alignements_csv += chu_word + "," + chu_tokno + "," + grc_word + "," + aligned_grc_tokno + "\n";
    }
    
    fs.writeFileSync("new_psal_alignments.csv", psal_alignements_csv);
}


const xml_stream = fs.createReadStream("septuagint.xml");
xml_stream.pipe(saxParser);
