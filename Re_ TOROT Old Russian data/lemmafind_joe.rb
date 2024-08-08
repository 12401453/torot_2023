# -*- coding: utf-8 -*-
require '/home/hanne/proiel-webapp/config/environment'

LEMMATA = Lemma.find_all_by_language('chu')

def find_lemma(form, pos)
  if LEMMATA.select { |l| l.part_of_speech_tag == pos and l.lemma == form}.any?
    lem = LEMMATA.select { |l| l.part_of_speech_tag == pos and l.lemma == form}.first

  #what's the point in checking if the lemma starts with the form if in your main-script you would reject it for being longer than the form anyway? also why are you chopping-ahead by one? If you want to allow a 4chars-long stem to be checked then why not just change the 4 to a 3?
  #imagine we have lemma=видѣти and form=видѣ (and the 4 was changed to a 3 for this example), by chopping-ahead on the first iteration you will catch every lemma starting with вид, when you could just catch every lemma starting with видѣ which will be more likely to have the correct one. (obviously until you get rid of the `lemma.length <= form.length` check in the main-script this example would get rejected anyway, see insert_tagfile_chu_joe.rb)
  elsif form.length > 4 and LEMMATA.select { |l| l.part_of_speech_tag == pos and l.lemma =~ /^#{form.chop}/}.any? 
    STDERR.puts form
    lem = LEMMATA.select { |l| l.part_of_speech_tag == pos and l.lemma =~ /^#{form.chop}/}.first
  elsif form.length > 4 
    form = form.chop
    lem = find_lemma(form, pos)
  else
    lem = nil
  end
  return lem #it confuses me that Ruby doesn't view this variable as out-of-scope here but I assume it's a feature of the language
end


############suggestion###############
def find_lemma_joe(form, pos)
  lem = nil
  if LEMMATA.select { |l| l.part_of_speech_tag == pos and l.lemma == form}.any?
    lem = LEMMATA.select { |l| l.part_of_speech_tag == pos and l.lemma == form}.first
  elsif form.length > 3 and LEMMATA.select { |l| l.part_of_speech_tag == pos and l.lemma =~ /^#{form}/}.any?
    STDERR.puts form
    lem = LEMMATA.select{ |l| l.part_of_speech_tag == pos and l.lemma =~ /^#{form}/}.first 
  elsif form.length > 3
    form = form.chop
    lem = find_lemma_joe(form, pos)
  end
  return lem
end

#then get rid of the length-check in the main-script

