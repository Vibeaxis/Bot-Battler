import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

const TIPS = [
  "TIP: Three items of the same rarity can be fused in The Forge.",
  "TIP: Selling 'Common' items provides Scrap for better crates.",
  "TIP: Win streaks increase enemy difficulty but yield higher rewards.",
  "TIP: 'Legendary' items have unique stat distributions. Good luck.",
  "TIP: Losing a battle grants a small Scrap consolation. Failure is progress.",
  "TIP: Different chassis types affect your base Speed and Armor caps.",
  "TIP: Check the Battle Log to analyze enemy damage types.",
  "TIP: Mystery Crates have a 0.1% chance to drop Mythic gear.",
  "TIP: Your active loadout cannot be sold. Unequip items first."
];

const SystemTicker = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TIPS.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-black/60 border-t border-b border-[var(--accent-color)]/30 py-2 px-4 flex items-center gap-4 overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-2 text-[var(--accent-color)] shrink-0 opacity-70">
        <Terminal className="w-4 h-4" />
        <span className="text-xs font-bold font-mono uppercase tracking-widest hidden md:inline-block">SYS_MSG:</span>
      </div>
      
      <div className="flex-1 relative h-6">
        <AnimatePresence mode='wait'>
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center"
          >
            <span className="text-xs md:text-sm font-mono text-gray-300 truncate">
              {TIPS[index]}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative 'Online' Indicator */}
      <div className="flex gap-1 shrink-0">
         <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-pulse" />
         <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full opacity-50" />
         <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full opacity-20" />
      </div>
    </div>
  );
};

export default SystemTicker;