<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Flappy Bird - Mobile Optimized</title>
<style>
  body {
    margin: 0;
    overflow: hidden;
    background: #70c5ce;
  }
  canvas {
    display: block;
    width: 100vw;
    height: 100vh;
  }
</style>
</head>
<body>
<canvas id="gameCanvas"></canvas>

<script>
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Ảnh
const birdImg = new Image();
birdImg.src = 'https://i.postimg.cc/9fbH08k9/image.png';
const pipeImg = new Image();
pipeImg.src = 'https://i.postimg.cc/K8FZYMYs/image.png';
const bgImg = new Image();
bgImg.src = 'https://i.postimg.cc/x8M2ffV2/image.png';

// Âm thanh
const flapSound = new Audio('sounds/flap.wav');
const hitSound = new Audio('sounds/hit.wav');

// Chim
let bird = { 
  x: canvas.width / 4, 
  y: canvas.height / 2, 
  width: 50, 
  height: 36, 
  gravity: 0.3, 
  lift: -8, 
  velocity: 0 
};

// Biến game
let pipes = [];
let frame = 0;
let score = 0;
let speed = 1.5; 
let gameOverFlag = false;
let gameStarted = false;
let startButton = null;

// Tạo ống
function createPipe() {
  const gap = canvas.height / 3; // Khoảng cách giữa 2 ống (linh động theo màn)
  const top = Math.random() * (canvas.height / 2);
  const bottom = canvas.height - top - gap;
  pipes.push({ x: canvas.width, top, bottom, width: 80 });
}

// Vẽ chim
function drawBird() {
  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  let angle = Math.min(Math.max(bird.velocity / 10, -0.5), 0.5);
  ctx.rotate(angle);
  ctx.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
  ctx.restore();
}

// Vẽ ống
function drawPipes() {
  for (let pipe of pipes) {
    ctx.drawImage(pipeImg, pipe.x, 0, pipe.width, pipe.top);
    ctx.drawImage(pipeImg, pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
  }
}

// Vẽ nền
function drawBackground() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

// Vẽ nút Start
function drawStartScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = `${canvas.width / 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText("Flappy Bird", canvas.width / 2, canvas.height / 2 - 100);

  ctx.font = `${canvas.width / 25}px Arial`;
  ctx.fillText("Tap or Press SPACE to Start", canvas.width / 2, canvas.height / 2 - 40);

  drawButton();
}

// Vẽ nút Start
function drawButton() {
  const btnWidth = 220;
  const btnHeight = 70;
  const x = canvas.width / 2 - btnWidth / 2;
  const y = canvas.height / 2 + 20;

  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(x, y, btnWidth, btnHeight);
  ctx.fillStyle = 'black';
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText("Start Game", canvas.width / 2, y + 45);

  startButton = { x, y, width: btnWidth, height: btnHeight };
}

// Game Over
function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = `${canvas.width / 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  ctx.font = `${canvas.width / 20}px Arial`;
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 60);
  ctx.font = `${canvas.width / 25}px Arial`;
  ctx.fillText("Tap or Press SPACE to Restart", canvas.width / 2, canvas.height / 2 + 120);
}

// Cập nhật trò chơi
function update() {
  if (!gameStarted || gameOverFlag) return;

  frame++;
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (frame % 200 === 0) createPipe(); // Giãn cách ống xa hơn

  for (let pipe of pipes) {
    pipe.x -= speed;

    // Va chạm
    if (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipe.width &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      hitSound.play();
      gameOverFlag = true;
    }

    // Tính điểm
    if (!pipe.scored && pipe.x + pipe.width < bird.x) {
      score++;
      pipe.scored = true;
      if (score % 5 === 0) speed += 0.2;
    }
  }

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    hitSound.play();
    gameOverFlag = true;
  }
}

// Vẽ khung hình
function draw() {
  drawBackground();
  drawPipes();
  drawBird();

  ctx.fillStyle = 'white';
  ctx.font = `${canvas.width / 20}px Arial`;
  ctx.textAlign = 'left';
  ctx.fillText("Score: " + score, 20, 50);

  if (!gameStarted) drawStartScreen();
  if (gameOverFlag) drawGameOver();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Bay
function flap() {
  if (!gameStarted || gameOverFlag) return;
  bird.velocity = bird.lift;
  flapSound.play();
}

// Reset
function resetGame() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  speed = 1.5;
  frame = 0;
  gameOverFlag = false;
}

// Start
function startGame() {
  gameStarted = true;
  resetGame();
}

// Điều khiển
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (!gameStarted) startGame();
    else if (gameOverFlag) resetGame();
    else flap();
  }
});

canvas.addEventListener('click', e => {
  if (!gameStarted && startButton &&
      e.clientX >= startButton.x &&
      e.clientX <= startButton.x + startButton.width &&
      e.clientY >= startButton.y &&
      e.clientY <= startButton.y + startButton.height) {
    startGame();
  } else if (gameOverFlag) resetGame();
  else flap();
});

canvas.addEventListener('touchstart', e => {
  if (!gameStarted) startGame();
  else if (gameOverFlag) resetGame();
  else flap();
});

// Đợi ảnh load
let loaded = 0;
const totalAssets = 3;
function checkLoaded() {
  loaded++;
  if (loaded === totalAssets) loop();
}

birdImg.onload = checkLoaded;
pipeImg.onload = checkLoaded;
bgImg.onload = checkLoaded;
</script>
</body>
</html>
