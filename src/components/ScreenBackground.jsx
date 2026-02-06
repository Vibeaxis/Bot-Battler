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

      {/* 2. The Darkener (ADJUSTED: Lighter center to let image pop) */}
      {/* Reduced via-[]/70 to via-[]/40 so the middle is much clearer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/80 via-[#0a0a12]/40 to-[#0a0a12]/80" />
      
      {/* 3. The Solid Fade (Configurable opacity) */}
      {/* This still respects the prop you pass in (default 0.3 visible image) */}
      <div 
        className="absolute inset-0 bg-[#0a0a12]"
        style={{ opacity: Math.max(0, 1 - opacity - 0.2) }} // Added a small boost (-0.2) to make sure it's not too thick
      />

      {/* 4. Scanline Texture (Keeps the CRT Vibe) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] opacity-10" />
      
      {/* 5. Vignette (ADJUSTED: Softer corners) */}
      {/* Changed transparency start from 0% to 40% so the center is totally clear */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
};

export default ScreenBackground;