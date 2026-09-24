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
