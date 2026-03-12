import React from 'react';

const Header = ({ snakes, status }) => {
  return (
    <header style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      padding: '8px 0 4px 0',
      zIndex: 10,
      flex: '0 0 auto'
    }}>
      <h1 style={{
        margin: '0 0 4px 0',
        fontSize: 'min(4.5vw, 18px)',
        fontWeight: '800',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        color: '#f8fafc',
        textAlign: 'center'
      }}>
        AI Snake: Apex Predators
      </h1>
      <div id="scoreboard" style={{
        display: 'flex',
        flexWrap: 'wrap', // Allow wrapping for many snakes
        justifyContent: 'center',
        gap: '8px',
        alignItems: 'center',
        width: '100%',
        maxWidth: '800px',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        padding: '8px 10px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        boxSizing: 'border-box'
      }}>
        {snakes.map((snake) => (
          <div key={snake.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            opacity: snake.isDead ? 0.3 : 1,
            transition: 'opacity 0.3s ease',
            padding: '2px 6px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px'
          }}>
            <span className="team-label" style={{ 
              color: snake.color, 
              fontSize: '9px', 
              fontWeight: '800',
            }}>{snake.name}</span>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '900', 
              color: snake.headColor,
              minWidth: '15px',
              textAlign: 'center',
            }}>{snake.body.length}</span>
          </div>
        ))}

        <span style={{ 
          color: status.type === 'running' ? '#fbbf24' : '#f87171',
          background: status.type === 'running' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(248, 113, 113, 0.1)',
          padding: '2px 8px',
          borderRadius: '10px',
          fontWeight: '800',
          fontSize: '9px',
          letterSpacing: '1px',
          whiteSpace: 'nowrap',
          marginLeft: '4px'
        }}>
          {status.text.toUpperCase()}
        </span>
      </div>
      
      <style>{`
        @media (max-width: 450px) {
          .team-label { display: none; }
          #scoreboard { gap: 4px; padding: 6px; }
        }
      `}</style>
    </header>
  );
};

export default Header;
