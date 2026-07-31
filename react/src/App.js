// use useState hook from react.
// This will allow us to keep track of state.
import { useState } from "react";
import { Board } from "./components/board";

export default function Game() {
  // TODO: is there a way to get board size, or do we prop that down?
  // history will store all 64 squares
  const [history, setHistory] = useState(() => [getStartingBoard()]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function getStartingBoard() {
  // Create an empty 8x8 grid
  const initialMatrix = Array.from({ length: 8 }, () => Array(8).fill(null));

  // --- POPULATE BACK ROWS (Rooks, Knights, Bishops, Queen, King) ---
  // White Pieces (Bottom row: y = 7)
  initialMatrix[0][7] = "chess-piece rook-white";
  initialMatrix[1][7] = "chess-piece knight-white";
  initialMatrix[2][7] = "chess-piece bishop-white";
  initialMatrix[3][7] = "chess-piece queen-white";
  initialMatrix[4][7] = "chess-piece king-white";
  initialMatrix[5][7] = "chess-piece bishop-white";
  initialMatrix[6][7] = "chess-piece knight-white";
  initialMatrix[7][7] = "chess-piece rook-white";

  // Black Pieces (Top row: y = 0)
  initialMatrix[0][0] = "chess-piece rook-black";
  initialMatrix[1][0] = "chess-piece knight-black";
  initialMatrix[2][0] = "chess-piece bishop-black";
  initialMatrix[3][0] = "chess-piece queen-black";
  initialMatrix[4][0] = "chess-piece king-black";
  initialMatrix[5][0] = "chess-piece bishop-black";
  initialMatrix[6][0] = "chess-piece knight-black";
  initialMatrix[7][0] = "chess-piece rook-black";

  // --- POPULATE PAWN LINES ---
  for (let x = 0; x < 8; x++) {
    initialMatrix[x][1] = "chess-piece pawn-black"; // Row y = 1
    initialMatrix[x][6] = "chess-piece pawn-white"; // Row y = 6
  }

  return initialMatrix;
}
