import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. THE SCREEN FLASH (Camera Exposure)
export const ScreenFlash = ({ type }) => {
  const getColor = () => {
    if (type === 'CRIT') return 'bg-white mix-blend-overlay'; // Bright flash
    if (type === 'HIT') return 'bg-red-500 mix-blend-overlay'; // Red tint
    // Add this line to the getColor function:
if (type === 'VICTORY') return 'bg-yellow-500 mix-blend-overlay opacity-50';
if (type === 'DEFEAT') return 'bg-gray-950 mix-blend-multiply opacity-90';
    return '';
  };

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: type === 'CRIT' ? 0.4 : 0.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }} // Super fast pop
          className={`fixed inset-0 pointer-events-none z-[100] ${getColor()}`}
        />
      )}
    </AnimatePresence>
  );
};

// 2. THE PARTICLE EXPLOSION (Metal Sparks)
export const ImpactParticles = ({ active, color = "#fbbf24", count = 12 }) => {
  if (!active) return null;

  // Create an array of particle configs
  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 50 + Math.random() * 100, // Fly outward 50-150px
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