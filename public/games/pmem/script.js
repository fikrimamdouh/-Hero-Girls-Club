let firstCard, secondCard;
let lockBoard = false;
let moves = 0;
let time = 0;
let timer;
let matchedPairs = 0;
let level = "easy";

const board = document.getElementById("gameBoard");
const movesText = document.getElementById("moves");
const timeText = document.getElementById("time");

const levels = {
  easy: ['🍎','🍌','🍎','🍌','🍇','🍓','🍇','🍓'],
  medium: ['🍎','🍌','🍇','🍓','🥝','🍍','🍎','🍌','🍇','🍓','🥝','🍍'],
  hard: ['🍎','🍌','🍇','🍓','🥝','🍍','🍉','🍒',
         '🍎','🍌','🍇','🍓','🥝','🍍','🍉','🍒']
};

function startTimer() {
  timer = setInterval(() => {
    time++;
    timeText.innerText = time;
  }, 1000);
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function createBoard() {
  clearInterval(timer);
  time = 0;
  moves = 0;
  matchedPairs = 0;
  movesText.innerText = 0;
  timeText.innerText = 0;
  firstCard = secondCard = null;

  board.innerHTML = "";
  board.style.gridTemplateColumns =
    level === "easy" ? "repeat(4,1fr)" :
    level === "medium" ? "repeat(4,1fr)" :
    "repeat(4,1fr)";

  shuffle(levels[level]).forEach(symbol => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.symbol = symbol;
    card.innerText = "?";
    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });

  startTimer();
}

function flipCard() {
  if (lockBoard || this.classList.contains("flipped")) return;

  this.classList.add("flipped");
  this.innerText = this.dataset.symbol;

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  moves++;
  movesText.innerText = moves;

  checkMatch();
}

function checkMatch() {
  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    matchedPairs++;

    if (matchedPairs === levels[level].length / 2) {
      clearInterval(timer);
      showPopup();
    }
    resetTurn();
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.innerText = "?";
      secondCard.innerText = "?";
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  firstCard = secondCard = null;
  lockBoard = false;
}

function showPopup() {
  document.getElementById("finalMoves").innerText = moves;
  document.getElementById("finalTime").innerText = time;
  document.getElementById("popup").style.display = "flex";
}

function restartGame() {
  document.getElementById("popup").style.display = "none";
  createBoard();
}

function changeLevel() {
  level = document.getElementById("level").value;
  restartGame();
}

createBoard();
