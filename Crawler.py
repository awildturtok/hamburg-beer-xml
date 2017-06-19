#!/usr/bin/env python
# -*- coding: utf-8 -*-

import urllib
import urllib2
from lxml import html
import requests

#mainLink is serach url from query = "File:Objektbild Hamburg",
#i checked some of the picture data,which is the Author "Historische Museen Hamburg"
#and i found out all of them have the "File:Objektbild" in title.
#because of that i tried to search all result of "File:Objektbild Hamburg" 
#and make this link as source page for the Skript.
mainLink = 'https://commons.wikimedia.org/w/index.php?title=Special:Search&limit=500&offset=0&profile=default&search=File%3AObjektbild+Hamburg&uselang=de&searchToken=6z54nl2rmfpfpz04u8e0elqiw'

#wikiMedia_Common_Links_zu_Bilder is text file to save the wikimedia result
wikiMedia_Common_Links_zu_Bilder='wikiMedia_Common_Links_zu_Bilder.txt'

file = open(wikiMedia_Common_Links_zu_Bilder, 'w')

page = requests.get(mainLink)
tree = html.fromstring(page.content)
#using XPath expression to find not absolout path
link = tree.xpath('//td/a/@href')
#make absolute image URL in wikiMedia_Common_Links_zu_Bilder
for p in link:
	url = "https://commons.wikimedia.org"+str(p)
	file.write(url)
	file.write('\n')
	#print(url)
file.close()

#delet duplicate line in wikiMedia_Common_Links_zu_Bilder.txt
lines_seen = set() # holds lines already seen
outfile = open('wikiMedia_Common_Links_zu_Bilder_without_duplicate.txt', "w")
for line in open('wikiMedia_Common_Links_zu_Bilder.txt', "r"):
    if line not in lines_seen: # not a duplicate
        outfile.write(line)
        lines_seen.add(line)
outfile.close()

#downloading all the links in all_Bilder_in_page_without_duplicate.txt
with open("wikiMedia_Common_Links_zu_Bilder_without_duplicate.txt") as fp:
	lines = fp.readlines()
	#print(lines)
	for k in range(0,len(lines)-1):
		page = requests.get(lines[k])
		tree = html.fromstring(page.content)
		link = tree.xpath('//div[@class="fullMedia"]/a/@href')
		title = tree.xpath('//div[@class="fullMedia"]/a/@title')
		print(link)
		print(title)
		urllib.urlretrieve(link[0], title[0])
