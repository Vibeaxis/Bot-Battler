
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Cpu, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BotCard from './BotCard';
import { useGameContext } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const HangarModal = ({ isOpen, onClose }) => {
  const { gameState, setActiveBot, purchaseNewBot } = useGameContext();
  const [isBuying, setIsBuying] = useState(false);
  const [newBotName, setNewBotName] = useState('');

  const nextCost = 500 * Math.pow(2, Math.max(0, gameState.hangar.length - 1));
  const canAfford = gameState.scrap >= nextCost;

  const handleBuy = (e) => {
    e.preventDefault();
    if (purchaseNewBot(newBotName)) {
      setIsBuying(false);
      setNewBotName('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-6xl h-[85vh] flex flex-col bg-[#0a0a12] border border-[var(--accent-color)] shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[5001] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-black/50">
              <div>
                 <h2 className="text-3xl font-bold text-[var(--accent-color)] uppercase tracking-widest flex items-center gap-3">
                   <Cpu className="w-8 h-8" /> Unit Hangar
                 </h2>
                 <p className="text-gray-500 text-sm font-mono mt-1">
                    ACTIVE FLEET: {gameState.hangar.length} UNITS
                 </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-red-900/20 hover:text-red-500 rounded-none -mr-2"
              >
                <X className="w-8 h-8" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* Existing Bots */}
                {gameState.hangar.map((bot) => {
                  const isActive = bot.id === gameState.playerBot.id;
                  
                  return (
                    <motion.div
                      key={bot.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "relative group cursor-pointer transition-all duration-300",
                        isActive ? "ring-2 ring-[var(--accent-color)] shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)] scale-[1.02]" : "opacity-80 hover:opacity-100 hover:scale-[1.01]"
                      )}
                      onClick={() => {
                        if (!isActive) {
                          setActiveBot(bot.id);
                        }
                      }}
                    >
                      {/* Active Status Badge */}
                      {isActive && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent-color)] text-black font-bold text-xs px-3 py-1 z-20 uppercase tracking-wider rounded-none shadow-lg">
                          Active Unit
                        </div>
                      )}
                      
                      {/* Overlay for inactive bots on hover */}
                      {!isActive && (
                         <div className="absolute inset-0 bg-[var(--accent-color)]/0 group-hover:bg-[var(--accent-color)]/5 z-10 transition-colors pointer-events-none border border-transparent group-hover:border-[var(--accent-color)]" />
                      )}

                      {/* We wrap the BotCard to disable its internal interactivity if needed, but we want tooltips to work */}
                      <div className="pointer-events-none">
                         <BotCard bot={bot} slotLevels={gameState.slotLevels} />
                      </div>
                      
                      {/* Click Capture Overlay for Selection */}
                      <div className="absolute inset-0 z-20" /> 

                    </motion.div>
                  );
                })}

                {/* Add New Slot Card */}
                {isBuying ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex flex-col h-full min-h-[400px] bg-black/40 border-2 border-dashed border-gray-700 p-6 items-center justify-center gap-6"
                  >
                    <h3 className="text-xl font-bold text-gray-300 uppercase">Initialize New Unit</h3>
                    <form onSubmit={handleBuy} className="w-full space-y-4">
                       <Input 
                         autoFocus
                         placeholder="UNIT DESIGNATION" 
                         className="bg-black border-gray-700 text-center uppercase font-mono text-lg"
                         value={newBotName}
                         onChange={(e) => setNewBotName(e.target.value)}
                         maxLength={12}
                       />
                       <div className="flex gap-2 justify-center w-full">
                         <Button type="button" variant="outline" onClick={() => setIsBuying(false)} className="flex-1 border-red-500/50 hover:bg-red-900/20 text-red-400">
                           CANCEL
                         </Button>
                         <Button type="submit" className="flex-1 bg-[var(--accent-color)] text-black hover:bg-[var(--accent-color)]/80 font-bold">
                           CONFIRM
                         </Button>
                       </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => setIsBuying(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!canAfford}
                    className={cn(
                      "flex flex-col h-full min-h-[400px] border-2 border-dashed p-6 items-center justify-center gap-4 transition-all duration-300 group",
                      canAfford 
                        ? "border-gray-700 hover:border-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.05)] cursor-pointer" 
                        : "border-red-900/30 bg-red-900/5 cursor-not-allowed opacity-60"
                    )}
                  >
                    <div className={cn(
                      "w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      canAfford 
                        ? "border-gray-700 group-hover:border-[var(--accent-color)] text-gray-500 group-hover:text-[var(--accent-color)]" 
                        : "border-red-900 text-red-900"
                    )}>
                      <Plus className="w-10 h-10" />
                    </div>
                    
                    <div className="text-center">
                      <h3 className={cn(
                        "text-lg font-bold uppercase tracking-widest mb-1",
                        canAfford ? "text-gray-400 group-hover:text-[var(--accent-color)]" : "text-red-900"
                      )}>
                        Purchase Slot
                      </h3>
                      <p className={cn(
                        "font-mono text-sm",
                        canAfford ? "text-yellow-500" : "text-red-800"
                      )}>
                        {nextCost} SCRAP
                      </p>
                    </div>
                  </motion.button>
                )}

              </div>
            </div>
            
            {/* Footer Status */}
            <div className="bg-black/80 border-t border-gray-800 p-4 px-8 flex justify-between items-center text-xs font-mono text-gray-500 uppercase">
              <span>Inventory is shared across all units</span>
              <span>Select a unit to deploy</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HangarModal;
