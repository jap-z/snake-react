import React from 'react';

const ControlGroup = ({ label, value, min, max, step = 1, onChange, suffix = "", disabled = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', opacity: disabled ? 0.3 : 1 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <label style={{ fontSize: '9px', fontWeight: '800', opacity: 0.5, letterSpacing: '1px' }}>
        {label.toUpperCase()}
      </label>
      <span style={{ fontSize: '11px', fontWeight: '900', color: '#fbbf24' }}>
        {value}{suffix}
      </span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step}
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      disabled={disabled}
      style={{ width: '100%', cursor: disabled ? 'not-allowed' : 'pointer', accentColor: '#fbbf24' }}
    />
  </div>
);

const Controls = ({ 
  tickRate, setTickRate, 
  sightRange, setSightRange, 
  smellRange, setSmellRange,
  starvationThreshold, setStarvationThreshold,
  starveMultiplier, setStarveMultiplier,
  riskToleranceBase, setRiskToleranceBase,
  memoryRetention, setMemoryRetention,
  initialSnakeCount, setInitialSnakeCount,
  showPaths, setShowPaths,
  isTrainingMode, setIsTrainingMode,
  brainType, setBrainType,
  spawnSnake
}) => {
  const speed = Math.round(11 - (tickRate / 15));

  return (
    <div style={{
      width: '95%',
      maxWidth: '500px',
      padding: '15px',
      background: 'rgba(30, 41, 59, 0.4)',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      margin: '10px 0',
      border: '1px solid rgba(255,255,255,0.05)',
      flex: '0 0 auto',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <label style={{ fontSize: '10px', fontWeight: '800', opacity: 0.8, letterSpacing: '1px' }}>
          ARENA BRAIN TYPE:
        </label>
        <select 
          value={brainType}
          onChange={(e) => setBrainType(e.target.value)}
          disabled={isTrainingMode}
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#fbbf24',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '10px',
            fontWeight: '900',
            cursor: isTrainingMode ? 'not-allowed' : 'pointer',
            opacity: isTrainingMode ? 0.3 : 1
          }}
        >
          <option value="algorithmic">ALGORITHMIC (BFS)</option>
          <option value="neural">NEURAL (LOAD APEX)</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {/* Core Controls */}
        <ControlGroup 
          label="Speed" 
          value={speed} 
          min={1} max={10} 
          onChange={(v) => setTickRate((11 - v) * 15)} 
          suffix="x"
        />
        <ControlGroup 
          label="Initial Snakes" 
          value={initialSnakeCount} 
          min={1} max={6} 
          onChange={setInitialSnakeCount} 
          disabled={isTrainingMode}
        />
        
        {/* Perception */}
        <ControlGroup 
          label="Sight Range" 
          value={sightRange} 
          min={2} max={30} 
          onChange={setSightRange} 
          suffix=" tiles"
        />
        <ControlGroup 
          label="Smell Range" 
          value={smellRange} 
          min={5} max={40} 
          onChange={setSmellRange} 
          suffix=" tiles"
        />

        {/* Advanced AI Tuning */}
        <ControlGroup 
          label="Starve Limit" 
          value={starvationThreshold} 
          min={10} max={150} 
          onChange={setStarvationThreshold} 
          suffix=" ticks"
        />
        <ControlGroup 
          label="Starve Smell Boost" 
          value={starveMultiplier} 
          min={1.0} max={5.0} step={0.5}
          onChange={setStarveMultiplier} 
          suffix="x"
        />
        <ControlGroup 
          label="Base Risk Tolerance" 
          value={riskToleranceBase} 
          min={0.0} max={1.0} step={0.05}
          onChange={setRiskToleranceBase} 
        />
        <ControlGroup 
          label="Memory Retention" 
          value={memoryRetention} 
          min={0.0} max={1.0} step={0.05}
          onChange={setMemoryRetention} 
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button 
          onClick={() => setShowPaths(!showPaths)}
          style={{
            flex: 1,
            padding: '10px',
            background: showPaths ? '#fbbf24' : 'rgba(255,255,255,0.05)',
            color: showPaths ? '#0f172a' : 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '900',
            fontSize: '10px',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {showPaths ? 'HIDE PATHS' : 'SHOW PATHS'}
        </button>

        <button 
          onClick={() => setIsTrainingMode(!isTrainingMode)}
          style={{
            flex: 1.5,
            padding: '10px',
            background: isTrainingMode ? '#a855f7' : 'rgba(255,255,255,0.05)',
            color: isTrainingMode ? '#ffffff' : 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '900',
            fontSize: '10px',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isTrainingMode ? '0 4px 12px rgba(168, 85, 247, 0.4)' : 'none'
          }}
        >
          {isTrainingMode ? 'STOP TRAINING' : 'TRAIN (SWARM)'}
        </button>

        <button 
          onClick={spawnSnake}
          disabled={initialSnakeCount >= 6 || isTrainingMode}
          style={{
            flex: 1.5,
            padding: '10px',
            background: (initialSnakeCount >= 6 || isTrainingMode) ? 'rgba(255,255,255,0.05)' : '#fbbf24',
            color: (initialSnakeCount >= 6 || isTrainingMode) ? 'rgba(255,255,255,0.2)' : '#0f172a',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '900',
            fontSize: '10px',
            letterSpacing: '1px',
            cursor: (initialSnakeCount >= 6 || isTrainingMode) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: (initialSnakeCount >= 6 || isTrainingMode) ? 'none' : '0 4px 12px rgba(251, 191, 36, 0.2)'
          }}
        >
          ADD PREDATOR
        </button>
      </div>
    </div>
  );
};

export default Controls;
