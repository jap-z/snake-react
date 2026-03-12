export const SENSOR_RADIUS = 5;
export const SENSOR_SIZE = SENSOR_RADIUS * 2 + 1; // 11x11 grid

export function getEgocentricSensorState(snake, food, allSnakes, tileCount) {
  const head = snake.body[0];
  let dx = 0, dy = -1; // Default UP if no body
  if (snake.body.length > 1) {
    dx = head.x - snake.body[1].x;
    dy = head.y - snake.body[1].y;
  }
  
  // Egocentric Vectors
  // Forward vector
  const fx = dx;
  const fy = dy;
  
  // Right vector (90 degrees clockwise)
  const rx = -dy;
  const ry = dx;
  
  // 11 * 11 * 3 channels = 363
  const state = new Float32Array(SENSOR_SIZE * SENSOR_SIZE * 3);
  
  // Create a fast lookup for physical obstacles
  const obstacleSet = new Set();
  allSnakes.forEach(s => {
    if (s.isDead) return;
    s.body.forEach((part, idx) => {
      // Don't count snake's own head as an obstacle
      if (s.id === snake.id && idx === 0) return;
      obstacleSet.add(`${part.x},${part.y}`);
    });
  });
  
  let i = 0;
  // ly goes from Forward (+5) to Backward (-5)
  for (let ly = SENSOR_RADIUS; ly >= -SENSOR_RADIUS; ly--) {
    // lx goes from Left (-5) to Right (+5)
    for (let lx = -SENSOR_RADIUS; lx <= SENSOR_RADIUS; lx++) {
      const gx = head.x + (lx * rx) + (ly * fx);
      const gy = head.y + (lx * ry) + (ly * fy);
      
      // Channel 1: Obstacles (1.0 = wall/body, 0.0 = clear)
      let isObstacle = 0.0;
      if (gx < 0 || gx >= tileCount || gy < 0 || gy >= tileCount) {
        isObstacle = 1.0; // Out of bounds (Wall)
      } else if (obstacleSet.has(`${gx},${gy}`)) {
        isObstacle = 1.0; // Body
      }
      
      // Channel 2: Sight (exact food location, 1.0 or 0.0)
      let isFood = 0.0;
      if (gx === food.x && gy === food.y) {
        isFood = 1.0;
      }
      
      // Channel 3: Smell Gradient
      // Distance from this specific sensor tile to the food
      const distToFood = Math.abs(gx - food.x) + Math.abs(gy - food.y);
      // Normalized between 0.0 (far away) and 1.0 (exactly on food)
      // tileCount * 1.5 is a heuristic max distance across the board
      let scent = Math.max(0, 1 - (distToFood / (tileCount * 1.5)));
      
      state[i++] = isObstacle;
      state[i++] = isFood;
      state[i++] = scent;
    }
  }
  
  return Array.from(state); // Convert Float32Array to standard array for general use
}
