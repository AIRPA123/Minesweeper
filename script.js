// Game Configuration
const DIFFICULTIES = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
};

// State
let currentState = {
    difficulty: 'easy',
    board: [], // 2D array storing cell data
    gameActive: false,
    minesLeft: 0,
    timeElapsed: 0,
    timerInterval: null,
    firstClick: true
};

// DOM Elements
const boardElement = document.getElementById('game-board');
const mineCountElement = document.getElementById('mine-count');
const timerElement = document.getElementById('timer');
const difficultySelect = document.getElementById('difficulty-select');
const resetBtn = document.getElementById('reset-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const overlay = document.getElementById('game-overlay');
const gameMessage = document.getElementById('game-message');

// Audio (Optional - can be added later, placeholders for now)
const playSound = (type) => {
    // Future implementation
};

// Initialization
function init() {
    difficultySelect.value = currentState.difficulty;

    // Event Listeners
    difficultySelect.addEventListener('change', (e) => {
        currentState.difficulty = e.target.value;
        resetGame();
    });

    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);

    // Prevent context menu on board
    boardElement.addEventListener('contextmenu', (e) => e.preventDefault());

    resetGame();
}

function resetGame() {
    stopTimer();
    currentState.gameActive = true;
    currentState.firstClick = true;
    currentState.timeElapsed = 0;
    currentState.board = [];

    const config = DIFFICULTIES[currentState.difficulty];
    currentState.minesLeft = config.mines;

    updateUI();
    createBoard(config);
    overlay.classList.add('hidden');
}

function createBoard(config) {
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${config.cols}, var(--cell-size))`;

    for (let r = 0; r < config.rows; r++) {
        const row = [];
        for (let c = 0; c < config.cols; c++) {
            const cellData = {
                row: r,
                col: c,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
            row.push(cellData);

            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.dataset.row = r;
            cellElement.dataset.col = c;

            cellElement.addEventListener('click', () => handleLeftClick(r, c));
            cellElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(r, c);
            });

            boardElement.appendChild(cellElement);
        }
        currentState.board.push(row);
    }
}

function placeMines(excludeRow, excludeCol) {
    const config = DIFFICULTIES[currentState.difficulty];
    let minesPlaced = 0;

    while (minesPlaced < config.mines) {
        const r = Math.floor(Math.random() * config.rows);
        const c = Math.floor(Math.random() * config.cols);

        // Don't place mine on first clicked cell or its neighbors (optional, but safer)
        // For simplicity, just avoiding the exact cell is usually enough, 
        // but avoiding neighbors guarantees a 0 start which is nicer.
        if (Math.abs(r - excludeRow) <= 1 && Math.abs(c - excludeCol) <= 1) continue;

        if (!currentState.board[r][c].isMine) {
            currentState.board[r][c].isMine = true;
            minesPlaced++;
        }
    }

    calculateNeighbors();
}

function calculateNeighbors() {
    const config = DIFFICULTIES[currentState.difficulty];

    for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
            if (currentState.board[r][c].isMine) continue;

            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;

                    if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                        if (currentState.board[nr][nc].isMine) count++;
                    }
                }
            }
            currentState.board[r][c].neighborMines = count;
        }
    }
}

function handleLeftClick(r, c) {
    if (!currentState.gameActive) return;

    const cell = currentState.board[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    if (currentState.firstClick) {
        currentState.firstClick = false;
        startTimer();
        placeMines(r, c);
    }

    if (cell.isMine) {
        gameOver(false);
    } else {
        revealCell(r, c);
        checkWin();
    }
}

function handleRightClick(r, c) {
    if (!currentState.gameActive) return;

    const cell = currentState.board[r][c];
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    currentState.minesLeft += cell.isFlagged ? -1 : 1;

    const cellElement = getCellElement(r, c);
    if (cell.isFlagged) {
        cellElement.classList.add('flagged');
    } else {
        cellElement.classList.remove('flagged');
    }

    updateUI();
}

function revealCell(r, c) {
    const config = DIFFICULTIES[currentState.difficulty];
    const cell = currentState.board[r][c];

    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    const cellElement = getCellElement(r, c);
    cellElement.classList.add('revealed');

    if (cell.neighborMines > 0) {
        cellElement.textContent = cell.neighborMines;
        cellElement.dataset.value = cell.neighborMines;
    } else {
        // Flood fill
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;

                if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                    revealCell(nr, nc);
                }
            }
        }
    }
}

function getCellElement(r, c) {
    // Grid layout is flat in DOM, calculation: index = r * cols + c
    const config = DIFFICULTIES[currentState.difficulty];
    const index = r * config.cols + c;
    return boardElement.children[index];
}

function checkWin() {
    const config = DIFFICULTIES[currentState.difficulty];
    let revealedCount = 0;

    for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
            if (currentState.board[r][c].isRevealed) revealedCount++;
        }
    }

    const totalCells = config.rows * config.cols;
    if (revealedCount === totalCells - config.mines) {
        gameOver(true);
    }
}

function gameOver(win) {
    currentState.gameActive = false;
    stopTimer();

    if (win) {
        gameMessage.textContent = "승리!";
        gameMessage.style.background = "linear-gradient(to right, #34d399, #38bdf8)";
        gameMessage.style.webkitBackgroundClip = "text";
    } else {
        gameMessage.textContent = "게임 오버";
        gameMessage.style.background = "linear-gradient(to right, #f472b6, #c084fc)";
        gameMessage.style.webkitBackgroundClip = "text";
        revealAllMines();
    }

    setTimeout(() => {
        overlay.classList.remove('hidden');
    }, 1000);
}

function revealAllMines() {
    const config = DIFFICULTIES[currentState.difficulty];
    for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
            const cell = currentState.board[r][c];
            if (cell.isMine) {
                const cellElement = getCellElement(r, c);
                setTimeout(() => {
                    cellElement.classList.add('revealed', 'mine-revealed');
                }, Math.random() * 500); // Random delay for cool effect
            }
        }
    }
}

function startTimer() {
    stopTimer();
    currentState.timerInterval = setInterval(() => {
        currentState.timeElapsed++;
        updateUI();
    }, 1000);
}

function stopTimer() {
    if (currentState.timerInterval) {
        clearInterval(currentState.timerInterval);
        currentState.timerInterval = null;
    }
}

function updateUI() {
    mineCountElement.textContent = currentState.minesLeft.toString().padStart(3, '0');
    timerElement.textContent = currentState.timeElapsed.toString().padStart(3, '0');
}

// Start the game
init();
