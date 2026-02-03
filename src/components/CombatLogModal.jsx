import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, ChevronRight, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CombatLogModal = ({ isOpen, onClose, battle }) => {
  if (!isOpen || !battle) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0a0a0a] border border-[var(--accent-color)] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-black/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--accent-color)] text-black">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-widest font-mono">
                  Combat Record
                </h2>
                <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
                   <span>ID: {battle.timestamp}</span>
                   <span className="text-[var(--accent-color)]">
                     VS {battle.enemyName}
                   </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Log Console */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs md:text-sm space-y-1 custom-scrollbar bg-black relative">
            {/* Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://transparenttextures.com/patterns/stardust.png')] z-0" />
            
            {battle.battleLog ? (
                battle.battleLog.map((log, index) => {
                    // Color coding based on content
                    let colorClass = "text-gray-400";
                    if (log.includes("CRITICAL")) colorClass = "text-yellow-400 font-bold";
                    else if (log.includes("wins")) colorClass = "text-[var(--accent-color)] font-bold text-base py-2 border-y border-gray-800 my-2";
                    else if (log.includes("misses")) colorClass = "text-gray-600 italic";
                    else if (log.includes("Round")) colorClass = "text-white mt-2 block opacity-50";

                    return (
                        <div key={index} className={`relative z-10 flex items-start gap-2 ${colorClass}`}>
                            <span className="opacity-30 select-none">
                                {index.toString().padStart(3, '0')}
                            </span>
                            <span>{log}</span>
                        </div>
                    );
                })
            ) : (
                <div className="text-red-500 italic p-4 text-center">
                    [ERROR] Log data corrupted or missing for this engagement.
                </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-800 bg-black/50 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-mono">
             <span>Result: <span className={battle.playerWon ? "text-green-500" : "text-red-500"}>{battle.playerWon ? "VICTORY" : "DEFEAT"}</span></span>
             <span>Scrap: {battle.scrapEarned}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CombatLogModal;