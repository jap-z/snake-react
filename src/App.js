import React from 'react';
import Header from './components/Header';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import { useGameState } from './hooks/useGameState';

const App = () => {
  const { 
    snakes, food, isGameOver, status, 
    tickRate, setTickRate, 
    sightRange, setSightRange,
    smellRange, setSmellRange,
    initialSnakeCount, setInitialSnakeCount,
    spawnSnake
  } = useGameState();

  return (
    <div style={{
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: "'Poppins', sans-serif",
      margin: 0,
      padding: 0,
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      <Header snakes={snakes} status={status} />
      
      <main style={{
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: 0
      }}>
        <GameBoard 
          snakes={snakes} 
          food={food} 
          isGameOver={isGameOver} 
        />
        <Controls 
          tickRate={tickRate} setTickRate={setTickRate}
          sightRange={sightRange} setSightRange={setSightRange}
          smellRange={smellRange} setSmellRange={setSmellRange}
          initialSnakeCount={initialSnakeCount} setInitialSnakeCount={setInitialSnakeCount}
          spawnSnake={spawnSnake}
        />
      </main>
      
      <footer style={{ 
        padding: '10px 0', 
        fontSize: '9px', 
        opacity: 0.3, 
        letterSpacing: '1px',
        textTransform: 'uppercase',
        textAlign: 'center',
        flex: '0 0 auto'
      }}>
        Apex Predators Multi-Snake Engine
      </footer>
    </div>
  );
};

export default App;
