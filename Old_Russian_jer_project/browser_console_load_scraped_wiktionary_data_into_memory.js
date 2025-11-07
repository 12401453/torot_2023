const cyr_map = new Map([

    ["а́", "а"],
    ["е́", "е"],
    ["и́", "и"],
    ["о́", "о"],
    ["у́", "у"],
    ["я́", "я"],
    ["ю́", "ю"],
    ["ё", "е"],
    ["ы́", "ы"]
  
  ]);

const deStressDownCase = (word) => {

    for(const pair of cyr_map) {
        word = word.toLocaleLowerCase().replaceAll(pair[0], pair[1]);
    }
    return word;
};




const scraped_ru = new Array();
const scraped_ru_matches = new Array();
const csr_matches = new Array();

fetch("csr_matches.json")
.then(response => {
    return response.json();
})
.then(response => {
    response.forEach(entry => csr_matches.push(entry));
});

for(let i = 10; i < 1521; i+=10) {

    const filename = `ru_wiktionary_data/russian_lemmas_pg${String(i - 9).padStart(5, "0")}-${String(i).padStart(5, "0")}.json`;
    
    fetch(filename)
    .then((response) => {
    //alert("first response");
        return response.json();
    })
    .then(response => {
        response.forEach(entry => {
            scraped_ru.push(entry);
            if(csr_matches.includes(deStressDownCase(entry.lemma))) {
                scraped_ru_matches.push(entry);
            }
        });
    });

}
fetch("ru_wiktionary_data/russian_lemmas_pg1521-01526.json")
.then(response => {
    return response.json();
})
.then(response => {
    response.forEach(entry => {
        scraped_ru.push(entry);
        if(csr_matches.includes(deStressDownCase(entry.lemma))) {
            scraped_ru_matches.push(entry);
        }
    });
    

});

