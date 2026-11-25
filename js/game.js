function createEmptyBoard() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function cloneBoard(board) {
  return board.map((row) => row.slice());
}

function getEmptyCells(board) {
  const cells = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (board[row][col] === 0) {
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

function spawnTiles(board, count) {
  const spawned = [];
  let remaining = count;

  while (remaining > 0) {
    const empty = getEmptyCells(board);
    if (empty.length === 0) break;

    const cell = pickRandomCell(empty);
    const value = randomTileValue();
    board[cell.row][cell.col] = value;
    spawned.push({ row: cell.row, col: cell.col, value });
    remaining -= 1;
  }

  return spawned;
}

function createInitialState() {
  const board = createEmptyBoard();
  const startCount = randomInt(START_TILE_MIN, START_TILE_MAX);
  spawnTiles(board, startCount);

  return {
    board,
    score: 0,
    over: false,
  };
}

function mergeLineOnce(line) {
  const filtered = line.filter((value) => value !== 0);
  const merged = [];
  let scoreGained = 0;
  let i = 0;

  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const value = filtered[i] * 2;
      merged.push(value);
      scoreGained += value;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i += 1;
    }
  }

  while (merged.length < GRID_SIZE) {
    merged.push(0);
  }

  return { line: merged, scoreGained };
}

function linesEqual(a, b) {
  return a.every((value, index) => value === b[index]);
}

function collapseLineLeft(line) {
  let current = line.slice();
  let totalScore = 0;
  let changed = false;

  while (true) {
    const { line: next, scoreGained } = mergeLineOnce(current);
    if (linesEqual(current, next)) break;
    current = next;
    totalScore += scoreGained;
    changed = true;
  }

  return { line: current, scoreGained: totalScore, changed };
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

function move(state, direction) {
  if (state.over) return null;

  const board = cloneBoard(state.board);
  let scoreGained = 0;
  let moved = false;

  if (direction === 'left' || direction === 'right') {
    for (let row = 0; row < GRID_SIZE; row += 1) {
      const original = board[row].slice();
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
      const original = getColumn(board, col);
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
  const spawned = spawnTiles(board, spawnCount);
  const score = state.score + scoreGained;
  const over = !canMove(board);

  return {
    state: {
      board,
      score,
      over,
    },
    scoreGained,
    spawned,
  };
}

function canMergeAdjacent(board) {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const value = board[row][col];
      if (value === 0) continue;

      if (col + 1 < GRID_SIZE && board[row][col + 1] === value) {
        return true;
      }
      if (row + 1 < GRID_SIZE && board[row + 1][col] === value) {
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
  };
}

