const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
  x: 100, 
  y: canvas.height / 2, 
  width: 50, 
  height: 36, 
  gravity: 0.35,   // 🪶 rơi chậm hơn (trước là 0.6)
  lift: -10,       // bay nhẹ nhàng hơn (trước -12)
  velocity: 0 
};

// Biến game
let pipes = [];
let frame = 0;
let score = 0;
let speed = 1.5; // ống di chuyển chậm hơn (trước là 2)
let gameOverFlag = false;
let gameStarted = false; // ✅ chưa bấm Start thì không rơi

// Hàm tạo ống
function createPipe() {
  let top = Math.random() * (canvas.height / 2) + 50;
  let gap = 440; // ✅ gấp đôi khoảng cách cũ (220 * 2)
  let bottom = canvas.height - top - gap;
  pipes.push({ x: canvas.width, top: top, bottom: bottom, width: 80 });
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
  ctx.font = '64px Arial';
  ctx.fillText("Flappy Bird", canvas.width / 2 - 180, canvas.height / 2 - 80);
  ctx.font = '32px Arial';
  ctx.fillText("Click 'Start Game' or Press SPACE", canvas.width / 2 - 230, canvas.height / 2);
  drawButton();
}

// Vẽ nút "Start Game"
function drawButton() {
  const btnWidth = 200;
  const btnHeight = 60;
  const x = canvas.width / 2 - btnWidth / 2;
  const y = canvas.height / 2 + 60;

  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(x, y, btnWidth, btnHeight);
  ctx.fillStyle = 'black';
  ctx.font = '28px Arial';
  ctx.fillText("Start Game", x + 25, y + 40);

  // Lưu vùng nút để bắt click
  startButton = { x, y, width: btnWidth, height: btnHeight };
}

let startButton = null;

// Vẽ Game Over
function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '64px Arial';
  ctx.fillText("Game Over", canvas.width / 2 - 160, canvas.height / 2);
  ctx.font = '32px Arial';
  ctx.fillText("Score: " + score, canvas.width / 2 - 60, canvas.height / 2 + 50);
  ctx.font = '24px Arial';
  ctx.fillText("Press SPACE or Click to Restart", canvas.width / 2 - 180, canvas.height / 2 + 100);
}

// Cập nhật trò chơi
function update() {
  if (!gameStarted || gameOverFlag) return;

  frame++;
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (frame > 60 && frame % 120 === 0) createPipe();

  for (let pipe of pipes) {
    pipe.x -= speed;

    // kiểm tra va chạm
    if (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipe.width &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      hitSound.play();
      gameOverFlag = true;
    }

    // tính điểm
    if (!pipe.scored && pipe.x + pipe.width < bird.x) {
      score++;
      pipe.scored = true;
      if (score % 5 === 0) speed += 0.2; // tăng tốc nhẹ
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
  ctx.font = '32px Arial';
  ctx.fillText("Score: " + score, 20, 50);

  if (!gameStarted) drawStartScreen();
  if (gameOverFlag) drawGameOver();
}

let loopId;
function loop() {
  update();
  draw();
  loopId = requestAnimationFrame(loop);
}

// Bay lên
function flap() {
  if (!gameStarted || gameOverFlag) return;
  bird.velocity = bird.lift;
  flapSound.play();
}

// Reset game
function resetGame() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  speed = 1.5;
  frame = 0;
  gameOverFlag = false;
}

// Bắt đầu game
function startGame() {
  gameStarted = true;
  resetGame();
}

// Sự kiện điều khiển
document.addEventListener('keydown', function(e) {
  if (e.code === 'Space') {
    if (!gameStarted) startGame();
    else if (gameOverFlag) resetGame();
    else flap();
  }
});

document.addEventListener('click', function(e) {
  if (!gameStarted) {
    // Kiểm tra click trúng nút Start
    if (
      startButton &&
      e.clientX >= startButton.x &&
      e.clientX <= startButton.x + startButton.width &&
      e.clientY >= startButton.y &&
      e.clientY <= startButton.y + startButton.height
    ) {
      startGame();
    }
  } else if (gameOverFlag) {
    resetGame();
  } else {
    flap();
  }
});

document.addEventListener('touchstart', function(e) {
  if (!gameStarted) startGame();
  else if (gameOverFlag) resetGame();
  else flap();
});

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  bird.y = canvas.height / 2;
});

// Đợi ảnh load xong rồi chạy
function startLoopWhenLoaded() {
  loop();
}

let loaded = 0;
const totalAssets = 3;
function checkLoaded() {
  loaded++;
  if (loaded === totalAssets) startLoopWhenLoaded();
}

birdImg.onload = checkLoaded;
pipeImg.onload = checkLoaded;
bgImg.onload = checkLoaded;

