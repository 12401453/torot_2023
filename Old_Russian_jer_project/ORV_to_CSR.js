const cyr_map = new Array([
  ["a", "а"],
  ["b", "б"],

]);

const tsy_regex = /ц[иы]/;
const zd_regex = /[сз]д/;
const zhd_regex = /[жш]д/;
//includes palatal letters because Russian seems to reapply this rule after they have hardened (молодёжь etc.)
//I'm gonna apply the Jer Shift before everything else so don't need to care about strong-jer > /o/
const e_o_regex = /[ščžcj]e(?:[tŕrpsšdfgkx́ḱǵlĺzžxčvbcʒśnńm\++](?:[aouyъ]|$)|$)/;
const bv_regex = /bv/;

const consonants_regex = /[tŕrpsšdfgkx́ḱǵlĺzžxčcʒśvbnńm]+/;
const vowels_regex = /[iyuьъṛṝḷḹeěoäaü]/;
const starting_i_regex = /^jь/g;

const reverseStr = (str) => {
  let reversed = "";
  for(let i = str.length; i > 0; i--) {
    reversed += str[i-1];
  }
  return reversed;
};

const applyHavlik = (orv_form) => {
  orv_form = orv_form.replaceAll("ěa", "ä");
  orv_form = orv_form.replaceAll(starting_i_regex, "i");
  const lngth = orv_form.length;
  let strong_position = false;

  let jer_shifted_backwards = "";

  for(let i = lngth; i > 0; i--) {
    const letter = orv_form[i - 1];
    if(vowels_regex.test(letter)) {
      if(letter == "ь" || letter == "ъ") {
        
        if(strong_position) {
          jer_shifted_backwards += letter == "ь" ? "e" : "o";
          strong_position = false;
        }
        else {
          jer_shifted_backwards += letter == "ь" ? "\'" : "";
          strong_position = true;
        }
      }
      else {
        jer_shifted_backwards += letter;
        strong_position = false;
      }
    }
    else {
      jer_shifted_backwards += letter;
    }
  }
  return reverseStr(jer_shifted_backwards);
};