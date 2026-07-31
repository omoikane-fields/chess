// Board component
// This represent the standard 8x8 chess board
export function Board({ xIsNext, squares, onPlay }) {
  const width = 8;
  const height = 8;

  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "chess-piece king-white";
    } else {
      nextSquares[i] = "chess-piece rook-black";
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

  const boardIndices = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="chess-board">
      {boardIndices.map((rowY) => (
        <div key={rowY} className="board-row" style={{ display: "flex" }}>
          {boardIndices.map((colX) => {
            // Determine light/dark square color alternating pattern
            const isLight = (colX + rowY) % 2 === 0;

            // Access the 2D array naturally using columns and rows!
            const pieceClass = squares[colX][rowY];

            return (
              <Square
                key={`${colX}-${rowY}`}
                cName={isLight ? "light" : "dark"}
                value={pieceClass}
                onSquareClick={() => handleClick(colX, rowY)}
              />
            );
          })}
        </div>
      ))}
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
      <div class={value}></div>
    </button>
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
