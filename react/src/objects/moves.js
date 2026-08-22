export const move = (from, to, special = null) => ({
  from,
  to,
  special,
});

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
