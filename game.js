const canvas = document.getElementById("contentGame");
const ctx = canvas.getContext("2d");

let currentLevel = 1;
let score = 0;
let lives = 3;
let remainingBreakable = 0;

const ball = {
  x: 500,
  y: 420,
  radius: 8,
  speed: 1000,
  dx: 10,
  dy: -10,
};

const paddle = {
  width: 140,
  height: 14,
  x: (canvas.width - 140) / 2,
  y: canvas.height - 25,
};

let bricks = [];

const txtLevel = document.getElementById("txtLevel");
const txtScore = document.getElementById("txtScore");
const txtLives = document.getElementById("txtLives");
const btnLvl1 = document.getElementById("btnLvl1");
const btnLvl2 = document.getElementById("btnLvl2");

function loadLevel(lvl) {
  currentLevel = lvl;
  bricks = [];
  remainingBreakable = 0;

  paddle.width = lvl === 1 ? 140 : 120;
  paddle.x = (canvas.width - paddle.width) / 2;

  ball.speed = lvl === 1 ? 6 : 6.5;
  ball.x = canvas.width / 2;
  ball.y = paddle.y - ball.radius - 2;
  ball.dx = ball.speed * (Math.random() < 0.5 ? -1 : 1);
  ball.dy = -ball.speed;

  const padding = 12;
  const offsetTop = 50;
  const offsetLeft = 50;

  if (lvl === 1) {
    const rows = 3;
    const cols = 7;
    const brickW = (canvas.width - offsetLeft * 2 - (cols - 1) * padding) / cols;
    const brickH = 24;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: offsetLeft + c * (brickW + padding),
          y: offsetTop + r * (brickH + padding),
          width: brickW,
          height: brickH,
          type: 1,
          hp: 1,
          color: "#3498db",
          status: 1,
        });
        remainingBreakable++;
      }
    }
  } else if (lvl === 2) {
    const layout = [
      [2, 2, 2, 9, 2, 2, 2],
      [1, 9, 2, 1, 2, 9, 1],
      [2, 1, 9, 2, 9, 1, 2],
      [1, 2, 1, 9, 1, 2, 1],
    ];

    const rows = layout.length;
    const cols = layout[0].length;
    const brickW = (canvas.width - offsetLeft * 2 - (cols - 1) * padding) / cols;
    const brickH = 24;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const type = layout[r][c];
        let hp = 1;
        let color = "#3498db";

        if (type === 9) {
          hp = 999;
          color = "#2d3436";
        } else if (type === 2) {
          hp = 2;
          color = "#e67e22";
          remainingBreakable++;
        } else {
          remainingBreakable++;
        }

        bricks.push({
          x: offsetLeft + c * (brickW + padding),
          y: offsetTop + r * (brickH + padding),
          width: brickW,
          height: brickH,
          type: type,
          hp: hp,
          color: color,
          status: 1,
        });
      }
    }
  }

  txtLevel.innerText = currentLevel;
  txtScore.innerText = score;
  txtLives.innerHTML = '<i class="bi bi-heart-fill"></i> '.repeat(Math.max(0, lives));

  if (currentLevel === 1) {
    btnLvl1.classList.add("active");
    btnLvl2.classList.remove("active");
  } else {
    btnLvl2.classList.add("active");
    btnLvl1.classList.remove("active");
  }
}

canvas.addEventListener("mousemove", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  let newX = mouseX - paddle.width / 2;

  if (newX < 0) newX = 0;
  if (newX + paddle.width > canvas.width) {
    newX = canvas.width - paddle.width;
  }
  paddle.x = newX;
});

window.addEventListener("keydown", function (e) {
  if (e.key === "1") loadLevel(1);
  if (e.key === "2") loadLevel(2);
});

function checkCollision(ball, rect) {
  const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.height));

  const distX = ball.x - closestX;
  const distY = ball.y - closestY;
  const distSq = distX * distX + distY * distY;

  if (distSq < ball.radius * ball.radius) {
    if (Math.abs(distX) > Math.abs(distY)) {
      ball.dx = -ball.dx;
      if (distX > 0) ball.x = rect.x + rect.width + ball.radius;
      else ball.x = rect.x - ball.radius;
    } else {
      ball.dy = -ball.dy;
      if (distY > 0) ball.y = rect.y + rect.height + ball.radius;
      else ball.y = rect.y - ball.radius;
    }
    return true;
  }
  return false;
}

function update() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x - ball.radius <= 0) {
    ball.x = ball.radius;
    ball.dx = -ball.dx;
  } else if (ball.x + ball.radius >= canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.dx = -ball.dx;
  }

  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.dy = -ball.dy;
  }

  const inPaddleX = ball.x >= paddle.x && ball.x <= paddle.x + paddle.width;
  const inPaddleY = ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height;

  if (inPaddleX && inPaddleY && ball.dy > 0) {
    ball.y = paddle.y - ball.radius;
    const offset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
    ball.dx = offset * (ball.speed * 1.15);
    ball.dy = -Math.abs(ball.dy);
  }

  for (let i = 0; i < bricks.length; i++) {
    const b = bricks[i];
    if (b.status === 1) {
      if (checkCollision(ball, b)) {
        if (b.type !== 9) {
          b.hp -= 1;
          if (b.hp === 1 && b.type === 2) {
            b.color = "#f39c12";
          }
          if (b.hp <= 0) {
            b.status = 0;
            score += (b.type * 10);
            txtScore.innerText = score;
            remainingBreakable--;

            if (remainingBreakable <= 0) {
              if (currentLevel === 1) {
                alert("Chúc mừng bạn đã vượt qua Màn 1. Bắt đầu Màn 2 thôi!");
                loadLevel(2);
              } else {
                alert("Chức mừng bạn đã chiến thắng");
                score = 0;
                loadLevel(1);
              }
              return;
            }
          }
        }
        break;
      }
    }
  }

  if (ball.y + ball.radius >= canvas.height) {
    lives--;
    txtLives.innerHTML = '<i class="bi bi-heart-fill"></i> '.repeat(Math.max(0, lives));

    if (lives <= 0) {
      alert("Game Over! Bạn đã hết mạng. Điểm đạt được: " + score);
      score = 0;
      lives = 3;
      loadLevel(1);
    } else {
      ball.x = canvas.width / 2;
      ball.y = paddle.y - ball.radius - 2;
      ball.dx = ball.speed * (Math.random() < 0.5 ? -1 : 1);
      ball.dy = -ball.speed;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  bricks.forEach(function (b) {
    if (b.status === 1) {
      ctx.beginPath();
      ctx.rect(b.x, b.y, b.width, b.height);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = "#dfe6e9";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (b.type === 9) {
        ctx.fillText("■", b.x + b.width / 2, b.y + b.height / 2);
      } else if (b.type === 2 && b.hp > 1) {
        ctx.fillText("2", b.x + b.width / 2, b.y + b.height / 2);
      }
    }
  });

  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillStyle = "#0984e3";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#e74c3c";
  ctx.fill();
  ctx.strokeStyle = "#c0392b";
  ctx.stroke();
  ctx.closePath();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

loadLevel(1);
requestAnimationFrame(gameLoop);
