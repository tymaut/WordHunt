#!/usr/bin/python
import MySQLdb
import string
import json

def getWords(keyValueArray):
	wordArray = []
	db = MySQLdb.connect(host="127.0.0.1",user="root",db="WordFindDB")
	cur = db.cursor()
	for key,value in keyValueArray.iteritems():
		query = "SELECT Word FROM Words WHERE Length=%s LIMIT %s" %(key,value)
		cur.execute(query)
		for row in cur.fetchall():
			wordArray.append(row[0])
	cur.close()
	db.close()
	return wordArray


level1= {'4':3,'5':3,'6':4,'7':3,'8':2}
print json.dumps(getWords(level1),indent=4, separators=(',', ': '))

