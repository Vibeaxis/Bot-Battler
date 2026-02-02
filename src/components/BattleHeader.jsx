
import React from 'react';
import { motion } from 'framer-motion';

const BattleHeader = ({ playerHealth, enemyHealth, maxHealth, round }) => {
  const playerHealthPercent = (playerHealth / maxHealth) * 100;
  const enemyHealthPercent = (enemyHealth / maxHealth) * 100;

  return (
    <div className="w-full bg-gray-900/90 border-b border-gray-700 p-4 mb-4 sticky top-0 z-20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Player Health Bar */}
        <div className="w-full md:w-[45%] flex flex-col gap-1">
          <div className="flex justify-between text-sm uppercase tracking-wider font-bold">
            <span className="text-blue-400">Player</span>
            <span className="text-gray-400">{Math.ceil(playerHealth)} / {maxHealth}</span>
          </div>
          <div className="h-6 bg-gray-800 rounded-sm overflow-hidden border border-gray-700 relative skew-x-[-10deg]">
            <motion.div
              className="h-full bg-blue-600 relative"
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(0, playerHealthPercent)}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* Center VS / Round Indicator */}
        <div className="flex flex-col items-center justify-center w-full md:w-[10%]">
          <div className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-white to-red-500">
            VS
          </div>
          <div className="text-xs font-mono text-gray-500">
            {round > 0 ? `ROUND ${round}` : 'READY'}
          </div>
        </div>

        {/* Enemy Health Bar */}
        <div className="w-full md:w-[45%] flex flex-col gap-1">
          <div className="flex justify-between text-sm uppercase tracking-wider font-bold">
            <span className="text-red-400">Enemy</span>
            <span className="text-gray-400">{Math.ceil(enemyHealth)} / {maxHealth}</span>
          </div>
          <div className="h-6 bg-gray-800 rounded-sm overflow-hidden border border-gray-700 relative skew-x-[10deg]">
            <motion.div
              className="h-full bg-red-600 relative float-right"
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(0, enemyHealthPercent)}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
               <div className="absolute inset-0 bg-gradient-to-b from-red-400/20 to-transparent" />
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BattleHeader;
