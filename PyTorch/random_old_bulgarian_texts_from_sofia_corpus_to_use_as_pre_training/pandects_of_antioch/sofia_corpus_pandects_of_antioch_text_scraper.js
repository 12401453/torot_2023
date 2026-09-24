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
  
  const req_url = "https://kortlandt.nl";
  
  https.get(req_url, response => {
    
    const chunks = [];
    
    response.on('data', (chunk) => {
      chunks.push(chunk);
    });

    response.on('end', () => {
      const response_string = Buffer.concat(chunks).toString("utf-8").trim();
      
      const ocs_dict_entry_doc = new JSDOM(fs.readFileSync("pandects_of_antioch.html")).window.document;

      const numbered_paragraphs = new Array();
      let csv_text = "page_no|page_text|gloss_thing\n";
      let pagenum = "2a";
      let paragraph_text = "";
      let weird_gloss_things = "";
      let num_previous_bare_spans = 0;
      let prev_node = "";
      Array.from(ocs_dict_entry_doc.querySelector(".body").querySelectorAll("p")[1].children).forEach((child, i) => {

        if(child.nodeName == "SPAN") {

          if(child.className == "pagenum" && i > 0) {
            numbered_paragraphs.push([pagenum, paragraph_text.replaceAll("|", "¬"), weird_gloss_things.replaceAll("|", "¬")]);
            pagenum = child.textContent;
            paragraph_text = "";
            weird_gloss_things = "";
          }
          else if(prev_node == "BR") {
            weird_gloss_things = child.textContent;
          }
          else if(child.className != "pagenum") {
            paragraph_text += child.textContent;
          }
          prev_node = "SPAN";
        }
        else if(child.nodeName == "BR") {
          prev_node = "BR";
        }
      
      });
      numbered_paragraphs.push([pagenum, paragraph_text, weird_gloss_things]);

      const custom_unicodepoint_map = new Map();
      numbered_paragraphs.forEach(array => {
        const fixed_text = replacePrivateCodepoints(array[1]);
        const fixed_gloss_thing = replacePrivateCodepoints(array[2]);
        csv_text += array[0] + "|" + fixed_text + "|" + fixed_gloss_thing + "\n";

        for(const char of fixed_text) {

          if(isPrivateUseAreaUnicodePoint(char)) {
            if(!custom_unicodepoint_map.has(char.codePointAt(0))) custom_unicodepoint_map.set(char.codePointAt(0), fixed_text);
          }
        }
      });



      fs.writeFileSync("pandects_of_antioch.csv", csv_text);
      console.log(custom_unicodepoint_map);
     
    });

  });
})();


