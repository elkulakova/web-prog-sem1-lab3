function bindShellEvents() {
  const leadersBtn = document.getElementById('leaders-btn');
  const closeBtn = document.getElementById('leaderboard-close-btn');

  leadersBtn?.addEventListener('click', () => {
    setOverlayVisible('leaderboard-overlay', true);
  });

  closeBtn?.addEventListener('click', () => {
    setOverlayVisible('leaderboard-overlay', false);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  bindShellEvents();
});
