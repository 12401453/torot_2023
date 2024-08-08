#!/usr/bin/env ruby

# def find_lemma_joe(str)
#   target = "vizimenti"  
  
#  # lem = nil
#   if str == target
#     lem = target
#   elsif str.length > 4 and target =~ /^#{str}/
#     #str = str.chop
#     #puts "Chopping form to #{str}"
#     lem = target
#   elsif str.length > 4
#     str = str.chop
#     puts "Chopping form to #{str}"
#     lem = find_lemma_joe(str)
#   else
#     lem = "FUCK YOU BITCH!"
#   end
#   return lem
# end 

def find_lemma_joe(form, lemma)
  lem = nil
  if form == lemma
    lem = lemma
  elsif form.length > 3 and lemma =~ /^#{form}/
    STDERR.puts form
    lem = lemma
  elsif form.length > 3
    form = form.chop
    lem = find_lemma_joe(form, lemma)
  end
  return lem
end


puts "Lemma is: #{find_lemma_joe(ARGV[0], ARGV[1])}"
