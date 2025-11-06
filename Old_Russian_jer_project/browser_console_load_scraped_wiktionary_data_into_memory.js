const scraped_ru = new Array();
for(let i = 10; i < 1521; i+=10) {

    const filename = `ru_wiktionary_data/russian_lemmas_pg${String(i - 9).padStart(5, "0")}-${String(i).padStart(5, "0")}.json`;
    
    fetch(filename)
    .then((response) => {
    //alert("first response");
        return response.json();
    })
    .then(response => {
        response.forEach(entry => scraped_ru.push(entry));
    });

}
fetch("ru_wiktionary_data/russian_lemmas_pg1521-01526.json")
.then(response => {
    return response.json();
})
.then(response => {
    response.forEach(entry => scraped_ru.push(entry));
});

