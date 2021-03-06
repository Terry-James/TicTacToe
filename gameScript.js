// variables for board, player and AI
var origBoard;
var humanPlayer = 'X';
var aiPlayer = 'O';

// Create a 2D Array of all winning combinations for the game.
const winningStates = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[6, 4, 2]
]; // Note: constant variables cannot have their values changed but properties can be.

// Used to select the different cells in the table created in index.html.
var cells = document.querySelectorAll('.cell');

// Original start game
startGame();

// Start game function
function startGame() {
	var checkPlayer = document.getElementById("AI");
	// will use the gameOver styling when the game is reset. Already reset when game original starts.
	document.querySelector(".gameOver").style.display = "none";

	// Loops threw each cell to establish index inorder to click each cell
	// These numbers can be referenced later to check for empty cells.
	origBoard = Array.from(Array(9).keys()); // Creates the array of keys or numbers
	for (var i = 0; i < cells.length; i++) {
		cells[i].innerText = ''; // sets inner text to nothing
		cells[i].style.removeProperty('background-color'); // important for restart
		cells[i].addEventListener('click', mouseClick, false);
	}
	if(checkPlayer.checked == true){// check if the radio button is checked
		humanPlayer = 'O';
		aiPlayer = 'X';
		if(!checkTie() && !winGame(origBoard, humanPlayer)){
			turn(bestPosition(), aiPlayer);
		}
	}
}

// Allows for using the mouse to click cells and not allowing same cell selection.
function mouseClick(boardSpace) {
	if (typeof origBoard[boardSpace.target.id] == 'number') {// typeof returns a primitive data type
		turn(boardSpace.target.id, humanPlayer)
		// As long as game is not in a tie state AI looks for best position
		if (!checkTie() && !winGame(origBoard, humanPlayer)){
			turn(bestPosition(), aiPlayer);
		} 
		if (!checkTie() && !winGame(origBoard, humanPlayer)){ // used to check for tie when ai goes first
			turn(boardSpace.target.id, humanPlayer)
		}
	}
}

// Submits the number of the cell clicked along with player
function turn(squareId, player) {
	origBoard[squareId] = player; // sets cell to either X or O
	document.getElementById(squareId).innerText = player;// sets cell to either X or O
	var gameWon = winGame(origBoard, player) // returns true or false if someone wins
	if (gameWon) { // if true
		gameOver(gameWon);
	}
}

// Check for winning states using fat arrow notation
function winGame(board, player) { // passes different states of the board
	// finds all the places on the board that have already been played in.
	// Reduces element down to one number accum is set to an array that played indexes are added to.
	var plays = board.reduce((accum, element, index) =>
		(element === player) ? accum.concat(index) : accum, []);// set accum to array
	var gameWon = null;

	for (let [index, win] of winningStates.entries()) { 
		// Loops thru and checks cells played using plays variable to check in winning states array
		if (win.every(elem => plays.indexOf(elem) > -1)) {
			gameWon = { index: index, player: player }; // name: value pairing
			break;
		}
	}
	return gameWon;
}

// sets the game over state so that no more cells can be clicked
function gameOver(gameWon) {
	for (var i = 0; i < cells.length; i++) {
		cells[i].removeEventListener('click', mouseClick, false);
	}
	// call the function to display appropriate winning message. Player can never win
	winMessage(gameWon.player == humanPlayer ? "Player never wins!" : "You will never win.");
}

// Displays text box at game end to display winning message
function winMessage(_player) {
	document.querySelector(".gameOver").style.display = "block";
	document.querySelector(".gameOver .text").innerText = _player;
}

//=> means parameters => { statements }
// Checks if a cell is still empty
function emptySquares() {
	// returns a list of empty cells by checking if its still a number instead of an X or O
	return origBoard.filter(s => typeof s == 'number'); // uses arrow notation s is a parameter
}

// Looks for the best position for ai to move
function bestPosition() {
	return minimax(origBoard, aiPlayer).index;
}

// Checks if all cells are filled and that there is no winner
function checkTie() {
	if (emptySquares().length == 0) {
		// remove mouse click if all cells are filled 
		for (var i = 0; i < cells.length; i++) {
			cells[i].removeEventListener('click', mouseClick, false);
		}
		winMessage("TIE \n So Close!")
		return true;
	}
	return false;
}

// Uses a minimax algorithm to determine best position for the ai to move
// This algorithm executes a recursive call to determine the best score/move at each stage of the game
function minimax(newBoard, player) {
	var openSpaces = emptySquares();

	if (winGame(newBoard, humanPlayer)) {
		return { score: -10 }; // returns -10 if ai turn is not a winning move or is a human winning move
	}
	else if (winGame(newBoard, aiPlayer)) {
		return { score: 10 }; // returns 10 if the move by ai is a winning move or not a winning move by the human player
	}
	else if (openSpaces.length === 0) {
		return { score: 0 }; // means no space are left the game is over.
	}
	var scoreCollection = []; // used to collect scores
	for (var i = 0; i < openSpaces.length; i++) {
		var move = {};// used to collect scores for ai move
		move.index = newBoard[openSpaces[i]];
		newBoard[openSpaces[i]] = player;

		if (player == aiPlayer) {
			var result = minimax(newBoard, humanPlayer);
			move.score = result.score; // stores score into move variable
		}
		else {
			var result = minimax(newBoard, aiPlayer);
			move.score = result.score; // stores score into move variable
		}

		newBoard[openSpaces[i]] = move.index;

		scoreCollection.push(move);
	}

	var best;
	// used to make sure ai place move in the best position based on the highest number in the highest layer of the tree.
	if (player === aiPlayer) { // === checks that type and value are the same (script equality)
		var bestScore = -100; // just need to be a low number
		for (var i = 0; i < scoreCollection.length; i++) {// move thru each scores collected
			if (scoreCollection[i].score > bestScore) {// if the score is 10 for the ai it is the best move
				bestScore = scoreCollection[i].score;
				best = i; 
			}
		}
	}
	else {
		var bestScore = 100; // just needs to be a high number
		for (var i = 0; i < scoreCollection.length; i++) {// move thru scores collected
			if (scoreCollection[i].score < bestScore) {// if the score is -10 for the human then it is not the best move
				bestScore = scoreCollection[i].score;
				best = i;
			}
		}
	}
	return scoreCollection[best]; // return the best move in the collection
}
