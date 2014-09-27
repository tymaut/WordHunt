/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx;			// Canvas rendering context

var time = 0;
var canvas,context,textCanvas,wordsContext;
var stringBuffer = "";
var dataInitialized = false;
var canvasWidth, canvasHeight;

$(document).ready(function(){
	setInterval("draw()", 100);
});

function initializeMap() {	
	canvas = document.getElementById("mainCanvas");
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;

	context = canvas.getContext("2d");
	context.scale(2,2);
	//context.fillStyle = "#0000ff";
	context.font = "bold 25px Arial";
}

window.onload = initializeMap;

function getWordList(callback)
{
	var req = $.getJSON("getWordList.php?level=0",function(data){
		callback(data);
    });
}

$(function(){
    /*
     * this swallows backspace keys on any non-input element.
     * stops backspace -> back
     */
    var rx = /INPUT|SELECT|TEXTAREA/i;
    $(document).bind("keydown keypress", function(e){
        if( e.which == 8 ){ // 8 == backspace
            if(!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly ){
                e.preventDefault();
            }
        }
    });
});


function randomFloat (min, max)
{
	return min + Math.random()*(max-min);
}

function matrixWidth(matrix)
{
	return matrix[0].length;
}

function matrixHeight(matrix)
{
	return matrix.length;
}

//direction:0:right, 1:45 degrees, 2:down
function checkFits(word,startV){
	var verLength = matrixHeight(matrix) - startV[0];
	var horLength = matrixWidth(matrix) - startV[1];
	switch(startV[2]){
		case 0:
			var margin = horLength-word.length;
			if(margin>=0)
				return true;
			return false;
			break;
		case 1:
			var margin1 = horLength-word.length;
			var margin2 = verLength-word.length;
			if((margin1>=0) && (margin2>=0))
				return true;
			return false;
			break;
		case 2:
			var margin = verLength-word.length;
			if(margin>=0)
				return true;
			return false;
			break;
	}
}

function checkSuits(word,startV){
	/*
	var fits = checkFits(matrix,word,startV,direction);
	if(!fits)
		return false;
	*/
	suitable = true;
	for (var i = 0; i < word.length; i++) {
		switch(startV[2]){
			case 0:
				if(!(((matrix[startV[0]][startV[1]+i] == word[i])) || matrix[startV[0]][startV[1]+i]==""))
					suitable = false;
				break;
			case 1:
				if(!(((matrix[startV[0]+i][startV[1]+i] == word[i])) || matrix[startV[0]+i][startV[1]+i]==""))
					suitable = false;			
				break;
			case 2:
				if(!(((matrix[startV[0]+i][startV[1]] == word[i])) || matrix[startV[0]+i][startV[1]]==""))
					suitable = false;			
				break;
		}

		if(!suitable)
			break;
	};
	return suitable;
}

function checkWordFits(word){
	var wordfitMatrix = [];
	for (var i = 0; i < matrix.length; i++) {
		for (var j = 0; j < matrix[i].length; j++) {
			if(checkFits(word,[i,j,0]))
				wordfitMatrix.push([i,j,0]);
			if(checkFits(word,[i,j,1]))
				wordfitMatrix.push([i,j,1]);
			if(checkFits(word,[i,j,2]))
				wordfitMatrix.push([i,j,2]);
		};
	};
	return wordfitMatrix;
}

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function createFitMatrix(wordList){
	var wordfitMatrix = [];
	for (var i = 0; i < wordList.length; i++) {
		var thisWordfitMatrix = [];
		var word = wordList[i];
		var wordFits = checkWordFits(word);
		if(wordFits.length == 0)
			return false;
		wordFits = [word,shuffle(wordFits)];
		wordfitMatrix.push(wordFits);
	};
	wordfitMatrix.sort(function(a, b){
	  return a[1].length - b[1].length; // ASC -> a - b; DESC -> b - a
	});	
	return wordfitMatrix;
}

function addToMatrix(word,startV,addToQueue){
	if(addToQueue)
		placementQueue.push([word,startV]);
	for (var i = 0; i < word.length; i++) {
		switch(startV[2]){
			case 0:
				matrix[startV[0]][startV[1]+i] = word[i];
				break;
			case 1:
				matrix[startV[0]+i][startV[1]+i] = word[i];
				break;
			case 2:
				matrix[startV[0]+i][startV[1]] = word[i];
				break;
		}
	};
}

function removeFromMatrix(){
	var current = placementQueue.pop();
	var word = current[0];
	var startV = current[1];
	for (var i = 0; i < word.length; i++) {
		switch(startV[2]){
			case 0:
				matrix[startV[0]][startV[1]+i] = "";
				break;
			case 1:
				matrix[startV[0]+i][startV[1]+i] = "";
				break;
			case 2:
				matrix[startV[0]+i][startV[1]] = "";
				break;
		}
	};
}

function a(_str){
	console.log(_str);
}
function createTableRec(level)
{
	if(level>=fitMatrix.length)
		return true;
	var alternatives = fitMatrix[level][1];
	var word = fitMatrix[level][0];
	for (var i = 0; i < alternatives.length; i++) {
		var startV = alternatives[i];
		if(checkSuits(word,startV)){
			addToMatrix(word,alternatives[i],true);
			if(level == fitMatrix.length){
				return true;
			}
			var found = createTableRec(level+1);
			if(found){
				return true;
			}
			else{
				removeFromMatrix();
				placeInMatrix();
			}
		}
		else
		{
		}
	};
	return false;
}

function placeInMatrix()
{
	clearMatrix();

	for (var i = 0; i < placementQueue.length; i++) {
		var word = placementQueue[i][0];
		var startV = placementQueue[i][1];
		addToMatrix(word,startV,false);	
	};
}

function initWordMatrix()
{
	var found = false;
		wordList = [];
		fitMatrix = [];
		clearMatrix();
		placementQueue = [];
		getWordList(function(data){
			for (var i = 0; i < data.length; i++) {
				wordList.push(data[i]);
			};
			setPuzzleSize(wordList);
			initEmptyMatrix();
			fitMatrix = createFitMatrix(wordList);
		    found = createTableRec(0);
		    if(!found)
		    	console.log("trying again");
		    else
		    	console.log("found one");
		});
	    if(found)
	    {
	    	placeInMatrix();
		    for(var i=0; i<puzzleSize; i++) {
			    for (var j = 0; j < puzzleSize; j++) {
		    		if(matrix[i][j] == "")
		    			matrix[i][j] = getRandomChar();
		    		//matrix[i][j] = "";
		    	};
			}
			dataLoaded = true;
		}
		console.log(wordList);
		console.log(placementQueue);
	
}

function clearMatrix()
{
	for (var i = 0; i < puzzleSize; i++) {
		for (var j = 0; j < puzzleSize; j++) {
			matrix[i][j] = "";
		};		
	};
}

function initEmptyMatrix()
{
	for(var i=0; i<puzzleSize; i++) {
		var arr = [];
	    for (var j = 0; j < puzzleSize; j++) {
	    	arr.push("");
	    };
		matrix.push(arr);
	}
}

function setPuzzleSize(wordList)
{
	puzzleSize = wordList.sort(function (a, b) { return b.length - a.length; })[0].length;
}

function getRandomChar()
{
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var rnum = Math.floor(Math.random() * chars.length);
	return chars[rnum];
}

var matrix = [];
var wordList = [];
var fitMatrix = [];
var placementQueue = [];
var puzzleSize = 0;
var dataLoaded = false;
var topLeft = [20,20];
var cellMargin = 40;

initWordMatrix();

function drawBorders()
{
	for (var i = 0; i <= puzzleSize; i++) {
		context.moveTo(topLeft[0],topLeft[1]+i*cellMargin);
		context.lineTo(topLeft[0]+puzzleSize*cellMargin,topLeft[1]+i*cellMargin);
		context.stroke();
		context.moveTo(topLeft[0]+i*cellMargin,topLeft[1]);
		context.lineTo(topLeft[0]+i*cellMargin,topLeft[1]+puzzleSize*cellMargin);
		context.stroke();
	};
}

function drawWords(){
	for(var i=0; i<puzzleSize; i++) {
	    var x=i*cellMargin+topLeft[0]+cellMargin/4;
	    for (var j = 0; j < puzzleSize; j++) {
	    	var y = j*cellMargin+topLeft[1]+cellMargin/1.5;
	    	context.fillText(matrix[i][j], x,y);	
	    };
	}
}


function draw() {
	if(dataLoaded){
		context.clearRect(0,0,canvas.width,canvas.height);
		context.fillStyle = "#000000";
		drawWords();
		drawBorders();
	}
}

/*
for (var i = 0; i < fitMatrix.length; i++) {
	console.log(fitMatrix[i][0]+"  "+fitMatrix[i][1].length);
	
	for (var j = 0; j < fitMatrix[i][1].length; j++) {
		console.log(fitMatrix[i][1][j]);
	};
	
};
*/
