#! /usr/bin/env ruby

# usage: ./extract_tagfile.rb <source_id> <proiel_root> <anything if you want a file without tags>

require "/home/hanne/proiel-webapp/config/environment.rb"
require "/home/hanne/tagging/normalise_rus.rb"

puts "---"
Sentence.find(:all, :conditions => ["source_divisions.source_id = ? ", ARGV[0]], :include => :source_division).each do |s|
  s.tokens.reject(&:is_empty?).each do |t|
    if ARGV[1]
      puts "#{normal_rus(t.form)}"
    elsif t.lemma and t.morphology and t.relation
      puts "#{normal_rus(t.form)}\t\t#{t.lemma.part_of_speech.tag}#{t.morphology}"
    end
  end
  puts "---"
end

  
