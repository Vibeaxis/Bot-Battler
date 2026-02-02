
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { Wrench, ShoppingCart, Swords, Trophy, Flame, Coins, Hammer, Cpu, Skull, Zap, Shield, Bot, Trash2 } from 'lucide-react';
import HangarModal from '@/components/HangarModal';
import { cn } from '@/lib/utils';

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
  
  const menuItems = [
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
    },
    {
      title: 'Battle Arena',
      description: 'Combat Zone',
      icon: Swords,
      path: '/battle',
      borderColor: 'border-green-500'
    }
  ];

  const BotIcon = ICON_COMPONENTS[gameState.playerBot.icon] || ICON_COMPONENTS.Cpu;
  
  const handleFactoryReset = () => {
    if (window.confirm("WARNING: This will wipe your save file permanently. Are you sure?")) {
      playSound('FUSE'); // Sound effect for destruction
      factoryReset();
    }
  };

  return (
    <>
      <Helmet>
        <title>Hub - Robot Battle Arena</title>
        <meta name="description" content="Main hub for Robot Battle Arena. Customize your bot, buy parts, and enter battles." />
      </Helmet>
      
      <HangarModal isOpen={isHangarOpen} onClose={() => setIsHangarOpen(false)} />

      <div className="min-h-screen bg-[#0a0a12] p-4 font-mono text-[#e0e0e0] selection:bg-[var(--accent-color)] selection:text-black">
        <div className="max-w-6xl mx-auto py-8 relative">
          
          {/* Factory Reset Button */}
          <div className="absolute top-0 left-0 z-10">
             <Button 
               onClick={handleFactoryReset}
               variant="ghost" 
               className="text-red-500 hover:text-red-400 hover:bg-red-900/20 opacity-30 hover:opacity-100 transition-all p-2 h-auto rounded-none"
               title="Factory Reset Data"
             >
               <Trash2 className="w-5 h-5" />
             </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold mb-4 text-[var(--accent-color)] uppercase tracking-widest [text-shadow:0_0_10px_var(--accent-color)]">
              Robot Battle Arena
            </h1>
            <p className="text-xl text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800 inline-block pb-2">Command Center</p>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             onClick={() => setIsHangarOpen(true)}
             className="bg-black/80 border border-[var(--accent-color)] rounded-none p-6 mb-8 flex items-center justify-center gap-4 max-w-md mx-auto shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)] cursor-pointer hover:bg-[rgba(var(--accent-rgb),0.1)] transition-all group relative overflow-hidden"
          >
             {/* Hover indicator */}
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[var(--accent-color)] border border-[var(--accent-color)] px-1 uppercase">
               Change Unit
             </div>

             <div className="p-3 bg-[rgba(var(--accent-rgb),0.1)] rounded-none border border-[var(--accent-color)] group-hover:scale-110 transition-transform">
               <BotIcon className="w-8 h-8 text-[var(--accent-color)]" />
             </div>
             <div className="text-left">
               <div className="text-xs text-gray-500 uppercase tracking-widest group-hover:text-[var(--accent-color)]">Active Unit</div>
               <div className="text-2xl font-bold text-[#e0e0e0] uppercase tracking-wider">{gameState.playerBot.name}</div>
             </div>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-black/80 rounded-none p-6 border border-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.05)] transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-8 h-8 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">Current Scrap</div>
                  <div className="text-3xl font-bold text-yellow-500">{gameState.scrap}</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 font-mono border-t border-gray-800 pt-2 mt-2">Total Earned: {gameState.totalScrapEarned}</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-black/80 rounded-none p-6 border border-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.05)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">Win Streak</div>
                  <div className="text-3xl font-bold text-green-500">{gameState.winStreak}</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-black/80 rounded-none p-6 border border-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.05)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-red-500" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">Loss Streak</div>
                  <div className="text-3xl font-bold text-red-500">{gameState.lossStreak}</div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {lastBattle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/80 rounded-none p-6 border border-[var(--accent-color)] mb-8 font-mono"
            >
              <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
                 <h3 className="text-lg font-bold text-[#e0e0e0] uppercase">Last Battle Log</h3>
                 <span className="text-xs text-gray-500">{new Date(lastBattle.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm">
                  {gameState.playerBot.name} <span className="text-gray-600">VS</span> {lastBattle.enemyName}
                </p>
                <div className="text-right">
                  <p className={`text-sm font-bold uppercase ${lastBattle.playerWon ? 'text-green-500' : 'text-red-500'}`}>
                    {lastBattle.playerWon ? 'Victory' : 'Defeat'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    +{lastBattle.scrapEarned} Scrap
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 5) }}
                >
                  <Button
                    onClick={() => navigate(item.path)}
                    className="w-full h-auto p-0 overflow-hidden group bg-black/80 border border-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.1)] hover:scale-[1.02] transition-all rounded-none"
                  >
                    <div className="p-8 w-full flex flex-col items-center">
                      <div className="border border-[rgba(var(--accent-rgb),0.3)] p-4 mb-4 rounded-none group-hover:border-[var(--accent-color)] transition-colors">
                        <Icon className="w-10 h-10 text-[var(--accent-color)] group-hover:[filter:drop-shadow(0_0_5px_var(--accent-color))] transition-all" />
                      </div>
                      <h3 className="text-xl font-bold text-[#e0e0e0] mb-2 font-mono uppercase tracking-wider group-hover:text-[var(--accent-color)] transition-colors">{item.title}</h3>
                      <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">{item.description}</p>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Hub;
