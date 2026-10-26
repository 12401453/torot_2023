#!/usr/bin/node
const manuscriptMap = {
  "\uE001": "А",
  "\uE003": "В",
  "\uE004": "Г",
  "\uE005": "Д",
  "\uE007": "Є",
  "\uE00C": "Ꙁ",
  "\uE00D": "И",
  "\uE00E": "І",
  "\uE012": "К",
  "\uE013": "Л",
  "\uE015": "М",
  "\uE017": "Н",
  "\uE019": "О",
  "\uE01F": "С",
  "\uE020": "Т",
  "\uE026": "Ф",
  "\uE02A": "Ѿ",
  "\uE043": "Ѳ",
  "\uE051": "а",
  "\uE052": "б",
  "\uE053": "в",
  "\uE054": "г",
  "\uE055": "д",
  "\uE056": "е",
  "\uE058": "ж",
  "\uE059": "ѕ",
  "\uE05C": "ꙁ",
  "\uE05D": "и",
  "\uE05E": "ı",
  "\uE062": "к",
  "\uE063": "л",
  "\uE064": "ꙥ",
  "\uE065": "м",
  "\uE067": "н",
  "\uE069": "о",
  "\uE06C": "п",
  "\uE06D": "р",
  "\uE06F": "с",
  "\uE070": "т",
  "\uE071": "ѹ",
  "\uE076": "ф",
  "\uE077": "х",
  "\uE078": "ѡ",
  "\uE07A": "ѿ",
  "\uE07B": "ц",
  "\uE07C": "ч",
  "\uE07D": "ш",
  "\uE07F": "щ",
  "\uE080": "ъ",
  "\uE081": "ꙑ",
  "\uE083": "ы",
  "\uE085": "ь",
  "\uE086": "ѣ",
  "\uE088": "ю",
  "\uE089": "ꙗ",
  "\uE08A": "ѥ",
  "\uE08B": "ѧ",
  "\uE08E": "ѩ",
  "\uE08F": "ѫ",
  "\uE090": "ѭ",
  "\uE091": "ѯ",
  "\uE093": "ѳ",
  "\uE094": "у",
  "\uE0A3": "ⷡ",
  "\uE0A4": "ⷢ",
  "\uE0B7": "ⷩ",
  "\uE0BF": "ⷭ",
  "\uE0C0": "ⷮ",
  "\uE0D6": "ⷺ",
  "\uE201": "ʾ",
  "\uE203": "ʿ",
  "\uE222": "̈",
  "\uE401": "҃",
  "\uE402": "꙯",
  "\uE405": "҇",
  "\uE410": "҇",
  "\uE411": "҇",
  "\uE415": "҇",
  "\uE52F": "⸱",
  "\uE53D": "⁘",
  "\uE544": ",",
  "\uE560": "∽",
  "\uE58A": "🞤",
  "\uE002": "Б",
  "\uE006": "Е",
  "\uE01C": "П",
  "\uE01D": "Р",
  "\uE02B": "Ц",
  "\uE05A": "ꙅ",
  "\uE072": "ꙋ",
  "\uE075": "у",
  "\uE0A2": "ⷠ",
  "\uE0A5": "ⷣ",
  "\uE0A6": "ⷷ",
  "\uE0A8": "ⷤ",
  "\uE0B2": "ⷦ",
  "\uE0B3": "ⷧ",
  "\uE0B5": "ⷨ",
  "\uE0B9": "ⷪ",
  "\uE0C7": "ⷯ",
  "\uE0CB": "ⷰ",
  "\uE0CC": "ⷱ",
  "\uE0E3": "ⷴ",
  "\uE400": "҃",
  "\uE566": "⩫",
  "\uE0BD": "\u2DEC",
  "\uE095": "\u0475",
  "\uE00A": "Ꙅ",
  "\uE021": "Ѹ",
  "\uE025": "У",
  "\uE02C": "Ч",
  "\uE030": "Ъ",
  "\uE033": "Ы",
  "\uE035": "Ь",
  "\uE038": "Ю",
  "\uE039": "Ꙗ",
  "\uE03B": "Ѧ",
  "\uE03F": "Ѫ",
  "\uE06B": "ҁ",
  "\uE092": "ѱ",
  "\uE0A1": "ⷶ",
  "\uE0AC": "ⷥ",
  "\uE0AD": "ꙵ",
  "\uE0AE": "ꙶ",
  "\uE0BC": "ⷫ",
  "\uE0C1": "ⷪ ꙷ",
  "\uE0CD": "ⷲ",
  "\uE0CF": "ⷳ",
  "\uE0D0": "ꙸ",
  "\uE0D5": "ꙺ",
  "\uE0D8": "ⷻ",
  "\uE0D9": "ⷼ",
  "\uE0DA": "ꚟ",
  "\uE0DB": "ⷽ",
  "\uE413": "҇",
  "\uE000": " ",
  "\uE008": "Ж",
  "\uE009": "Ѕ",
  "\uE022": "Ꙋ",
  "\uE027": "Х",
  "\uE028": "Ѡ",
  "\uE02D": "Ш",
  "\uE031": "Ꙑ",
  "\uE036": "Ѣ",
  "\uE03A": "Ѥ",
  "\uE03E": "Ѩ",
  "\uE042": "Ѱ",
  "\uE057": "є",
  "\uE073": "ꙋ",
  "\uE07E": "шт",
  "\uE0BA": "ⷪ",
  "\uE0C5": "ꙷ",
  "\uE0DE": "ѩ",
  "\uE0DF": "ⷾ",
  "\uE109": "ни",
  "\uE10F": "тв",
  "\uE113": "ти",
  "\uE117": "ть",
  "\uE17F": "ꙗ",
  "\uE202": "˃",
  "\uE204": "˂",
  "\uE205": "̆",
  "\uE206": "̑",
  "\uE208": "˅",
  "\uE20B": "̾",
  "\uE220": "̇",
  "\uE221": "̊",
  "\uE224": "̓",
  "\uE228": "̋",
  "\uE231": "ʿ",
  "\uE233": "̆",
  "\uE237": "ʾ",
  "\uE23F": "́",
  "\uE403": "҇",
  "\uE412": "҇",
  "\uE529": "∽",
  "\uE534": "⁘",
  "\uE537": ":",
  "\uE538": "⁖",
  "\uE539": ":⸱",
  "\uE53A": "⸱⸱⸱",
  "\uE53C": "⸪",
  "\uE580": "̷",
  "\uE582": "﹨",
  "\uE5A0": "∽",
  "\uE5BB": "⊂",
  "\uE5BE": "∋",
  "\u00A8": "\u2022",
  "\uE023": "\uA64A", // Ꙋ
  "\uE0C2": "\u2DF9", // ⷹ
  "\uE0D3": "\uA679", // ꙹ
  "\uE0DD": "\u2DFD", // ⷽ
  "\uE01A": "\u047A", // Ѻ
  "\uE045": "\u0474", // Ѵ
  "\uE06A": "\u047B", // ѻ
  "\uE0C9": "\u2DEA", // ⷪ
  "\uE0CA": "\uA67B\u2DEE", // ꙻ ⷮ //I've taken the intervening space out
  "\uE19E": "\u0469", // ѩ
  "\uE570": "\u20D3", // ⃓
  "\uE590": "\u205C", // ⁜
  "\uE592": "\u205C", // ⁜
  "\uE594": "\u203B", // ※
  "\uE5BD": "\u2ABD", // ⪽
  "\uE5BF": "\u2208", // ∈
  "\uE014": "\uA664", // Ꙥ
  "\uE018": "\u041D", // Н
  "\uE068": "\u043D", // н
  "\uE0C8": "\uA67B", // ꙻ
  "\uE010": "Ꙇ",
  "\uE011": "Ђ",
  "\uE02E": "ШТ",
  "\uE02F": "Щ",
  "\uE041": "Ѯ",
  "\uE060": "ꙇ",
  "\uE061": "ђ",
  "\uE082": "ъи",
  "\uE0A7": "ꙴ",
  "\uE0A9": "ˢ",
  "\uE0B0": "ꙶ",
  "\uE0C6": "ꚞ",
  "\uE0CE": "ⷲ ⷮ",
  "\uE0D1": "ꙹ",
  "\uE0D2": "ꙹ",
  "\uE0E0": "ⷿ",
  "\uE406": "̅",
  "\uE416": "҇",
  "\uE418": "҇",
  "\uE41A": "҇",
  "\uE41B": "҇",
  "\uE567": "—:",
};

function manuscriptsToUnicode(text) {
  return text.replace(/[\uE000-\uF8FF\u00A8]/g, ch => manuscriptMap[ch] ?? ch);
}

function unknownManuscriptCharacters(text, unknown_codepoint_set, unknown_codepoint_map) {
  const unknown_codepoint_strings = [...new Set([...text].filter(ch =>
    /[\uE000-\uF8FF\u00A8]/.test(ch) && !(ch in manuscriptMap)
  ))].map(ch => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);

  for(const str of unknown_codepoint_strings) {
    unknown_codepoint_set.add(str);
    unknown_codepoint_map.set(str, text);
  }
}

// if (typeof module !== 'undefined') {
//   module.exports = { manuscriptMap, manuscriptsToUnicode, unknownManuscriptCharacters };
// }


// const fs = require('node:fs');
// const readline = require('readline');
if(process.argv.length < 3) {
  console.log("Must provide filepath");
  process.exit(0);
}
const bespoke_encoded_path = process.argv[2];

import fs from "node:fs";
import readline from "readline";


const input_lines = readline.createInterface({input: fs.createReadStream(bespoke_encoded_path)});

let utf8_conversion = "";
const unknown_codepoint_set = new Set();
const unknown_codepoint_map = new Map();
for await(const line of input_lines) {
  utf8_conversion += manuscriptsToUnicode(line) + "\n";
  unknownManuscriptCharacters(line, unknown_codepoint_set, unknown_codepoint_map);
}

fs.writeFileSync(bespoke_encoded_path.slice(0, -4)+"_utf8_conversion.txt", utf8_conversion);
console.log(unknown_codepoint_set);

for(const pair of unknown_codepoint_map) {
  console.log(pair[1]);
}
