# Snake: Apex Predators (React Port) - Architecture Plan

## 1. Core Mission
Port the monolithic "Advanced AI Snake Competition" HTML/JS into a modern, component-based React application while preserving the complex AI logic and responsive 800x800 square aspect ratio.

## 2. Separation of Concerns

### A. View Layer (React Components)
*   **`<GameContainer />`**: High-level wrapper handling global layout, background gradients, and viewport locking.
*   **`<Header />`**: Manages title and responsive scoreboard.
*   **`<ScoreCard />`**: Atomic component for Green/Blue scores.
*   **`<GameBoard />`**: Manages the `<canvas>` element and resizing logic.
*   **`<Controls />`**: (Optional) UI for starting/pausing the simulation.

### B. State Layer (React Hooks)
*   **`useGameState`**: Core engine. Manages `snakes`, `food`, `isGameOver`, and `scores`.
*   **`useGameLoop`**: Custom hook encapsulating `requestAnimationFrame` or `setTimeout` logic for the 70ms tick rate.
*   **`useCanvasRenderer`**: Handles the procedural drawing logic (grid, food glow, snake eyes, floating status text).

### C. Logic Layer (Pure Functions / Utilities)
*   **`gridUtils.js`**: Functions like `getDist`, `getObstacles`, `placeFood`, and `checkCollision`.
*   **`pathfinding.js`**: The `bfs` and `floodFill` algorithms, decoupled from React state.
*   **`aiEngine.js`**: The predator logic: `determineTarget` and `getSafeNextMove`.

## 3. Data Structures
*   **Snake**: `Array<{x: number, y: number}>`
*   **AI State**: `Object { memory: {x,y}|null, status: string, hunger: number }`
*   **Config**: Constants for `tileCount (40)`, `SIGHT_RANGE`, `SMELL_RANGE`.

## 4. Implementation Phase 1: Utilities
I will first extract the pathfinding and AI logic into standalone ES modules to ensure they remain testable and decoupled from the UI.

## 5. Implementation Phase 2: React Hook
The `useGameState` hook will be the single source of truth, updating snake positions and AI decisions every tick.

---
*Plan created by Big Clawd - 2026-03-11*
