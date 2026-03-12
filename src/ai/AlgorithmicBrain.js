import { getObstacles } from '../utils/gridUtils';
import { determineTarget, getSafeNextMove } from './aiEngine';

export class AlgorithmicBrain {
  constructor(config) {
    this.config = config;
  }

  decide(snake, food, allSnakes) {
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

    return {
      move,
      path,
      aiState: newAi
    };
  }
}
