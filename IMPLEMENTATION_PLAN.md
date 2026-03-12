# Implementation Plan: Neural Evolution

This document outlines the step-by-step engineering roadmap for migrating the Snake: Apex Predators project from a React-bound heuristic AI to a decoupled, headless-capable Neural Evolution environment.

## Phase 1: Engine Decoupling (Pure Physics Engine)
*Goal: Separate game rules from the React rendering lifecycle to allow high-speed headless execution.*
- [ ] Create `src/engine/GameEnvironment.js` as a pure ES6 class.
- [ ] Port grid state, snake body arrays, and food coordinates into class state.
- [ ] Port physics logic (`getSafeNextMove` execution, collision detection, eating, starvation).
- [ ] Implement a `tick(intents)` method that processes an array of actions (e.g., `TURN_LEFT`, `GO_STRAIGHT`, `TURN_RIGHT`) and updates the state.
- [ ] Refactor `useGameState.js` to simply instantiate `GameEnvironment` and sync its state to React state on a `setInterval`.

## Phase 2: Sensor Array & Egocentric Vision
*Goal: Translate the 2D grid into a fixed-size 1D tensor for neural network consumption.*
- [ ] Define the Receptive Field size (e.g., 11x11 grid centered on the snake's head).
- [ ] Implement Egocentric rotation math: Map global X/Y coordinates to the snake's local Forward/Left/Right/Back perspective.
- [ ] Implement Channel 1: Physical Obstacles (Walls, Self, Enemies). Handle out-of-bounds padding.
- [ ] Implement Channel 2: Direct Sight (Exact food location, 1.0 or 0.0).
- [ ] Implement Channel 3: Scent Gradient (Mathematical distance/heat map pointing toward food).
- [ ] Expose a `getSensorState(snakeId)` method in `GameEnvironment` that returns the flattened `363` (11x11x3) length array.

## Phase 3: The Brain Interface & Algorithmic Port
*Goal: Standardize how different AIs interact with the engine.*
- [ ] Create `src/ai/BaseBrain.js` interface with a `decide(sensorData)` method.
- [ ] Refactor our current BFS/FloodFill logic into `src/ai/AlgorithmicBrain.js`. Note: This will require translating the new `TURN_LEFT`/`GO_STRAIGHT` intents back into grid coordinates internally.
- [ ] Create a placeholder `src/ai/NeuralBrain.js` that returns random intents.

## Phase 4: Headless Training Loop (The Gymnasium)
*Goal: Build the environment capable of running thousands of games per second.*
- [ ] Create `src/training/Trainer.js`.
- [ ] Implement the `runGeneration(population)` loop: Spawns a dedicated headless `GameEnvironment` for each snake (or a large batch of snakes) and runs `tick()` in a `while` loop until all snakes die.
- [ ] Implement the Fitness Scoring logic: Apply the `Base Score * (Final Length ^ 1.5)` formula, explicitly ignoring kill points.

## Phase 5: The Genetic Algorithm (TFJS & Custom NEAT)
*Goal: Breed and mutate the neural networks.*
- [ ] Install `@tensorflow/tfjs` and `@tensorflow/tfjs-backend-wasm`.
- [ ] Implement the NN topology in `NeuralBrain.js` (Input: 363 -> Hidden: 64 -> Hidden: 32 -> Output: 3 Softmax).
- [ ] Implement `src/training/Genetics.js`:
  - `crossover(brainA, brainB)`: Mixes weights.
  - `mutate(brain, rate)`: Applies random Gaussian noise to weights.
- [ ] Wire the genetics into `Trainer.js` to handle generation progression.
- [ ] Implement checkpoint saving: Serialize the best brain's weights to `localStorage` or a downloadable JSON file every 10 generations.

## Phase 6: Integration & Arena Mode (UI)
*Goal: Bring the evolved brains back into the visual simulation.*
- [ ] Update the React UI to allow selecting the "Brain Type" for new predators (Algorithmic vs. Neural Checkpoint).
- [ ] Build a file loader or `localStorage` reader to hydrate a `NeuralBrain` from saved weights.
- [ ] Ensure the 70ms visual tick loop correctly queries the `NeuralBrain` for intents using real-time sensor data.
- [ ] (Future) Add combat/kill rewards to the fitness function for Phase 2 training.