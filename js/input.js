/**
 * Клавиатура: стрелки → direction ('up' | 'down' | 'left' | 'right').
 * Свайпы добавим в блоке G.
 */
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
