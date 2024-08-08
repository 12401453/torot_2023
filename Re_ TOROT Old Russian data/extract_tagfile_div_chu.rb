require  '/home/hanne/proiel-webapp/config/environment'
require '~/tagging/normalise_orth.rb'

SourceDivision.find(ARGV[0]).sentences.map(&:id).each do |id|
  puts "%%#{id}"
  s = Sentence.find(id)
  s.tokens.reject(&:is_empty?).each do |t|
    puts normal(t.form)
  end
end

  
