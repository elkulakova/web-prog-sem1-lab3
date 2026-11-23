function isValidBoard(board) {
  if (!Array.isArray(board) || board.length !== GRID_SIZE) return false;

  return board.every(
    (row) =>
      Array.isArray(row) &&
      row.length === GRID_SIZE &&
      row.every((cell) => typeof cell === 'number' && Number.isFinite(cell) && cell >= 0)
  );
}

function isValidGameState(data) {
  return (
    data &&
    typeof data === 'object' &&
    isValidBoard(data.board) &&
    typeof data.score === 'number' &&
    Number.isFinite(data.score) &&
    data.score >= 0 &&
    typeof data.over === 'boolean'
  );
}

function loadGameState() {
  const raw = localStorage.getItem(STORAGE_KEYS.game);
  if (raw === null) return null;

  try {
    const data = JSON.parse(raw);
    return isValidGameState(data)
      ? { board: data.board, score: data.score, over: data.over }
      : null;
  } catch {
    return null;
  }
}

function saveGameState(state) {
  localStorage.setItem(
    STORAGE_KEYS.game,
    JSON.stringify({
      board: state.board,
      score: state.score,
      over: state.over,
    })
  );
}

function clearGameState() {
  localStorage.removeItem(STORAGE_KEYS.game);
}
