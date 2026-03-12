import { BaseBrain } from './BaseBrain';
import * as tf from '@tensorflow/tfjs';
import { createModel, getWeights, setWeights } from '../training/Genetics';

export class NeuralBrain extends BaseBrain {
  constructor(config, weights = null) {
    super(config);
    this.tfModel = createModel();
    if (weights) {
      setWeights(this.tfModel, weights);
    }
  }

  getWeights() {
    return getWeights(this.tfModel);
  }

  decide(sensorData, snake, food, allSnakes) {
    if (snake.isDead) return null;

    // We must run inference synchronously or async? 
    // TFJS predict is synchronous if we use tensor.dataSync()
    const inputTensor = tf.tensor2d([sensorData]);
    const prediction = this.tfModel.predict(inputTensor);
    const outputData = prediction.dataSync(); // Array of 3 probabilities
    
    inputTensor.dispose();
    prediction.dispose();

    // Map output to intents: 0 = LEFT, 1 = STRAIGHT, 2 = RIGHT
    let maxIdx = 0;
    let maxVal = outputData[0];
    for (let i = 1; i < 3; i++) {
      if (outputData[i] > maxVal) {
        maxVal = outputData[i];
        maxIdx = i;
      }
    }

    const intents = ['TURN_LEFT', 'GO_STRAIGHT', 'TURN_RIGHT'];
    const selectedIntent = intents[maxIdx];

    return {
      intent: selectedIntent,
      aiState: { ...snake.ai, status: "NEURAL", hunger: snake.ai.hunger + 1 },
      path: []
    };
  }

  dispose() {
    this.tfModel.dispose();
  }
}
