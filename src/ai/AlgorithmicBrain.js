import { getObstacles } from '../utils/gridUtils';
import { determineTarget, getSafeNextMove } from './aiEngine';
import { BaseBrain } from './BaseBrain';

export class AlgorithmicBrain extends BaseBrain {
  decide(sensorData, snake, food, allSnakes) {
    if (snake.isDead) return null;

    const newAi = { ...snake.ai, hunger: snake.ai.hunger + 1 };
    const othersBodies = allSnakes.filter(s => s.id !== snake.id).flatMap(s => s.body);
    const obs = getObstacles(snake.body, othersBodies);
    
    const enemy = allSnakes
      .filter(s => s.id !== snake.id && !s.isDead)
      .sort((a, b) => {
        const distA = Math.abs(snake.body[0].x - a.body[0].x) + Math.abs(snake.body[0].y - a.body[0].y);
        const distB = Math.abs(snake.body[0].x - b.body[0].x) + Math.abs(snake.body[0].y - b.body[0].y);
        return distA - distB;
      })[0] || allSnakes[0] || snake;
    
    const target = determineTarget(snake.body, newAi, food, enemy.body, this.config);
    const { move, path } = getSafeNextMove(snake.body, target, obs, enemy.body, newAi, this.config);

    // Convert exact move coordinate into an Egocentric Intent
    const head = snake.body[0];
    let dx = 0, dy = -1; // Default UP
    if (snake.body.length > 1) {
      dx = head.x - snake.body[1].x;
      dy = head.y - snake.body[1].y;
    }

    const targetDx = move.x - head.x;
    const targetDy = move.y - head.y;

    let intent = 'GO_STRAIGHT';
    
    // TURN_LEFT: dx_new = dy, dy_new = -dx
    if (targetDx === dy && targetDy === -dx) {
      intent = 'TURN_LEFT';
    } 
    // TURN_RIGHT: dx_new = -dy, dy_new = dx
    else if (targetDx === -dy && targetDy === dx) {
      intent = 'TURN_RIGHT';
    } 
    // GO_STRAIGHT: dx_new = dx, dy_new = dy
    else if (targetDx === dx && targetDy === dy) {
      intent = 'GO_STRAIGHT';
    }

    return {
      intent,
      path,
      aiState: newAi
    };
  }
}
