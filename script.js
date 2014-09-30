
/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx;			// Canvas rendering context

var time = 0;
var canvas,context,infoDiv;
var stringBuffer = "";
var dataInitialized = false;

var matrix = [];
var placementQueue = [];
var puzzleSize = 0;
var dataLoaded = false;
var topLeft = [10,2];
var cellMargin = 40;
var completionArray = [];


$(document).ready(function(){
	setInterval("drawWordList()",100);
	setInterval("updateScoreTable()",250);
});

function initializeMap() {	
	canvas = document.getElementById("mainCanvas");
	context = canvas.getContext("2d");
	context.font = "bold 26px Arial";

	infoDiv = document.getElementById("infoDiv");
	getAPuzzleConfig();

	canvas.addEventListener("touchstart", downEventTouch, false);
	canvas.addEventListener("touchend", upEventTouch, false);
	canvas.addEventListener("touchleave", leaveEventTouch, false);
	canvas.addEventListener("touchmove", moveEventTouch, false);

	canvas.addEventListener("mousedown", downEvent, false);
	canvas.addEventListener("mouseup", upEvent, false);
	canvas.addEventListener("mouseleave", leaveEvent, false);
	canvas.addEventListener("mousemove", moveEvent, false);	


}
//document.ontouchmove = function(e) {e.preventDefault()};
window.onload = initializeMap;


function getRemote(url) {
    return $.ajax({
        type: "GET",
        url: url,
        async: false
    }).responseText;
}

function getAPuzzleConfig()
{
	dataLoaded = false;
	config = getRemote("getPuzzle.php");
	if(config.length>0)
		placementQueue = jQuery.parseJSON(config);
	setPuzzleSize();
	var m = (canvas.width - puzzleSize*cellMargin)/2;
	topLeft = [m,2];
	initEmptyMatrix();
	placeInMatrix();
	fillEmptyCells();
	dataLoaded = true;
	createCompletionArray();
	time = 0;	
	drawPuzzle();
	drawWordList();
	

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

function addToMatrix(index){
	var startV = placementQueue[index][1];
	var word = placementQueue[index][0];
	var startX = startV[0];
	var startY = startV[1];
	var lastCell = [];
	for (var i = 0; i < word.length; i++) {
		var last = (i == word.length-1);
		switch(startV[2]){
			case 0:
				if(last)
					lastCell = [startX,startY+i];
				matrix[startX][startY+i] = word[i];
				break;
			case 1:
				if(last)
					lastCell = [startX+i,startY+i];
				matrix[startX+i][startY+i] = word[i];
				break;
			case 2:
				if(last)
					lastCell = [startX+i,startY];
				matrix[startX+i][startY] = word[i];
				break;
			case 3:
				if(last)
					lastCell = [startX+i,startY-i];
				matrix[startX+i][startY-i] = word[i];
				break;
			case 4:
				if(last)
					lastCell = [startX,startY-i];
				matrix[startX][startY-i] = word[i];
				break;
			case 5:
				if(last)
					lastCell = [startX-i,startY-i];
				matrix[startX-i][startY-i] = word[i];
				break;
			case 6:
				if(last)
					lastCell = [startX-i,startY];
				matrix[startX-i][startY] = word[i];
				break;
			case 7:
				if(last)
					lastCell = [startX-i,startY+i];
				matrix[startX-i][startY+i] = word[i];
				break;
		}
	};
	placementQueue[index] = ([word,startV,lastCell]);
}

function fillEmptyCells()
{
	for(var i=0; i<puzzleSize; i++) {
	    for (var j = 0; j < puzzleSize; j++) {
			if(matrix[i][j] == "")
				matrix[i][j] = getRandomChar();
		}
	}
}

function placeInMatrix()
{
	for (var i = 0; i < placementQueue.length; i++) {
		var word = placementQueue[i][0];
		var startV = placementQueue[i][1];
		addToMatrix(i);	
	};
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
	matrix = [];
	for(var i=0; i<puzzleSize; i++) {
		var arr = [];
	    for (var j = 0; j < puzzleSize; j++) {
	    	arr.push("");
	    };
		matrix.push(arr);
	}
}

function setPuzzleSize()
{
	var longest = placementQueue[0][0].length;
	puzzleSize = longest;
}

function getRandomChar()
{
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var rnum = Math.floor(Math.random() * chars.length);
	return chars[rnum];
}

function drawBorders()
{
	context.strokeStyle = "#000000";
	context.lineWidth = 1;
	for (var i = 0; i <= puzzleSize; i++) {
		context.beginPath();
		context.moveTo(topLeft[0],topLeft[1]+i*cellMargin);
		context.lineTo(topLeft[0]+puzzleSize*cellMargin,topLeft[1]+i*cellMargin);
		context.closePath();
		context.stroke();
		context.beginPath();
		context.moveTo(topLeft[0]+i*cellMargin,topLeft[1]);
		context.lineTo(topLeft[0]+i*cellMargin,topLeft[1]+puzzleSize*cellMargin);
		context.closePath();
		context.stroke();
	};
}

function drawWords(){
	context.fillStyle = "#000000";
	for(var i=0; i<puzzleSize; i++) {
	    var x=i*cellMargin+topLeft[0]+cellMargin/4;
	    for (var j = 0; j < puzzleSize; j++) {
	    	var y = j*cellMargin+topLeft[1]+cellMargin/1.5;
	    	context.fillText(matrix[i][j], x,y);	
	    }
	}
}

function drawCompletedWords(){
	for (var i = 0; i < completionArray.length; i++) {
		if(completionArray[i]){
			var word = placementQueue[i][0];
			var startV = placementQueue[i][1];
			var endV = placementQueue[i][2];
			var startCoor = [topLeft[0]+startV[0]*cellMargin+cellMargin/2,topLeft[1]+startV[1]*cellMargin+cellMargin/2];
			var endCoor = [topLeft[0]+endV[0]*cellMargin+cellMargin/2,topLeft[1]+endV[1]*cellMargin+cellMargin/2];
			context.strokeStyle = "#bb0000";
			context.lineWidth = 3;
			context.beginPath();
			context.moveTo(startCoor[0],startCoor[1]);
			context.lineTo(endCoor[0],endCoor[1]);
			context.closePath();
			context.stroke();
		}
	};
}

function drawPuzzle()
{
	if(dataLoaded){
		context.clearRect(0,0,canvas.width,canvas.height);
		context.fillStyle = "#ffffff";
		context.fillRect(0,0,canvas.width,canvas.height);
		drawWords();
		drawBorders();
		drawCompletedWords();
	}
}


function drawWordList()
{
	if(!placementQueue.length>0)
		return;
	var s = "<table border='1'><tr>";
	var j = 0;
	for (var i = 0; i < placementQueue.length; i++) {
		if(j++==4){
			s = s+"</tr><tr>";
			j = 1;
		}
		s = s+"<td>"
		word = placementQueue[i][0];
		var completed = completionArray[i]
		if(completed)
			s = s + "<del>"+word+"</del>";
		else
			var s = s + word;
		s = s+"</td>";
	};
	s = s+"</table>"
	$("#infoDiv").html(s);
}

function updateScoreTable()
{
	if(dataLoaded){
		time += 250;
		var text = "";
		text += "Time: "+Math.round(time/1000) +" seconds\n";
		document.getElementById("statArea").value = text;
	}
}

var cellStart = [];
var lineStart = [];
var cellEnd = [];
var lineEnd = [];
var lineEnd = [];
var paint;

function createCompletionArray()
{
	completionArray = [];
	for (var i = 0; i < placementQueue.length; i++) {
		completionArray.push(false);
	};
}

function setCompleted(i)
{
	if(i>=0){
		completionArray[i] = true;
	}
	drawWordList();
}

function checkPuzzleState(){
	var completed = true;
	for (var i = 0; i < completionArray.length; i++) {
		completed = completed & completionArray[i];
	};	
	return completed;
}

function findNearestCell(Point,n)
{
	pointX = Point[0];
	pointY = Point[1];
	var near = [1000,1000];
	var nearCellCoor = [];
	var nearCell = [];
	for(var i=0;i<puzzleSize;i++){
		cellX = topLeft[0]+i*cellMargin+cellMargin/2;
		cellY = topLeft[1]+i*cellMargin+cellMargin/2;
		if(Math.abs(pointX-cellX)<near[0]){
			near[0] = Math.abs(pointX-cellX)
			nearCell[1] = i;
			nearCellCoor[0] = cellX;
		}
		if(Math.abs(pointY-cellY)<near[1]){
			near[1] = Math.abs(pointY-cellY)
			nearCell[0] = i;
			nearCellCoor[1] = cellY;
		}
	}
	if(n==0){
		cellStart = nearCell;
		lineStart = nearCellCoor;
	}
	else
	{
		cellEnd = nearCell;
		lineEnd = nearCellCoor;
	}
}

function getWordOnSelection(cells)
{
	startCell = cells[0];
	endCell = cells[1];
	diffX = endCell[1]-startCell[1];
	diffY = endCell[0]-startCell[0];
	word = "";
	if(diffX == 0 && diffY != 0){
		for(var i=startCell[0];i!=endCell[0]+Math.abs(diffY)/diffY;i=i+Math.abs(diffY)/diffY){
			word = word+matrix[startCell[1]][i];
		}
	}
	else if(diffY==0 && diffX != 0){
		for(var i=startCell[1];i!=endCell[1]+Math.abs(diffX)/diffX;i=i+Math.abs(diffX)/diffX){
			word = word+matrix[i][startCell[0]];
		}
	}
	else if(Math.abs(diffX)==Math.abs(diffY) && diffX!=0){
		multY = Math.abs(diffY)/diffY;
		multX = Math.abs(diffX)/diffX;
		for(var i=0;i<=Math.abs(diffX);i++){
			word = word+matrix[startCell[1]+i*multX][startCell[0]+i*multY];
		}
	}
	else {
		return false;
	}
	return word;
}

function wordLookUp(startV){
	for (var i = 0; i < placementQueue.length; i++) {
		var word = placementQueue[i][0];
		var thisStartV = placementQueue[i][1];
		if(startV[0] == thisStartV[1] && startV[1] == thisStartV[0] && startV[2] == thisStartV[2] && word.length == startV[3]){
			return i;
		}
	};
	return -1;
}

function getSelectionVector(cells)
{
	startCell = cells[0];
	endCell = cells[1];
	diffX = endCell[1]-startCell[1];
	diffY = endCell[0]-startCell[0];
	word = "";
	if(diffY == 0 && diffX > 0)
		return [startCell[0],startCell[1],2,diffX+1];
	else if(Math.abs(diffX)==Math.abs(diffY) && diffX>0 && diffY>0)
		return [startCell[0],startCell[1],1,Math.abs(diffX)+1];
	else if(diffX==0 && diffY > 0)
		return [startCell[0],startCell[1],0,diffY+1];
	else if(Math.abs(diffX)==Math.abs(diffY) && diffX<0 && diffY>0)
		return [startCell[0],startCell[1],7,Math.abs(diffX)+1];
	else if(diffY==0 && diffX < 0)
		return [startCell[0],startCell[1],6,-diffX+1];
	else if(Math.abs(diffX)==Math.abs(diffY) && diffX<0 && diffY<0)
		return [startCell[0],startCell[1],5,Math.abs(diffX)+1];
	else if(diffX == 0 && diffY < 0)
		return [startCell[0],startCell[1],4,-diffY+1];
	else if(Math.abs(diffX)==Math.abs(diffY) && diffX>0 && diffY<0)
		return [startCell[0],startCell[1],3,Math.abs(diffX)+1];
	else {
		return false;
	}
}

function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function downEvent(e){   
	e.preventDefault();
	var pos = findPos(document.getElementById("mainCanvas"));
	findNearestCell([e.pageX - pos.x,e.pageY - pos.y],0);
	paint = true;
}

function moveEvent(e){
	e.preventDefault();
	var pos = findPos(document.getElementById("mainCanvas"));
	var prevEnd = cellEnd;
	if(paint){
		findNearestCell([e.pageX - pos.x,e.pageY - pos.y],1);
	}
	if(prevEnd[0]!=cellEnd[0] || prevEnd[1] != cellEnd[1]){
		drawPuzzle();
	}
	drawSelectionLine();
}

function upEvent(e){
	selectionCells = [cellStart,cellEnd];
	var selectedWord = getWordOnSelection(selectionCells);
	var selectionV = getSelectionVector(selectionCells);
	setCompleted(wordLookUp(selectionV));
	var completed = checkPuzzleState();
	drawPuzzle();
	if(completed)
		getAPuzzleConfig();
	lineStart = [];
	cellStart = [];
	lineEnd = [];
	cellEnd = [];
	paint = false;
}

function leaveEvent(e){
	lineStart = [];
	cellStart = [];
	lineEnd = [];
	cellEnd = [];
	paint = false;
}

function downEventTouch(e){    
	e.preventDefault();
	downEvent(e);
}

function moveEventTouch(e){
	e.preventDefault();
	moveEvent(e);
}

function upEventTouch(e){
	e.preventDefault();
	upEvent(e);
}

function leaveEventTouch(e){
	e.preventDefault();
	leaveEvent(e);
}


function drawSelectionLine()
{
	if(paint)
	{
		context.strokeStyle = "#df4b26";
		context.lineWidth = 4;
		//handDrawLine(context,lineStart[0],lineStart[1],lineEnd[0],lineEnd[1]);
		
		context.strokeStyle = "#df4b26";
		context.lineJoin = "round";
		context.lineWidth = 8;
		context.beginPath();
		context.moveTo(lineStart[0], lineStart[1]);
		context.lineTo(lineEnd[0],lineEnd[1]);
		context.closePath();
		context.stroke();
		
	}

}

function fuzz(x, f){
    return x + Math.random()*f - f/2;
}



// estimate the movement of the arm
// x0: start
// x1: end
// t: step from 0 to 1
function handDrawMovement(x0, x1, t){
    return x0 + (x0-x1)*(
            15*Math.pow(t, 4) -
            6*Math.pow(t, 5) -
            10*Math.pow(t,3)
    )
}


// inspired by this paper
// http://iwi.eldoc.ub.rug.nl/FILES/root/2008/ProcCAGVIMeraj/2008ProcCAGVIMeraj.pdf
function handDrawLine(ctx, x0, y0, x1, y1){
    ctx.moveTo(x0, y0)

    var d = Math.sqrt((x1-x0)*(x1-x0)+(y1-y0)*(y1-y0))

    var steps = d/25;
    if(steps < 4) {
        steps = 4;
    }
    // fuzzyness
    var f = 8.0;
    for(var i = 1; i <= steps; i++)
    {
        var t1 = i/steps;
        var t0 = t1-1/steps
        var xt0 = handDrawMovement(x0, x1, t0)
        var yt0 = handDrawMovement(y0, y1, t0)
        var xt1 = handDrawMovement(x0, x1, t1)
        var yt1 = handDrawMovement(y0, y1, t1)
        ctx.beginPath();
        ctx.quadraticCurveTo(fuzz(xt0, f), fuzz(yt0, f), xt1, yt1)
        ctx.closePath();
    	ctx.stroke();
        ctx.moveTo(xt1, yt1)
    }

}


