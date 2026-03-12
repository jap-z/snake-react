import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEnvironment } from '../engine/GameEnvironment';
import { AlgorithmicBrain } from '../ai/AlgorithmicBrain';

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
  const [showPaths, setShowPaths] = useState(false);
  
  // Advanced AI Config State
  const [starvationThreshold, setStarvationThreshold] = useState(40);
  const [starveMultiplier, setStarveMultiplier] = useState(2.0);
  const [riskToleranceBase, setRiskToleranceBase] = useState(0.05);
  const [memoryRetention, setMemoryRetention] = useState(0.95);

  // Game State
  const [gameState, setGameState] = useState({
    snakes: [],
    food: { x: 20, y: 20 },
    isGameOver: false,
    status: { text: "Simulation Running", type: "running" }
  });

  const envRef = useRef(null);
  const aiConfigRef = useRef({
    sightRange, smellRange, starvationThreshold, starveMultiplier, riskToleranceBase, memoryRetention
  });

  useEffect(() => {
    aiConfigRef.current = {
      sightRange, smellRange, starvationThreshold, starveMultiplier, riskToleranceBase, memoryRetention
    };
  }, [sightRange, smellRange, starvationThreshold, starveMultiplier, riskToleranceBase, memoryRetention]);

  const initGame = useCallback(() => {
    const count = Math.min(initialSnakeCount, SNAKE_TEMPLATES.length);
    const initialSnakes = SNAKE_TEMPLATES.slice(0, count).map(s => ({
      ...s,
      body: [s.startPos],
      ai: { memory: null, status: "IDLE", hunger: 0 },
      plannedPath: [],
      isDead: false
    }));
    
    envRef.current = new GameEnvironment(initialSnakes);
    setGameState(envRef.current.getState());
  }, [initialSnakeCount]);

  useEffect(() => {
    initGame();
  }, [initialSnakeCount, initGame]);

  const spawnSnake = () => {
    setInitialSnakeCount(prev => Math.min(prev + 1, SNAKE_TEMPLATES.length));
  };

  const update = useCallback(() => {
    if (!envRef.current || envRef.current.isGameOver) return;

    const currentEnvState = envRef.current.getState();
    const brain = new AlgorithmicBrain(aiConfigRef.current);
    
    // Have all brains decide their next move
    const intents = {};
    currentEnvState.snakes.forEach(snake => {
       if (!snake.isDead) {
          intents[snake.id] = brain.decide(snake, currentEnvState.food, currentEnvState.snakes);
       }
    });

    // Tick the engine
    const newState = envRef.current.tick(intents);
    setGameState({ ...newState });

    if (newState.isGameOver) {
      setTimeout(initGame, 3000);
    }
  }, [initGame]);

  useEffect(() => {
    const interval = setInterval(update, tickRate);
    return () => clearInterval(interval);
  }, [update, tickRate]);

  return { 
    snakes: gameState.snakes, 
    food: gameState.food, 
    isGameOver: gameState.isGameOver, 
    status: gameState.status, 
    tickRate, setTickRate, 
    sightRange, setSightRange,
    smellRange, setSmellRange,
    starvationThreshold, setStarvationThreshold,
    starveMultiplier, setStarveMultiplier,
    riskToleranceBase, setRiskToleranceBase,
    memoryRetention, setMemoryRetention,
    initialSnakeCount, setInitialSnakeCount,
    showPaths, setShowPaths,
    spawnSnake,
    initGame 
  };
};
