# -*- coding: utf-8 -*-
require "/home/hanne/proiel-webapp/config/environment"
ENV["RAILS_ENV"] = "production"
require "/home/hanne/tagging/rus_to_orv_lemma.rb"
require "/home/hanne/tagging/normalise_rus.rb"
require "/home/hanne/tagging/normalise_mar.rb"
require "/home/hanne/tagging/lemmafind_orv.rb"

infile = File.open(ARGV[0])

s = nil
t = nil

infile.each_line do |l|
  if l =~ /^%%/
    s = Sentence.find(l[/^%%(.*)/, 1].to_i)
    STDERR.puts "Working on #{s.id}"
    t = s.tokens.first
  else
    form, tag = l.split(/\s+/)
    if form == Lemma.find(120253).lemma
      STDERR.puts "special i rule running on #{form}"
      if tag[0, 2] == "Pp"
        STDERR.puts "This is a pronoun"
        lemma = "#{form},#{tag[0, 2]},#{s.source_division.source.language.to_s}"
        m = MorphFeatures.new(lemma, tag[2, 10])
        STDERR.puts "Assigning tag #{m} (#{m.valid?})"
      else
        lemma = "#{form},C-,#{s.source_division.source.language.to_s}"
        m = MorphFeatures.new(lemma, "---------n")
        STDERR.puts "Assigning tag #{m} (#{m.valid?})"
      end
      begin
        t.morph_features = m
        t.save
      rescue => e
        STDERR.puts e
      end
    elsif form == normal_rus(t.form)
      cform = t.form.gsub(/\(/, "").gsub(/\)/, "")
      analyses_r = TAGGER.tag_token(:orv, cform).flatten.uniq.select { |a| a.is_a?(MorphFeatures) }
      analyses_norm = TAGGER.tag_token(:orv, form.gsub(/\(/, "").gsub(/\)/, "")).flatten.uniq.select { |b| b.is_a?(MorphFeatures) }
      analyses_lem = TAGGER.tag_token(:orv, rus_lemma(cform)).flatten.uniq.select { |b| b.is_a?(MorphFeatures) }

      if analyses_r.any?
        m = analyses_r.first
        STDERR.puts "Assigning #{m} (orv match)"
        t.morph_features = m
        t.save
      elsif analyses_norm.any? { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }
        m = analyses_norm.select { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }.first
        rm = MorphFeatures.new("#{m.lemma.lemma},#{m.lemma.part_of_speech.tag},#{s.source_division.source.language.to_s}", m.morphology.tag)
        STDERR.puts "Assigning #{rm} (normalised)"
        t.morph_features = rm
        t.save
      elsif analyses_lem.any? { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }
        m = analyses_lem.select { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }.first
        rm = MorphFeatures.new("#{m.lemma.lemma},#{m.lemma.part_of_speech.tag},#{s.source_division.source.language.to_s}", m.morphology.tag)
        STDERR.puts "Assigning #{rm} (lemma-style)"
        t.morph_features = rm
        t.save
      else
        STDERR.puts "found no valid analysis for #{form}, but TnT thought it was #{tag}"
        if find_lemma(rus_lemma(cform), tag[0, 2]) and find_lemma(rus_lemma(cform), tag[0, 2]).lemma.length <= form.length
          STDERR.puts "Guessed lemma #{find_lemma(rus_lemma(cform), tag[0, 2])}"
          lemma = "#{find_lemma(rus_lemma(cform), tag[0, 2]).lemma},#{tag[0, 2]},#{s.source_division.source.language.to_s}"
        else
          lemma = "FIXME,#{tag[0, 2]},#{s.source_division.source.language.to_s}"
        end
        m = MorphFeatures.new(lemma, tag[2, 10])
        STDERR.puts "Assigning tag #{m} (#{m.valid?})"
        begin
          t.morph_features = m
          t.save
        rescue => e
          STDERR.puts e
        end
      end
    else
      puts "Form mismatch: tag file has #{form}, source has #{t.form}, normalised #{normal_rus(t.form)}"
    end
    t = t.next_object
  end
end
