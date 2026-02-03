import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. THE SCREEN FLASH (Camera Exposure)
export const ScreenFlash = ({ type }) => {
  const isEndGame = type === 'VICTORY' || type === 'DEFEAT';

  const getColor = () => {
    if (type === 'CRIT') return 'bg-white mix-blend-overlay'; 
    if (type === 'HIT') return 'bg-red-500 mix-blend-overlay'; 
    if (type === 'VICTORY') return 'bg-yellow-400 mix-blend-hard-light'; // Hard light makes gold pop
    if (type === 'DEFEAT') return 'bg-gray-950 mix-blend-multiply'; // Multiply makes it dark
    return '';
  };

  // Helper to determine how transparent the flash is
  const getTargetOpacity = () => {
    if (type === 'CRIT') return 0.5;     // Bright flash
    if (type === 'VICTORY') return 0.6;  // Strong Gold Glow
    if (type === 'DEFEAT') return 0.95;  // Almost pitch black
    return 0.2;                          // Standard HIT (Subtle)
  };

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: getTargetOpacity() }}
          exit={{ opacity: 0 }}
          // Dynamic Duration: Fast for combat (0.1s), Slow fade for End Game (1.5s)
          transition={{ duration: isEndGame ? 0.8 : 0.1 }} 
          className={`fixed inset-0 pointer-events-none z-[100] ${getColor()}`}
        />
      )}
    </AnimatePresence>
  );
};

// 2. THE PARTICLE EXPLOSION (Keep this as is)
export const ImpactParticles = ({ active, color = "#fbbf24", count = 12 }) => {
  if (!active) return null;

  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 50 + Math.random() * 100, 
    size: 2 + Math.random() * 4,
    duration: 0.4 + Math.random() * 0.3
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ 
            x: Math.cos(p.angle * (Math.PI / 180)) * p.distance,
            y: Math.sin(p.angle * (Math.PI / 180)) * p.distance,
            opacity: 0,
            scale: 0 
          }}
          transition={{ duration: p.duration, ease: "easeOut" }}
          className="absolute rounded-full shadow-[0_0_8px_currentColor]"
          style={{ 
            backgroundColor: color, 
            width: p.size, 
            height: p.size,
            boxShadow: `0 0 ${p.size * 2}px ${color}`
          }}
        />
      ))}
    </div>
  );
};