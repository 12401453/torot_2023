# -*- coding: utf-8 -*-

require "json"


file = File.open('lcs_converted.json')

forms = JSON.load(file)

predicted_forms = []

forms.each do |f|
	f[2].values.each do |v|
		v[0].each do |pf|
		predicted_forms << pf
		end
	end
end

#puts predicted_forms.inspect

ini = []
mid = []
fin = []


predicted_forms.each do |pf|
	#STDERR.puts pf
	#STDERR.puts pf.split(//).last
	clusters = pf.split(/а|е|и|о|у|ы|ю|я|ü/)
	#STDERR.puts clusters.inspect
	clusters.each do |c|
		if c == clusters[0]
			ini << c
		elsif c == clusters.last and !['а','е','и','о','у','ы','ю','я','ü'].include?(pf.split(//).last)
			fin << c unless c == ''
		else
			mid << c
		end
	end
end

puts "Word-initial predicted clusters"
puts ini.uniq.inspect

puts "Word-internal predicted clusters"
puts mid.uniq.inspect

puts "Word-final predicted clusters"
puts fin.uniq.inspect


file2 = File.open('target_wiki_paradigms_deduplicated_nostress.json')

forms2 = JSON.load(file2)

#print forms2[0][1]["inflections"]

wiki_forms = []

forms2.each do |f|
	f[1]["inflections"].each do |wf|
		wiki_forms << wf
	end
end

#puts wiki_forms.join().split(//).uniq.inspect

wini = []
wfin = []
wmid = []

wiki_forms.each do |wf|
	#STDERR.puts wf
	#STDERR.puts wf.split(//).last
	clusters = wf.split(/а|у|ы|о|и|е|ю|я|ё|ѐ|э/)
	#STDERR.puts clusters.inspect
	clusters.each do |c|
		if c == clusters[0]
			wini << c
		elsif c == clusters.last and !["а","у","ы","о","и","е","ю","я","ё","ѐ","э"].include?(wf.split(//).last)
			wfin << c unless c == ''
		else
			wmid << c
		end
	end
end


puts "Word-initial wiki clusters"
puts wini.uniq.inspect

puts "Word-internal wiki clusters"
puts wmid.uniq.inspect

puts "Word-final wiki clusters"
puts wfin.uniq.inspect

puts "Word-initial predicted clusters missing from wiki data"
puts (ini.uniq - wini.uniq).inspect

puts "Word-internal predicted clusters missing from wiki data"
puts (mid.uniq - wmid.uniq).inspect

puts "Word-final predicted clusters missing from wiki data"
puts (fin.uniq - wfin.uniq).inspect



