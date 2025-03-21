#!/usr/bin/env ruby
# -*- coding: utf-8 -*-

 LEMNORMAL = {"!" => "",
  "'" => "",
  "(" => "",
  ")" => "", 
  "-" => "", 
  "." => "",
  ":" => "", 
  "=" => "", 
  "?" => "", 
  "[" => "",
  "]" => "", 
  "a" => "а",
  "x" => "х",
  "ʼ" => "ь", 
  "̂" => "", 
  "̆" => "",
  "̈" => "", 
  "̑" => "", 
  "̒" => "", 
  "̓" => "", 
  "̔" => "", 
  "̕" => "", 
  "͆" => "", 
  "͑" => "", 
  "͗" => "", 
  "͛" => "", 
  "͞" => "", 
  "ͨ" => "", 
  "Ї" => "и", 
  "А" => "а", 
  "Б"=> "б", 
  "В"=> "в", 
  "Г"=> "г", 
  "Д"=> "д", 
  "Е"=> "е", 
  "Ж"=> "ж", 
  "З"=> "з", 
  "И"=> "и", 
  "К"=> "к", 
  "Л"=> "л", 
  "М"=> "м", 
  "Н"=> "н", 
  "О"=> "о", 
  "П"=> "п", 
  "Р"=> "р", 
  "С"=> "с", 
  "Т"=> "т", 
  "Ф"=> "ф", 
  "Х"=> "х", 
  "Ц"=> "ц", 
  "Ч"=> "ч", 
  "Ш"=> "ш", 
  "Ъ"=> "ъ", 
  "Ь"=> "ь", 
  "Ю"=> "ю", 
  "і"=> "и", 
  "ї"=> "и", 
  "ћ"=> "г", 
  "Ѡ"=> "о", 
  "ѡ"=> "о", 
  "Ѣ"=> "ѣ", 
  "ѱ"=> "пс", 
  "ѹ"=> "оу", 
  "҃"=> "", 
  "҄"=> "", 
  "҅"=> "", 
  "҇"=> "", 
  "ӑ"=> "а", 
  "ӱ"=> "оу", 
  "’"=> "ъ", 
  "ⰹ"=> "и", 
  "ⱕ"=> "ѧ", 
  "ⷠ"=> "б", 
  "ⷡ"=> "в", 
  "ⷢ"=> "г", 
  "ⷣ"=> "д", 
  "ⷦ"=> "к", 
  "ⷧ"=> "л", 
  "ⷩ"=> "н", 
  "ⷪ"=> "о", 
  "ⷫ"=> "п", 
  "ⷬ"=> "р", 
  "ⷭ"=> "с", 
  "ⷮ"=> "т", 
  "ⷯ"=> "х", 
  "ⷰ"=> "ц", 
  "ⷱ"=> "ч", 
  "ⷸ"=> "г", 
  "ꙃ"=> "ѕ", 
  "Ꙇ"=> "и", 
  "ꙇ"=> "и",
  "й"=>"и",
  "Ꙉ"=> "г", 
  "ꙉ"=> "г", 
  "ꙋ"=> "оу",
 "Ꙑ"=> "ꙑ", 
  "ы" => "ꙑ",  
  "ꙙ"=> "ѧ", 
  "ꙿ" => "ь",
  "͆" => "",
  "͑" => "", 
  "̑" => "", 
  "͗" => "",
  "̂" => "",
  "҆" => "",
  "ꙁ" => "з",
  "꙯" => "",
  "҆" => "",
  "҅" => "",
  " " => "",
  "є" => "е"}



def normal_lemma(tk)
  lt = []
  chs = tk.split(//u)
  chs.each do |c|
    if LEMNORMAL.keys.include?(c)
      lt <<  LEMNORMAL[c]
    else 
      lt << c
    end
  end 
  return lt.join
end

inFile = File.open("chu_words.csv", "r");
@outFile = File.open("chu_words_normalise_lemma_NW.csv", "w")
inFile.each_line do |line|
  @outFile.puts normal_lemma(line)
end
@outFile.close()