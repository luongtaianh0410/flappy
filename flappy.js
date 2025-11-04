const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

 
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

 
const birdImg = new Image();
birdImg.src = 'https://i.postimg.cc/9fbH08k9/image.png';

const pipeImg = new Image();
pipeImg.src = 'https://i.postimg.cc/K8FZYMYs/image.png';

const bgImg = new Image();
bgImg.src = 'https://i.postimg.cc/x8M2ffV2/image.png';

 
const flapSound = new Audio('sounds/flap.wav');
const hitSound = new Audio('sounds/hit.wav');

 
let bird = { 
  x: 100, 
  y: canvas.height/2, 
  width: 50, 
  height: 36, 
  gravity: 0.6, 
  lift: -12, 
  velocity: 0 
};

let pipes = [];
let frame = 0;
let score = 0;
let speed = 2;
let gameOverFlag = false;

 
function createPipe() {
  let top = Math.random() * (canvas.height/2) + 50;
  let gap = 150;
  let bottom = canvas.height - top - gap;
  pipes.push({ x: canvas.width, top: top, bottom: bottom, width: 80 });
}

 
function drawBird() {
  ctx.save();
  ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
  let angle = Math.min(Math.max(bird.velocity / 10, -0.5), 0.5);
  ctx.rotate(angle);
  ctx.drawImage(birdImg, -bird.width/2, -bird.height/2, bird.width, bird.height);
  ctx.restore();
}

// Vẽ ống
function drawPipes() {
  for (let pipe of pipes) {
    ctx.drawImage(pipeImg, pipe.x, 0, pipe.width, pipe.top);
    ctx.drawImage(pipeImg, pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
  }
}

 
function drawBackground() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

 
function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '64px Arial';
  ctx.fillText("Game Over", canvas.width/2 - 160, canvas.height/2);
  ctx.font = '32px Arial';
  ctx.fillText("Score: " + score, canvas.width/2 - 60, canvas.height/2 + 50);
}

 
function update() {
  if (gameOverFlag) return;

  frame++;
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (frame % 90 === 0) createPipe();

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
      if (score % 5 === 0) speed += 0.5; // tăng tốc
    }
  }

 
  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    hitSound.play();
    gameOverFlag = true;
  }
}

 
function draw() {
  drawBackground();
  drawPipes();
  drawBird();
  ctx.fillStyle = 'white';
  ctx.font = '32px Arial';
  ctx.fillText("Score: " + score, 20, 50);
  if (gameOverFlag) drawGameOver();
}

 
let loopId;
function loop() {
  update();
  draw();
  loopId = requestAnimationFrame(loop);
}
loop();

 
function flap() {
  bird.velocity = bird.lift;
  flapSound.play();
}

document.addEventListener('keydown', function(e) {
  if (e.code === 'Space') flap();
});

document.addEventListener('touchstart', function(e) {
  flap();
});

 
window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

