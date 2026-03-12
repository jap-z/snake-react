import { useState, useEffect, useCallback, useRef } from 'react';
import { placeFood, getObstacles, checkCollision, tileCount } from '../utils/gridUtils';
import { determineTarget, getSafeNextMove } from '../ai/aiEngine';

const SNAKE_TEMPLATES = [
  { id: 'green', name: 'GRN', color: '#22c55e', headColor: '#4ade80', statusColor: '#86efac', startPos: { x: 6, y: 20 } },
  { id: 'blue', name: 'BLU', color: '#3b82f6', headColor: '#60a5fa', statusColor: '#93c5fd', startPos: { x: 33, y: 20 } },
  { id: 'purple', name: 'PRP', color: '#a855f7', headColor: '#c084fc', statusColor: '#e9d5ff', startPos: { x: 20, y: 6 } },
  { id: 'orange', name: 'ORG', color: '#f97316', headColor: '#fb923c', statusColor: '#ffedd5', startPos: { x: 20, y: 33 } },
  { id: 'pink', name: 'PNK', color: '#ec4899', headColor: '#f472b6', statusColor: '#fce7f3', startPos: { x: 6, y: 6 } },
  { id: 'cyan', name: 'CYN', color: '#06b6d4', headColor: '#22d3ee', statusColor: '#ecfeff', startPos: { x: 33, y: 33 } },
];

export const useGameState = () => {
  // Config State
  const [initialSnakeCount, setInitialSnakeCount] = useState(3);
  const [sightRange, setSightRange] = useState(10);
  const [smellRange, setSmellRange] = useState(20);
  const [tickRate, setTickRate] = useState(70);

  // Game State
  const [snakes, setSnakes] = useState([]);
  const [food, setFood] = useState({ x: 20, y: 20 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [status, setStatus] = useState({ text: "Simulation Running", type: "running" });

  const stateRef = useRef({ snakes, food, isGameOver, tickRate, sightRange, smellRange });

  useEffect(() => {
    stateRef.current = { snakes, food, isGameOver, tickRate, sightRange, smellRange };
  }, [snakes, food, isGameOver, tickRate, sightRange, smellRange]);

  const initGame = useCallback(() => {
    const count = Math.min(initialSnakeCount, SNAKE_TEMPLATES.length);
    const newSnakes = SNAKE_TEMPLATES.slice(0, count).map(s => ({
      ...s,
      body: [s.startPos],
      ai: { memory: null, status: "IDLE", hunger: 0 },
      isDead: false
    }));
    
    setSnakes(newSnakes);
    setFood(placeFood(newSnakes.flatMap(sn => sn.body), []));
    setIsGameOver(false);
    setStatus({ text: "Simulation Running", type: "running" });
  }, [initialSnakeCount]);

  // Initial Boot
  useEffect(() => {
    initGame();
  }, [initialSnakeCount]); // Restart simulation when initial count changes

  const spawnSnake = () => {
    setInitialSnakeCount(prev => Math.min(prev + 1, SNAKE_TEMPLATES.length));
  };

  const update = useCallback(() => {
    const { snakes: currentSnakes, food: f, isGameOver: over, sightRange: sight, smellRange: smell } = stateRef.current;
    if (over) return;

    // 1. Move & AI Decisions
    const nextStates = currentSnakes.map(snake => {
      if (snake.isDead) return snake;

      const newAi = { ...snake.ai, hunger: snake.ai.hunger + 1 };
      const othersBodies = currentSnakes.filter(s => s.id !== snake.id).flatMap(s => s.body);
      const obs = getObstacles(snake.body, othersBodies);
      
      const enemy = currentSnakes
        .filter(s => s.id !== snake.id && !s.isDead)
        .sort((a, b) => {
          const distA = Math.abs(snake.body[0].x - a.body[0].x) + Math.abs(snake.body[0].y - a.body[0].y);
          const distB = Math.abs(snake.body[0].x - b.body[0].x) + Math.abs(snake.body[0].y - b.body[0].y);
          return distA - distB;
        })[0] || currentSnakes[0];
      
      const target = determineTarget(snake.body, newAi, f, enemy.body, sight, smell);
      const nextMove = getSafeNextMove(snake.body, target, obs, enemy.body, newAi);

      return {
        ...snake,
        ai: newAi,
        nextMove,
        newBody: [nextMove, ...snake.body]
      };
    });

    // 2. Handle Eating
    let foodEaten = false;
    const finalSnakes = nextStates.map(snake => {
      if (snake.isDead) return snake;
      const eats = snake.nextMove.x === f.x && snake.nextMove.y === f.y;
      if (eats) {
        foodEaten = true;
        return { ...snake, body: snake.newBody, ai: { ...snake.ai, hunger: 0 } };
      }
      const b = [...snake.newBody];
      b.pop();
      return { ...snake, body: b };
    });

    if (foodEaten) {
      const allBodies = finalSnakes.flatMap(s => s.body);
      setFood(placeFood(allBodies, []));
    }

    // 3. Collision & Death
    let deathOccurred = false;
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

      if (isDeadNow) {
        deathOccurred = true;
        return { ...snake, isDead: true };
      }
      return snake;
    });

    setSnakes(evaluatedSnakes);

    const aliveCount = evaluatedSnakes.filter(s => !s.isDead).length;
    if (aliveCount <= 1 && INITIAL_SNAKES_COUNT_LOGIC_PROTECTION) { // Use template length check
       // game over logic...
    }
    
    // Better game over logic for dynamic counts
    if (currentSnakes.length > 1 && aliveCount <= 1) {
        setIsGameOver(true);
        const winner = evaluatedSnakes.find(s => !s.isDead);
        setStatus({ 
          text: winner ? `${winner.name} WINS!` : "MUTUAL DESTRUCTION!", 
          type: "stopped" 
        });
        setTimeout(initGame, 3000);
    }
  }, [initGame]);

  const INITIAL_SNAKES_COUNT_LOGIC_PROTECTION = snakes.length > 1;

  useEffect(() => {
    const interval = setInterval(update, tickRate);
    return () => clearInterval(interval);
  }, [update, tickRate]);

  return { 
    snakes, food, isGameOver, status, 
    tickRate, setTickRate, 
    sightRange, setSightRange,
    smellRange, setSmellRange,
    initialSnakeCount, setInitialSnakeCount,
    spawnSnake,
    initGame 
  };
};
