export const drawSnake = (ctx, snake, bodyColor, headColor, isDead, gridSize) => {
  if (snake.length === 0) return;

  if (snake.length > 1) {
    ctx.beginPath();
    ctx.moveTo(snake[0].x * gridSize + gridSize/2, snake[0].y * gridSize + gridSize/2);
    for (let i = 1; i < snake.length; i++) {
      ctx.lineTo(snake[i].x * gridSize + gridSize/2, snake[i].y * gridSize + gridSize/2);
    }
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = gridSize * 0.85; // Slightly thicker body
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  const hx = snake[0].x * gridSize + gridSize/2;
  const hy = snake[0].y * gridSize + gridSize/2;
  
  // Head Shadow/Glow
  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowColor = headColor;
  ctx.fillStyle = headColor;
  ctx.beginPath();
  ctx.arc(hx, hy, gridSize * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const getHeading = (s) => {
    if (s.length >= 2) return { x: s[0].x - s[1].x, y: s[0].y - s[1].y };
    return { x: 1, y: 0 };
  };

  const heading = getHeading(snake);
  ctx.fillStyle = isDead ? '#111827' : '#ffffff';
  
  const eye1X = hx + heading.x * gridSize*0.18 - heading.y * gridSize*0.25;
  const eye1Y = hy + heading.y * gridSize*0.18 + heading.x * gridSize*0.25;
  const eye2X = hx + heading.x * gridSize*0.18 + heading.y * gridSize*0.25;
  const eye2Y = hy + heading.y * gridSize*0.18 - heading.x * gridSize*0.25;
  
  ctx.beginPath(); ctx.arc(eye1X, eye1Y, gridSize*0.14, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(eye2X, eye2Y, gridSize*0.14, 0, Math.PI*2); ctx.fill();
  
  if (!isDead) {
    ctx.fillStyle = '#000000'; 
    ctx.beginPath(); ctx.arc(eye1X + heading.x*1.2, eye1Y + heading.y*1.2, gridSize*0.07, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(eye2X + heading.x*1.2, eye2Y + heading.y*1.2, gridSize*0.07, 0, Math.PI*2); ctx.fill();
  }
};

export const drawFloatingStatus = (ctx, head, status, hunger, defaultColor, gridSize) => {
  if (status === "IDLE") return; // Don't clutter if idle
  
  ctx.save();
  ctx.fillStyle = status === "STARVE" ? "#f87171" : defaultColor;
  ctx.font = "bold 11px 'Poppins'";
  ctx.textAlign = "center";
  ctx.shadowBlur = 4;
  ctx.shadowColor = "#000";
  // Add a slight vertical bounce animation offset if we were in a real loop
  ctx.fillText(status, head.x * gridSize + gridSize / 2, head.y * gridSize - 6);
  ctx.restore();
};
