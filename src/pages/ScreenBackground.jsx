import React from 'react';
import { motion } from 'framer-motion';

const ScreenBackground = ({ image, opacity = 0.3 }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 1. The Image Layer with slow drift animation */}
      <motion.div 
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* 2. The Darkener (Crucial for text readability) */}
      {/* We use a gradient to make the center slightly more visible than edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/90 via-[#0a0a12]/70 to-[#0a0a12]/90" />
      
      {/* 3. The Solid Fade (Configurable opacity) */}
      <div 
        className="absolute inset-0 bg-[#0a0a12]"
        style={{ opacity: 1 - opacity }} 
      />

      {/* 4. Scanline Texture (Keeps the CRT Vibe) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] opacity-10" />
      
      {/* 5. Vignette (Dark corners) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
};

export default ScreenBackground;