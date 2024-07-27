const moves = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const gameContainer = document.querySelector(".game-container");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");

let cards;
let interval;
let firstCard = false;
let secondCard = false;
let isFlipping = false; // Flag to prevent double clicks during flip

const items = [
  { name: "filtro", image: "images/game/filtro.png" },
  { name: "carbon", image: "images/game/carbon.png" },
  { name: "piedra", image: "images/game/piedra.png" },
  { name: "vaso", image: "images/game/vaso.png" },
  { name: "botella", image: "images/game/botella.png" },
  { name: "clima", image: "images/game/clima.png" },
  { name: "sol", image: "images/game/sol.png" },
  { name: "cambio", image: "images/game/cambio.png" },
  { name: "filtro1", image: "images/game/filtro1.png" },
  { name: "econaranja", image: "images/game/econaranja.png" },
  { name: "limpio", image: "images/game/limpio.png" },
  { name: "filtro2", image: "images/game/filtro2.png" },
];

let seconds = 0,
  minutes = 0;
let movesCount = 0,
  winCount = 0;

const timeGenerator = () => {
  seconds += 1;
  if (seconds >= 60) {
    minutes += 1;
    seconds = 0;
  }
  let secondsValue = seconds < 10 ? `0${seconds}` : seconds;
  let minutesValue = minutes < 10 ? `0${minutes}` : minutes;
  timeValue.innerHTML = `<span>Tiempo:</span>${minutesValue}:${secondsValue}`;
};

const movesCounter = () => {
  movesCount += 1;
  moves.innerHTML = `<span>Movimientos:</span>${movesCount}`;
};

const generateRandom = (size = 4) => {
  let tempArray = [...items];
  let cardValues = [];
  size = (size * size) / 2;
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    cardValues.push(tempArray[randomIndex]);
    tempArray.splice(randomIndex, 1);
  }
  return cardValues;
};

const matrixGenerator = (cardValues, size = 4) => {
  gameContainer.innerHTML = "";
  cardValues = [...cardValues, ...cardValues];
  cardValues.sort(() => Math.random() - 0.5);
  for (let i = 0; i < size * size; i++) {
    gameContainer.innerHTML += `
     <div class="card-container" data-card-value="${cardValues[i].name}">
        <div class="card-before">?</div>
        <div class="card-after">
        <img src="${cardValues[i].image}" class="image"/></div>
     </div>
     `;
  }
  gameContainer.style.gridTemplateColumns = `repeat(${size},auto)`;

  cards = document.querySelectorAll(".card-container");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (!card.classList.contains("matched") && !isFlipping && !card.classList.contains("flipped")) {
        card.classList.add("flipped");
        if (!firstCard) {
          firstCard = card;
          firstCardValue = card.getAttribute("data-card-value");
        } else {
          movesCounter();
          secondCard = card;
          let secondCardValue = card.getAttribute("data-card-value");
          if (firstCardValue == secondCardValue) {
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
            firstCard = false;
            secondCard = false;
            winCount += 1;
            if (winCount == Math.floor(cardValues.length / 2)) {
              result.innerHTML = `<h2>Ganaste!!!</h2><h4>Movimientos: ${movesCount}</h4>`;
              stopGame();
            }
          } else {
            isFlipping = true; // Set the flag to true
            setTimeout(() => {
              firstCard.classList.remove("flipped");
              secondCard.classList.remove("flipped");
              firstCard = false;
              secondCard = false;
              isFlipping = false; // Reset the flag after flipping back
            }, 900);
          }
        }
      }
    });
  });
};

startButton.addEventListener("click", () => {
  movesCount = 0;
  seconds = 0;
  minutes = 0;
  controls.classList.add("hide");
  stopButton.classList.remove("hide");
  startButton.classList.add("hide");
  interval = setInterval(timeGenerator, 1000);
  moves.innerHTML = `<span>Movimientos:</span> ${movesCount}`;
  initializer();
});

stopButton.addEventListener("click", (stopGame = () => {
  controls.classList.remove("hide");
  stopButton.classList.add("hide");
  startButton.classList.remove("hide");
  clearInterval(interval);
}));

const initializer = () => {
  result.innerText = "";
  winCount = 0;
  let cardValues = generateRandom();
  console.log(cardValues);
  matrixGenerator(cardValues);
};

