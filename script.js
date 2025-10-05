// Memory Match — simple, accessible, responsive

const boardEl = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timeEl = document.getElementById('time');
const startBtn = document.getElementById('start');
const pairsSelect = document.getElementById('pairs');
const winModal = document.getElementById('win');
const finalMovesEl = document.getElementById('final-moves');
const finalTimeEl = document.getElementById('final-time');
const playAgainBtn = document.getElementById('play-again');

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matched = 0;
let totalPairs = 8;
let timer = null;
let seconds = 0;

// Simple set of emoji to use as card faces
const EMOJIS = ['🍎','🍌','🍒','🍇','🍉','🍓','🍑','🥝','🍍','🥥','🍐','🍋'];

function startGame(){
  resetState();
  totalPairs = Number(pairsSelect.value) || 8;
  const cards = generateCards(totalPairs);
  renderBoard(cards);
  startTimer();
}

function resetState(){
  clearInterval(timer);
  timer = null;
  seconds = 0;
  timeEl.textContent = '0:00';
  moves = 0;
  movesEl.textContent = moves;
  firstCard = null; secondCard = null; lockBoard = false; matched = 0;
  winModal.classList.add('hidden');
}

function generateCards(pairs){
  const faces = EMOJIS.slice(0);
  // shuffle and take needed faces
  shuffleArray(faces);
  const selected = faces.slice(0, pairs);
  // duplicate and shuffle
  const deck = shuffleArray(selected.concat(selected));
  return deck;
}

function renderBoard(cards){
  boardEl.innerHTML = '';
  // set grid columns dynamically based on number of cards
  const cols = Math.min(6, Math.ceil(Math.sqrt(cards.length)));
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  cards.forEach((face, idx) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.setAttribute('aria-label', 'Card');
    card.dataset.face = face;
    card.dataset.index = idx;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back" aria-hidden="true">?</div>
        <div class="card-face card-front" aria-hidden="true">${face}</div>
      </div>
    `;
    card.addEventListener('click', onCardClick);
    boardEl.appendChild(card);
  });
}

function onCardClick(e){
  if(lockBoard) return;
  const clicked = e.currentTarget;
  if(clicked === firstCard) return; // clicking same card

  flipCard(clicked);

  if(!firstCard){
    firstCard = clicked;
    return;
  }

  secondCard = clicked;
  moves += 1;
  movesEl.textContent = moves;

  checkForMatch();
}

function flipCard(card){
  card.classList.add('flipped');
}

function unflipCards(a, b){
  lockBoard = true;
  setTimeout(()=>{
    a.classList.remove('flipped');
    b.classList.remove('flipped');
    resetPick();
  }, 900);
}

function disableCards(a, b){
  a.disabled = true;
  b.disabled = true;
  resetPick();
}

function resetPick(){
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function checkForMatch(){
  const isMatch = firstCard.dataset.face === secondCard.dataset.face;
  if(isMatch){
    disableCards(firstCard, secondCard);
    matched += 1;
    if(matched === totalPairs){
      // game won
      endGame();
    }
    return;
  }
  unflipCards(firstCard, secondCard);
}

function startTimer(){
  timer = setInterval(()=>{
    seconds += 1;
    timeEl.textContent = formatTime(seconds);
  }, 1000);
}

function endGame(){
  clearInterval(timer);
  finalMovesEl.textContent = moves;
  finalTimeEl.textContent = formatTime(seconds);
  winModal.classList.remove('hidden');
}

function formatTime(sec){
  const m = Math.floor(sec/60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

function shuffleArray(arr){
  // Fisher–Yates shuffle
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);

// start on page load with default
document.addEventListener('DOMContentLoaded', startGame);