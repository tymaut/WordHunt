#!/usr/bin/python
import MySQLdb
import string

def insertWord(n):
	file = open('words/words{0}.txt'.format(n))
	arr = file.read().split(" ")
	for word in arr:
		if((len(word)!=0)):
			query = "INSERT INTO Words (`Word`,`Length`) VALUES ('{0}',{1})".format(word.upper(),len(word))
			cur.execute(query)
			db.commit()


db = MySQLdb.connect(host="127.0.0.1",user="root",db="WordFindDB")
cur = db.cursor()
insertWord(3)
insertWord(4)
insertWord(5)
insertWord(6)
insertWord(7)
insertWord(8)
insertWord(9)
insertWord(10)
insertWord(11)

cur.close()
db.close()


