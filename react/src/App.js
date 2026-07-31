// use useState hook from react.
// This will allow us to keep track of state.
import { useState } from "react";
import { Board } from "./components/board";

export default function Game() {
  // TODO: is there a way to get board size, or do we prop that down?
  // history will store all 64 squares
  const [history, setHistory] = useState(() => [getStartingBoard()]);
  const [currentMove, setCurrentMove] = useState(0);
  const whiteIsNext = currentMove % 2 === 0;
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
        <Board
          whiteIsNext={whiteIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
        />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function getStartingBoard() {
  // back rows are identical for white and black
  const BACK_ROW = [
    "rook",
    "knight",
    "bishop",
    "queen",
    "king",
    "bishop",
    "knight",
    "rook",
  ];
  // Create an empty 8x8 grid
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));

  for (let x = 0; x < 8; x++) {
    // Top Rows (Black)
    board[x][0] = new ChessPiece(BACK_ROW[x], "black");
    board[x][1] = new ChessPiece("pawn", "black");

    // Bottom Rows (White)
    board[x][6] = new ChessPiece("pawn", "white");
    board[x][7] = new ChessPiece(BACK_ROW[x], "white");
  }

  return board;
}

class ChessPiece {
  constructor(type, color) {
    this.type = type; // e.g. queen
    this.color = color; // e.g. white
    this.hasMoved = false; // e.g. castling, pawn rules

    // CSS class name
    this.className = `chess-piece ${type}-${color}`;
  }
}
