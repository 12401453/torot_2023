require  '/home/hanne/proiel-webapp/config/environment'
require '/home/hanne/tagging/normalise_rus.rb'

SourceDivision.find(ARGV[0]).sentences.map(&:id).each do |id|
  puts "%%#{id}"
  s = Sentence.find(id)
  s.tokens.reject(&:is_empty?).each do |t|
    puts normal_rus(t.form)
  end
end

  
