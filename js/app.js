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

function bindShellEvents() {
  const leadersBtn = document.getElementById('leaders-btn');
  const closeBtn = document.getElementById('leaderboard-close-btn');
  const restartBtn = document.getElementById('restart-btn');
  const gameOverRestartBtn = document.getElementById('game-over-restart-btn');
  const undoBtn = document.getElementById('undo-btn');

  leadersBtn?.addEventListener('click', () => {
    setOverlayVisible('leaderboard-overlay', true);
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
}

function bootGame() {
  const saved = loadGameState();

  if (saved) {
    gameState = saved;
    previousState = null;
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
  bootGame();
});
