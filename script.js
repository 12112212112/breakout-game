const canvas = document.getElementById("breakout");
const ctx = canvas.getContext("2d");

let gameStarted = false;
let ballRadius = 10;
let x, y, dx, dy;
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX;
let rightPressed = false;
let leftPressed = false;

const brickColumnCount = 6;
const brickWidth = 60;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 20;

let bricks = [];
let score = 0;
let level = 1;
let maxLevels = 5;

function initBricks() {
  let rowCount = Math.min(2 + level, 6);
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      bricks[c][r] = {
        x: 0,
        y: 0,
        status: 1,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      };
    }
  }
}

function resetGame() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2 + level * 0.5;
  dy = -(2 + level * 0.5);
  paddleX = (canvas.width - paddleWidth) / 2;
  score = 0;
  initBricks();
}

function startGame() {
  document.getElementById("startScreen").style.display = "none";
  gameStarted = true;
  level = 1;
  resetGame();
  draw();
}

function reloadGame() {
  document.getElementById("endScreen").style.display = "none";
  gameStarted = true;
  level = 1;
  resetGame();
  draw();
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

canvas.addEventListener("touchstart", (e) => {
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if (touchX < canvas.width / 2) leftPressed = true;
  else rightPressed = true;
});

canvas.addEventListener("touchend", () => {
  leftPressed = false;
  rightPressed = false;
});

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function collisionDetection() {
  let totalBricks = 0;
  let destroyed = 0;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        totalBricks++;
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
        }
      } else {
        destroyed++;
      }
    }
  }

  if (destroyed === totalBricks && totalBricks > 0) {
    if (level >= maxLevels) {
      endGame(true);
    } else {
      level++;
      resetGame();
    }
  }
}

function endGame(won) {
  document.getElementById("endScreen").style.display = "flex";
  document.getElementById("endMessage").textContent = won ? "🎉 فزت في كل المستويات!" : "💥 خسرت!";
  document.getElementById("finalLevel").textContent = level;
  gameStarted = false;
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#00ffcc";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        b.x = brickX;
        b.y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("النقاط: " + score, 8, 20);
}

function draw() {
  if (!gameStarted) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
    else return endGame(false);
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 5;
  else if (leftPressed && paddleX > 0) paddleX -= 5;

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}
