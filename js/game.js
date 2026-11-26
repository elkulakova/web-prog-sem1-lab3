let nextTileId = 1;

function createEmptyBoard() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function createTile(value, { merged = false, isNew = false } = {}) {
  return {
    id: nextTileId++,
    value,
    merged,
    isNew,
  };
}

function cloneTile(tile) {
  if (!tile) return null;
  return {
    id: tile.id,
    value: tile.value,
    merged: Boolean(tile.merged),
    isNew: Boolean(tile.isNew),
  };
}

function cloneBoard(board) {
  return board.map((row) => row.map((cell) => cloneTile(cell)));
}

function getEmptyCells(board) {
  const cells = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (!board[row][col]) {
        cells.push({ row, col });
      }
    }
  }

  return cells;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomTileValue() {
  return Math.random() < FOUR_PROBABILITY ? 4 : 2;
}

function pickRandomCell(cells) {
  return cells[randomInt(0, cells.length - 1)];
}

function spawnTiles(board, count, { isNew = true } = {}) {
  let remaining = count;

  while (remaining > 0) {
    const empty = getEmptyCells(board);
    if (empty.length === 0) break;

    const cell = pickRandomCell(empty);
    board[cell.row][cell.col] = createTile(randomTileValue(), { isNew });
    remaining -= 1;
  }
}

function syncNextTileId(board) {
  let maxId = 0;

  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell && cell.id > maxId) maxId = cell.id;
    });
  });

  nextTileId = Math.max(nextTileId, maxId + 1);
}

function createInitialState() {
  nextTileId = 1;
  const board = createEmptyBoard();
  const startCount = randomInt(START_TILE_MIN, START_TILE_MAX);
  spawnTiles(board, startCount, { isNew: true });

  return {
    board,
    score: 0,
    over: false,
    scoreSaved: false,
  };
}

function mergeLineOnce(line) {
  const filtered = line.filter(Boolean);
  const merged = [];
  let scoreGained = 0;
  let i = 0;

  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i].value === filtered[i + 1].value) {
      const value = filtered[i].value * 2;
      merged.push(createTile(value, { merged: true }));
      scoreGained += value;
      i += 2;
    } else {
      merged.push({
        id: filtered[i].id,
        value: filtered[i].value,
        merged: false,
        isNew: false,
      });
      i += 1;
    }
  }

  while (merged.length < GRID_SIZE) {
    merged.push(null);
  }

  return { line: merged, scoreGained };
}

function linesEqual(a, b) {
  return a.every((tile, index) => {
    const other = b[index];
    if (!tile && !other) return true;
    if (!tile || !other) return false;
    return tile.id === other.id && tile.value === other.value;
  });
}

function collapseLineLeft(line) {
  let current = line.map((tile) => cloneTile(tile));
  let totalScore = 0;

  while (true) {
    const { line: next, scoreGained } = mergeLineOnce(current);
    if (linesEqual(current, next)) break;
    current = next;
    totalScore += scoreGained;
  }

  return { line: current, scoreGained: totalScore };
}

function reverseLine(line) {
  return line.slice().reverse();
}

function getColumn(board, col) {
  return board.map((row) => row[col]);
}

function setColumn(board, col, values) {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    board[row][col] = values[row];
  }
}

function clearTileFlags(board) {
  board.forEach((row) => {
    row.forEach((cell) => {
      if (!cell) return;
      cell.merged = false;
      cell.isNew = false;
    });
  });
}

function move(state, direction) {
  if (state.over) return null;

  const board = cloneBoard(state.board);
  clearTileFlags(board);

  let scoreGained = 0;
  let moved = false;

  if (direction === 'left' || direction === 'right') {
    for (let row = 0; row < GRID_SIZE; row += 1) {
      const original = board[row].map((tile) => cloneTile(tile));
      const source = direction === 'left' ? original : reverseLine(original);
      const collapsed = collapseLineLeft(source);
      const next = direction === 'left' ? collapsed.line : reverseLine(collapsed.line);

      if (!linesEqual(original, next)) {
        board[row] = next;
        scoreGained += collapsed.scoreGained;
        moved = true;
      }
    }
  } else if (direction === 'up' || direction === 'down') {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const original = getColumn(board, col).map((tile) => cloneTile(tile));
      const source = direction === 'up' ? original : reverseLine(original);
      const collapsed = collapseLineLeft(source);
      const next = direction === 'up' ? collapsed.line : reverseLine(collapsed.line);

      if (!linesEqual(original, next)) {
        setColumn(board, col, next);
        scoreGained += collapsed.scoreGained;
        moved = true;
      }
    }
  } else {
    return null;
  }

  if (!moved) return null;

  const spawnCount = randomInt(NEW_TILE_MIN, NEW_TILE_MAX);
  spawnTiles(board, spawnCount, { isNew: true });

  return {
    board,
    score: state.score + scoreGained,
    over: !canMove(board),
    scoreSaved: false,
  };
}

function canMergeAdjacent(board) {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const tile = board[row][col];
      if (!tile) continue;

      if (col + 1 < GRID_SIZE && board[row][col + 1] && board[row][col + 1].value === tile.value) {
        return true;
      }
      if (row + 1 < GRID_SIZE && board[row + 1][col] && board[row + 1][col].value === tile.value) {
        return true;
      }
    }
  }

  return false;
}

function canMove(board) {
  return getEmptyCells(board).length > 0 || canMergeAdjacent(board);
}

function restartGame() {
  return createInitialState();
}

function cloneState(state) {
  return {
    board: cloneBoard(state.board),
    score: state.score,
    over: state.over,
    scoreSaved: Boolean(state.scoreSaved),
  };
}

function boardFromNumbers(numberBoard) {
  nextTileId = 1;
  return numberBoard.map((row) =>
    row.map((value) => (value ? createTile(value, { isNew: false }) : null))
  );
}
