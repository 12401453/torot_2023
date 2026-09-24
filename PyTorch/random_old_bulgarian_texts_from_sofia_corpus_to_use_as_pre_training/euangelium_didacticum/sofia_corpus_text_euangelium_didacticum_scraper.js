#!/usr/bin/node

const fs = require('node:fs');
const https = require("node:https");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const isPrivateUseAreaUnicodePoint = (char) => {
  const codepoint = char.codePointAt(0);

  return(
    (codepoint >= 0XE000 && codepoint <= 0XF8FF) ||
    (codepoint >= 0XF0000 && codepoint <= 0XFFFFF) ||
    (codepoint >= 0X100000 && codepoint <= 0X10FFFF)
  )
};

const privateCodePointReplacements = new Array(
  //pandects of antioch
  [57861, "и"],
  [57857, "ѥ"],
  [57869, "ч"],
  [57362, "҃"], //titlo
  [57860, "И"],
  [57868, "Ч"],
  [58185, "∞"], //some weird curve thing with dots on on the webpage
  [57395, "҇"], //used on the webpage for a stroke over a superscript letter
  [57865, "ꙑ"], //this has a horizontal connecting bar on the website but I can't find a Unicode grapheme like that
  [57873, "ⱑ"], //used like in Savv. for a front-nasal
  [58180, "—"], //this is curvier in Bukyvede
  [57600, "ꙵ"], //first word this occurs in has an incorrect space in it
  [58181, "∞"], //this version has no dots
  [57887, "с"], //this is some batshit looking tilted <e> in the source but the word is surely есть
  [58178, ":~"],
  //yagichev_zlatoust
  [57891, "ы"], //this is like 57865 except with a front-jer
  [57877, "ꙋ"],
  [57875, "ꙩ"],
  [58183, "꠸"], //the online text has a less sharply curving live, but I cba look for that so I'm using the Rupee mark
  [58186, "∞"],
  [57369, "҅"], //the text has both a rough-breathing looking mark and an acute accent, and I'm foresaking the acute
  [57885, "с"], //weird larger-looking <с>, I'm replacing with regular Cyrillic <с>
  [57864, "Ꙑ"], //capitalised version of 57865
  [58184, "—"], //same as 58180 except has a dot above and below
  [57368, "҆"], //same as 57369 except a smooth-breathing; am foresaking the acute again
  [58182, "~"], //looks more like 58180 with a curve at either end and a dot above and below
  //euangelium_didacticum
  [57878, "Ꙋ"]
  // [, ""],
  // [, ""],
  // [, ""],
  // [, ""],
  // [, ""],
  // [, ""],
  // [, ""],
  // [, ""],
  // [, ""],
);

const replacePrivateCodepoints = (str) => {
  for(const pair of privateCodePointReplacements) {
    str = str.replaceAll(String.fromCodePoint(pair[0]), pair[1]);
  }
  return str;
}

(async() => {
  
  const req_url = "https://histdict.uni-sofia.bg/textcorpus/show/doc_154";
  
  https.get(req_url, response => {
    
    const chunks = [];
    
    response.on('data', (chunk) => {
      chunks.push(chunk);
    });

    response.on('end', () => {
      //console.log("ended");
      const response_string = Buffer.concat(chunks).toString("utf-8").trim();
      
      const ocs_dict_entry_doc = new JSDOM(response_string).window.document;
      //console.log("ended");

      const numbered_paragraphs = new Array();
      let csv_text = "page_no|page_text|gloss_thing\n";
      let raw_text = "";
      let pagenum = "2a";
      let paragraph_text = "";
      let weird_gloss_things = "";
      let num_previous_bare_spans = 0;
      let prev_node = "";
      ocs_dict_entry_doc.querySelector(".body").querySelectorAll("p")[1].childNodes.forEach((child, i) => {
        if(child.nodeName == "SPAN") {

          raw_text += replacePrivateCodepoints(child.textContent);
          
        }
        else if(child.nodeName == "BR") {
          raw_text += "\n";
        }
      
      });
      // numbered_paragraphs.push([pagenum, paragraph_text, weird_gloss_things]);

      // const custom_unicodepoint_map = new Map();
      // numbered_paragraphs.forEach(array => {
      //   const fixed_text = replacePrivateCodepoints(array[1]);
      //   const fixed_gloss_thing = replacePrivateCodepoints(array[2]);
      //   csv_text += array[0] + "|" + fixed_text + "|" + fixed_gloss_thing + "\n";

      //   for(const char of fixed_text) {

      //     if(isPrivateUseAreaUnicodePoint(char)) {
      //       if(!custom_unicodepoint_map.has(char.codePointAt(0))) custom_unicodepoint_map.set(char.codePointAt(0), fixed_text);
      //     }
      //   }
      // });
      const custom_unicodepoint_map = new Map();
      for(const word of raw_text.split(/\s+/)) {
        for(const char of word) {
          if(isPrivateUseAreaUnicodePoint(char)) {
            if(!custom_unicodepoint_map.has(char.codePointAt(0))) custom_unicodepoint_map.set(char.codePointAt(0), word);
          }
        }
      }


      fs.writeFileSync("euangelium_didacticum.txt", raw_text);
      console.log(custom_unicodepoint_map);
     
    });

  });
})();


