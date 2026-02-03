import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CombatTextOverlay = ({ activeText }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {activeText && (
          <motion.div
            key={activeText.id} // Unique key ensures restart
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: -80, 
              scale: [0.5, 1.5, 1] 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`font-black text-4xl italic tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] 
              ${activeText.isCrit ? 'text-yellow-400 text-6xl' : 'text-white'}
              ${activeText.type === 'miss' ? 'text-gray-400 text-2xl' : ''}
            `}
            style={{ 
               textShadow: activeText.isCrit ? '0 0 20px rgba(250, 204, 21, 0.6)' : '0 0 10px rgba(255,0,0,0.5)' 
            }}
          >
            {activeText.content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CombatTextOverlay;