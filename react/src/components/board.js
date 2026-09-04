import React, { useState, useRef, useEffect } from "react";
import { getCandidateMoves } from "../objects/pieces.js";

// Board component
// This represent the standard 8x8 chess board
export function Board({ currentColor, squares, lastMove, recordMove }) {
  const width = 8;
  const height = 8;
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [availableMoves, setAvailableMoves] = useState([]);

  function handleSquareClick(position) {
    if (calculateWinner(squares)) {
      return;
    }
    const piece = squares[position.x][position.y];

    // don't have a piece selected.
    if (!selectedSquare) {
      if (piece?.color === currentColor) {
        const availableMoves = getCandidateMoves(squares, piece, position, {
          currentColor,
          lastMove,
        });

        setSelectedSquare(position);
        setAvailableMoves(availableMoves);

        return;
      }

      // no piece is selected. User clicked on square with no piece or opponent's piece. Do nothing.
      return;
    }

    // This puts the piece back to same square if clicked again.
    if (selectedSquare.x === position.x && selectedSquare.y === position.y) {
      setAvailableMoves([]); // clear available moves when deselecting
      setSelectedSquare(null);
      return;
    }

    // varify can move to the square
    const selectedMove = availableMoves.find(
      (move) => move.to.x === position.x && move.to.y === position.y,
    );

    // do nothing. the piece won't move.
    if (!selectedMove) return;

    const nextSquares = squares.map((column) => column.slice());
    // TODO: would be nice to store held piece.
    const movingPiece = nextSquares[selectedSquare.x][selectedSquare.y];
    const movedPiece = Object.assign(
      Object.create(Object.getPrototypeOf(movingPiece)),
      movingPiece,
      { hasMoved: true, position },
    );

    // place the piece in the new square (this will overwrite any piece that was there, which is correct for captures)
    // TODO: might be nice to have a capture method, so removed pieces can be shown.
    nextSquares[position.x][position.y] = movedPiece;
    // remove the piece from the original square
    nextSquares[selectedSquare.x][selectedSquare.y] = null;

    if (selectedMove.special === "en-passant") {
      nextSquares[position.x][selectedSquare.y] = null;
    }

    recordMove(nextSquares, selectedMove);
    setAvailableMoves([]);
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
      <div className="chess-board diamond-border">
        {boardIndices.map((rowY) => (
          <div key={rowY} className="board-row">
            {boardIndices.map((colX) => {
              // Determine light/dark square color alternating pattern
              const isLight = (colX + rowY) % 2 === 0;

              // Access the 2D array naturally using columns and rows!
              const piece = squares[colX][rowY];
              const isHighlight = availableMoves.some(
                (move) => move.to.x === colX && move.to.y === rowY,
              );

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
                  isHighlight={isHighlight}
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
  isHighlight,
}) {
  return (
    <button
      className={`square ${cName} ${isSelected ? "selected" : ""} ${isHighlight ? "highlight" : ""}`}
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
  const [ghostSize, setGhostSize] = useState(null); // for responsive design

  const selectPiece = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setPosition({ x: rect.left, y: rect.top });
    setGhostSize(rect.width);
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
    <div
      animate={{ rotate: 0 }}
      whileHover={
        canInteract ? { rotate: [0, -10, 10, -10, 10, 0] } : undefined
      }
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`${piece.className} ${isSelected ? "ghost" : ""} ${canInteract ? "wiggle-element" : ""}`}
      onClick={canInteract ? selectPiece : undefined}
      style={{
        cursor: canInteract ? "pointer" : "default",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: ghostSize,
        height: ghostSize,
      }}
    ></div>
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
