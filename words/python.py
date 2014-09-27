#!/usr/bin/python
import MySQLdb
db = MySQLdb.connect(host="localhost",user="wordFindUser",passwd="password",db="WordFind")
cur = db.cursor()
file = open('words/words6.txt')
print file.read()
