#!/usr/bin/python
import MySQLdb
import string
import json
import random

matrix = []
wordList = []
fitMatrix = []
placementQueue = []
puzzleSize = 0

#direction:0: 0 degrees, 1:-45 degrees, 2:-90 degrees, 3:-135 degrees, 4:-180 degrees, 5:-215 degrees, 6:-270 degrees, 7: -315 degrees
def checkFits(word,startV):
	startX = startV[0]
	startY = startV[1]
	wordLength = len(word)
	horMarginRight = puzzleSize-(startY+wordLength)
	verMarginBottom = puzzleSize-(startX+wordLength)
	horMarginLeft = startY-wordLength+1
	verMarginUp = startX-wordLength+1
	if(startV[2] == 0):
		if(horMarginRight>=0):
			return True
		return False
	if(startV[2] == 1):
		if((horMarginRight>=0) and (verMarginBottom>=0)):
			return True
		return False
	if(startV[2] == 2):
		if(verMarginBottom>=0):
			return True
		return False
	if(startV[2] == 3):
		if((horMarginLeft>=0) and (verMarginBottom>=0)):
			return True
		return False
	if(startV[2] == 4):
		if(horMarginLeft>=0):		
			return True
		return False
	if(startV[2] == 5):
		if((horMarginLeft>=0) and (verMarginUp>=0)):		
			return True
		return False
	if(startV[2] == 6):
		if(verMarginUp>=0):
			return True
		return False
	if(startV[2] == 7):
		if((horMarginRight>=0) and (verMarginUp>=0)):
			return True
		return False

def checkSuits(word,startV):
	startX = startV[0]
	startY = startV[1]
	for i in range(0,len(word)):
		if(startV[2] == 0):
			dir0 = matrix[startX][startY+i]
			if(not(dir0 == word[i] or dir0== "")):
				return False
		elif(startV[2] == 1):
			dir1 = matrix[startX+i][startY+i]
			if(not(dir1 == word[i] or dir1 == "")):
				return False
		elif(startV[2] == 2):
			dir2 = matrix[startX+i][startY]
			if(not(dir2 == word[i] or dir2 == "")):
				return False
		elif(startV[2] == 3):
			dir3 = matrix[startX+i][startY-i]
			if(not(dir3 == word[i] or dir3 == "")):
				return False
		elif(startV[2] == 4):
			dir4 = matrix[startX][startY-i]
			if(not(dir4 == word[i] or dir4 == "")):
				return False
		elif(startV[2] == 5):
			dir5 = matrix[startX-i][startY-i]
			if(not(dir5 == word[i] or dir5 == "")):
				return False
		elif(startV[2] == 6):
			dir6 = matrix[startX-i][startY]
			if(not(dir6 == word[i] or dir6 == "")):
				return False
		elif(startV[2] == 7):
			dir7 = matrix[startX-i][startY+i]
			if(not(dir7 == word[i] or dir7 == "")):
				return False
	return True

def checkWordFits(word):
	wordfitMatrix = []
	for i in range(0,puzzleSize):
		for j in range(0,puzzleSize):
			if(checkFits(word,[i,j,0])):
				wordfitMatrix.append([i,j,0])
			if(checkFits(word,[i,j,1])):
				wordfitMatrix.append([i,j,1])
			if(checkFits(word,[i,j,2])):
				wordfitMatrix.append([i,j,2])
			if(checkFits(word,[i,j,3])):
				wordfitMatrix.append([i,j,3])
			if(checkFits(word,[i,j,4])):
				wordfitMatrix.append([i,j,4])
			if(checkFits(word,[i,j,5])):
				wordfitMatrix.append([i,j,5])
			if(checkFits(word,[i,j,6])):
				wordfitMatrix.append([i,j,6])
			if(checkFits(word,[i,j,7])):
				wordfitMatrix.append([i,j,7])
	return wordfitMatrix

def createFitMatrix():
	wordfitMatrix = []
	for i in range(0,len(wordList)):
		thisWordfitMatrix = []
		word = wordList[i]
		wordFits = checkWordFits(word)
		if(len(wordFits) == 0):
			return False
		random.shuffle(wordFits)
		wordFits = [word,wordFits]
		wordfitMatrix.append(wordFits)
	wordfitMatrix.sort(key=len, reverse=True)
	return wordfitMatrix

def addToMatrix(word,startV,addToQueue):
	global matrix,placementQueue
	startX = startV[0]
	startY = startV[1]
	if(addToQueue):
		placementQueue.append([word,startV])
	for i in range(0,len(word)):
		if(startV[2]==0):
			matrix[startX][startY+i] = word[i]
		if(startV[2]==1):
			matrix[startX+i][startY+i] = word[i]
		if(startV[2]==2):
			matrix[startX+i][startY] = word[i]
		if(startV[2]==3):
			matrix[startX+i][startY-i] = word[i]
		if(startV[2]==4):
			matrix[startX][startY-i] = word[i]
		if(startV[2]==5):
			matrix[startX-i][startY-i] = word[i]
		if(startV[2]==6):
			matrix[startX-i][startY] = word[i]
		if(startV[2]==7):
			matrix[startX-i][startY+i] = word[i]						

def removeFromMatrix():
	global matrix, placementQueue
	current = placementQueue.pop()
	word = current[0]
	startV = current[1]
	startX = startV[0]
	startY = startV[1]
	for i in range(0,len(word)):
		if(startV[2]==0):
			matrix[startX][startY+i] = ""
		if(startV[2]==1):
			matrix[startX+i][startY+i] = ""
		if(startV[2]==2):
			matrix[startX+i][startY] = ""
		if(startV[2]==3):
			matrix[startX+i][startY-i] = ""
		if(startV[2]==4):
			matrix[startX][startY-i] = ""
		if(startV[2]==5):
			matrix[startX-i][startY-i] = ""
		if(startV[2]==6):
			matrix[startX-i][startY] = ""
		if(startV[2]==7):
			matrix[startX-i][startY+i] = ""	

def a(_str):
	print(_str)
iter = 0
def createTableRec(level):
	global iter
	iter = iter + 1
	if(iter >= 500000):
		return False
	if(level>=len(fitMatrix)):
		return True
	alternatives = fitMatrix[level][1]
	word = fitMatrix[level][0]
	for i in range(0,len(alternatives)):
		startV = alternatives[i]
		if(checkSuits(word,startV)):
			addToMatrix(word,alternatives[i],True)
			if(level == len(fitMatrix)):
				return True
			found = createTableRec(level+1)
			if(found):
				return True
			else:
				removeFromMatrix()
				placeInMatrix()
	return False


def placeInMatrix():
	initEmptyMatrix()
	for place in placementQueue:
		word = place[0]
		startV = place[1]
		addToMatrix(word,startV,False)	
	

levels = [{5:3,6:3,7:2,8:2}, {5:4,6:3,7:2,8:2,9:1},{5:5,6:2,7:2,8:1,9:1}]
def getWords():
	level = random.choice(levels)
	wordArray = []
	db = MySQLdb.connect(host="127.0.0.1",user="root",db="WordFindDB")
	cur = db.cursor()
	for key,value in level.iteritems():
		query = "SELECT Word FROM Words WHERE Length=%s ORDER BY RAND() LIMIT %s" %(key,value)
		cur.execute(query)
		for row in cur.fetchall():
			wordArray.append(row[0])
	cur.close()
	db.close()
	return wordArray

def fillEmptyCells():
	global matrix
	for i in range(0,puzzleSize):
		for j in range(0,puzzleSize):
			if(matrix[i][j] == ""):
				matrix[i][j] = getRandomChar()

def initGlobals():
	global matrix,wordList,fitMatrix,placementQueue,puzzleSize
	matrix = []
	wordList = []
	fitMatrix = []
	placementQueue = []
	puzzleSize = 0

def initEmptyMatrix():
	global matrix
	matrix = [["" for x in xrange(puzzleSize)] for x in xrange(puzzleSize)]

def setPuzzleSize():
	global wordList, puzzleSize
	wordList.sort(key=len, reverse=True)
	puzzleSize = len(wordList[0])

def getRandomChar():
	return random.choice(string.ascii_uppercase)

total = 0
def initWordMatrix():
	global wordList, fitMatrix, total, iter
	a("start")
	found = False
	while(True):
		try:
			if(total == 1000):
				break
			a("trying...")
			initGlobals()
			wordList = getWords()
			setPuzzleSize()
			initEmptyMatrix()
			fitMatrix = createFitMatrix()
			iter = 0
			found = createTableRec(0)
			if(found):
				total = total + 1
				a("pushing to DB item # "+str(total))
				pushToDB()
		except:
			a("Exception")
			pass
#	a(matrix)
#	a(placementQueue)
#	placeInMatrix()
#	fillEmptyCells()
#	dataLoaded = True
	a("that's all")

def pushToDB():
	config = json.dumps(placementQueue)
	db = MySQLdb.connect(host="127.0.0.1",user="root",db="WordFindDB")
	cur = db.cursor()
	query = "INSERT INTO Configurations (`Config`) VALUES ('%s')" %(config)
	cur.execute(query)
	db.commit()
	cur.close()
	db.close()

initWordMatrix()




