#!/usr/bin/node

import fs from 'fs';
import readline from 'readline';

const read_stream1 = fs.createReadStream("assemanianus_untagged_autolemmatised.csv");

const toTitleCase = (str) => {
    return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
}

const convertSubtitle = (citation_part) => {
    let name = citation_part.split(" ")[0];
    let chapter = citation_part.split(" ")[1].split(".")[0];

    if(name == "MATT") name = "Matthew";
    else name = toTitleCase(name);

    return name + " " + chapter;
}

let xml_string = "";

xml_string += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<proiel export-time=\"2024-10-29T23:27:02+01:00\" schema-version=\"2.0\">\n  <annotation>\n    <relations>\n      <value tag=\"adnom\" summary=\"adnominal\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"adv\" summary=\"adverbial\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"ag\" summary=\"agens\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"apos\" summary=\"apposition\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"arg\" summary=\"argument (object or oblique)\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"atr\" summary=\"attribute\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"aux\" summary=\"auxiliary\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"comp\" summary=\"complement\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"expl\" summary=\"expletive\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"narg\" summary=\"adnominal argument\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"nonsub\" summary=\"non-subject (object, oblique or adverbial)\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"obj\" summary=\"object\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"obl\" summary=\"oblique\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"parpred\" summary=\"parenthetical predication\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"part\" summary=\"partitive\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"per\" summary=\"peripheral (oblique or adverbial)\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"pid\" summary=\"Predicate identity\" primary=\"false\" secondary=\"true\"/>\n      <value tag=\"pred\" summary=\"predicate\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"rel\" summary=\"apposition or attribute\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"sub\" summary=\"subject\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"voc\" summary=\"vocative\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"xadv\" summary=\"open adverbial complement\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"xobj\" summary=\"open objective complement\" primary=\"true\" secondary=\"true\"/>\n      <value tag=\"xsub\" summary=\"external subject\" primary=\"false\" secondary=\"true\"/>\n    </relations>\n    <parts-of-speech>\n      <value tag=\"A-\" summary=\"adjective\"/>\n      <value tag=\"Df\" summary=\"adverb\"/>\n      <value tag=\"S-\" summary=\"article\"/>\n      <value tag=\"Ma\" summary=\"cardinal numeral\"/>\n      <value tag=\"Nb\" summary=\"common noun\"/>\n      <value tag=\"C-\" summary=\"conjunction\"/>\n      <value tag=\"Pd\" summary=\"demonstrative pronoun\"/>\n      <value tag=\"F-\" summary=\"foreign word\"/>\n      <value tag=\"Px\" summary=\"indefinite pronoun\"/>\n      <value tag=\"N-\" summary=\"infinitive marker\"/>\n      <value tag=\"I-\" summary=\"interjection\"/>\n      <value tag=\"Du\" summary=\"interrogative adverb\"/>\n      <value tag=\"Pi\" summary=\"interrogative pronoun\"/>\n      <value tag=\"Mo\" summary=\"ordinal numeral\"/>\n      <value tag=\"Pp\" summary=\"personal pronoun\"/>\n      <value tag=\"Pk\" summary=\"personal reflexive pronoun\"/>\n      <value tag=\"Ps\" summary=\"possessive pronoun\"/>\n      <value tag=\"Pt\" summary=\"possessive reflexive pronoun\"/>\n      <value tag=\"R-\" summary=\"preposition\"/>\n      <value tag=\"Ne\" summary=\"proper noun\"/>\n      <value tag=\"Py\" summary=\"quantifier\"/>\n      <value tag=\"Pc\" summary=\"reciprocal pronoun\"/>\n      <value tag=\"Dq\" summary=\"relative adverb\"/>\n      <value tag=\"Pr\" summary=\"relative pronoun\"/>\n      <value tag=\"G-\" summary=\"subjunction\"/>\n      <value tag=\"V-\" summary=\"verb\"/>\n      <value tag=\"X-\" summary=\"unassigned\"/>\n    </parts-of-speech>\n    <morphology>\n      <field tag=\"person\">\n        <value tag=\"1\" summary=\"first person\"/>\n        <value tag=\"2\" summary=\"second person\"/>\n        <value tag=\"3\" summary=\"third person\"/>\n        <value tag=\"x\" summary=\"uncertain person\"/>\n      </field>\n      <field tag=\"number\">\n        <value tag=\"s\" summary=\"singular\"/>\n        <value tag=\"d\" summary=\"dual\"/>\n        <value tag=\"p\" summary=\"plural\"/>\n        <value tag=\"e\" summary=\"singular or plural\"/>\n        <value tag=\"x\" summary=\"uncertain number\"/>\n      </field>\n      <field tag=\"tense\">\n        <value tag=\"p\" summary=\"present\"/>\n        <value tag=\"i\" summary=\"imperfect\"/>\n        <value tag=\"r\" summary=\"perfect\"/>\n        <value tag=\"s\" summary=\"resultative\"/>\n        <value tag=\"a\" summary=\"aorist\"/>\n        <value tag=\"u\" summary=\"past\"/>\n        <value tag=\"l\" summary=\"pluperfect\"/>\n        <value tag=\"f\" summary=\"future\"/>\n        <value tag=\"t\" summary=\"future perfect\"/>\n        <value tag=\"x\" summary=\"uncertain tense\"/>\n      </field>\n      <field tag=\"mood\">\n        <value tag=\"i\" summary=\"indicative\"/>\n        <value tag=\"s\" summary=\"subjunctive\"/>\n        <value tag=\"m\" summary=\"imperative\"/>\n        <value tag=\"o\" summary=\"optative\"/>\n        <value tag=\"n\" summary=\"infinitive\"/>\n        <value tag=\"p\" summary=\"participle\"/>\n        <value tag=\"d\" summary=\"gerund\"/>\n        <value tag=\"g\" summary=\"gerundive\"/>\n        <value tag=\"u\" summary=\"supine\"/>\n        <value tag=\"x\" summary=\"uncertain mood\"/>\n        <value tag=\"y\" summary=\"finiteness unspecified\"/>\n        <value tag=\"e\" summary=\"indicative or subjunctive\"/>\n        <value tag=\"f\" summary=\"indicative or imperative\"/>\n        <value tag=\"h\" summary=\"subjunctive or imperative\"/>\n        <value tag=\"t\" summary=\"finite\"/>\n      </field>\n      <field tag=\"voice\">\n        <value tag=\"a\" summary=\"active\"/>\n        <value tag=\"m\" summary=\"middle\"/>\n        <value tag=\"p\" summary=\"passive\"/>\n        <value tag=\"e\" summary=\"middle or passive\"/>\n        <value tag=\"x\" summary=\"unspecified\"/>\n      </field>\n      <field tag=\"gender\">\n        <value tag=\"m\" summary=\"masculine\"/>\n        <value tag=\"f\" summary=\"feminine\"/>\n        <value tag=\"n\" summary=\"neuter\"/>\n        <value tag=\"p\" summary=\"masculine or feminine\"/>\n        <value tag=\"o\" summary=\"masculine or neuter\"/>\n        <value tag=\"r\" summary=\"feminine or neuter\"/>\n        <value tag=\"q\" summary=\"masculine, feminine or neuter\"/>\n        <value tag=\"x\" summary=\"uncertain gender\"/>\n      </field>\n      <field tag=\"case\">\n        <value tag=\"n\" summary=\"nominative\"/>\n        <value tag=\"a\" summary=\"accusative\"/>\n        <value tag=\"k\" summary=\"nominative or accusative\"/>\n        <value tag=\"o\" summary=\"oblique\"/>\n        <value tag=\"g\" summary=\"genitive\"/>\n        <value tag=\"c\" summary=\"genitive or dative\"/>\n        <value tag=\"e\" summary=\"accusative or dative\"/>\n        <value tag=\"d\" summary=\"dative\"/>\n        <value tag=\"b\" summary=\"ablative\"/>\n        <value tag=\"i\" summary=\"instrumental\"/>\n        <value tag=\"l\" summary=\"locative\"/>\n        <value tag=\"v\" summary=\"vocative\"/>\n        <value tag=\"x\" summary=\"uncertain case\"/>\n        <value tag=\"z\" summary=\"no case\"/>\n      </field>\n      <field tag=\"degree\">\n        <value tag=\"p\" summary=\"positive\"/>\n        <value tag=\"c\" summary=\"comparative\"/>\n        <value tag=\"s\" summary=\"superlative\"/>\n        <value tag=\"x\" summary=\"uncertain degree\"/>\n        <value tag=\"z\" summary=\"no degree\"/>\n      </field>\n      <field tag=\"strength\">\n        <value tag=\"w\" summary=\"weak\"/>\n        <value tag=\"s\" summary=\"strong\"/>\n        <value tag=\"t\" summary=\"weak or strong\"/>\n      </field>\n      <field tag=\"inflection\">\n        <value tag=\"n\" summary=\"non-inflecting\"/>\n        <value tag=\"i\" summary=\"inflecting\"/>\n      </field>\n    </morphology>\n    <information-statuses>\n      <value tag=\"new\" summary=\"new\"/>\n      <value tag=\"kind\" summary=\"kind\"/>\n      <value tag=\"acc_gen\" summary=\"acc-gen\"/>\n      <value tag=\"acc_sit\" summary=\"acc-sit\"/>\n      <value tag=\"acc_inf\" summary=\"acc-inf\"/>\n      <value tag=\"old\" summary=\"old\"/>\n      <value tag=\"old_inact\" summary=\"old-inact\"/>\n      <value tag=\"no_info_status\" summary=\"annotatable (undecided)\"/>\n      <value tag=\"info_unannotatable\" summary=\"unannotatable\"/>\n      <value tag=\"quant\" summary=\"quantifier restriction\"/>\n      <value tag=\"non_spec\" summary=\"non-specific\"/>\n      <value tag=\"non_spec_inf\" summary=\"inferred from non-specific\"/>\n      <value tag=\"non_spec_old\" summary=\"non-specific old\"/>\n    </information-statuses>\n  </annotation>";




async function readAssemFile() {
    
    const assem_file = readline.createInterface({input: read_stream1});

    xml_string += "  <source id=\"assem\" language=\"chu\">\n";
    xml_string += "    <title>Codex Assemanianus</title>\n";
    xml_string += "    <license>CC BY-NC-SA 4.0</license>\n";
    xml_string += "    <license-url>https://creativecommons.org/licenses/by-nc-sa/4.0/</license-url>\n";
    xml_string += "    <annotator>Javascript</annotator>\n";
    xml_string += "    <reviewer>No-one</reviewer>\n";

    xml_string += "    <div>\n";



    let subtitle_no = 0;
    let id = 10000000;
    let sentence_id = 0;

    for await(const line of assem_file) {
        const row = line.split("|");

        const form = row[0];
        const pos = row[1];
        const morphology = row[4];
        const lemma = row[3];
        const presentation_before = row[5];
        const presentation_after = row[6];
        const citation_part = row[9];

        if(sentence_id < Number(row[10])) {
            if(sentence_id > 0) {
                xml_string += "      </sentence>\n";
            }
            
        }

        if(subtitle_no < Number(row[8])) {
            if(subtitle_no > 0) {
                xml_string += "    </div>\n"
            }
            subtitle_no = Number(row[8]);
            xml_string += "    <div>\n      <title>" + convertSubtitle(citation_part) + "</title>\n"
        }

        if(sentence_id < Number(row[10])) {
            sentence_id = Number(row[10]);
            xml_string += "      <sentence id=\"" + sentence_id + "\" status=\"unannotated\">\n";
        }

        xml_string += "        <token id=\"" + id + "\" form=\"" + form + "\" citation-part=\"" + citation_part + "\" lemma=\"" + lemma + "\" part-of-speech=\"" + pos + "\" morphology=\"" + morphology + "\"";
        if(presentation_before.length !== 0) {
            xml_string += " presentation-before=\"" + presentation_before + "\"";
        }
        if(presentation_after.length !== 0) {
            xml_string += " presentation-after=\"" + presentation_after + "\"";
        }
        xml_string += "/>\n";

        id++;

    }

    xml_string += "      </sentence>\n    </div>\n  </source>\n</proiel>";

}

await readAssemFile();
fs.writeFileSync("assem.xml", xml_string);