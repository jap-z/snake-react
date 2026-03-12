# Snake: Apex Predators - Neural Evolution Architecture

## 1. Core Abstraction: Engine vs. Brain
The system is divided into two strict domains to allow for headless training and interchangeable AI models.

### The Environment (`GameEnvironment`)
- **Role:** The Physics Engine.
- **Responsibilities:** Maintains the true global grid (40x40), manages snake coordinates, handles movement, spawns food, and calculates collisions/deaths.
- **Input:** Accepts an `Intent` (`UP`, `DOWN`, `LEFT`, `RIGHT`) from each snake.
- **Output:** Provides raw game state to the UI and specific `SensorData` to the brains.
- **UI Decoupling:** Runs entirely independently of React (`useGameState.js` becomes a thin wrapper that polls the engine).

### The Brain (`BaseBrain`)
- **Role:** The Decision Maker.
- **Implementations:** 
  - `AlgorithmicBrain` (Our current heuristic BFS/FloodFill logic).
  - `NeuralBrain` (TFJS Model).
- **Input:** Accepts `SensorData` (The Receptive Field).
- **Output:** Returns an `Intent`.

---

## 2. The Sensor System: "The Receptive Field"
Instead of simple raycasting, the snake processes a localized, multi-channel grid of data. 

### Circular Radius & Boundary Handling
- The receptive field is a **circular radius** (e.g., radius of 5 tiles) centered on the snake's head.
- **Fixed Input Size:** Neural Networks require a fixed number of input nodes. If the radius is 5, the flattened array size must always be constant (e.g., area of a circle with r=5 is ~81 tiles).
- **Wall Truncation:** When the snake approaches a wall, the physical tiles outside the bounds are mathematically filled with `1.0` (Obstacle) values in the sensor array. The "shape" of the physical space shrinks, but the *data structure size* remains constant, padded by "Wall" data.

### The 3 Data Channels (Sight vs. Smell)
For every valid tile in the receptive radius, 3 data points are fed to the network:

1. **Physical Obstacles (Sight/Touch)**
   - `1.0`: Wall, self-body, or enemy body.
   - `0.0`: Empty space.
2. **Direct Sight (The Retina)**
   - `1.0`: Exact location of food (only registers if food is within the true line-of-sight distance).
   - `0.0`: No food visible.
3. **Scent Gradient (Smell)**
   - A mathematical heat map (0.0 to 1.0).
   - Provides a directional vector toward food outside of visual range. Values get "hotter" the closer a specific sensor tile is to the global food coordinate.

*(Total NN Inputs = Number of Tiles in Radius * 3 Channels)*

---

## 3. The Reward System (Fitness Function)
To prevent local maxima (like the "Spinner" or "Suicide" loopholes), the fitness function must balance survival with aggressive hunting.

**Positive Reinforcement:**
- **Eating Food:** `+1000 points`
- **Moving closer to food:** `+1 point` (Encourages following the scent gradient).

**Negative Reinforcement:**
- **Death (Wall or Body):** `-500 points` (Severe penalty).
- **Moving away from food:** `-2 points` (Discourages wandering).
- **Starvation Penalty:** `-1 point per tick` after exceeding the hunger threshold.

**The Multiplier:**
Total Fitness = `Base Score * (Final Length ^ 1.5)`
This exponentially rewards snakes that survive by eating rather than just dodging walls.

*Note: For the initial training phase, we are explicitly EXCLUDING any rewards for killing enemy snakes. The primary objective is to teach the AI basic survival and food acquisition before introducing competitive combat behaviors.*

---

## 4. Egocentric vs Allocentric Vision
- **Egocentric (Relative Vision):** The sensor grid will rotate based on the snake's current heading. To the Neural Network, "Up" on the sensor grid is always "Forward" relative to the snake's nose. 
- **Output:** The network will have 3 output nodes: `[TURN_LEFT, GO_STRAIGHT, TURN_RIGHT]`. 
- **Why:** This drastically reduces training time because the AI doesn't have to learn compass directions; it just learns "if wall in front, turn left or right."

---

## 5. Modes of Operation

### Mode 1: Training (The Gymnasium)
- **Execution:** Headless, pure data loop running at maximum CPU speed (no React/Canvas rendering).
- **Algorithm:** NEAT (NeuroEvolution of Augmenting Topologies).
- **Process:** Spawn generation (e.g., 100 snakes) -> Run until all dead -> Calculate Fitness -> Breed top % -> Mutate -> Spawn next generation.
- **Artifacts:** Exports JSON weights of the best performing brains at specific intervals (e.g., `gen_50_weights.json`).

### Mode 2: Arena (Production UI)
- **Execution:** The React UI we have built.
- **Features:** Dropdown to hot-swap brains on the fly (`Algorithmic`, `Neural_Gen_10`, `Neural_Gen_100`).

---
*Document maintained by Big Clawd - 2026-03-12*