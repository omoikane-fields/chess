import { motion, useDragControls } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";

// Board component
// This represent the standard 8x8 chess board
export function Board({ whiteIsNext, squares, onPlay }) {
  const width = 8;
  const height = 8;

  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (whiteIsNext) {
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
    status = "Next player: " + (whiteIsNext ? "White" : "Black");
  }

  const boardIndices = Array.from({ length: 8 }, (_, i) => i);

  return (
    <>
      <div className="status">{status}</div>
      <div className="chess-board">
        {boardIndices.map((rowY) => (
          <div key={rowY} className="board-row" style={{ display: "flex" }}>
            {boardIndices.map((colX) => {
              // Determine light/dark square color alternating pattern
              const isLight = (colX + rowY) % 2 === 0;

              // Access the 2D array naturally using columns and rows!
              const piece = squares[colX][rowY];
              console.log("piece: ", piece);

              return (
                <Square
                  key={`${colX}-${rowY}`}
                  cName={isLight ? "light" : "dark"}
                  piece={piece}
                  onSquareClick={() => handleClick(colX, rowY)}
                />
              );
            })}
          </div>
        ))}
      </div>
      <ToggleDrag />
    </>
  );
}

// Square component
function Square({ piece, onSquareClick, cName }) {
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
      {piece && <ChessPiece piece={piece} />}
    </button>
  );
}

// <div className={piece.className}></div>
function ChessPiece({ piece }) {
  const [isSelected, setIsSelected] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const selectPiece = () => {
    setIsSelected((prev) => !prev);
  };

  // Track mouse movement only when active
  useEffect(() => {
    if (!isSelected) return;

    const handleMouseMove = (e) => {
      // Center the div on the cursor (assuming 100x100 size)
      setPosition({
        x: e.clientX - 50,
        y: e.clientY - 50,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isSelected]);

  return (
    <>
      {!isSelected && (
        <motion.div
          animate={{ rotate: 0 }}
          whileHover={{
            rotate: [0, -10, 10, -10, 10, 0], // Defines the wiggle path
          }}
          transition={{
            duration: 0.4, // Total time for one wiggle cycle
            ease: "easeInOut",
          }}
          style={{
            cursor: "pointer",
          }}
        >
          <div
            className={`${piece.className} new-class ${isSelected ? "ghost" : ""}`}
            onClick={selectPiece}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          ></div>
        </motion.div>
      )}

      {isSelected && (
        <div
          className={`${piece.className} new-class ${isSelected ? "ghost" : ""}`}
          onClick={selectPiece}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        ></div>
      )}
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

export default function ToggleDrag() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const dragRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  // Handle the initial click to START dragging
  const handleMouseDown = (e) => {
    if (isDragging) return; // Already dragging, ignore

    // Calculate offset to prevent snapping to top-left
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    setIsDragging(true);
  };

  // Handle the second click to STOP dragging
  const handleClick = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    };

    // Attach global listeners only when dragging is active
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      // We listen for 'click' globally to catch the "stop" click anywhere
      document.addEventListener("click", handleClick, { once: true });
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
    };
  }, [isDragging]);

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: 120,
        height: 120,
        backgroundColor: isDragging ? "#FF5722" : "#2196F3",
        cursor: isDragging ? "grabbing" : "grab",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        userSelect: "none",
        boxShadow: isDragging
          ? "0 10px 20px rgba(0,0,0,0.2)"
          : "0 4px 6px rgba(0,0,0,0.1)",
        borderRadius: 8,
        zIndex: isDragging ? 1000 : 1,
        transition: isDragging ? "none" : "background 0.2s",
      }}
    >
      {isDragging ? "Click to Drop" : "Click to Drag"}
    </div>
  );
}
