import { isInsideBoard, isEmpty, isEnemy } from "./boardUtils.js";
import { move } from "./moves.js";

const moves = {
  oneStep: (start, end, direction) => {
    return end.x === start.x && end.y - start.y === direction;
  },

  twoStep: (start, end, direction, hasMoved) => {
    if (hasMoved) return; // two step not allowed

    return end.x === start.x && end.y - start.y === 2 * direction;
  },
};

// valid moves will be according to the board

/*
 * FActory Methods
 */
const WHITE_DIRECTION = -1; // y 0 is at the top
const BLACK_DIRECTION = 1;

// export function createPawn(color, startPos) {
//   const direction = color === "white" ? WHITE_DIRECTION : BLACK_DIRECTION;
//   const piece = new ChessPiece("pawn", color, startPos);

//   piece.canMove = (start, end) => {
//     return (
//       moves.oneStep(start, end, direction) ||
//       moves.twoStep(start, end, direction, piece.hasMoved)
//     );
//   };

//   return piece;
// }

export class ChessPiece {
  constructor(type, color, position) {
    this.type = type; // e.g. queen
    this.color = color; // e.g. white
    this.hasMoved = false; // e.g. castling, pawn rules
    this.canMove = null; // overwritten by factory
    this.position = position;

    // CSS class name
    this.className = `chess-piece ${type}-${color}`;
  }
}

/*
 * Composition of movement logic.
 */
function composeMoves(...generators) {
  return (context) => generators.flatMap((generator) => generator(context));
}

/*
 * Pawn Movement Logic
 */
function pawnSingleStep({ board, piece, from, direction }) {
  const to = { x: from.x, y: from.y + direction };

  return isInsideBoard(to) && isEmpty(board, to) ? [move(from, to)] : [];
}

function pawnDoubleStep({ board, piece, from, direction }) {
  if (piece.hasMoved) return [];

  const middle = { x: from.x, y: from.y + direction };
  const to = { x: from.x, y: from.y + direction * 2 };

  return isEmpty(board, middle) && isEmpty(board, to)
    ? [move(from, to, "double-step")]
    : [];
}

function pawnCaptures({ board, piece, from, direction }) {
  return [-1, 1]
    .map((xOffset) => ({
      x: from.x + xOffset,
      y: from.y + direction,
    }))
    .filter((to) => isEnemy(board, piece, to))
    .map((to) => move(from, to, "capture"));
}

/*
 * Rook Movement Logic
 */
// will work for queen and bishop as well, just need to change the directions
function followDirection({ board, piece, from, direction, limit = Infinity }) {
  const moves = [];
  let to = { x: from.x + direction.x, y: from.y + direction.y };

  while (isInsideBoard(to) && moves.length < limit) {
    if (isEmpty(board, to)) {
      moves.push(move(from, to));
    } else if (isEnemy(board, piece, to)) {
      moves.push(move(from, to, "capture"));
      break; // stop after capturing an enemy piece
    } else {
      break; // stop if there's a friendly piece
    }

    to = { x: to.x + direction.x, y: to.y + direction.y };
  }

  return moves;
}

function orthogonalRay({ board, piece, from, limit }) {
  const directions = [
    { x: 1, y: 0 }, // right
    { x: -1, y: 0 }, // left
    { x: 0, y: 1 }, // down
    { x: 0, y: -1 }, // up
  ];

  return directions.flatMap((direction) =>
    followDirection({ board, piece, from, direction, limit }),
  );
}

function diagonalRay({ board, piece, from, limit }) {
  const directions = [
    { x: 1, y: 1 }, // down-right
    { x: -1, y: 1 }, // down-left
    { x: 1, y: -1 }, // up-right
    { x: -1, y: -1 }, // up-left
  ];

  return directions.flatMap((direction) =>
    followDirection({ board, piece, from, direction, limit }),
  );
}

function lShapeMoves({ board, piece, from }) {
  const offsets = [
    { x: 1, y: 2 },
    { x: 1, y: -2 },
    { x: -1, y: 2 },
    { x: -1, y: -2 },
    { x: 2, y: 1 },
    { x: 2, y: -1 },
    { x: -2, y: 1 },
    { x: -2, y: -1 },
  ];

  return offsets
    .map((offset) => ({ x: from.x + offset.x, y: from.y + offset.y }))
    .filter((to) => isInsideBoard(to))
    .filter((to) => isEmpty(board, to) || isEnemy(board, piece, to))
    .map((to) => move(from, to));
}

const bishopMoves = composeMoves(diagonalRay);
const queenMoves = composeMoves(orthogonalRay, diagonalRay);
const pawnMoves = composeMoves(pawnSingleStep, pawnDoubleStep, pawnCaptures);
const rookMoves = composeMoves(orthogonalRay);
const knightMoves = composeMoves(lShapeMoves);
const kingMoves = (context) =>
  composeMoves(orthogonalRay, diagonalRay)({ ...context, limit: 1 });

export function getCandidateMoves(board, piece, from, gameState) {
  const direction = piece.color === "white" ? -1 : 1;

  return moveGenerators[piece.type]({
    board,
    piece,
    from,
    direction,
    gameState,
  });
}

const moveGenerators = {
  pawn: pawnMoves,
  rook: rookMoves,
  bishop: bishopMoves,
  queen: queenMoves,
  knight: knightMoves,
  king: kingMoves,
};
