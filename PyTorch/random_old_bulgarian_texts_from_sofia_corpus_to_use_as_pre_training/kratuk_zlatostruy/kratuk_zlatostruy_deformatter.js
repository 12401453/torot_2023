#!/usr/bin/node

const fs = require('node:fs');

const lines = fs.readFileSync("kratuk_zlatostruy.txt", {encoding: "utf8"}).split("\n");


let word_joined_text = "";
let need_to_join_lines = false;
for(const line of lines) {
  if(/[0-9]/.test(line[0])) continue;

  const ends_on_hyphen = line.slice(-1) == "-";

  let current_line = ends_on_hyphen ? line.slice(0, -1) : line;

  if(need_to_join_lines) word_joined_text += current_line;
  else word_joined_text += "\n" + current_line;

  need_to_join_lines = ends_on_hyphen;

}

fs.writeFileSync("word_joined_kratuk_zlatostruy.txt", word_joined_text);



