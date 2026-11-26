function isValidTile(cell) {
  if (cell === null || cell === 0) return true;
  if (typeof cell === 'number') return Number.isFinite(cell) && cell >= 0;

  return (
    cell &&
    typeof cell === 'object' &&
    typeof cell.id === 'number' &&
    Number.isFinite(cell.id) &&
    typeof cell.value === 'number' &&
    Number.isFinite(cell.value) &&
    cell.value > 0
  );
}

function isValidBoard(board) {
  if (!Array.isArray(board) || board.length !== GRID_SIZE) return false;

  return board.every(
    (row) => Array.isArray(row) && row.length === GRID_SIZE && row.every(isValidTile)
  );
}

function normalizeBoard(board) {
  const hasObjects = board.some((row) => row.some((cell) => cell && typeof cell === 'object'));

  if (!hasObjects) {
    return boardFromNumbers(board);
  }

  const normalized = board.map((row) =>
    row.map((cell) => {
      if (!cell || cell === 0) return null;
      return {
        id: cell.id,
        value: cell.value,
        merged: false,
        isNew: false,
      };
    })
  );

  syncNextTileId(normalized);
  return normalized;
}

function isValidGameState(data) {
  return (
    data &&
    typeof data === 'object' &&
    isValidBoard(data.board) &&
    typeof data.score === 'number' &&
    Number.isFinite(data.score) &&
    data.score >= 0 &&
    typeof data.over === 'boolean' &&
    (data.scoreSaved === undefined || typeof data.scoreSaved === 'boolean')
  );
}

function loadGameState() {
  const raw = localStorage.getItem(STORAGE_KEYS.game);
  if (raw === null) return null;

  try {
    const data = JSON.parse(raw);
    if (!isValidGameState(data)) return null;

    return {
      board: normalizeBoard(data.board),
      score: data.score,
      over: data.over,
      scoreSaved: Boolean(data.scoreSaved),
    };
  } catch {
    return null;
  }
}

function saveGameState(state) {
  localStorage.setItem(
    STORAGE_KEYS.game,
    JSON.stringify({
      board: state.board.map((row) =>
        row.map((cell) => (cell ? { id: cell.id, value: cell.value } : null))
      ),
      score: state.score,
      over: state.over,
      scoreSaved: Boolean(state.scoreSaved),
    })
  );
}

function isValidLeaderboardEntry(entry) {
  return (
    entry &&
    typeof entry === 'object' &&
    typeof entry.name === 'string' &&
    entry.name.trim().length > 0 &&
    typeof entry.score === 'number' &&
    Number.isFinite(entry.score) &&
    entry.score >= 0 &&
    typeof entry.date === 'string' &&
    entry.date.length > 0
  );
}

function loadLeaderboard() {
  const raw = localStorage.getItem(STORAGE_KEYS.leaderboard);
  if (raw === null) return [];

  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(isValidLeaderboardEntry);
  } catch {
    return [];
  }
}

function saveLeaderboard(entries) {
  localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(entries));
}

function addLeaderboardEntry(name, score) {
  const trimmed = String(name).trim();
  const entries = loadLeaderboard();

  entries.push({
    name: trimmed,
    score,
    date: new Date().toISOString(),
  });

  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.date.localeCompare(b.date);
  });

  const top = entries.slice(0, LEADERBOARD_LIMIT);
  saveLeaderboard(top);
  return top;
}
