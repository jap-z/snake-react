import { GameEnvironment } from '../engine/GameEnvironment';

export class Trainer {
  constructor(config) {
    this.config = config;
    this.generation = 0;
  }

  /**
   * Runs a single headless game for a specific brain.
   * @param {BaseBrain} brain - The brain to evaluate.
   * @param {number} maxTicks - Absolute max ticks to prevent infinite loops.
   * @returns {Object} Statistics including fitness score.
   */
  runSingleGame(brain, maxTicks = 2000) {
    // Single snake template for isolated training
    const snakeTemplate = { 
      id: 'train_1', 
      name: 'TRN', 
      color: '#ffffff', 
      headColor: '#cccccc', 
      statusColor: '#aaaaaa', 
      startPos: { x: 20, y: 20 } 
    };

    const env = new GameEnvironment([snakeTemplate]);
    
    let ticksAlive = 0;
    let maxApples = 0;
    let deathReason = "MAX_TICKS";
    const absoluteHungerLimit = this.config.starvationThreshold * 3; // e.g., 120 ticks without food

    while (!env.isGameOver && ticksAlive < maxTicks) {
      const currentState = env.getState();
      const snake = currentState.snakes[0];
      
      if (snake.isDead) {
        deathReason = "COLLISION";
        break;
      }

      // Hard starvation kill to prevent spinning in circles forever
      if (snake.ai.hunger > absoluteHungerLimit) {
        deathReason = "STARVATION";
        break;
      }
      
      const sensorData = env.getSensorState(snake.id);
      const decision = brain.decide(sensorData, snake, currentState.food, currentState.snakes);
      
      env.tick({ [snake.id]: decision });
      ticksAlive++;
      
      const currentApples = env.getState().snakes[0].body.length - 1;
      if (currentApples > maxApples) {
        maxApples = currentApples;
      }
    }

    // Fitness Calculation (Phase 4 Logic)
    let baseScore = ticksAlive + (maxApples * 1000);
    
    // Penalize death forms
    if (deathReason === "COLLISION") baseScore -= 500;
    if (deathReason === "STARVATION") baseScore -= 250;

    // Prevent negative base scores from breaking the multiplier
    baseScore = Math.max(1, baseScore);

    // Exponential reward for actual growth
    const fitness = baseScore * Math.pow(maxApples + 1, 1.5);
    
    return {
      fitness,
      applesEaten: maxApples,
      ticksAlive,
      deathReason
    };
  }

  /**
   * Evaluates an entire population of brains.
   * @param {Array<BaseBrain>} population - Array of brains to evaluate.
   * @returns {Array<Object>} Sorted array of results (highest fitness first).
   */
  runGeneration(population) {
    this.generation++;
    const results = [];

    for (let i = 0; i < population.length; i++) {
      const brain = population[i];
      const stats = this.runSingleGame(brain);
      results.push({
        brain,
        fitness: stats.fitness,
        apples: stats.applesEaten,
        ticks: stats.ticksAlive,
        deathReason: stats.deathReason
      });
    }

    // Sort descending by fitness
    results.sort((a, b) => b.fitness - a.fitness);
    
    return results;
  }
}
