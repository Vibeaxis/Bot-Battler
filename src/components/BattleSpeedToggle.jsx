
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

const BattleSpeedToggle = ({ speed, setSpeed }) => {
  const speeds = [1, 2, 4];

  return (
    <div className="flex items-center gap-2 bg-black/60 border border-gray-800 p-1 rounded-lg backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-1 px-2 text-xs font-mono text-gray-500 uppercase select-none">
        <Zap className="w-3 h-3 text-[var(--accent-color)]" /> Speed
      </div>
      <div className="flex gap-1">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={cn(
              "relative px-3 py-1 text-xs font-bold font-mono transition-colors rounded overflow-hidden min-w-[32px] z-10",
              speed === s 
                ? "text-black" 
                : "text-gray-400 hover:text-white hover:bg-white/10"
            )}
          >
            {speed === s && (
              <motion.div
                layoutId="activeSpeedIndicator"
                className="absolute inset-0 bg-[var(--accent-color)] -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{s}x</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BattleSpeedToggle;
