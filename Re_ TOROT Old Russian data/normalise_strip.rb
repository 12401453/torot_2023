# -*- coding: utf-8 -*-

SNORMAL = {"!" => "",
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
  "҃"=> "", 
  "҄"=> "", 
  "҅"=> "", 
  "҇"=> "", 
  "͆" => "",
  "͑" => "", 
  "̑" => "", 
  "͗" => "",
  "ꙿ" => "",
  "̂" => "",
  "҆" => "",
  "꙯" => ""}



def normal_strip(tk)
  lt = []
  chs = tk.split(//u)
  chs.each do |c|
    if SNORMAL.keys.include?(c)
      lt <<  SNORMAL[c]
    else 
      lt << c
    end
  end 
  return lt.join
end