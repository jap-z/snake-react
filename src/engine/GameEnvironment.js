import { placeFood, checkCollision, tileCount } from '../utils/gridUtils';

export class GameEnvironment {
  constructor(initialSnakes) {
    this.tileCount = tileCount;
    // Deep copy initial snakes
    this.snakes = initialSnakes.map(s => ({
      ...s,
      body: [...s.body],
      ai: { ...s.ai },
      plannedPath: [],
      isDead: false
    }));
    
    this.food = placeFood(this.snakes.flatMap(sn => sn.body), []);
    this.isGameOver = false;
    this.status = { text: "Simulation Running", type: "running" };
    this.tickCount = 0;
  }

  // brainsOutput is an object mapping snakeId to { move: {x,y}, path: [], aiState: {} }
  tick(brainsOutput) {
    if (this.isGameOver) return this.getState();
    this.tickCount++;

    // 1. Apply Moves and Update AI State
    const nextStates = this.snakes.map(snake => {
      if (snake.isDead) return snake;

      const output = brainsOutput[snake.id];
      const nextMove = output ? output.move : { x: snake.body[0].x, y: snake.body[0].y - 1 };
      const newAi = output && output.aiState ? output.aiState : { ...snake.ai };
      const path = output && output.path ? output.path : [];

      return {
        ...snake,
        ai: newAi,
        nextMove,
        plannedPath: path,
        newBody: [nextMove, ...snake.body]
      };
    });

    // 2. Handle Eating
    let foodEaten = false;
    const finalSnakes = nextStates.map(snake => {
      if (snake.isDead) return snake;
      const eats = snake.nextMove.x === this.food.x && snake.nextMove.y === this.food.y;
      if (eats) {
        foodEaten = true;
        return { ...snake, body: snake.newBody, ai: { ...snake.ai, hunger: 0, status: "IDLE" } };
      }
      const b = [...snake.newBody];
      b.pop();
      return { ...snake, body: b };
    });

    if (foodEaten) {
      const allBodies = finalSnakes.flatMap(s => s.body);
      this.food = placeFood(allBodies, []);
    }

    // 3. Collision & Death
    const evaluatedSnakes = finalSnakes.map(snake => {
      if (snake.isDead) return snake;
      
      const othersBodies = finalSnakes.filter(s => s.id !== snake.id).flatMap(s => s.body);
      let isDeadNow = checkCollision(snake.body[0], snake.body, othersBodies);
      
      finalSnakes.forEach(other => {
        if (snake.id !== other.id && !other.isDead) {
          if (snake.body[0].x === other.body[0].x && snake.body[0].y === other.body[0].y) {
            if (snake.body.length <= other.body.length) isDeadNow = true;
          }
        }
      });

      if (isDeadNow) return { ...snake, isDead: true };
      return snake;
    });

    this.snakes = evaluatedSnakes;

    // Check Game Over Condition
    const aliveCount = this.snakes.filter(s => !s.isDead).length;
    if (this.snakes.length > 1 && aliveCount <= 1) {
        this.isGameOver = true;
        const winner = this.snakes.find(s => !s.isDead);
        this.status = { 
          text: winner ? `${winner.name} WINS!` : "MUTUAL DESTRUCTION!", 
          type: "stopped" 
        };
    } else if (this.snakes.length === 1 && aliveCount === 0) {
        this.isGameOver = true;
        this.status = { text: "GAME OVER", type: "stopped" };
    }

    return this.getState();
  }

  getState() {
    return {
      snakes: this.snakes,
      food: this.food,
      isGameOver: this.isGameOver,
      status: this.status,
      tickCount: this.tickCount
    };
  }
}
