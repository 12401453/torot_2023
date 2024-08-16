#include <iostream>
#include <string>
#include <fstream>

//there's no way to do char-by-char rebuilding of the string without using ICU
std::string deleteTest(std::string form_cell)
{
    std::string str1;
    std::string str2;
    int x = 0;
    //  int q = 0;
    int y;

    for (int letno = -37; letno < -3; letno++)
    {

        switch (letno)
        {
        case -37:
            str1.assign("і");
            str2.assign("");
            break;
        case -36:
            str1.assign("ц");
            str2.assign("");
            break;
        case -35:
            str1.assign("у");
            str2.assign("");
            break;
        case -34:
            str1.assign("к");
            str2.assign("");
            break;
        case -33:
            str1.assign("е");
            str2.assign("");
            break;
        case -32:
            str1.assign("н");
            str2.assign("");
            break;
        case -31:
            str1.assign("г");
            str2.assign("");
            break;
        case -30:
            str1.assign("ш");
            str2.assign(""); // ѭ̑
            break;
        case -29:
            str1.assign("з");
            str2.assign(""); //
            break;
        case -28:
            str1.assign("х");
            str2.assign(""); //
            break;
        case -27:
            str1.assign("ъ");
            str2.assign("");
            break;
        case -26:
            str1.assign("ф");
            str2.assign("");
            break;
        case -25:
            str1.assign("в");
            str2.assign("");
            break;
        case -24:
            str1.assign("а");
            str2.assign("");
            break;
        case -23:
            str1.assign("п");
            str2.assign("");
            break;
        case -22:
            str1.assign("р");
            str2.assign("");
            break;
        case -21:
            str1.assign("о");
            str2.assign("");
            break;
        case -20:
            str1.assign("л");
            str2.assign("");
            break;
        case -19:
            str1.assign("д");
            str2.assign("");
            break;
        case -18:
            str1.assign("ж");
            str2.assign("");
            break;
        case -17:
            str1.assign("ч");
            str2.assign("");
            break;
        case -16:
            str1.assign("с");
            str2.assign("");
            break;
        case -15:
            str1.assign("ч");
            str2.assign("");
            break;
        case -14:
            str1.assign("м");
            str2.assign("");
            break;
        case -13:
            str1.assign("т");
            str2.assign("");
            break;        
        case -12:
            str1.assign("ь");
            str2.assign("");
            break;
        case -11:
            str1.assign("б");
            str2.assign("");
            break;
        case -10:
            str1.assign("ю");
            str2.assign("");
            break;
        case -9:
            str1.assign("ѧ");
            str2.assign("");
            break;
        case -8:
            str1.assign("ѫ");
            str2.assign("");
            break;
        case -7:
            str1.assign("ѭ");
            str2.assign("");
            break;
        case -6:
            str1.assign("ѣ");
            str2.assign("");
            break;
        case -5:
            str1.assign("ѳ");
            str2.assign("");
            break;
        case -4:
            str1.assign("ѯ");
            str2.assign("");
            break;
        /*case -3:
            str1.assign("ч");
            str2.assign("");
            break;
        case -2:
            str1.assign("ч");
            str2.assign("");
            break;
        case -1:
            str1.assign("ч");
            str2.assign("оу");
            break;
        case 0:
            str1.assign("ч");
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
            break; */
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

int main()
{
    std::ifstream inFile("chu_words_deepCleaned.csv");
    std::ofstream outFile("deleteLettersTest.csv");
    std::string line;
    while(std::getline(inFile, line)) {
        outFile << deleteTest(line);
    }
    
    outFile.close();
    inFile.close();
    return 0;
}
