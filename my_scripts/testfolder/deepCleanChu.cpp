#include <iostream>
#include <string>
#include <fstream>

//there's no way to do char-by-char rebuilding of the string without using ICU
std::string deep_clean_Cyr(std::string form_cell)
{
    std::string str1;
    std::string str2;
    int x = 0;
    //  int q = 0;
    int y;

    for (int letno = -44; letno < 133; letno++)
    {

        switch (letno)
        {
        case -44:
            str1.assign("̀");
            str2.assign("");
            break;
        case -43:
            str1.assign(">");
            str2.assign("");
            break; 
        case -42:
            str1.assign("/");
            str2.assign("");
            break; 
        case -41:
            str1.assign("\"");
            str2.assign("");
            break; 
        case -40:
            str1.assign("͡");
            str2.assign("");
            break;
        case -39:
            str1.assign("·");
            str2.assign("");
            break;
        case -38:
            str1.assign("̏");
            str2.assign("");
            break;
        case -37:
            str1.assign(" ");
            str2.assign("");
            break;
        case -36:
            str1.assign("+");
            str2.assign("");
            break;
        case -35:
            str1.assign("⁜");
            str2.assign("");
            break;
        case -34:
            str1.assign("͠");
            str2.assign("");
            break;
        case -33:
            str1.assign("!");
            str2.assign("");
            break;
        case -32:
            str1.assign("҅"); // these are barely-visible diacritics that need getting rid of
            str2.assign("");
            break;
        case -31:
            str1.assign("҆");
            str2.assign("");
            break;
        case -30:
            str1.assign("҄");
            str2.assign(""); // ѭ̑
            break;
        case -29:
            str1.assign("͑");
            str2.assign(""); //
            break;
        case -28:
            str1.assign("͗");
            str2.assign(""); //
            break;
        case -27:
            str1.assign("̆");
            str2.assign("");
            break;
        case -26:
            str1.assign("̈");
            str2.assign("");
            break;
        case -25:
            str1.assign("̑");
            str2.assign("");
            break;
        case -24:
            str1.assign("̒");
            str2.assign("");
            break;
        case -23:
            str1.assign("̓");
            str2.assign("");
            break;
        case -22:
            str1.assign("̔");
            str2.assign("");
            break;
        case -21:
            str1.assign("̕");
            str2.assign("");
            break;
        case -20:
            str1.assign("͆");
            str2.assign("");
            break;
        case -19:
            str1.assign("͛");
            str2.assign("");
            break;
        case -18:
            str1.assign("͞");
            str2.assign("");
            break;
        case -17:
            str1.assign("ͨ");
            str2.assign("");
            break;
        case -16:
            str1.assign("҃");
            str2.assign("");
            break;
        case -15:
            str1.assign("҇");
            str2.assign("");
            break;
        case -14:
            str1.assign("ꙿ");
            str2.assign("");
            break;
        case -13:
            str1.assign("꙯");
            str2.assign("");
            break;        
        case -12:
            str1.assign("'");
            str2.assign("");
            break;
        case -11:
            str1.assign("(");
            str2.assign("");
            break;
        case -10:
            str1.assign(")");
            str2.assign("");
            break;
        case -9:
            str1.assign("-");
            str2.assign("");
            break;
        case -8:
            str1.assign(".");
            str2.assign("");
            break;
        case -7:
            str1.assign(":");
            str2.assign("");
            break;
        case -6:
            str1.assign("=");
            str2.assign("");
            break;
        case -5:
            str1.assign("?");
            str2.assign("");
            break;
        case -4:
            str1.assign("[");
            str2.assign("");
            break;
        case -3:
            str1.assign("]");
            str2.assign("");
            break;
        case -2:
            str1.assign("̂");
            str2.assign("");
            break;
        case -1:
            str1.assign("Ꙋ");
            str2.assign("оу");
            break;
        case 0:
            str1.assign("ОУ");
            str2.assign("оу");
            break;
        case 1:
            str1.assign("о҄у");
            str2.assign("оу");
            break;
        case 2:
            str1.assign("ꙑ");
            str2.assign("ъі");
            break;
        case 3:
            str1.assign("Оу");
            str2.assign("оу");
            break;
        case 4:
            str1.assign("ѹ");
            str2.assign("оу");
            break;
        case 5:
            str1.assign("о̑у");
            str2.assign("оу");
            break;
        case 6:
            str1.assign("ꙋ");
            str2.assign("оу");
            break;
        case 7:
            str1.assign("A");
            str2.assign("а");
            break;
        case 8:
            str1.assign("O");
            str2.assign("о");
            break;
        case 9:
            str1.assign("E");
            str2.assign("е");
            break;
        case 10:
            str1.assign("C");
            str2.assign("с");
            break;
        case 11:
            str1.assign("a");
            str2.assign("а");
            break;
        case 12:
            str1.assign("o");
            str2.assign("о");
            break;
        case 13:
            str1.assign("e");
            str2.assign("е");
            break;
        case 14:
            str1.assign("c");
            str2.assign("с");
            break;
        case 15:
            str1.assign("ы");
            str2.assign("ьі");
            break;
        case 16:
            str1.assign("ѵ");
            str2.assign("у");
            break;
        case 17:
            str1.assign("Ꙃ");
            str2.assign("ѕ");
            break;
        case 18:
            str1.assign("Ћ");
            str2.assign("ꙉ");
            break;
        case 19:
            str1.assign("y");
            str2.assign("у");
            break;
        case 20:
            str1.assign("ꙃ");
            str2.assign("ѕ");
            break;
        case 21:
            str1.assign("ћ");
            str2.assign("ꙉ");
            break;
        case 22:
            str1.assign("Ⱕ");
            str2.assign("ѧ");
            break;
        case 23:
            str1.assign("Я");
            str2.assign("ꙗ");
            break;
        case 24:
            str1.assign("ⱕ");
            str2.assign("ѧ");
            break;
        case 25:
            str1.assign("я");
            str2.assign("ꙗ");
            break;
        case 26:
            str1.assign("Ҍ");
            str2.assign("ѣ");
            break;
        case 27:
            str1.assign("ҍ");
            str2.assign("ѣ");
            break;
        case 28:
            str1.assign("Ї");
            str2.assign("і");
            break;
        case 29:
            str1.assign("ї");
            str2.assign("і");
            break;
        case 30:
            str1.assign("X");
            str2.assign("х");
            break;
        case 31:
            str1.assign("x");
            str2.assign("х");
            break;
        case 32:
            str1.assign("ѩ");
            str2.assign("ѧ");
            break;
        case 33:
            str1.assign("Ѩ");
            str2.assign("ѧ");
            break;
        case 34:
            str1.assign("щ");
            str2.assign("шт");
            break;
        case 35:
            str1.assign("Щ");
            str2.assign("шт");
            break;
        case 36:
            str1.assign("и");
            str2.assign("і");
            break;
        case 37:
            str1.assign("И");
            str2.assign("і");
            break;
        case 38:
            str1.assign("ꙇ");
            str2.assign("і");
            break;
        case 39:
            str1.assign("Ꙇ");
            str2.assign("і");
            break;
        case 40:
            str1.assign("ⰹ");
            str2.assign("і");
            break;
        case 41:
            str1.assign("ѡ");
            str2.assign("о");
            break;
        case 42:
            str1.assign("Ѡ");
            str2.assign("о");
            break;
        case 43:
            str1.assign("ꙙ");
            str2.assign("ѧ");
            break;
        case 44:
            str1.assign("Ꙙ");
            str2.assign("ѧ");
            break;
        case 45:
            str1.assign("А");
            str2.assign("а");
            break;
        case 46:
            str1.assign("Б");
            str2.assign("б");
            break;
        case 47:
            str1.assign("Ц");
            str2.assign("ц");
            break;
        case 48:
            str1.assign("Г");
            str2.assign("г");
            break;
        case 49:
            str1.assign("Д");
            str2.assign("д");
            break;
        case 50:
            str1.assign("Е");
            str2.assign("е");
            break;
        case 51:
            str1.assign("Ж");
            str2.assign("ж");
            break;
        case 52:
            str1.assign("Ѕ");
            str2.assign("ѕ");
            break;
        case 53:
            str1.assign("З");
            str2.assign("з");
            break;
        case 54:
            str1.assign("І");
            str2.assign("і");
            break;
        case 55:
            str1.assign("Ꙉ");
            str2.assign("ꙉ");
            break;
        case 56:
            str1.assign("К");
            str2.assign("к");
            break;
        case 57:
            str1.assign("Л");
            str2.assign("л");
            break;
        case 58:
            str1.assign("М");
            str2.assign("м");
            break;
        case 59:
            str1.assign("Н");
            str2.assign("н");
            break;
        case 60:
            str1.assign("О");
            str2.assign("о");
            break;
        case 61:
            str1.assign("П");
            str2.assign("п");
            break;
        case 62:
            str1.assign("Р");
            str2.assign("р");
            break;
        case 63:
            str1.assign("С");
            str2.assign("с");
            break;
        case 64:
            str1.assign("Т");
            str2.assign("т");
            break;
        case 65:
            str1.assign("Ѹ");
            str2.assign("оу");
            break;
        case 66:
            str1.assign("Ф");
            str2.assign("ф");
            break;
        case 67:
            str1.assign("Х");
            str2.assign("х");
            break;
        case 68:
            str1.assign("Ч");
            str2.assign("ч");
            break;
        case 69:
            str1.assign("Ш");
            str2.assign("ш");
            break;
        case 70:
            str1.assign("Ъ");
            str2.assign("ъ");
            break;
        case 71:
            str1.assign("Ь");
            str2.assign("ь");
            break;
        case 72:
            str1.assign("Ѣ");
            str2.assign("ѣ");
            break;
        case 73:
            str1.assign("Ю");
            str2.assign("ю");
            break;
        case 74:
            str1.assign("Ѫ");
            str2.assign("ѫ");
            break;
        case 75:
            str1.assign("Ѭ");
            str2.assign("ѭ");
            break;
        case 76:
            str1.assign("В");
            str2.assign("в");
            break;
        case 77:
            str1.assign("Ѵ");
            str2.assign("у");
            break;
        case 78:
            str1.assign("Ѳ");
            str2.assign("ѳ");
            break;
        case 79:
            str1.assign("Ѧ");
            str2.assign("ѧ");
            break;
        case 80:
            str1.assign("ꙁ");
            str2.assign("з");
            break;
        case 81:
            str1.assign("Ꙁ");
            str2.assign("з");
            break;
        case 82:
            str1.assign("ѭ̑");
            str2.assign("ѭ"); //
            break;
        case 83:
            str1.assign("ѥ"); // Ѥ
            str2.assign("е");
            break;
        case 84:
            str1.assign("Ѥ");
            str2.assign("е");
            break;
        case 85:
            str1.assign("ꙉ");
            str2.assign("г");
            break;
        case 86:
            str1.assign("ӱ");
            str2.assign("у");
            break;
        case 87:
            str1.assign("ӑ");
            str2.assign("а");
            break;
        case 88:
            str1.assign("У");
            str2.assign("у");
            break;
        case 89:
            str1.assign("ѿ");
            str2.assign("от");
            break;
        case 90:
            str1.assign("ѱ");
            str2.assign("пс");
            break;
        case 91:
            str1.assign("Ѱ");
            str2.assign("пс");
            break;
        case 92:
            str1.assign("ѻ");
            str2.assign("о");
            break;
        case 93:
            str1.assign("ⷠ");
            str2.assign("б");
            break;
        case 94:
            str1.assign("ⷡ");
            str2.assign("в");
            break;
        case 95:
            str1.assign("ⷢ");
            str2.assign("г");
            break;
        case 96:
            str1.assign("ⷣ");
            str2.assign("д");
            break;
        case 97:
            str1.assign("ⷦ");
            str2.assign("к");
            break;
        case 98:
            str1.assign("ⷧ");
            str2.assign("л");
            break;
        case 99:
            str1.assign("ⷩ");
            str2.assign("н");
            break;
        case 100:
            str1.assign("ⷪ");
            str2.assign("о");
            break;
        case 101:
            str1.assign("ⷫ");
            str2.assign("п");
            break;
        case 102:
            str1.assign("ⷬ");
            str2.assign("р");
            break;
        case 103:
            str1.assign("ⷭ");
            str2.assign("с");
            break;
        case 104:
            str1.assign("ⷮ");
            str2.assign("т");
            break;
        case 105:
            str1.assign("ⷯ");
            str2.assign("х");
            break;
        case 106:
            str1.assign("ⷰ");
            str2.assign("ц");
            break;
        case 107:
            str1.assign("ⷱ");
            str2.assign("ч");
            break;
        case 108:
            str1.assign("ⷸ");
            str2.assign("г");
            break;
        case 109:
            str1.assign("ȥ");
            str2.assign("з");
            break;
        case 110:
            str1.assign("й");
            str2.assign("і");
            break;
        case 111:
            str1.assign("ѷ");
            str2.assign("у");
            break;
        case 112:
            str1.assign("ⱔ");
            str2.assign("ѧ");
            break;
        case 113:
            str1.assign("Ⱉ");
            str2.assign("о");
            break;
        case 114:
            str1.assign("Ө"); 
            str2.assign("ѳ");
            break;
        case 115:
            str1.assign("є");
            str2.assign("е");
            break;       
        ///////////////these ones can stand for either jer so ideally it'd be replaced in any real script with /[ъ,ь]/
        case 116:
            str1.assign("ʼ");
            str2.assign("");
            break;
        case 117:
            str1.assign("ⸯ");
            str2.assign("");
            break;
        case 118:
            str1.assign("’");
            str2.assign("");
            break;
        //////////////////////////////those below should not be used except when aggressive harmonisation is desired
        case 119:
            str1.assign("ꙗ"); //this destroys a lot of information but it's necessary to harmonise with the Glagolitic texts
            str2.assign("ѣ");
            break;
        case 120:
            str1.assign("ѕ");
            str2.assign("з");
            break;
            ////////////front-rounded vowel-letters after soft-consonants
        case 121:
            str1.assign("шю");
            str2.assign("шоу");
            break;
        case 122:
            str1.assign("чю");
            str2.assign("чоу");
            break;
        case 123:
            str1.assign("жю");
            str2.assign("жоу");
            break;
        case 124:
            str1.assign("ждю");
            str2.assign("ждоу");
            break;  
        case 125:
            str1.assign("штю");
            str2.assign("штоу");
            break;
        case 126:
            str1.assign("цю");
            str2.assign("цоу");
            break;
        case 127:
            str1.assign("шѭ");
            str2.assign("шѫ");
            break;
        case 128:
            str1.assign("чѭ");
            str2.assign("чѫ");
            break;
        case 129:
            str1.assign("жѭ");
            str2.assign("жѫ");
            break;
        case 130:
            str1.assign("ждѭ");
            str2.assign("ждѫ");
            break;
        case 131:
            str1.assign("цѭ");
            str2.assign("цѫ");
            break;
        case 132:
            str1.assign("штѭ");
            str2.assign("штѫ");
            break;
        }

        do
        {
            x = form_cell.find(str1);
            if (x == -1)
            {
                break;
            }

            y = str1.length();
            form_cell.replace(x, y, str2);
        } while (x != -1);
        //std::cout << letno << "\n";
    }
    return form_cell;
}

int main(int argc, char** argv)
{
    if(argc != 2) {
        std::cout << "Usage: ./deepCleanChu <file_to_clean>\n";
        return 0;
    }
    std::string infileName = argv[1];
    std::ifstream inFile(infileName);
    int in_len = infileName.size();
    std::ofstream outFile(infileName.substr(0, in_len-4) + "_deepCleaned" + infileName.substr(in_len-4, 4));
    std::string line;
    while(std::getline(inFile, line)) {
        outFile << deep_clean_Cyr(line) << "\n";
    }
    outFile.close();
    inFile.close();
    return 0;
}
