// inInsideBoard returns true if the position is within the 8x8 chess board boundaries
export function isInsideBoard({ x, y }) {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}

// getPiece returns the piece at the given position on the board, or null if the position is outside the board
export function getPiece(board, { x, y }) {
  return isInsideBoard({ x, y }) ? board[x][y] : null;
}

// isEmpty returns true if the given position on the board is empty (no piece present)
export function isEmpty(board, position) {
  return getPiece(board, position) === null;
}

// isEnemy returns true if the piece at the given position on the board is an enemy piece (different color) compared to the provided piece
export function isEnemy(board, piece, position) {
  const target = getPiece(board, position);
  return target && target.color !== piece.color;
}
