function createElement(tag, { className, text, attrs = {}, dataset = {}, children = [] } = {}) {
  const el = document.createElement(tag);

  if (className) {
    el.className = className;
  }

  if (text != null) {
    el.textContent = text;
  }

  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value == null) return;
    if (value === true) {
      el.setAttribute(key, '');
      return;
    }
    el.setAttribute(key, String(value));
  });

  Object.entries(dataset).forEach(([key, value]) => {
    el.dataset[key] = value;
  });

  children.forEach((child) => {
    if (child != null) el.append(child);
  });

  return el;
}

function createBoardCells() {
  const cells = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      cells.push(
        createElement('div', {
          className: 'board__cell',
          dataset: { row: String(row), col: String(col) },
        })
      );
    }
  }

  return cells;
}

function createGameOverOverlay() {
  const title = createElement('h2', {
    className: 'modal__title',
    text: 'игра окончена!',
    attrs: { id: 'game-over-title' },
  });

  const message = createElement('p', {
    className: 'modal__message',
    text: 'ходов больше нет( сохраните результат или начните заново',
    attrs: { id: 'game-over-message' },
  });

  const nameLabel = createElement('label', {
    className: 'modal__label',
    text: 'имя',
    attrs: { for: 'player-name', id: 'player-name-label' },
  });

  const nameInput = createElement('input', {
    className: 'modal__input',
    attrs: {
      type: 'text',
      id: 'player-name',
      name: 'playerName',
      placeholder: 'ваше имя',
      autocomplete: 'nickname',
      maxlength: '20',
    },
  });

  const saveBtn = createElement('button', {
    className: 'btn btn--primary',
    text: 'сохранить результат',
    attrs: { type: 'button', id: 'save-score-btn' },
  });

  const restartBtn = createElement('button', {
    className: 'btn btn--ghost',
    text: 'начать заново',
    attrs: { type: 'button', id: 'game-over-restart-btn' },
  });

  const form = createElement('div', {
    className: 'modal__form',
    attrs: { id: 'game-over-form' },
    children: [nameLabel, nameInput, saveBtn],
  });

  const dialog = createElement('div', {
    className: 'modal',
    attrs: { role: 'dialog', 'aria-labelledby': 'game-over-title', 'aria-modal': 'true' },
    children: [title, message, form, restartBtn],
  });

  return createElement('div', {
    className: 'overlay overlay--hidden',
    attrs: { id: 'game-over-overlay' },
    children: [dialog],
  });
}

function createLeaderboardOverlay() {
  const title = createElement('h2', {
    className: 'modal__title',
    text: 'таблица рекордов',
    attrs: { id: 'leaderboard-title' },
  });

  const headRow = createElement('tr', {
    children: [
      createElement('th', { text: 'имя' }),
      createElement('th', { text: 'очки' }),
      createElement('th', { text: 'дата' }),
    ],
  });

  const emptyRow = createElement('tr', {
    attrs: { id: 'leaderboard-empty-row' },
    children: [
      createElement('td', {
        text: 'здесь пока нет сохранённых рекордов',
        attrs: { colspan: '3' },
      }),
    ],
  });

  const table = createElement('table', {
    className: 'leaderboard',
    attrs: { id: 'leaderboard-table' },
    children: [
      createElement('thead', { children: [headRow] }),
      createElement('tbody', {
        attrs: { id: 'leaderboard-body' },
        children: [emptyRow],
      }),
    ],
  });

  const closeBtn = createElement('button', {
    className: 'btn btn--ghost',
    text: 'закрыть',
    attrs: { type: 'button', id: 'leaderboard-close-btn' },
  });

  const dialog = createElement('div', {
    className: 'modal',
    attrs: { role: 'dialog', 'aria-labelledby': 'leaderboard-title', 'aria-modal': 'true' },
    children: [title, table, closeBtn],
  });

  return createElement('div', {
    className: 'overlay overlay--hidden',
    attrs: { id: 'leaderboard-overlay' },
    children: [dialog],
  });
}

function setOverlayVisible(overlayId, visible) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  if (visible) {
    overlay.classList.remove('overlay--hidden');
  } else {
    overlay.classList.add('overlay--hidden');
  }
}

function updateScoreDisplay(score) {
  const el = document.getElementById('score-value');
  if (el) el.textContent = String(score);
}

function getTileColor(value) {
  return TILE_COLORS[value] || TILE_COLORS.higher;
}

function createTile(value) {
  const tile = createElement('div', {
    className: `tile tile--${value > 2048 ? 'higher' : value}`,
    text: String(value),
  });

  tile.style.backgroundColor = getTileColor(value);
  tile.style.color = value <= 4 ? '#776e65' : '#f9f6f2';

  return tile;
}

/** Рисует значения board[][] в клетки #game-board (без innerHTML) */
function renderBoard(board) {
  const boardEl = document.getElementById('game-board');
  if (!boardEl) return;

  const cells = boardEl.querySelectorAll('.board__cell');

  cells.forEach((cell) => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const value = board[row][col];

    cell.replaceChildren();

    if (value) {
      cell.append(createTile(value));
    }
  });
}

function resetGameOverForm() {
  const form = document.getElementById('game-over-form');
  const message = document.getElementById('game-over-message');
  const nameInput = document.getElementById('player-name');

  if (form) form.hidden = false;
  if (nameInput) nameInput.value = '';
  if (message) {
    message.textContent = 'ходов больше нет( сохраните результат или начните заново';
  }
}

function isOverlayOpen(overlayId) {
  const overlay = document.getElementById(overlayId);
  return Boolean(overlay && !overlay.classList.contains('overlay--hidden'));
}

function renderApp() {
  const scoreValue = createElement('span', {
    className: 'score__value',
    text: '0',
    attrs: { id: 'score-value' },
  });

  const score = createElement('div', {
    className: 'score',
    children: [
      createElement('span', { className: 'score__label', text: 'Счёт' }),
      scoreValue,
    ],
  });

  const restartBtn = createElement('button', {
    className: 'btn btn--secondary',
    text: 'заново',
    attrs: { type: 'button', id: 'restart-btn' },
  });

  const undoBtn = createElement('button', {
    className: 'btn btn--secondary',
    text: 'отмена',
    attrs: { type: 'button', id: 'undo-btn' },
  });

  const leadersBtn = createElement('button', {
    className: 'btn btn--secondary',
    text: 'рекорды',
    attrs: { type: 'button', id: 'leaders-btn' },
  });

  const actions = createElement('div', {
    className: 'actions',
    children: [restartBtn, undoBtn, leadersBtn],
  });

  const header = createElement('header', {
    className: 'header',
    children: [
      createElement('h1', { className: 'header__title', text: '2048' }),
      createElement('p', {
        className: 'header__subtitle',
        text: 'сложите плитки и наберите 2048',
      }),
      score,
      actions,
    ],
  });

  const board = createElement('div', {
    className: 'board',
    attrs: {
      id: 'game-board',
      role: 'grid',
      'aria-label': 'игровое поле 4 на 4',
    },
    children: createBoardCells(),
  });

  const main = createElement('main', {
    className: 'main',
    children: [board],
  });

  const app = createElement('div', {
    className: 'game-app',
    children: [header, main],
  });

  document.body.append(app, createGameOverOverlay(), createLeaderboardOverlay());
}
