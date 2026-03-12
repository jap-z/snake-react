import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEnvironment } from '../engine/GameEnvironment';
import { AlgorithmicBrain } from '../ai/AlgorithmicBrain';
import { NeuralBrain } from '../ai/NeuralBrain';
import { crossover, mutate } from '../training/Genetics';

const SNAKE_TEMPLATES = [
  { id: 'green', name: 'GRN', color: '#22c55e', headColor: '#4ade80', statusColor: '#86efac', startPos: { x: 6, y: 20 } },
  { id: 'blue', name: 'BLU', color: '#3b82f6', headColor: '#60a5fa', statusColor: '#93c5fd', startPos: { x: 33, y: 20 } },
  { id: 'purple', name: 'PRP', color: '#a855f7', headColor: '#c084fc', statusColor: '#e9d5ff', startPos: { x: 20, y: 6 } },
  { id: 'orange', name: 'ORG', color: '#f97316', headColor: '#fb923c', statusColor: '#ffedd5', startPos: { x: 20, y: 33 } },
  { id: 'pink', name: 'PNK', color: '#ec4899', headColor: '#f472b6', statusColor: '#fce7f3', startPos: { x: 6, y: 6 } },
  { id: 'cyan', name: 'CYN', color: '#06b6d4', headColor: '#22d3ee', statusColor: '#ecfeff', startPos: { x: 33, y: 33 } },
];

const POPULATION_SIZE = 50;

export const useGameState = () => {
  // Config State
  const [initialSnakeCount, setInitialSnakeCount] = useState(3);
  const [sightRange, setSightRange] = useState(10);
  const [smellRange, setSmellRange] = useState(20);
  const [tickRate, setTickRate] = useState(70);
  const [showPaths, setShowPaths] = useState(false);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [generation, setGeneration] = useState(1);
  
  // Advanced AI Config State
  const [starvationThreshold, setStarvationThreshold] = useState(40);
  const [starveMultiplier, setStarveMultiplier] = useState(2.0);
  const [riskToleranceBase, setRiskToleranceBase] = useState(0.05);
  const [memoryRetention, setMemoryRetention] = useState(0.95);

  // Game State
  const [gameState, setGameState] = useState({
    snakes: [],
    food: null,
    foods: null,
    isTrainingMode: false,
    isGameOver: false,
    status: { text: "Simulation Running", type: "running" }
  });

  const envRef = useRef(null);
  const brainsRef = useRef({});
  const populationWeightsRef = useRef([]); // Stores weight arrays for the next gen
  
  const aiConfigRef = useRef({
    sightRange, smellRange, starvationThreshold, starveMultiplier, riskToleranceBase, memoryRetention
  });

  useEffect(() => {
    aiConfigRef.current = {
      sightRange, smellRange, starvationThreshold, starveMultiplier, riskToleranceBase, memoryRetention
    };
  }, [sightRange, smellRange, starvationThreshold, starveMultiplier, riskToleranceBase, memoryRetention]);

  // Evaluate fitness and breed next generation
  const evaluateAndBreed = useCallback(() => {
    if (!envRef.current) return;
    
    const finalState = envRef.current.getState();
    const results = finalState.snakes.map(s => {
      const apples = s.body.length - 1;
      const ticks = finalState.tickCount;
      // Fitness = (Ticks + Apples*1000) * (Apples+1)^1.5
      let baseScore = ticks + (apples * 1000);
      const fitness = baseScore * Math.pow(apples + 1, 1.5);
      return { 
        id: s.id, 
        fitness, 
        weights: brainsRef.current[s.id].getWeights() 
      };
    });

    // Sort by fitness
    results.sort((a, b) => b.fitness - a.fitness);
    
    // Selection: Top 10% (5 snakes) are elite
    const elites = results.slice(0, 5);
    const nextGenWeights = [];

    // 1. Keep Elites (5)
    elites.forEach(e => nextGenWeights.push(e.weights));

    // 2. Breed remaining 45
    while (nextGenWeights.length < POPULATION_SIZE) {
      // Pick two random elites
      const parentA = elites[Math.floor(Math.random() * elites.length)].weights;
      const parentB = elites[Math.floor(Math.random() * elites.length)].weights;
      
      const child = crossover(parentA, parentB);
      const mutatedChild = mutate(child, 0.1, 0.2); // 10% mutation rate, small amount
      nextGenWeights.push(mutatedChild);
    }

    populationWeightsRef.current = nextGenWeights;
    
    // Dispose old brains to prevent memory leaks in TFJS
    Object.values(brainsRef.current).forEach(b => {
      if (b.dispose) b.dispose();
    });
    
    setGeneration(g => g + 1);
  }, []);

  const initGame = useCallback(() => {
    let initialSnakes = [];
    
    // Cleanup existing brains before new init
    Object.values(brainsRef.current).forEach(b => {
      if (b.dispose) b.dispose();
    });
    brainsRef.current = {};

    if (isTrainingMode) {
      for (let i = 0; i < POPULATION_SIZE; i++) {
        const id = `ghost_${i}`;
        initialSnakes.push({
          id,
          name: `G${i}`,
          color: 'rgba(255, 255, 255, 0.15)',
          headColor: 'rgba(255, 255, 255, 0.5)',
          statusColor: '#ffffff',
          startPos: { x: 20, y: 20 },
          body: [{ x: 20, y: 20 }],
          ai: { memory: null, status: "IDLE", hunger: 0 },
          plannedPath: [],
          isDead: false
        });
        
        const weights = populationWeightsRef.current[i] || null;
        brainsRef.current[id] = new NeuralBrain(aiConfigRef.current, weights);
      }
    } else {
      const count = Math.min(initialSnakeCount, SNAKE_TEMPLATES.length);
      initialSnakes = SNAKE_TEMPLATES.slice(0, count).map(s => ({
        ...s,
        body: [s.startPos],
        ai: { memory: null, status: "IDLE", hunger: 0 },
        plannedPath: [],
        isDead: false
      }));
      initialSnakes.forEach(s => {
        brainsRef.current[s.id] = new AlgorithmicBrain(aiConfigRef.current);
      });
    }
    
    envRef.current = new GameEnvironment(initialSnakes, { isTrainingMode });
    setGameState(envRef.current.getState());
  }, [initialSnakeCount, isTrainingMode, generation]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const spawnSnake = () => {
    if (!isTrainingMode) {
      setInitialSnakeCount(prev => Math.min(prev + 1, SNAKE_TEMPLATES.length));
    }
  };

  const update = useCallback(() => {
    if (!envRef.current || envRef.current.isGameOver) return;

    const currentEnvState = envRef.current.getState();
    const intents = {};
    
    currentEnvState.snakes.forEach(snake => {
       if (!snake.isDead) {
          const sensorData = envRef.current.getSensorState(snake.id);
          const brain = brainsRef.current[snake.id];
          if (brain) {
            const targetFood = currentEnvState.isTrainingMode ? currentEnvState.foods[snake.id] : currentEnvState.food;
            intents[snake.id] = brain.decide(sensorData, snake, targetFood, currentEnvState.snakes);
          }
       }
    });

    const newState = envRef.current.tick(intents);
    setGameState({ ...newState });

    if (newState.isGameOver) {
      if (isTrainingMode) {
        evaluateAndBreed();
      } else {
        setTimeout(initGame, 3000);
      }
    }
  }, [initGame, isTrainingMode, evaluateAndBreed]);

  useEffect(() => {
    const interval = setInterval(update, tickRate);
    return () => clearInterval(interval);
  }, [update, tickRate]);

  return { 
    snakes: gameState.snakes, 
    food: gameState.food,
    foods: gameState.foods,
    isTrainingMode: gameState.isTrainingMode,
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
    isTrainingModeToggle: isTrainingMode, setIsTrainingMode,
    generation,
    spawnSnake,
    initGame 
  };
};
