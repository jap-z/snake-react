export const tileCount = 40;
export const SIGHT_RANGE = 10;
export const SMELL_RANGE = 20;
export const TICK_RATE = 70;

export const getDist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const getObstacles = (self, other) => {
  const obs = new Set();
  self.forEach(part => obs.add(`${part.x},${part.y}`));
  other.forEach(part => obs.add(`${part.x},${part.y}`));
  // Remove tail tips as they will move
  if (self.length > 0) obs.delete(`${self[self.length-1].x},${self[self.length-1].y}`);
  if (other.length > 0) obs.delete(`${other[other.length-1].x},${other[other.length-1].y}`);
  // Keep the neck as an obstacle
  if (self.length > 1) obs.add(`${self[1].x},${self[1].y}`);
  return obs;
};

export const getHeading = (snake) => {
  if (snake.length >= 2) return { x: snake[0].x - snake[1].x, y: snake[0].y - snake[1].y };
  return { x: 1, y: 0 };
};

export const placeFood = (snake1, snake2) => {
  let valid = false;
  let food;
  while (!valid) {
    food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
    valid = true;
    if (snake1.some(p => p.x === food.x && p.y === food.y)) valid = false;
    if (snake2.some(p => p.x === food.x && p.y === food.y)) valid = false;
  }
  return food;
};

export const checkCollision = (head, selfSnake, otherSnake) => {
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
  for (let i = 1; i < selfSnake.length; i++) if (head.x === selfSnake[i].x && head.y === selfSnake[i].y) return true;
  for (let i = 0; i < otherSnake.length; i++) if (head.x === otherSnake[i].x && head.y === otherSnake[i].y) return true;
  return false;
};
