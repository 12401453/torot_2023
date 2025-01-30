# -*- coding: utf-8 -*-

TRS = {'a'=>'a',
  'b'=>'б',
  'v'=>'в',
  'g'=>'г',
  'd'=>'д',
  'e'=>'е',
  'Z'=>'ж',
  'D'=>'ѕ',
  'z'=>'з',
  'i'=>'и',
  'I'=>'і',
  'J'=>'ꙇ',
  'G'=>'ꙉ',
  'k'=>'к',
  'l'=>'л',
  'm'=>'м',
  'n'=>'н',
  'o'=>'о',
  'p'=>'п',
  'r'=>'р',
  's'=>'с',
  't'=>'т',
  'u'=>'оу',
  'f'=>'ф',
  'T'=>'ѳ',
  'x'=>'х',
  'w'=>'ѡ',
  'c'=>'ц',
  'C'=>'ч',
  'S'=>'ш',
  '&'=>'ъ',
  '$'=>'ь',
  'y'=>'ꙑ',
  '@'=>'ѣ',
  'E'=>'ѧ',
  'O'=>'ѫ',
  'Y'=>'у',
  'A'=>'ꙙ',
  'q'=>'щ',
  '^'=>'҄',
  "'"=>'ⸯ',
  '%'=>''} #using vertical tilde for poerok, like in Supr.

CAPS = {'ꙙ'=>'Ѧ',
'у'=>'У',
'ѫ'=>'Ѫ',
'ѧ'=>'Ѧ',
'ш'=>'Ш',
'ч'=>'Ч',
'ц'=>'Ц',
'ѡ'=>'Ѡ',
'х'=>'Х',
'ѳ'=>'Ө',
'ф'=>'Ф',
'т'=>'Т',
'с'=>'С',
'р'=>'Р',
'п'=>'П',
'о'=>'О',
'н'=>'Н',
'м'=>'М',
'л'=>'Л',
'к'=>'К',
'ꙇ'=>'Ꙇ',
'і'=>'Ꙇ',
'и'=>'И',
'з'=>'З',
'ѕ'=>'Ѕ',
'ж'=>'Ж',
'е'=>'Е',
'д'=>'Д',
'г'=>'Г',
'в'=>'В',
'б'=>'Б',
'a'=>'А'}
  

#DIACR = {'!' => '҃',
  
#}

BOOKS = {'1'=>'MATT', '2'=>'MARK', '3'=>'LUKE', '4'=>'JOHN'}

FULL = {'MATT' => 'Matthew', 'MARK' => 'Mark', 'LUKE' => 'Luke', 'JOHN' => 'John'}

#TODO What's the percent sign doing all over the place?
#TODO Fix diacritics and capitals etc.
#dropping spiritus asper, as already done in the current Zogr fragment
#dropping breve, unlike current Zogr fragment
#dropping question mark for illegible characters
#dropping [] for

def translit(tk)
  lt = []
  t = tk.gsub(/ju/,'ю').gsub(/jE/,'ѩ').gsub(/jO/,'ѭ').gsub(/\(/,'').gsub(/~/,'').gsub(/\?/,'')
  chs = t.split(//u)
  chs.each do |c|
    if TRS.keys.include?(c)
      lt <<  TRS[c]
    else 
      lt << c
    end
  end 
  return lt.join
end

def caps(tk)
  if tk =~ /\*./
    new = []
    c = tk.split('*')
    #STDERR.puts tk
    c.each do |ch|
      if ch == c[1]
        chr = ch.split(//u)
        chr[0] = CAPS[chr[0]]
        new << chr.join
      else
        new << ch
      end
      #STDERR.puts new.join
    end
    return new.join
  else
    return tk
  end
end


def diacritics(tk) #some titlos are misplaced #supralinears are simply taken down
  if tk =~ /!/
    #STDERR.puts tk
    ch = tk.split('!')
    #STDERR.puts ch.join('+')
    #STDERR.puts ch.size
    new = []
    ch.each do |c|
      unless c.nil?
        if c == ch[1] and ch.first == ''
          #STDERR.puts c
          chars =  c.split(//u)
          titlo = [chars[0],'҃',chars[1..-1]].flatten.join
          #STDERR.puts titlo
          new << titlo
        else
          new << c
        end
      end
      end
    #STDERR.puts new.join
    new.join
  else
    tk
  end
end

def punctuation_end(token,p)
  STDOUT.puts "<token form='#{token}' citation-part='#{@book} #{@ch}.#{@vs}' presentation-after='#{p} ' />"
end

def punctuation_first(token,p)
  STDOUT.puts "<token form='#{token}' citation-part='#{@book} #{@ch}.#{@vs}' presentation-before='#{p}' presentation-after=' ' />"
end

def punctuation_both(token,p,pp)
  STDOUT.puts "<token form='#{token}' citation-part='#{@book} #{@ch}.#{@vs}' presentation-before='#{p}' presentation-after='#{pp} ' />"
end

STDOUT.puts "<proiel schema-version='2.0'>"
STDOUT.puts "<source id='zogr' language='chu' >"
STDOUT.puts "<title>Codex Zographensis</title>"
STDOUT.puts "<citation-part>Zogr.</citation-part>"
STDOUT.puts "<div>"
STDOUT.puts "<title>Matthew 3</title>"
STDOUT.puts "<sentence>"

@ch = "3"
@vs = nil
@book = nil
@sentence_end = false

File.open('zogr_ascii.txt').each_line do |l|
  tks = l.split(' ')
  tks.each do |tk|
    if tk == tks.first
      fig = tk.split(//)
      bk = BOOKS[fig[0]]
      ch = fig[1..2].join.gsub(/\A0/,'')
      vs = fig[3..4].join.gsub(/\A0/,'')
      if bk != @book
        @book = bk
      end
      if ch != @ch
        @ch = ch
        STDOUT.puts "</sentence>"
        STDOUT.puts "</div>"
        STDOUT.puts "<div>"
        STDOUT.puts "<title>#{FULL[@book]} #{@ch}</title>"
        STDOUT.puts "<sentence>"
        @sentence_end = false
      end
      if vs != @vs
        @vs = vs
      end
      #STDERR.puts tk
      #STDERR.puts "#{@book}, #{@ch}.#{@vs}"
    elsif  tk =~ /\]\./
      #STDERR.puts tk
      STDOUT.puts "</sentence>\n<sentence>" if @sentence_end == true
      punctuation_end(diacritics(caps(translit(tk.gsub(/\]\./,'')))),'].')
      @sentence_end = true
    elsif tk =~ /\.\]/
      STDERR.puts tk
      STDOUT.puts "</sentence>\n<sentence>" if @sentence_end == true
      punctuation_end(diacritics(caps(translit(tk.gsub(/\.\]/,'')))),'.]')
      @sentence_end = true
    elsif tk =~ /\./
      STDOUT.puts "</sentence>\n<sentence>" if @sentence_end == true
      punctuation_end(diacritics(caps(translit(tk.gsub(/\./,'')))),'.')
      @sentence_end = true
    elsif tk =~ /:\+/
      STDOUT.puts "</sentence>\n<sentence>" if @sentence_end == true
      punctuation_end(diacritics(caps(translit(tk.gsub(/:\+/,'')))),'⁛')
      @sentence_end = true
    elsif tk =~ /:-/
      STDOUT.puts "</sentence>\n<sentence>" if @sentence_end == true
      punctuation_end(diacritics(caps(translit(tk.gsub(/:-/,'')))),'⁛')
      @sentence_end = true
    elsif tk =~ /:/
       STDOUT.puts "</sentence>\n<sentence>" if @sentence_end == true
      punctuation_end(diacritics(caps(translit(tk.gsub(/:/,'')))),':')
      @sentence_end = true
    elsif tk =~ /\A\[/
      if tk =~ /\]\z/
        #STDERR.puts tk
        STDOUT.puts "</sentence>\n<sentence>" if @sentence_end == true
        punctuation_both(diacritics(caps(translit(tk.gsub(/\A\[/,'').gsub(/\]\z/,'')))),'[',']')
        @sentence_end = false
      else
        STDOUT.puts "</sentence>\n<sentence>" if @sentence_end == true
        punctuation_first(diacritics(caps(translit(tk.gsub(/\A\[/,'')))),'[')
        @sentence_end = false
      end
    elsif tk =~ /\]\z/
      STDOUT.puts "</sentence>\n<sentence>" if @sentence_end == true
      punctuation_end(diacritics(caps(translit(tk.gsub(/\]\z/,'')))),']')
      @sentence_end = false
    else 
      STDOUT.puts "</sentence>\n<sentence>" if @sentence_end == true
      STDOUT.puts "<token form='#{diacritics(caps(translit(tk)))}' citation-part='#{@book} #{@ch}.#{@vs}' presentation-after=' ' />" 
      @sentence_end = false
    end
  end
end

STDOUT.puts "</sentence>"
STDOUT.puts "</div>"
STDOUT.puts "</source>"
STDOUT.puts "</proiel>"
