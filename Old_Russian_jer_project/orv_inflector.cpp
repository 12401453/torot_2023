#include <iostream>
#include "LcsFlecter.h"

int main() {

  LcsFlecter noun_flecter(true);
  LcsFlecter verb_flecter(false);

  std::ifstream orv_ocs_lemma_matches("orv_ocs_lemma_matches.csv");
  if(orv_ocs_lemma_matches.good()) {

    std::string line;
    while(std::getline(orv_ocs_lemma_matches, line)) {
      std::cout << line << "\n";
    }


    orv_ocs_lemma_matches.close();
  }


  return 0;
}
