import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. THE SCREEN FLASH (Unchanged, looks good)
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
    return 0.2;
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

// 2. THE PARTICLE EXPLOSION (Upgraded for "Global" feel)
export const ImpactParticles = ({ active, color = "#fbbf24", count = 20 }) => {
  if (!active) return null;

  // We generate particles with MUCH larger distances now
  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    // Distance: Was 150, now up to 500px to clear the card
    distance: 150 + Math.random() * 350, 
    // Size: Varied for debris look
    size: 3 + Math.random() * 6,
    // Speed: Some fly fast, some float
    duration: 0.5 + Math.random() * 0.5,
    delay: Math.random() * 0.1
  }));

  return (
    // Fixed: Removed 'absolute inset-0' and replaced with fixed centering logic
    // or just allow it to overflow naturally from the center of the parent.
    // Using z-[999] ensures it sits above other UI cards.
    <div className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center pointer-events-none z-[999] overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
          animate={{ 
            // Physics: Use simple trig to blast outwards
            x: Math.cos(p.angle * (Math.PI / 180)) * p.distance,
            y: Math.sin(p.angle * (Math.PI / 180)) * p.distance,
            opacity: 0,
            scale: 0 
          }}
          transition={{ 
            duration: p.duration, 
            ease: "easeOut",
            delay: p.delay
          }}
          className="absolute rounded-full"
          style={{ 
            backgroundColor: color, 
            width: p.size, 
            height: p.size,
            // Glow effect
            boxShadow: `0 0 ${p.size * 3}px ${color}, 0 0 ${p.size}px white`
          }}
        />
      ))}
    </div>
  );
};