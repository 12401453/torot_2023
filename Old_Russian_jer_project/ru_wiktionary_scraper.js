

let russian_section = "";
document.querySelectorAll(".mw-parser-output > section").forEach( section => {
    //if(section.querySelector(".mw-heading.mw-heading1 > h1").id == "Русский") console.log("Found russian");
    const header_elem = section.querySelector(".mw-heading.mw-heading1 > h1");
    if(header_elem !== null && header_elem.id == "Русский") russian_section = section;
});

const page_lemmas = [];
const morph_tables = [];

if(russian_section.querySelector("section > div.mw-heading.mw-heading2") !== null) {
    russian_section.querySelectorAll(":scope > section").forEach(section => page_lemmas.push(section));
}
else page_lemmas.push(russian_section);

for(const page_lemma of page_lemmas) {
    //this doesn't work for pronouns because the tables for them are retarded and indistinguishable from loads of other shite
    page_lemma.querySelectorAll(".morfotable.ru").forEach(section => {
        const tbody = section.querySelector("tbody");
        morph_tables.push(tbody); //even if null we add it so the index aligns with the page_lemmas index
    })
}



















const inflection_rows = document.querySelector(".morfotable.ru > tbody").children;
const inflection_table_size = inflection_rows.length;

for(let i = 1; i < inflection_table_size; i++) {


}
