import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Cpu, Trophy, Crosshair, TrendingUp, Wallet, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BotCard from './BotCard';
import { useGameContext } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const ProfileModal = ({ isOpen, onClose }) => {
  const { gameState, setActiveBot, purchaseNewBot } = useGameContext();
  const [isBuying, setIsBuying] = useState(false);
  const [newBotName, setNewBotName] = useState('');

  const nextCost = 500 * Math.pow(2, Math.max(0, gameState.hangar.length - 1));
  const canAfford = gameState.scrap >= nextCost;

  // --- CAREER STATS ---
  const battles = gameState.totalBattles || 0;
  const wins = gameState.totalWins || 0;
  const winRate = battles > 0 ? ((wins / battles) * 100).toFixed(1) : "0.0";
  const lifetimeScrap = gameState.totalScrapEarned || 0;

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
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8">
          <div className="absolute inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            // Changed max-w to fit grid comfortably, added flex column
            className="relative w-full max-w-[90vw] h-[95vh] flex flex-col bg-[#0a0a12] border border-[var(--accent-color)] shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[5001] overflow-hidden"
          >
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-black/50 shrink-0">
              <div>
                  <h2 className="text-3xl font-bold text-[var(--accent-color)] uppercase tracking-widest flex items-center gap-3">
                    <Cpu className="w-8 h-8" /> Operator Profile
                  </h2>
                  <p className="text-gray-500 text-sm font-mono mt-1">
                    ID: {gameState.playerBot.name.toUpperCase()}_CMD
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

            {/* --- CAREER STATS STRIP --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-black/20 border-b border-gray-800 shrink-0">
                <div className="flex flex-col border-l-2 border-[var(--accent-color)] pl-4">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Crosshair className="w-3 h-3" /> Engagements
                    </span>
                    <span className="text-2xl font-bold text-white font-mono">{battles}</span>
                </div>
                <div className="flex flex-col border-l-2 border-green-500/50 pl-4">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Trophy className="w-3 h-3" /> Victories
                    </span>
                    <span className="text-2xl font-bold text-green-500 font-mono">{wins}</span>
                </div>
                <div className="flex flex-col border-l-2 border-yellow-500/50 pl-4">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" /> Win Rate
                    </span>
                    <span className="text-2xl font-bold text-yellow-500 font-mono">{winRate}%</span>
                </div>
                <div className="flex flex-col border-l-2 border-purple-500/50 pl-4">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Wallet className="w-3 h-3" /> Lifetime Earnings
                    </span>
                    <span className="text-2xl font-bold text-purple-500 font-mono">{lifetimeScrap.toLocaleString()}</span>
                </div>
            </div>

            {/* --- BOT GRID (SCROLLABLE) --- */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/20 via-[#0a0a12] to-[#0a0a12]">
              <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-2">
                  <h3 className="text-gray-500 text-xs font-mono uppercase tracking-widest">
                      Active Units ({gameState.hangar.length})
                  </h3>
                  <span className="text-[10px] text-gray-600 font-mono">SCROLL FOR MORE</span>
              </div>

              {/* FLEX WRAP instead of Grid to handle fixed-width cards better */}
              <div className="flex flex-wrap gap-8 justify-center pb-12">
                
                {/* Bot Cards */}
                {gameState.hangar.map((bot) => {
                  const isActive = bot.id === gameState.playerBot.id;
                  
                  return (
                    <motion.div
                      key={bot.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "relative group cursor-pointer transition-all duration-300 rounded-sm shrink-0",
                        // Force width to match BotCard exactly
                        "w-80",
                        isActive ? "ring-2 ring-[var(--accent-color)] shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)] scale-[1.02] z-10" : "opacity-80 hover:opacity-100 hover:scale-[1.01] hover:z-10"
                      )}
                      onClick={() => !isActive && setActiveBot(bot.id)}
                    >
                      {isActive && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent-color)] text-black font-bold text-xs px-3 py-1 z-30 uppercase tracking-wider rounded-none shadow-lg whitespace-nowrap">
                          Active Unit
                        </div>
                      )}
                      
                      {!isActive && (
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent z-20 transition-colors pointer-events-none border border-transparent group-hover:border-[var(--accent-color)]" />
                      )}

                      {/* Render BotCard directly */}
                      <BotCard 
                        bot={bot} 
                        slotLevels={gameState.slotLevels} 
                        side="player" 
                        // Ensure card doesn't try to grow/shrink weirdly
                        className="w-full h-[480px] shadow-none" 
                      />
                    </motion.div>
                  );
                })}

                {/* Purchase Slot (Sized to match BotCard) */}
                <div className="w-80 h-[480px] shrink-0">
                    {isBuying ? (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="flex flex-col h-full bg-black/40 border-2 border-dashed border-gray-700 p-6 items-center justify-center gap-6"
                      >
                        <h3 className="text-xl font-bold text-gray-300 uppercase">Initialize Unit</h3>
                        <form onSubmit={handleBuy} className="w-full space-y-4">
                            <Input 
                              autoFocus
                              placeholder="UNIT DESIGNATION" 
                              className="bg-black border-gray-700 text-center uppercase font-mono text-lg h-12"
                              value={newBotName}
                              onChange={(e) => setNewBotName(e.target.value)}
                              maxLength={12}
                            />
                            <div className="flex gap-2 justify-center w-full">
                              <Button type="button" variant="outline" onClick={() => setIsBuying(false)} className="flex-1 border-red-500/50 hover:bg-red-900/20 text-red-400 h-10">
                                CANCEL
                              </Button>
                              <Button type="submit" className="flex-1 bg-[var(--accent-color)] text-black hover:bg-[var(--accent-color)]/80 font-bold h-10">
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
                          "flex flex-col h-full w-full border-2 border-dashed p-6 items-center justify-center gap-4 transition-all duration-300 group",
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
                            Requisition Unit
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
            </div>
            
            <div className="bg-black/80 border-t border-gray-800 p-4 px-8 flex justify-between items-center text-xs font-mono text-gray-500 uppercase shrink-0">
              <span className="flex items-center gap-2"><ShieldAlert className="w-3 h-3" /> Inventory shared across fleet</span>
              <span>Select unit to deploy active</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;