let gameState = null;
let previousState = null;
let scoreSaved = false;

function persist() {
  if (!gameState) return;
  saveGameState(gameState);
}

function updateUndoButton() {
  const btn = document.getElementById('undo-btn');
  if (!btn) return;
  btn.disabled = !previousState || Boolean(gameState?.over);
}

function refreshView() {
  if (!gameState) return;

  updateScoreDisplay(gameState.score);
  renderBoard(gameState.board);
  setOverlayVisible('game-over-overlay', gameState.over);
  updateUndoButton();
  persist();
}

function startNewGame() {
  gameState = restartGame();
  previousState = null;
  scoreSaved = false;
  resetGameOverForm();
  setOverlayVisible('leaderboard-overlay', false);
  refreshView();
}

function handleDirection(direction) {
  if (!gameState || gameState.over) return;
  if (isOverlayOpen('leaderboard-overlay') || isOverlayOpen('game-over-overlay')) return;

  const snapshot = cloneState(gameState);
  const result = move(gameState, direction);
  if (!result) return;

  previousState = snapshot;
  gameState = result.state;
  refreshView();
}

function undoMove() {
  if (!gameState || gameState.over || !previousState) return;

  gameState = previousState;
  previousState = null;
  setOverlayVisible('game-over-overlay', false);
  refreshView();
}

function openLeaderboard() {
  renderLeaderboard(loadLeaderboard());
  setOverlayVisible('leaderboard-overlay', true);
}

function saveCurrentScore() {
  if (!gameState || !gameState.over || scoreSaved) return;

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
  scoreSaved = true;
  if (saveBtn) saveBtn.disabled = true;
  markScoreSaved();
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
    scoreSaved = false;
    resetGameOverForm();
    refreshView();
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
