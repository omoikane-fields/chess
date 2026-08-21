import { motion } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";

// Board component
// This represent the standard 8x8 chess board
export function Board({ currentColor, squares, onPlay }) {
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
                  whiteIsNext={whiteIsNext}
                  onSquareClick={() => handleClick(colX, rowY)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

// Square component
function Square({ piece, whiteIsNext, onSquareClick, cName }) {
  return (
    <button className={`square ${cName}`} onClick={onSquareClick}>
      {piece && <ChessPiece piece={piece} whiteIsNext={whiteIsNext} />}
    </button>
  );
}

// <div className={piece.className}></div>
function ChessPiece({ whiteIsNext, piece }) {
  const [isSelected, setIsSelected] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const canInteract = (piece.color === "white") === whiteIsNext;

  const dragOffset = useRef({ x: 0, y: 0 });

  const selectPiece = (e) => {
    if (!isSelected) {
      const rect = e.currentTarget.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setPosition({ x: rect.left, y: rect.top });
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
  };

  // Track mouse movement only when active
  useEffect(() => {
    if (!isSelected || !canInteract) return;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [canInteract, isSelected]);

  return (
    <motion.div
      animate={{ rotate: 0 }}
      whileHover={
        canInteract ? { rotate: [0, -10, 10, -10, 10, 0] } : undefined
      }
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`${piece.className} new-class ${isSelected ? "ghost" : ""}`}
      onClick={canInteract ? selectPiece : undefined}
      style={{
        cursor: canInteract ? "pointer" : "default",
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    ></motion.div>
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
