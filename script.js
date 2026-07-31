/* =================================================================
   SLIDE PUZZLE — script.js
   Core game logic: state, shuffling, movement, timer, win detection
   ================================================================= */

(function () {
  'use strict';

  // ── Constants ────────────────────────────────────────────────
  const GRID      = 3;                          // 3×3 grid
  const TOTAL     = GRID * GRID;                // 9 tiles
  const SOLVED    = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // win state (0 = empty)
  const SHUFFLE_MOVES = 100;                    // backward-shuffle steps
  const IMAGE_SRC = 'puzzle.png';               // puzzle image path

  // ── DOM References ───────────────────────────────────────────
  const boardEl       = document.getElementById('board');
  const moveCounterEl = document.getElementById('moveCounter');
  const timerEl       = document.getElementById('timer');
  const btnShuffle    = document.getElementById('btnShuffle');
  const btnToggleNums = document.getElementById('btnToggleNums');
  const winOverlay    = document.getElementById('winOverlay');
  const winMovesEl    = document.getElementById('winMoves');
  const winTimeEl     = document.getElementById('winTime');
  const winPlayAgain  = document.getElementById('winPlayAgain');

  // ── Game State ───────────────────────────────────────────────
  let tiles       = [...SOLVED];    // current board state (1D array)
  let moves       = 0;              // move counter
  let seconds     = 0;              // elapsed seconds
  let timerID     = null;           // setInterval reference
  let isRunning   = false;          // whether the game timer is active
  let showNumbers = false;          // tile-number overlay toggle
  let isWon       = false;          // prevent interaction after win

  // =================================================================
  //  INITIALISATION
  // =================================================================

  /**
   * Boot the game: preload image → render initial (solved) board
   * then immediately shuffle for a new game.
   */
  function init() {
    const img = new Image();
    img.onload = () => {
      renderBoard();
      shuffle();
    };
    img.onerror = () => {
      // If image fails to load, still render (tiles will have fallback bg)
      console.warn('Puzzle image failed to load — using fallback.');
      renderBoard();
      shuffle();
    };
    img.src = IMAGE_SRC;
  }

  // =================================================================
  //  BOARD RENDERING
  // =================================================================

  /**
   * Build 9 tile elements inside the board container.
   * Each tile's `background-position` shows the correct sub-section
   * of the full puzzle image.
   */
  function renderBoard() {
    boardEl.innerHTML = '';

    tiles.forEach((tileValue, index) => {
      const el = document.createElement('div');
      el.classList.add('tile');
      el.setAttribute('role', 'gridcell');
      el.dataset.value = tileValue;

      if (tileValue === 0) {
        // Empty slot
        el.classList.add('tile--empty');
        el.setAttribute('aria-label', 'Empty slot');
      } else {
        // Calculate the original row/col of this tile value
        // tileValue 1 → row 0, col 0 … tileValue 8 → row 2, col 1
        const origRow = Math.floor((tileValue - 1) / GRID);
        const origCol = (tileValue - 1) % GRID;

        // Use background-position to show the correct image slice
        // 0%, 50%, 100% for 3 columns/rows
        const bgX = (origCol / (GRID - 1)) * 100;
        const bgY = (origRow / (GRID - 1)) * 100;

        el.style.backgroundImage    = `url('${IMAGE_SRC}')`;
        el.style.backgroundSize     = `${GRID * 100}%`;   // 300% — the image is 3× the tile size
        el.style.backgroundPosition = `${bgX}% ${bgY}%`;

        el.setAttribute('aria-label', `Tile ${tileValue}`);

        // Number badge
        const numSpan = document.createElement('span');
        numSpan.classList.add('tile__number');
        numSpan.textContent = tileValue;
        numSpan.setAttribute('aria-hidden', 'true');
        el.appendChild(numSpan);

        // Click handler
        el.addEventListener('click', () => handleTileClick(index));
      }

      boardEl.appendChild(el);
    });
  }

  // =================================================================
  //  SHUFFLING (Guaranteed Solvable)
  // =================================================================

  /**
   * Generate a solvable puzzle by starting from the solved state
   * and performing `SHUFFLE_MOVES` random valid adjacent swaps.
   */
  function shuffle() {
    // Reset state
    tiles   = [...SOLVED];
    moves   = 0;
    seconds = 0;
    isWon   = false;
    stopTimer();
    updateMoveDisplay();
    updateTimerDisplay();
    hideWinOverlay();
    boardEl.classList.remove('board--won');

    // Find the empty slot
    let emptyIdx = tiles.indexOf(0);

    // Perform random valid moves from the solved state
    let lastEmpty = -1; // track previous empty to avoid undoing the last move

    for (let i = 0; i < SHUFFLE_MOVES; i++) {
      const neighbours = getNeighbours(emptyIdx);

      // Filter out the previous empty position to avoid back-and-forth
      const candidates = neighbours.filter(n => n !== lastEmpty);
      const pick = candidates[Math.floor(Math.random() * candidates.length)];

      // Swap
      lastEmpty = emptyIdx;
      [tiles[emptyIdx], tiles[pick]] = [tiles[pick], tiles[emptyIdx]];
      emptyIdx = pick;
    }

    renderBoard();
  }

  /**
   * Return an array of valid neighbour indices for position `idx`
   * in a GRID×GRID flat array.
   */
  function getNeighbours(idx) {
    const row = Math.floor(idx / GRID);
    const col = idx % GRID;
    const result = [];

    if (row > 0)        result.push(idx - GRID); // up
    if (row < GRID - 1) result.push(idx + GRID); // down
    if (col > 0)        result.push(idx - 1);    // left
    if (col < GRID - 1) result.push(idx + 1);    // right

    return result;
  }

  // =================================================================
  //  TILE MOVEMENT
  // =================================================================

  /**
   * Handle a tile click at the given board index.
   * If the tile is adjacent to the empty slot, swap them.
   */
  function handleTileClick(clickedIdx) {
    if (isWon) return;

    const emptyIdx = tiles.indexOf(0);
    const neighbours = getNeighbours(emptyIdx);

    // Only allow moves that are adjacent to the empty slot
    if (!neighbours.includes(clickedIdx)) return;

    // Start timer on first move
    if (!isRunning) startTimer();

    // Swap tile with empty
    [tiles[emptyIdx], tiles[clickedIdx]] = [tiles[clickedIdx], tiles[emptyIdx]];

    // Increment moves
    moves++;
    updateMoveDisplay();

    // Re-render
    renderBoard();

    // Check win
    if (checkWin()) {
      handleWin();
    }
  }

  // =================================================================
  //  WIN DETECTION
  // =================================================================

  /**
   * Check if every tile index matches the solved sequence.
   */
  function checkWin() {
    return tiles.every((val, idx) => val === SOLVED[idx]);
  }

  /**
   * Handle the win state: stop timer, show overlay with stats.
   */
  function handleWin() {
    isWon = true;
    stopTimer();

    // Trigger celebratory animation on tiles
    boardEl.classList.add('board--won');

    // Populate win overlay stats
    winMovesEl.textContent = moves;
    winTimeEl.textContent  = formatTime(seconds);

    // Show overlay with slight delay for tile animation
    setTimeout(showWinOverlay, 600);
  }

  // =================================================================
  //  TIMER
  // =================================================================

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timerID = setInterval(() => {
      seconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    isRunning = false;
    if (timerID) {
      clearInterval(timerID);
      timerID = null;
    }
  }

  /** Format seconds into MM:SS string. */
  function formatTime(totalSec) {
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  // =================================================================
  //  UI UPDATES
  // =================================================================

  function updateMoveDisplay() {
    moveCounterEl.textContent = moves;
  }

  function updateTimerDisplay() {
    timerEl.textContent = formatTime(seconds);
  }

  function showWinOverlay() {
    winOverlay.classList.add('win-overlay--visible');
    winOverlay.setAttribute('aria-hidden', 'false');
  }

  function hideWinOverlay() {
    winOverlay.classList.remove('win-overlay--visible');
    winOverlay.setAttribute('aria-hidden', 'true');
  }

  // =================================================================
  //  TOGGLE NUMBERS
  // =================================================================

  function toggleNumbers() {
    showNumbers = !showNumbers;
    boardEl.classList.toggle('board--show-numbers', showNumbers);
    btnToggleNums.setAttribute('aria-pressed', String(showNumbers));
  }

  // =================================================================
  //  EVENT LISTENERS
  // =================================================================

  btnShuffle.addEventListener('click', shuffle);
  btnToggleNums.addEventListener('click', toggleNumbers);
  winPlayAgain.addEventListener('click', shuffle);

  // Keyboard support: arrow keys to move tiles
  document.addEventListener('keydown', (e) => {
    if (isWon) return;

    const emptyIdx = tiles.indexOf(0);
    const row = Math.floor(emptyIdx / GRID);
    const col = emptyIdx % GRID;
    let targetIdx = -1;

    switch (e.key) {
      case 'ArrowUp':
        // Move tile BELOW the empty slot UP into it
        if (row < GRID - 1) targetIdx = emptyIdx + GRID;
        break;
      case 'ArrowDown':
        // Move tile ABOVE the empty slot DOWN into it
        if (row > 0) targetIdx = emptyIdx - GRID;
        break;
      case 'ArrowLeft':
        // Move tile to the RIGHT of the empty slot LEFT into it
        if (col < GRID - 1) targetIdx = emptyIdx + 1;
        break;
      case 'ArrowRight':
        // Move tile to the LEFT of the empty slot RIGHT into it
        if (col > 0) targetIdx = emptyIdx - 1;
        break;
      default:
        return; // Ignore other keys
    }

    if (targetIdx >= 0) {
      e.preventDefault();
      handleTileClick(targetIdx);
    }
  });

  // ── Start the game ───────────────────────────────────────────
  init();

})();
