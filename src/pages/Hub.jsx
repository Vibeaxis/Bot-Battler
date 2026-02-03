import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { Wrench, ShoppingCart, Swords, Trophy, Flame, Coins, Hammer, Cpu, Skull, Zap, Shield, Bot, Trash2, FileText, ChevronRight } from 'lucide-react';
import ProfileModal from '@/components/ProfileModal';
import { cn } from '@/lib/utils';
import CombatLogModal from '@/components/CombatLogModal'; // <-- IMPORT THIS
const ICON_COMPONENTS = {
  Cpu,
  Skull,
  Zap,
  Shield,
  Bot
};

const Hub = () => {
  const navigate = useNavigate();
  const { gameState, factoryReset } = useGameContext();
  const { playSound } = useSoundContext();
  const [isHangarOpen, setIsHangarOpen] = useState(false);
  const lastBattle = gameState.battleHistory[0];
  const [isLogOpen, setIsLogOpen] = useState(false); // <--- ADD THIS LINE
  const menuItems = [
    {
      title: 'Battle Arena',
      description: 'Combat Zone',
      icon: Swords,
      path: '/battle',
      borderColor: 'border-green-500' // Keep as fallback or use theme
    },
    {
      title: 'Workshop',
      description: 'System Config',
      icon: Wrench,
      path: '/workshop',
      borderColor: 'border-blue-500'
    },
    {
      title: 'The Forge',
      description: 'Part Fusion',
      icon: Hammer,
      path: '/forge',
      borderColor: 'border-red-500'
    },
    {
      title: 'Shop',
      description: 'Acquisition',
      icon: ShoppingCart,
      path: '/shop',
      borderColor: 'border-purple-500'
    }
  ];

  const BotIcon = ICON_COMPONENTS[gameState.playerBot.icon] || ICON_COMPONENTS.Cpu;
  
  const handleFactoryReset = () => {
    if (window.confirm("WARNING: This will wipe your save file permanently. Are you sure?")) {
      playSound('FUSE');
      factoryReset();
    }
  };

  return (
    <>
      <Helmet>
        <title>Hub - Robot Battle Arena</title>
        <meta name="description" content="Main hub for Robot Battle Arena. Customize your bot, buy parts, and enter battles." />
      </Helmet>
      
      <ProfileModal isOpen={isHangarOpen} onClose={() => setIsHangarOpen(false)} />
{/* <--- YOU WERE MISSING THIS BLOCK ---> */}
      <CombatLogModal 
        isOpen={isLogOpen} 
        onClose={() => setIsLogOpen(false)} 
        battle={lastBattle} 
      />
      <div className="min-h-screen bg-[#0a0a12] p-4 font-mono text-[#e0e0e0] selection:bg-[var(--accent-color)] selection:text-black">
        <div className="max-w-7xl mx-auto py-8 relative">
          
          {/* Header & Factory Reset */}
          <div className="flex justify-between items-start mb-8">
             <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--accent-color)] uppercase tracking-widest [text-shadow:0_0_10px_var(--accent-color)] leading-none">
                  Command Center
                </h1>
                <p className="text-sm md:text-xl text-gray-500 uppercase tracking-[0.4em] mt-2">
                  Robot Battle Arena
                </p>
             </div>

             <Button 
                onClick={handleFactoryReset}
                variant="ghost" 
                className="text-red-900 hover:text-red-500 hover:bg-red-900/20 transition-all p-2 h-auto rounded-none border border-transparent hover:border-red-500"
                title="Factory Reset Data"
             >
                <Trash2 className="w-5 h-5" />
             </Button>
          </div>

          {/* SECTION 1: MAIN ACTION BUTTONS (Moved to Top) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Button
                    onClick={() => navigate(item.path)}
                    className="w-full h-32 p-0 overflow-hidden group bg-black/80 border border-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-all rounded-none relative"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                        <Icon className="w-16 h-16 text-[var(--accent-color)] opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500" />
                    </div>
                    
                    <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
                      <Icon className="w-8 h-8 mb-3 text-[var(--accent-color)] group-hover:drop-shadow-[0_0_8px_var(--accent-color)] transition-all" />
                      <h3 className="text-xl font-bold text-[#e0e0e0] font-mono uppercase tracking-wider group-hover:text-[var(--accent-color)] transition-colors">
                        {item.title}
                      </h3>
                      <div className="h-[1px] w-8 bg-gray-700 my-1 group-hover:w-16 group-hover:bg-[var(--accent-color)] transition-all" />
                      <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">
                        {item.description}
                      </p>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* SECTION 2: STATUS DASHBOARD (Active Bot + Stats) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              
              {/* Left Column: Active Unit (Takes 4/12 columns on large screens) */}
              <div className="lg:col-span-4 flex flex-col">
                  <motion.div
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.3 }}
                     onClick={() => setIsHangarOpen(true)}
                     className="flex-1 bg-black/40 border border-[var(--accent-color)] p-6 relative cursor-pointer group hover:bg-[rgba(var(--accent-rgb),0.05)] transition-all flex flex-col items-center justify-center min-h-[200px]"
                  >
                     <div className="absolute top-0 left-0 bg-[var(--accent-color)] text-black text-[10px] font-bold px-2 py-0.5 uppercase">
                        Active Unit
                     </div>
                     <div className="absolute top-2 right-2 text-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-opacity">
                        <Wrench className="w-4 h-4" />
                     </div>

                     <div className="mb-4 p-4 rounded-full border-2 border-[var(--accent-color)] bg-black shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)] group-hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.4)] transition-all">
                        <BotIcon className="w-12 h-12 text-[var(--accent-color)]" />
                     </div>
                     
                     <h2 className="text-2xl font-bold text-white uppercase tracking-widest text-center group-hover:text-[var(--accent-color)] transition-colors">
                        {gameState.playerBot.name}
                     </h2>
                     <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">[ CLICK TO SWAP ]</p>
                  </motion.div>
              </div>

              {/* Right Column: Stats Grid (Takes 8/12 columns) */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-black/40 border border-gray-800 p-4 flex flex-col justify-center items-center hover:border-yellow-500/50 transition-colors"
                  >
                      <Coins className="w-6 h-6 text-yellow-500 mb-2" />
                      <div className="text-3xl font-bold text-yellow-500">{gameState.scrap}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest">Scrap Reserves</div>
                      <div className="text-[9px] text-gray-700 mt-1">Total: {gameState.totalScrapEarned}</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-black/40 border border-gray-800 p-4 flex flex-col justify-center items-center hover:border-green-500/50 transition-colors"
                  >
                      <Trophy className="w-6 h-6 text-green-500 mb-2" />
                      <div className="text-3xl font-bold text-green-500">{gameState.winStreak}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest">Win Streak</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-black/40 border border-gray-800 p-4 flex flex-col justify-center items-center hover:border-red-500/50 transition-colors"
                  >
                      <Flame className="w-6 h-6 text-red-500 mb-2" />
                      <div className="text-3xl font-bold text-red-500">{gameState.lossStreak}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest">Loss Streak</div>
                  </motion.div>
                  
                {/* --- LATEST ENGAGEMENT (CLICKABLE) --- */}
                  {lastBattle && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      // Added hover effects and onClick
                      onClick={() => setIsLogOpen(true)}
                      className="md:col-span-3 bg-black/40 border border-gray-800 p-4 mt-2 cursor-pointer group hover:border-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.05)] transition-all"
                    >
                        <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2 group-hover:border-gray-700">
                            <div className="flex items-center gap-2">
                                <FileText className="w-3 h-3 text-gray-500 group-hover:text-[var(--accent-color)]" />
                                <span className="text-xs text-gray-400 uppercase tracking-widest group-hover:text-gray-300">Latest Engagement</span>
                            </div>
                            <span className="text-[10px] text-gray-600">{new Date(lastBattle.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-mono text-gray-300">
                                VS <span className="text-white font-bold group-hover:text-[var(--accent-color)] transition-colors">{lastBattle.enemyName}</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold uppercase px-2 py-0.5 rounded-sm ${lastBattle.playerWon ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                    {lastBattle.playerWon ? 'VICTORY' : 'DEFEAT'}
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[var(--accent-color)] group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    </motion.div>
                  )}
              </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Hub;