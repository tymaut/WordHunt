Word Hunt game. It can be tested from www.yavuzkozak.org/wordhunt

the getPuzzle.php file that is accesed from script.js returns json puzzle data which is as follows:

[[word1,[x1,y1,direction1]],[word2,[x2,y2,direction2]]...]

Example:

[["NAUPLIOID", [8, 0, 0]], ["LOFTLESS", [0, 8, 3]], ["OVERFLY", [0, 6, 3]], ["OUTCOME", [7, 2, 7]], ["ARAFAT", [5, 0, 7]], ["SHABBY", [7, 8, 4]], ["QUOTH", [6, 8, 6]], ["PANSY", [0, 7, 3]], ["UPPER", [0, 1, 2]], ["STAGY", [3, 7, 3]], ["LARKY", [0, 0, 2]]]

first item is the word
second item is the start vector
  first item in start vector is the cell x coordinate in the puzzle
  second item in start vector is the cell y coordinate in the puzzle
  third item in start vector is the direction of the word in the puzzle (0:left,1:-45 degrees,2:-90 degrees(down)...7:+45 degrees)
  
getPuzzle.php file fetches a random puzzle configuration from a local database which holds many unique puzzle configurations
