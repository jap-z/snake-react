import { getDist, getHeading, tileCount } from '../utils/gridUtils';
import { bfs, floodFill } from '../utils/pathfinding';

export const determineTarget = (snake, aiState, food, enemy, sightRange, smellRange) => {
  let head = snake[0];
  let distToFood = getDist(head, food);
  let distToEnemy = getDist(head, enemy[0]);

  let starveChance = Math.max(0, (aiState.hunger - 40) / 60);
  if (Math.random() < starveChance) {
    aiState.status = "STARVE";
    return { x: food.x, y: food.y };
  }

  if (distToFood <= sightRange) {
    aiState.memory = { x: food.x, y: food.y };
    aiState.status = "SEE";
    return { x: food.x, y: food.y };
  } 

  let smellChance = 1 - (distToFood / (smellRange + 10)); 
  if (distToFood <= smellRange && Math.random() < smellChance) {
    if (!aiState.memory || getDist(head, aiState.memory) <= 2) {
      let angle = Math.random() * Math.PI * 2;
      let radius = Math.random() * 4 + 2; 
      let nx = Math.floor(food.x + Math.cos(angle) * radius);
      let ny = Math.floor(food.y + Math.sin(angle) * radius);
      aiState.memory = { x: Math.max(0, Math.min(tileCount - 1, nx)), y: Math.max(0, Math.min(tileCount - 1, ny)) };
    }
    aiState.status = "SMELL";
    return aiState.memory;
  } 

  if (aiState.memory && getDist(head, aiState.memory) > 1) {
    if (Math.random() < 0.05) aiState.memory = null; 
    else { aiState.status = "MEM"; return aiState.memory; }
  }

  let huntChance = Math.max(0, 1 - (distToEnemy / 25)); 
  if (Math.random() < huntChance) {
    aiState.status = "HUNT";
    let eh = enemy[0];
    let heading = getHeading(enemy);
    let tx = Math.max(0, Math.min(tileCount - 1, eh.x + heading.x * 4));
    let ty = Math.max(0, Math.min(tileCount - 1, eh.y + heading.y * 4));
    return {x: tx, y: ty};
  } else {
    if (!aiState.memory || getDist(head, aiState.memory) <= 2) {
      let midX = Math.floor((head.x + food.x) / 2);
      let midY = Math.floor((head.y + food.y) / 2);
      let noiseX = Math.floor((Math.random() - 0.5) * 15);
      let noiseY = Math.floor((Math.random() - 0.5) * 15);
      aiState.memory = { 
        x: Math.max(0, Math.min(tileCount - 1, midX + noiseX)), 
        y: Math.max(0, Math.min(tileCount - 1, midY + noiseY)) 
      };
    }
    aiState.status = "SEARCH";
    return aiState.memory;
  }
};

export const getSafeNextMove = (snake, target, obstacles, enemySnake, aiState) => {
  let head = snake[0];
  let enemyHead = enemySnake[0];
  let heading = getHeading(snake);
  let dirs = [[0,-1],[0,1], [-1,0],[1,0]];
  let safeMoves = [];

  for (let d of dirs) {
    let nx = head.x + d[0];
    let ny = head.y + d[1];
    let key = `${nx},${ny}`;
    
    if (nx >= 0 && nx < tileCount && ny >= 0 && ny < tileCount && !obstacles.has(key)) {
      if (snake.length > 1 && nx === snake[1].x && ny === snake[1].y) continue;

      let area = floodFill({x: nx, y: ny}, obstacles);
      let distToEnemyHead = Math.abs(nx - enemyHead.x) + Math.abs(ny - enemyHead.y);
      let isRisky = (distToEnemyHead === 1);

      if (isRisky) {
        if (snake.length > enemySnake.length) {
          isRisky = false;
        } else {
          let riskTolerance = 0.05 + (aiState.hunger / 150); 
          if (aiState.status === "STARVE") riskTolerance += 0.50; 
          if (Math.random() < riskTolerance) isRisky = false; 
        }
      }

      let isStraight = (d[0] === heading.x && d[1] === heading.y) ? 1 : 0;
      safeMoves.push({x: nx, y: ny, area: area, risky: isRisky, isStraight: isStraight});
    }
  }

  if (safeMoves.length === 0) return {x: head.x, y: head.y - 1}; 

  safeMoves.sort((a, b) => {
    if (a.risky !== b.risky) return a.risky ? 1 : -1;
    if (Math.abs(b.area - a.area) > 5) return b.area - a.area; 
    return b.isStraight - a.isStraight; 
  });

  let maxArea = safeMoves[0].area;
  let requiredArea = Math.min(snake.length + 5, tileCount * tileCount / 4);

  let path = bfs(head, target, obstacles, heading);
  if (path && path.length > 0) {
    let nextStep = path[0];
    let stepInfo = safeMoves.find(m => m.x === nextStep.x && m.y === nextStep.y);
    
    if (stepInfo && stepInfo.risky === safeMoves[0].risky) {
      if (stepInfo.area >= requiredArea || stepInfo.area === maxArea) {
        return {x: nextStep.x, y: nextStep.y};
      }
    }
  }
  return {x: safeMoves[0].x, y: safeMoves[0].y};
};
