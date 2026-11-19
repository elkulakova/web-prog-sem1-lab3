let gameState = null;

function refreshView() {
  if (!gameState) return;

  updateScoreDisplay(gameState.score);
  renderBoard(gameState.board);
  setOverlayVisible('game-over-overlay', gameState.over);
}

function startNewGame() {
  gameState = restartGame();
  resetGameOverForm();
  setOverlayVisible('leaderboard-overlay', false);
  refreshView();
}

function handleDirection(direction) {
  if (!gameState || gameState.over) return;
  if (isOverlayOpen('leaderboard-overlay') || isOverlayOpen('game-over-overlay')) return;

  const result = move(gameState, direction);
  if (!result) return;

  gameState = result.state;
  refreshView();
}

function bindShellEvents() {
  const leadersBtn = document.getElementById('leaders-btn');
  const closeBtn = document.getElementById('leaderboard-close-btn');
  const restartBtn = document.getElementById('restart-btn');
  const gameOverRestartBtn = document.getElementById('game-over-restart-btn');

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
}

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  bindShellEvents();
  bindKeyboardControls(handleDirection);
  startNewGame();
});
