import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { tileCount } from '../utils/gridUtils';
import { drawSnake, drawFloatingStatus } from '../utils/canvasRenderer';

const GameBoard = ({ snakes, food, isGameOver }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Remove internal padding calculation, use full width
        const availableWidth = rect.width;
        const availableHeight = window.innerHeight * 0.7; 
        
        const size = Math.floor(Math.min(availableWidth, availableHeight));
        if (size > 0) setDimensions({ width: size, height: size });
      }
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = dimensions.width * window.devicePixelRatio;
    canvas.height = dimensions.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const gridSize = dimensions.width / tileCount;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath(); ctx.moveTo(i * gridSize, 0); ctx.lineTo(i * gridSize, dimensions.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * gridSize); ctx.lineTo(dimensions.width, i * gridSize); ctx.stroke();
    }

    const fx = food.x * gridSize + gridSize / 2;
    const fy = food.y * gridSize + gridSize / 2;
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444';
    ctx.fillStyle = '#f87171';
    ctx.beginPath(); ctx.arc(fx, fy, gridSize / 2.5, 0, 2 * Math.PI); ctx.fill();
    ctx.restore();

    snakes.forEach(snake => {
      drawSnake(ctx, snake.body, snake.color, snake.headColor, snake.isDead, gridSize);
      if (!isGameOver && !snake.isDead) {
        drawFloatingStatus(ctx, snake.body[0], snake.ai.status, snake.ai.hunger, snake.statusColor, gridSize);
      }
    });
  }, [snakes, food, isGameOver, dimensions]);

  return (
    <div ref={containerRef} style={{
      width: '100%',
      padding: 0, // No padding
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }}>
      <canvas 
        ref={canvasRef} 
        style={{
          width: `${dimensions.width}px`, height: `${dimensions.height}px`,
          backgroundColor: '#111827', borderRadius: '12px',
          border: '2px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)', display: 'block'
        }}
      />
    </div>
  );
};

export default GameBoard;
