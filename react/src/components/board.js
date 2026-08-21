import { motion } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";

// Board component
// This represent the standard 8x8 chess board
export function Board({ currentColor, squares, onPlay }) {
  const width = 8;
  const height = 8;
  const [selectedSquare, setSelectedSquare] = useState(null);

  function handleSquareClick(position) {
    if (calculateWinner(squares)) {
      return;
    }

    if (!selectedSquare) {
      const piece = squares[position.x][position.y];
      if (piece && piece.color === currentColor) {
        setSelectedSquare(position);
      }
      return;
    }

    // This puts the piece back to same square if clicked again.
    if (selectedSquare.x === position.x && selectedSquare.y === position.y) {
      setSelectedSquare(null);
      return;
    }

    // Prevents moving to a square that already has a piece on it.
    // TODO: Implement capturing logic in the future.
    if (squares[position.x][position.y]) {
      return;
    }

    const nextSquares = squares.map((column) => column.slice());
    nextSquares[position.x][position.y] =
      nextSquares[selectedSquare.x][selectedSquare.y];
    nextSquares[selectedSquare.x][selectedSquare.y] = null;
    onPlay(nextSquares);
    setSelectedSquare(null);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (currentColor === "white" ? "White" : "Black");
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
                  position={{ x: colX, y: rowY }}
                  currentColor={currentColor}
                  isSelected={
                    selectedSquare?.x === colX && selectedSquare?.y === rowY
                  }
                  onSquareClick={handleSquareClick}
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
function Square({
  piece,
  position,
  currentColor,
  isSelected,
  onSquareClick,
  cName,
}) {
  return (
    <button
      className={`square ${cName} ${isSelected ? "selected" : ""}`}
      onClick={() => onSquareClick(position)}
    >
      {piece && (
        <ChessPiece
          piece={piece}
          canInteract={piece.color === currentColor}
          isSelected={isSelected}
          onSelect={(event) => {
            event.stopPropagation();
            onSquareClick(position);
          }}
        />
      )}
    </button>
  );
}

// <div className={piece.className}></div>
function ChessPiece({ piece, canInteract, isSelected, onSelect }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const dragOffset = useRef({ x: 0, y: 0 });

  const selectPiece = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setPosition({ x: rect.left, y: rect.top });
    onSelect(e);
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
