// variables for board, player and AI
var origBoard;
const humanPlayer = 'O';
const aiPlayer = 'X';

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
const cells = document.querySelectorAll('.cell');

// Original start game
startGame();

// Start game function
function startGame() {
	// will use the gameOver styling when the game is reset. Already reset when game original starts.
	document.querySelector(".gameOver").style.display = "none";

	// Loops threw each cell to establish index inorder to click each cell
	// These numbers can be referenced later to check for empty cells.
	origBoard = Array.from(Array(9).keys());
	for (var i = 0; i < cells.length; i++) {
		cells[i].innerText = '';
		cells[i].style.removeProperty('background-color');
		cells[i].addEventListener('click', mouseClick, false);
	}
}

// Allows for using the mouse to click cells and not allowing same cell selection.
function mouseClick(boardSpace) {
	if (typeof origBoard[boardSpace.target.id] == 'number') {
		turn(boardSpace.target.id, humanPlayer)
		// As long as game is not in a tie state AI looks for best position
		if (!checkTie()) turn(bestPosition(), aiPlayer);
	}
}

// Submits the number of the cell clicked along with player
function turn(squareId, player) {
	origBoard[squareId] = player; // sets cell to either X or O
	document.getElementById(squareId).innerText = player;// sets cell to either X or O
	var gameWon = isWin(origBoard, player)
	if (gameWon) {
		gameOver(gameWon)
	}
}

// => means parameters => { statements }
function isWin(board, player) {
	var plays = board.reduce((a, e, i) =>
		(e === player) ? a.concat(i) : a, []);
	var gameWon = null;
	for (var [index, win] of winningStates.entries()) {
		if (win.every(elem => plays.indexOf(elem) > -1)) {
			gameWon = { index: index, player: player };
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
	return origBoard.filter(s => typeof s == 'number');
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
	var openSpaces = emptySquares(newBoard);

	if (isWin(newBoard, player)) {
		return { score: -10 }; // returns -10 if ai turn is not a winning move or is a human winning move
	}
	else if (isWin(newBoard, aiPlayer)) {
		return { score: 10 }; // returns 10 if the move by ai is a winning move or not a winning move by the human player
	}
	else if (openSpaces.length === 0) {
		return { score: 0 }; // means no space are left the game is over.
	}
	var moves = [];
	for (var i = 0; i < openSpaces.length; i++) {
		var move = {};
		move.index = newBoard[openSpaces[i]];
		newBoard[openSpaces[i]] = player;

		if (player == aiPlayer) {
			var result = minimax(newBoard, humanPlayer);
			move.score = result.score;
		}
		else {
			var result = minimax(newBoard, aiPlayer);
			move.score = result.score;
		}

		newBoard[openSpaces[i]] = move.index;

		moves.push(move);
	}

	var bestMove;
	if (player === aiPlayer) { // === checks that type and value are the same (script equality)
		var bestScore = -100; // just need to be a low number
		for (var i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score;
				bestMove = i; 
			}
		}
	}
	else {
		var bestScore = 100; // just needs to be a high number
		for (var i = 0; i < moves.length; i++) {
			if (moves[i].score < bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	}
	return moves[bestMove];
}