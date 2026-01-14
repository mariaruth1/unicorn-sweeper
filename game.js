document.addEventListener("DOMContentLoaded", () => {
  const gameContainer = document.getElementById("game-container");
  const startButton = document.getElementById("start-button");
  const isMobile = window.innerWidth < 768;

  let width = isMobile ? 7 : 10;
  let height = isMobile ? 14 : 10;
  let unicornCount = 15;
  let totalTiles;
  let gameMatrix = [];
  let isGameOver = false;
  let flagsUsed = 0;
  let hasGameStarted = false;

  function initGame() {
    gameContainer.innerHTML = "";
    width = parseInt(document.getElementById("input-width").value);
    height = parseInt(document.getElementById("input-height").value);
    unicornCount = parseInt(document.getElementById("input-unicorns").value);

    totalTiles = width * height;
    if (unicornCount >= totalTiles) {
      window.alert("Too many unicorns! They need room to sleep.");
      return;
    }

    hasGameStarted = false;
    isGameOver = false;
    flagsUsed = 0;
    gameMatrix = [];
    document.getElementById("unicorn-total").innerText = unicornCount;
    document.getElementById("flags-used").innerText = flagsUsed;
    startButton.innerText = "Generate New";
    const gameOverText = document.getElementById("game-over-message");
    if (gameOverText) {
      gameOverText.remove();
    }

    const tileSize = 40;
    gameContainer.style.setProperty("--grid-width", width);
    gameContainer.style.setProperty("--grid-height", height);
    gameContainer.style.setProperty("--tile-size", tileSize + "px");
    const shuffledArray = Array(unicornCount)
      .fill("unicorn")
      .concat(Array(totalTiles - unicornCount).fill("empty"))
      .sort(() => Math.random() - 0.5);

    createBoard(shuffledArray);
  }

  function createBoard(shuffledArray) {
    for (let y = 0; y < height; y++) {
      gameMatrix[y] = [];
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const tileType = shuffledArray[index];

        const tileElement = document.createElement("div");
        tileElement.classList.add("tile");
        tileElement.dataset.x = x;
        tileElement.dataset.y = y;
        tileElement.dataset.type = tileType;

        let pressTimer;

        tileElement.addEventListener("touchstart", (e) => {
          e.preventDefault();
          pressTimer = window.setTimeout(() => {
            tileFlagged(x, y); // Long press places a flag
          }, 500); // 500ms for a long press
        });

        tileElement.addEventListener("touchend", () => {
          e.preventDefault();
          clearTimeout(pressTimer);
        });
        tileElement.addEventListener("click", () => tileClicked(x, y));
        tileElement.addEventListener("contextmenu", function (e) {
          e.preventDefault();
        });
        tileElement.addEventListener("auxclick", function (e) {
          e.preventDefault();
          tileFlagged(x, y);
        });

        gameContainer.appendChild(tileElement);

        gameMatrix[y][x] = {
          element: tileElement,
          type: tileType,
          revealed: false,
          flagged: false,
          count: 0,
        };
      }
    }

    calculateNumbers();
  }

  function tileFlagged(x, y) {
    if (!hasGameStarted) {
      hasGameStarted = true;
      startButton.innerText = "New Game";
    }

    const tile = gameMatrix[y][x];
    if (isGameOver || tile.revealed) return;

    if (tile.flagged) {
      tile.flagged = false;
      tile.element.textContent = "";
      flagsUsed--;
    } else if (flagsUsed < unicornCount) {
      tile.flagged = true;
      tile.element.textContent = "🌈";
      flagsUsed++;
    }
    document.getElementById("flags-used").innerText = flagsUsed;
    checkForWin();
  }

  function tileClicked(x, y) {
    if (!hasGameStarted) {
      hasGameStarted = true;
      startButton.innerText = "New Game";
    }

    const tile = gameMatrix[y][x];
    if (isGameOver || tile.revealed || tile.flagged) return;
    tile.revealed = true;
    tile.element.classList.add("revealed");

    if (tile.type === "unicorn") {
      tile.element.textContent = "🦄";
      gameOver("Game over");
      return;
    }

    checkForWin();

    if (tile.count > 0) {
      tile.element.textContent = tile.count;
    } else {
      for (let offY = -1; offY <= 1; offY++) {
        for (let offX = -1; offX <= 1; offX++) {
          const nextY = y + offY;
          const nextX = x + offX;
          if (nextY >= 0 && nextY < height && nextX >= 0 && nextX < width) {
            tileClicked(nextX, nextY);
          }
        }
      }
    }
  }

  function checkForWin() {
    let unrevealedSafeTiles = 0;
    let flaggedUnicorns = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = gameMatrix[y][x];

        if (tile.type !== "unicorn" && !tile.revealed) {
          unrevealedSafeTiles++;
        }
        if (tile.type === "unicorn" && tile.flagged) {
          flaggedUnicorns++;
        }
      }
    }

    if (unrevealedSafeTiles === 0 || flaggedUnicorns === unicornCount) {
      gameOver("You win!");
    }
  }

  function calculateNumbers() {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (gameMatrix[y][x].type === "unicorn") continue;

        let count = 0;

        for (let offY = -1; offY <= 1; offY++) {
          for (let offX = -1; offX <= 1; offX++) {
            const checkY = y + offY;
            const checkX = x + offX;

            if (
              checkY >= 0 &&
              checkY < height &&
              checkX >= 0 &&
              checkX < width
            ) {
              if (gameMatrix[checkY][checkX].type === "unicorn") {
                count++;
              }
            }
          }
        }

        gameMatrix[y][x].count = count;
        addNumberStyle(gameMatrix[y][x].element, count);
      }
    }
  }

  function addNumberStyle(tileElement, count) {
    switch (count) {
      case 1:
        tileElement.style.color = "#e22bb1ff";
        break;
      case 2:
        tileElement.style.color = "#9277ffff";
        break;
      case 3:
        tileElement.style.color = "#43b1ffff";
        break;
      case 4:
        tileElement.style.color = "#00FFFF";
        break;
      case 5:
        tileElement.style.color = "#4DE94C";
        break;
      case 6:
        tileElement.style.color = "#FFFF00";
        break;
      case 7:
        tileElement.style.color = "#FF8C00";
        break;
      case 8:
        tileElement.style.color = "#FF0000";
        break;
      default:
        tileElement.style.color = "black";
    }
  }

  function gameOver(displayText) {
    isGameOver = true;
    const gameOverText = document.createElement("div");
    gameOverText.id = "game-over-message";
    gameOverText.classList.add("game-over");
    gameOverText.innerText = displayText;
    document.body.appendChild(gameOverText);
  }

  startButton.addEventListener("click", initGame);
  initGame();
});
