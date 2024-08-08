#! /usr/bin/env ruby


require "/home/hanne/proiel-webapp/config/environment.rb"


puts "---"
Sentence.find(:all, :conditions => ["source_divisions.source_id = ? ", ARGV[0]], :include => :source_division).each do |s|
  s.tokens.reject(&:is_empty?).each do |t|
    if ARGV[1]
      puts "#{t.form}"
    elsif t.lemma and t.morphology and t.relation
      puts "#{t.form}\t\t#{t.lemma.part_of_speech.tag}#{t.morphology}"
    end
  end
  puts "---"
end

  
