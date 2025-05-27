const board = document.getElementById('gameBoard');
const startBtn = document.getElementById('startBtn');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');

let currentLevel = 1;
let timeLeft;
let gameTimer;
let firstCard = null;
let lockBoard = false;
let score = 0;

// Звуки (локальні файли)
const flipSound = new Audio('sounds/560043__andrussy44__book_flip1.wav'); // Переворот картки
const matchSound = new Audio('sounds/386200__ldezem__match-lighting-short.wav'); // Збіг пари
const levelSound = new Audio('sounds/787559__interstellarcat__video-game-level-complete-sound-effect.wav'); // Завершення рівня

const levels = {
    1: { rows: 2, cols: 3, time: 10 }, // 10 секунд
    2: { rows: 3, cols: 4, time: 20 }, // 20 секунд
    3: { rows: 4, cols: 6, time: 90 }  // 1 хвилина 30 секунд
};

async function loadCards() {
    try {
        const response = await fetch('cards.json');
        if (!response.ok) throw new Error('Не вдалося завантажити cards.json');
        const data = await response.json();
        return data.map(item => item.emoji);
    } catch (error) {
        console.error('Помилка завантаження JSON:', error);
        // Резервні дані
        return ['🎲', '🧩', '🎯', '🃏', '♟️', '🎮', '👾', '🕹️', '📦', '🧠', '⚔️', '🚀'];
    }
}

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

async function setupGame() {
    const level = levels[currentLevel];
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${level.cols}, 1fr)`;

    const pairs = (level.rows * level.cols) / 2;
    const chosen = shuffle(await loadCards()).slice(0, pairs);
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
    flipSound.play().catch(() => console.log('Звук перевороту не відтворився'));

    if (!firstCard) {
        firstCard = this;
    } else {
        if (firstCard.dataset.emoji === this.dataset.emoji) {
            firstCard.classList.add('matched');
            this.classList.add('matched');
            score += timeLeft * 10; // Бали за збіг
            scoreDisplay.textContent = `Бали: ${score}`;
            matchSound.play().catch(() => console.log('Звук збігу не відтворився'));
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
        score += timeLeft * 50; // Бонус за завершення рівня
        scoreDisplay.textContent = `Бали: ${score}`;
        levelSound.play().catch(() => console.log('Звук рівня не відтворився'));
        if (currentLevel < Object.keys(levels).length) {
            currentLevel++;
            setTimeout(() => {
                alert(`Вітаємо! Ви перейшли на рівень ${currentLevel}. Ваші бали: ${score}`);
                setupGame();
                startTimer();
            }, 500);
        } else {
            setTimeout(() => {
                alert(`Вітаємо! Ви пройшли всі рівні! Ваші бали: ${score}. Промокод: GAMEBOX2025`);
                resetGame();
            }, 500);
        }
    }
}

function resetGame() {
    currentLevel = 1;
    score = 0;
    scoreDisplay.textContent = `Бали: ${score}`;
    board.innerHTML = '';
    timerDisplay.textContent = '00:00';
    clearInterval(gameTimer);
}

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}
