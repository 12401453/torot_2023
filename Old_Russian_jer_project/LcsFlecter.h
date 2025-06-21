#include <vector>
#include <array>
#include <set>
#include <sstream>
#include <iostream>
#include <string>
#include <fstream>
#include <unordered_map>
#include <map>
#include <cstring>
#include <unordered_set>

#define NOUN true
#define VERB false

typedef std::map<int, std::string> inner_map;

struct Inflection {
    int desinence_ix;
    std::string flected_form;
};

struct Lemma {
    std::string stem;
    std::string conj_type;
    bool noun_verb;
};

class LcsFlecter {
    public:
        LcsFlecter(Lemma lcs_lemma={"gord", "masc_o", NOUN}) : m_active_endings(lcs_lemma.noun_verb ? m_noun_endings : m_verb_endings), m_noun_verb(lcs_lemma.noun_verb) {
            setConjType(lcs_lemma.conj_type);
            setStem(lcs_lemma.stem);
        };

        LcsFlecter(bool noun_verb) : m_active_endings(noun_verb ? m_noun_endings : m_verb_endings), m_noun_verb(noun_verb) {
            if(noun_verb == NOUN) {
                setConjType("masc_o");
                setStem("gord");
            }
            else {
                setConjType("40");
                setStem("tvor");
            }
        }

    std::string getEnding(int desinence_ix);
    std::string getEnding(std::string conj_type, int desinence_ix);
    void setConjType(std::string conj_type);
    void setStem(std::string stem);

    Inflection addEnding(int desinence_ix);
    std::array<std::vector<Inflection>, 3> getFullParadigm();

    void postProcess(std::array<std::vector<Inflection>, 3> &inflected_forms);



    void class1Clean(Inflection& inflection);
    void class1NasalClean(std::string& flecter_output);
    void itiClean(std::string& flecter_output);
    void class14AblautClean(std::string& flecter_output);
    void class15AblautClean(std::string& flecter_output);
    void class3Clean(std::string& flecter_output);
    void class5AblautClean(std::string& flecter_output);
    std::string class5AblautCleanCopy(std::string flecter_output);
    void class51VelarClean(Inflection& inflection);
    void class11InfixClean(std::string& flecter_output);
    void class12InfixClean(std::string& flecter_output);
    void imperfSheta(std::string& flecter_output);

    void firstVelarClean(std::string& flecter_output);
    void pv1LongE(std::string& flecter_output);

    void Dejotate(std::string& jotated_form);
    
    bool c_strStartsWith(const char* str1, const char* str2);

    void produceUniqueInflections();

    std::unordered_set<std::string> m_unique_inflections;


    private:
        static const std::unordered_map<int, inner_map> m_noun_endings;
        static const std::unordered_map<int, inner_map> m_verb_endings;
        static const std::unordered_map<std::string, int> m_conj_type_map;

        const std::unordered_map<int, inner_map>& m_active_endings;

        int m_outer_map_no;
        bool m_noun_verb;
        std::string m_conj_type;
        std::string m_stem;

};
