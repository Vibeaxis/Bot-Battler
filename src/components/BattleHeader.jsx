import React from 'react';
import { motion } from 'framer-motion';

const BattleHeader = ({ playerHealth, enemyHealth, playerMax, enemyMax, round }) => {
  // Use specific max values for accurate percentages
  const pMax = playerMax || 100;
  const eMax = enemyMax || 100;

  const playerHealthPercent = (playerHealth / pMax) * 100;
  const enemyHealthPercent = (enemyHealth / eMax) * 100;

  return (
    <div className="w-full bg-gray-900/90 border-b border-gray-700 p-4 mb-4 sticky top-0 z-20 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
        
        {/* PLAYER HEALTH BAR */}
        <div className="w-full md:flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-xs font-mono uppercase tracking-widest font-bold">
            <span className="text-[var(--accent-color)] drop-shadow-[0_0_5px_var(--accent-color)]">Operator</span>
            <span className="text-gray-400">
                <span className="text-white">{Math.round(playerHealth)}</span> / {pMax}
            </span>
          </div>
          <div className="h-5 bg-gray-900 rounded-sm overflow-hidden border border-gray-700 relative skew-x-[-15deg]">
            
            {/* GHOST BAR (White Flash) */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-white/50 z-0"
              initial={false}
              animate={{ width: `${Math.max(0, playerHealthPercent)}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            />

            {/* MAIN BAR */}
            <motion.div
              className="h-full relative z-10"
              style={{ backgroundColor: 'var(--accent-color)' }}
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(0, playerHealthPercent)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              {/* Scanline pattern */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-30" />
            </motion.div>
          </div>
        </div>

        {/* VS INDICATOR */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div 
            className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] via-white to-red-600 drop-shadow-lg"
          >
            VS
          </div>
          <div className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em] bg-black/50 px-2 py-0.5 rounded-full border border-gray-800">
            {round > 0 ? `ROUND ${round}` : 'READY'}
          </div>
        </div>

        {/* ENEMY HEALTH BAR */}
        <div className="w-full md:flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-xs font-mono uppercase tracking-widest font-bold">
            <span className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">Target</span>
            <span className="text-gray-400">
                <span className="text-white">{Math.round(enemyHealth)}</span> / {eMax}
            </span>
          </div>
          <div className="h-5 bg-gray-900 rounded-sm overflow-hidden border border-gray-700 relative skew-x-[15deg]">
            
            {/* GHOST BAR (White Flash) */}
            <motion.div
              className="absolute inset-y-0 right-0 bg-white/50 z-0 origin-right"
              initial={false}
              animate={{ width: `${Math.max(0, enemyHealthPercent)}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            />

            {/* MAIN BAR (Floats Right) */}
            <div className="w-full h-full flex justify-end">
                <motion.div
                className="h-full bg-red-600 relative z-10"
                initial={{ width: '100%' }}
                animate={{ width: `${Math.max(0, enemyHealthPercent)}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-red-400/30 to-transparent" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-30" />
                </motion.div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BattleHeader;