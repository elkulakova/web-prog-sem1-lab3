let gameState = null;
let previousState = null;

function persist() {
  if (!gameState) return;
  saveGameState(gameState);
}

function updateUndoButton() {
  const btn = document.getElementById('undo-btn');
  if (!btn) return;
  btn.disabled = !previousState || Boolean(gameState?.over);
}

function syncGameOverForm() {
  if (!gameState?.over) return;

  if (gameState.scoreSaved) {
    markScoreSaved();
    const saveBtn = document.getElementById('save-score-btn');
    if (saveBtn) saveBtn.disabled = true;
  } else {
    resetGameOverForm();
  }
}

function refreshView({ animate = true } = {}) {
  if (!gameState) return;

  updateScoreDisplay(gameState.score);
  renderBoard(gameState.board, { animate });
  clearTileFlags(gameState.board);

  const wasOverVisible = isOverlayOpen('game-over-overlay');
  setOverlayVisible('game-over-overlay', gameState.over);

  if (gameState.over && (!wasOverVisible || gameState.scoreSaved)) {
    syncGameOverForm();
  }

  updateUndoButton();
  persist();
}

function startNewGame() {
  gameState = restartGame();
  previousState = null;
  resetGameOverForm();
  setOverlayVisible('leaderboard-overlay', false);
  refreshView({ animate: false });
}

function handleDirection(direction) {
  if (!gameState || gameState.over) return;
  if (isOverlayOpen('leaderboard-overlay') || isOverlayOpen('game-over-overlay')) return;

  const snapshot = cloneState(gameState);
  const nextState = move(gameState, direction);
  if (!nextState) return;

  previousState = snapshot;
  gameState = nextState;
  refreshView({ animate: true });
}

function undoMove() {
  if (!gameState || gameState.over || !previousState) return;

  gameState = previousState;
  previousState = null;
  setOverlayVisible('game-over-overlay', false);
  refreshView({ animate: false });
}

function openLeaderboard() {
  renderLeaderboard(loadLeaderboard());
  setOverlayVisible('leaderboard-overlay', true);
}

function saveCurrentScore() {
  if (!gameState || !gameState.over || gameState.scoreSaved) return;

  const nameInput = document.getElementById('player-name');
  const saveBtn = document.getElementById('save-score-btn');
  const name = nameInput ? nameInput.value.trim() : '';

  if (!name) {
    nameInput?.classList.add('modal__input--error');
    nameInput?.focus();
    return;
  }

  nameInput?.classList.remove('modal__input--error');
  addLeaderboardEntry(name, gameState.score);
  gameState.scoreSaved = true;
  if (saveBtn) saveBtn.disabled = true;
  markScoreSaved();
  persist();
}

function bindShellEvents() {
  const leadersBtn = document.getElementById('leaders-btn');
  const closeBtn = document.getElementById('leaderboard-close-btn');
  const restartBtn = document.getElementById('restart-btn');
  const gameOverRestartBtn = document.getElementById('game-over-restart-btn');
  const undoBtn = document.getElementById('undo-btn');
  const saveBtn = document.getElementById('save-score-btn');
  const nameInput = document.getElementById('player-name');

  leadersBtn?.addEventListener('click', () => {
    openLeaderboard();
  });

  closeBtn?.addEventListener('click', () => {
    setOverlayVisible('leaderboard-overlay', false);
  });

  restartBtn?.addEventListener('click', () => {
    startNewGame();
  });

  gameOverRestartBtn?.addEventListener('click', () => {
    startNewGame();
  });

  undoBtn?.addEventListener('click', () => {
    undoMove();
  });

  saveBtn?.addEventListener('click', () => {
    saveCurrentScore();
  });

  nameInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveCurrentScore();
    }
  });
}

function bootGame() {
  const saved = loadGameState();

  if (saved) {
    gameState = saved;
    previousState = null;
    refreshView({ animate: false });
    return;
  }

  startNewGame();
}

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  bindShellEvents();
  bindKeyboardControls(handleDirection);
  bindSwipeControls(document.getElementById('game-board'), handleDirection);
  bootGame();
});
