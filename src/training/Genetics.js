import * as tf from '@tensorflow/tfjs';

// Input: 363, Hidden: 64, Hidden: 32, Output: 3
export function createModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [363], units: 64, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));
  return model;
}

// Extract weights from a model
export function getWeights(model) {
  return model.getWeights().map(w => w.dataSync());
}

// Set weights into a model
export function setWeights(model, weightData) {
  const currentWeights = model.getWeights();
  const newWeights = currentWeights.map((w, i) => {
    return tf.tensor(weightData[i], w.shape);
  });
  model.setWeights(newWeights);
}

// Crossover two sets of weights
export function crossover(parentA, parentB) {
  const childWeights = [];
  for (let i = 0; i < parentA.length; i++) {
    const a = parentA[i];
    const b = parentB[i];
    const child = new Float32Array(a.length);
    // 50/50 chance for each weight
    for (let j = 0; j < a.length; j++) {
      child[j] = Math.random() > 0.5 ? a[j] : b[j];
    }
    childWeights.push(child);
  }
  return childWeights;
}

// Mutate weights
export function mutate(weights, mutationRate = 0.1, mutationAmount = 0.5) {
  const mutatedWeights = [];
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i];
    const mutated = new Float32Array(w.length);
    for (let j = 0; j < w.length; j++) {
      if (Math.random() < mutationRate) {
        // Add random gaussian noise
        const u1 = Math.random() + 0.000001; // Avoid 0
        const u2 = Math.random() + 0.000001;
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        mutated[j] = w[j] + (z0 * mutationAmount);
      } else {
        mutated[j] = w[j];
      }
    }
    mutatedWeights.push(mutated);
  }
  return mutatedWeights;
}
