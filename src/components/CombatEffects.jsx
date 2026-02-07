import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. SCREEN FLASH (Unchanged)
export const ScreenFlash = ({ type }) => {
  const isEndGame = type === 'VICTORY' || type === 'DEFEAT';
  
  const getColor = () => {
    if (type === 'CRIT') return 'bg-white mix-blend-overlay'; 
    if (type === 'HIT') return 'bg-red-500 mix-blend-overlay'; 
    if (type === 'VICTORY') return 'bg-yellow-400 mix-blend-hard-light';
    if (type === 'DEFEAT') return 'bg-gray-950 mix-blend-multiply';
    return '';
  };

  const getTargetOpacity = () => {
    if (type === 'CRIT') return 0.5;
    if (type === 'VICTORY') return 0.6;
    if (type === 'DEFEAT') return 0.95;
    return 0.15; // Lowered opacity for standard hits
  };

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: getTargetOpacity() }}
          exit={{ opacity: 0 }}
          transition={{ duration: isEndGame ? 0.8 : 0.1 }} 
          className={`fixed inset-0 pointer-events-none z-[100] ${getColor()}`}
        />
      )}
    </AnimatePresence>
  );
};

// 2. IMPACT PARTICLES (Now forces "Sparks" instead of Red)
export const ImpactParticles = ({ active, count = 20 }) => {
  if (!active) return null;

  const SPARK_COLORS = ['#ffffff', '#fef08a', '#facc15', '#fb923c']; // White -> Yellow -> Orange

  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 100 + Math.random() * 300, 
    size: 2 + Math.random() * 4,
    duration: 0.3 + Math.random() * 0.4,
    // Randomly pick a spark color for this specific particle
    color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]
  }));

  return (
    <div className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center pointer-events-none z-[999] overflow-visible">
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
          className="absolute rounded-full"
          style={{ 
            backgroundColor: p.color, 
            width: p.size, 
            height: p.size,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}` // Glowing sparks
          }}
        />
      ))}
    </div>
  );
};