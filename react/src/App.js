// use useState hook from react.
// This will allow us to keep track of state.
import { useState } from "react";

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
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

// Square component
function Square({ value, onSquareClick, cName }) {
  // Trial One, but now lift the state into the Board
  //
  // array destructiong to extract two items from useState hook.
  // value: a variable holding the current state.
  // setValue: a function used to update the state, i.e. setValue(newData)
  //
  // useState(null), null is initial value of the state when component first renders.
  // if y is used instead of null, the squares would display 'y'
  // const [value, setValue] = useState();

  // Before we lifted value into Board, we handled clicks per square.
  // Moved to board.
  //
  // make this square interactive by providing a function.
  // use html onclick to link to this function.
  // function handleClick() {
  //   setValue("X"); // setting to X for now, but this will change.
  // }

  return (
    <button className={`square ${cName}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

// Board component
function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      <div>
        {[...Array(3)].map((_, row) => (
          <div key={row} className="board-row">
            {[...Array(3)].map((_, col) => {
              const index = row * 3 + col;
              return (
                <Square
                  cName={index % 2 === 0 ? "even" : "odd"}
                  key={index}
                  value={squares[index]} // ✅ This now works: 'squares' exists in scope
                  onSquareClick={() => handleClick(index)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

// calculateWinner by looping through
// possible wins (limited to 3x3)
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
