function bindKeyboardControls(onDirection) {
  document.addEventListener('keydown', (event) => {
    const direction = DIRECTIONS[event.key];
    if (!direction) return;

    const tag = event.target && event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    event.preventDefault();
    onDirection(direction);
  });
}

function bindSwipeControls(boardEl, onDirection) {
  if (!boardEl) return;

  let startX = 0;
  let startY = 0;
  let tracking = false;

  boardEl.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length !== 1) return;
      tracking = true;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    },
    { passive: true }
  );

  boardEl.addEventListener(
    'touchmove',
    (event) => {
      if (!tracking) return;
      event.preventDefault();
    },
    { passive: false }
  );

  boardEl.addEventListener('touchend', (event) => {
    if (!tracking) return;
    tracking = false;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < SWIPE_THRESHOLD) return;

    if (absX > absY) {
      onDirection(dx > 0 ? 'right' : 'left');
    } else {
      onDirection(dy > 0 ? 'down' : 'up');
    }
  });

  boardEl.addEventListener('touchcancel', () => {
    tracking = false;
  });
}
