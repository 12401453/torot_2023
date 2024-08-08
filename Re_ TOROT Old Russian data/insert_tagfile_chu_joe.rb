require "/home/hanne/proiel-webapp/config/environment"
ENV["RAILS_ENV"] = "production"
require "/home/hanne/tagging/normalise_orth.rb"
require "/home/hanne/tagging/normalise_mar.rb"
require "/home/hanne/tagging/normalise_strip.rb"
require "/home/hanne/tagging/normalise_lemma_chu.rb"
require "/home/hanne/tagging/lemmafind.rb"

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
    if form == normal(t.form)
      analyses = TAGGER.tag_token(:chu, t.form).flatten.uniq.select { |a| a.is_a?(MorphFeatures) }
      analyses_norm = TAGGER.tag_token(:chu, form).flatten.uniq.select { |b| b.is_a?(MorphFeatures) }
      analyses_mar = TAGGER.tag_token(:chu, normal_mar(t.form)).flatten.uniq.select { |b| b.is_a?(MorphFeatures) }
      analyses_strip = TAGGER.tag_token(:chu, normal_strip(t.form)).flatten.uniq.select { |b| b.is_a?(MorphFeatures) }

      if analyses.any? { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }
        m = analyses.select { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }.first
        STDERR.puts "Assigning #{m}"
        t.morph_features = m
        t.save
      elsif analyses_norm.any? { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }
        m = analyses_norm.select { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }.first
        STDERR.puts "Assigning #{m} (normalised)"
        t.morph_features = m
        t.save
      elsif analyses_mar.any? { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }
        m = analyses_mar.select { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }.first
        STDERR.puts "Assigning #{m} (Marianus-style)"
        t.morph_features = m
        t.save
      elsif analyses_strip.any? { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }
        m = analyses_strip.select { |a| a.lemma.part_of_speech.tag + a.morphology.tag == tag }.first
        STDERR.puts "Assigning #{m} (stripped)"
        t.morph_features = m
        t.save
      else
        STDERR.puts "found no valid analysis for #{form}, but TnT thought it was #{tag}"
        #I've put the result of find_lemma() into a variable to stop it needlessly being called four times and to make it easier to read
        found_lemma = find_lemma(normal_lemma(t.form), tag[0, 2])

        #Why does the lemma need to be at least as short as the form? Won't this prevent lemmatisation of e.g. aorists like видѣ/видѣти?
        #I don't understand why in your find_lemma() function you prevent the chopped-form from getting smaller than 4-characters long unless you're guarding against prepositions/prefixes being matched to loads of inappropriate stuff by the `l.lemma =~ /^#{form.chop}/` check, but that can't happen anyway if the lemma is banned from being bigger than the form. (See lemmafind_joe.rb)
        #shouldn't the length-comparison (if it should be there at all) be `found_lemma.lemma.length <= normal_lemma(t.form).length` to keep things consistent?
        if found_lemma and found_lemma.lemma.length <= form.length 
        
          STDERR.puts "Guessed lemma #{found_lemma}"
          lemma = "#{found_lemma.lemma},#{tag[0, 2]},#{s.source_division.source.language.to_s}"
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
      puts "Form mismatch: tag file has #{form}, source has #{t.form}, normalised #{normal(t.form)}"
    end
    t = t.next_object
  end
end
