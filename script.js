const board = document.getElementById('gameBoard');
const startBtn = document.getElementById('startBtn');
const timerDisplay = document.getElementById('timer');

let currentLevel = 1;
let timeLeft;
let gameTimer;
let firstCard = null;
let lockBoard = false;

const levels = {
    1: { rows: 2, cols: 3, time: 10 }, // 10 секунд
    2: { rows: 3, cols: 4, time: 20 }, // 20 секунд
    3: { rows: 4, cols: 6, time: 90 }  // 1 хвилина 30 секунд
};

const emojis = ['🎲', '🧩', '🎯', '🃏', '♟️', '🎮', '👾', '🕹️', '📦', '🧠', '⚔️', '🚀'];

startBtn.addEventListener('click', () => {
    resetGame();
    setupGame();
    startTimer();
});

function startTimer() {
    timeLeft = levels[currentLevel].time;
    updateTimerDisplay();
    gameTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            alert('Час вичерпано! Спробуйте ще раз.');
            resetGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
}

function setupGame() {
    const level = levels[currentLevel];
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${level.cols}, 1fr)`;

    const pairs = (level.rows * level.cols) / 2;
    const chosen = shuffle([...emojis].slice(0, pairs));
    const cardsArray = shuffle([...chosen, ...chosen]);

    cardsArray.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji;
        card.addEventListener('click', onCardClick);
        card.innerHTML = '❓';
        board.appendChild(card);
    });
    firstCard = null;
    lockBoard = false;
}

function onCardClick() {
    if (lockBoard || this.classList.contains('matched') || this === firstCard) return;

    this.textContent = this.dataset.emoji;
    this.classList.add('revealed');

    if (!firstCard) {
        firstCard = this;
    } else {
        if (firstCard.dataset.emoji === this.dataset.emoji) {
            firstCard.classList.add('matched');
            this.classList.add('matched');
            firstCard = null;
            checkWin();
        } else {
            lockBoard = true;
            setTimeout(() => {
                firstCard.textContent = '❓';
                this.textContent = '❓';
                firstCard.classList.remove('revealed');
                this.classList.remove('revealed');
                firstCard = null;
                lockBoard = false;
            }, 1000);
        }
    }
}

function checkWin() {
    const unmatched = document.querySelectorAll('.card:not(.matched)');
    if (unmatched.length === 0) {
        clearInterval(gameTimer);
        if (currentLevel < Object.keys(levels).length) {
            currentLevel++;
            setTimeout(() => {
                alert(`Вітаємо! Ви перейшли на рівень ${currentLevel}.`);
                setupGame();
                startTimer();
            }, 500);
        } else {
            setTimeout(() => {
                alert(`Вітаємо! Ви пройшли всі рівні! Ваш промокод: GAMEBOX2025`);
                resetGame();
            }, 500);
        }
    }
}

function resetGame() {
    currentLevel = 1;
    board.innerHTML = '';
    timerDisplay.textContent = '00:00';
    clearInterval(gameTimer);
}

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}
