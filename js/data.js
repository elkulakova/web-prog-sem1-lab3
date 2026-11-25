const GRID_SIZE = 4;

const START_TILE_MIN = 1;
const START_TILE_MAX = 3;

const NEW_TILE_MIN = 1;
const NEW_TILE_MAX = 2;

const FOUR_PROBABILITY = 0.1;

const LEADERBOARD_LIMIT = 10;

const SWIPE_THRESHOLD = 24;

const STORAGE_KEYS = {
  game: 'game-2048-state',
  leaderboard: 'game-2048-leaderboard',
};

const DIRECTIONS = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

const TILE_COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
  higher: '#3c3a32',
};
