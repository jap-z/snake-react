export class BaseBrain {
  constructor(config) {
    this.config = config;
  }
  
  /**
   * Decide the next action for the snake.
   * @param {Object} sensorData - The egocentric sensory array (Phase 2).
   * @param {Object} snake - The snake object (for legacy fallback).
   * @param {Object} food - The food object (for legacy fallback).
   * @param {Array} allSnakes - Array of all snakes (for legacy fallback).
   * @returns {Object} { intent: 'TURN_LEFT' | 'GO_STRAIGHT' | 'TURN_RIGHT', aiState: {}, path: [] }
   */
  decide(sensorData, snake, food, allSnakes) {
    throw new Error("decide() must be implemented by subclasses");
  }
}
