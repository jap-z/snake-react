import React from 'react';

const ControlGroup = ({ label, value, min, max, onChange, suffix = "" }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
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
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      style={{ width: '100%', cursor: 'pointer', accentColor: '#fbbf24' }}
    />
  </div>
);

const Controls = ({ 
  tickRate, setTickRate, 
  sightRange, setSightRange, 
  smellRange, setSmellRange,
  initialSnakeCount, setInitialSnakeCount,
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
        />
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
      </div>

      <button 
        onClick={spawnSnake}
        disabled={initialSnakeCount >= 6}
        style={{
          width: '100%',
          padding: '10px',
          background: initialSnakeCount >= 6 ? 'rgba(255,255,255,0.05)' : '#fbbf24',
          color: initialSnakeCount >= 6 ? 'rgba(255,255,255,0.2)' : '#0f172a',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '900',
          fontSize: '11px',
          letterSpacing: '1px',
          cursor: initialSnakeCount >= 6 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: initialSnakeCount >= 6 ? 'none' : '0 4px 12px rgba(251, 191, 36, 0.2)'
        }}
      >
        ADD NEW PREDATOR
      </button>
    </div>
  );
};

export default Controls;
