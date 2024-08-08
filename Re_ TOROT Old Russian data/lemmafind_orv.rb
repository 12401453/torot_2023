# -*- coding: utf-8 -*-
require '/home/hanne/proiel-webapp/config/environment'

LEMMATA = Lemma.find_all_by_language('orv')

def find_lemma(forma, pos)
  form = forma.gsub(/\[/,'').gsub(/]/,'')
  if LEMMATA.select { |l| l.part_of_speech_tag == pos and l.lemma == form}.any?
    lem = LEMMATA.select { |l| l.part_of_speech_tag == pos and l.lemma == form}.first
  elsif form.length > 4 and LEMMATA.select { |l| l.part_of_speech_tag == pos and l.lemma =~ /^#{form.chop}/}.any?  
    STDERR.puts form
    lem = LEMMATA.select { |l| l.part_of_speech_tag == pos and l.lemma =~ /^#{form.chop}/}.first
  elsif form.length > 4 
    form = form.chop
    lem = find_lemma(form, pos)
  else
    lem = nil
  end
  return lem
end

