import { BaseBrain } from './BaseBrain';

export class NeuralBrain extends BaseBrain {
  constructor(config, tfModel = null) {
    super(config);
    this.tfModel = tfModel;
  }

  decide(sensorData, snake, food, allSnakes) {
    if (snake.isDead) return null;

    // TODO: In Phase 5, pass sensorData to TFJS
    // const prediction = this.tfModel.predict(tf.tensor2d([sensorData]));
    
    // For now, random intent
    const intents = ['TURN_LEFT', 'GO_STRAIGHT', 'TURN_RIGHT'];
    const randomIntent = intents[Math.floor(Math.random() * intents.length)];

    return {
      intent: randomIntent,
      aiState: { ...snake.ai, status: "NEURAL_RANDOM", hunger: snake.ai.hunger + 1 },
      path: []
    };
  }
}
