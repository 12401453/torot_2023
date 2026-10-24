
const manuscriptMap = Object.freeze({
  "\uE051": "а",
  "\uE052": "б",
  "\uE053": "в",
  "\uE054": "г",
  "\uE055": "д",
  "\uE056": "е",
  "\uE058": "ж",
  "\uE05C": "ꙁ",
  "\uE05D": "и",
  "\uE062": "к",
  "\uE063": "л",
  "\uE065": "м",
  "\uE067": "н",
  "\uE069": "о",
  "\uE06C": "п",
  "\uE06D": "р",
  "\uE06F": "с",
  "\uE070": "т",
  "\uE071": "ѹ",
  "\uE077": "х",
  "\uE07B": "ц",
  "\uE07C": "ч",
  "\uE07D": "ш",
  "\uE07F": "щ",
  "\uE080": "ъ",
  "\uE081": "ꙑ",
  "\uE085": "ь",
  "\uE086": "ѣ",
  "\uE088": "ю",
  "\uE089": "ꙗ",
  "\uE08A": "ѥ",
  "\uE08B": "ѧ",
  "\uE402": "꙯"
});

function manuscriptsToUnicode(text) {
  return text.replace(
    /[\uE000-\uF8FF]/g,
    ch => manuscriptMap[ch] ?? ch
  );
}
