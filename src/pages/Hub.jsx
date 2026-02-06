import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { 
  Wrench, ShoppingCart, Swords, Trophy, Flame, Coins, Hammer, 
  Trash2, FileText, ChevronRight, Crosshair, Zap
} from 'lucide-react';
import * as LucideIcons from 'lucide-react'; // 1. FULL IMPORT FOR AVATARS
import ProfileModal from '@/components/ProfileModal';
import CombatLogModal from '@/components/CombatLogModal';
import SystemTicker from '@/components/SystemTicker';
import { cn } from '@/lib/utils';
import ScreenBackground from '@/components/ScreenBackground';
import hubBg from '@/assets/hub_bg.jpg';

// 2. Create Map for dynamic lookup
const IconMap = { ...LucideIcons };

const Hub = () => {
  const navigate = useNavigate();
  const { gameState, factoryReset, startGauntlet } = useGameContext();
  const { playSound } = useSoundContext();
  const [isHangarOpen, setIsHangarOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const lastBattle = gameState.battleHistory[0];

  // 3. NEW ICON LOGIC
  const currentIconId = gameState.playerBot.icon;
  const isDiceBear = currentIconId === 'DiceBear';
  // Fallback to 'Cpu' if icon not found in library
  const BotIcon = !isDiceBear ? (IconMap[currentIconId] || IconMap.Cpu) : null;

  const handleFactoryReset = () => {
    if (window.confirm("WARNING: This will wipe your save file permanently. Are you sure?")) {
      playSound('FUSE');
      factoryReset();
    }
  };

  const handleEnterGauntlet = () => {
      playSound('CLICK');
      startGauntlet();
      navigate('/gauntlet');
  };

  return (
    <>
      <Helmet>
        <title>Hub - Robot Battle Arena</title>
      </Helmet>
      
      {/* BACKGROUND LAYER */}
      <ScreenBackground image={hubBg} opacity={0.35} />

      <ProfileModal isOpen={isHangarOpen} onClose={() => setIsHangarOpen(false)} />
      <CombatLogModal isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} battle={lastBattle} />

      {/* MAIN CONTENT */}
      <div className="min-h-screen bg-transparent font-mono text-[#e0e0e0] flex flex-col pb-12 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="bg-black/80 border-b border-[var(--accent-color)] backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Title */}
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-black text-[var(--accent-color)] uppercase tracking-widest [text-shadow:0_0_15px_rgba(var(--accent-rgb),0.5)] leading-none">
                        Command Center
                    </h1>
                    <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                        <span className="w-2 h-2 bg-green-500 animate-pulse rounded-full" />
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">System Online</p>
                    </div>
                </div>

                {/* COMPACT STATS BAR */}
                <div className="flex items-center gap-4 md:gap-8 bg-[#050505] border border-gray-800 rounded-sm px-6 py-2">
                    <div className="flex items-center gap-3">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Scrap</span>
                            <span className="text-lg font-bold text-yellow-500 leading-none">{gameState.scrap}</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-gray-800" />
                    <div className="flex items-center gap-3">
                        <Trophy className="w-4 h-4 text-green-500" />
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Wins</span>
                            <span className="text-lg font-bold text-green-500 leading-none">{gameState.winStreak}</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-gray-800" />
                    <div className="flex items-center gap-3">
                        <Flame className="w-4 h-4 text-red-500" />
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Losses</span>
                            <span className="text-lg font-bold text-red-500 leading-none">{gameState.lossStreak}</span>
                        </div>
                    </div>
                </div>

                {/* Factory Reset (Small) */}
                <Button 
                    onClick={handleFactoryReset}
                    variant="ghost" 
                    size="sm"
                    className="absolute top-4 right-4 md:static text-red-900 hover:text-red-500 hover:bg-red-900/10"
                    title="Factory Reset"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-12">
            
            {/* SECTION 1: ACTIVE UNIT & COMBAT LOG */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Bot Card */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setIsHangarOpen(true)}
                    className="lg:col-span-1 bg-black/60 backdrop-blur-md border border-[var(--accent-color)] relative cursor-pointer group hover:bg-[rgba(var(--accent-rgb),0.05)] transition-all min-h-[180px] flex items-center p-6 gap-6"
                >
                    <div className="absolute top-0 left-0 bg-[var(--accent-color)] text-black text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">
                        Active Unit
                    </div>
                    
                    {/* AVATAR RENDERER */}
                    <div className="p-3 border-2 border-[var(--accent-color)] bg-black shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] group-hover:scale-105 transition-transform overflow-hidden w-20 h-20 flex items-center justify-center">
                        {isDiceBear ? (
                             <img 
                                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(gameState.playerBot.name)}`}
                                alt="Bot Avatar"
                                className="w-full h-full object-contain"
                             />
                        ) : (
                             <BotIcon className="w-12 h-12 text-[var(--accent-color)]" />
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest group-hover:text-[var(--accent-color)] transition-colors truncate">
                            {gameState.playerBot.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-mono">
                            <span>LVL {gameState.playerBot.level || 1}</span>
                            <span className="text-[var(--accent-color)]">OPERATOR</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest group-hover:text-white transition-colors">
                            [ CLICK TO CONFIGURE ]
                        </p>
                    </div>
                </motion.div>

                {/* Latest Engagement Log */}
                <div className="lg:col-span-2">
                    {lastBattle ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setIsLogOpen(true)}
                            className="h-full bg-black/40 backdrop-blur-md border border-gray-800 p-6 cursor-pointer group hover:border-[var(--accent-color)] transition-all flex flex-col justify-center"
                        >
                            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                                <div className="flex items-center gap-2 text-gray-500 group-hover:text-[var(--accent-color)] transition-colors">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-xs uppercase tracking-widest">Latest Engagement Log</span>
                                </div>
                                <span className="text-[10px] text-gray-600 font-mono">{new Date(lastBattle.timestamp).toLocaleTimeString()}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className={`text-3xl font-black italic tracking-tighter ${lastBattle.playerWon ? 'text-green-500' : 'text-red-500'}`}>
                                        {lastBattle.playerWon ? 'VICTORY' : 'DEFEAT'}
                                    </span>
                                    <div className="h-8 w-[1px] bg-gray-800" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Opponent</p>
                                        <p className="text-lg font-bold text-white group-hover:text-[var(--accent-color)] transition-colors">{lastBattle.enemyName}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full bg-black/40 border border-gray-800 border-dashed p-6 flex flex-col items-center justify-center text-gray-600">
                            <p className="uppercase tracking-widest text-sm">No Combat Data Logged</p>
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION 2: COMBAT OPERATIONS */}
            <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Crosshair className="w-4 h-4" /> Combat Operations
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    
                    {/* STANDARD BATTLE */}
                    <button 
                        onClick={() => navigate('/battle')}
                        className="relative h-32 bg-black/60 backdrop-blur-md border border-gray-800 hover:border-green-500 group transition-all flex items-center px-8 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-green-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                        <Swords className="w-12 h-12 text-gray-700 group-hover:text-green-500 transition-colors mr-6" />
                        <div className="text-left relative z-10">
                            <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase group-hover:text-green-500 transition-colors">Battle Arena</h4>
                            <p className="text-xs text-gray-500 font-mono mt-1">Standard Scavenge Operations</p>
                        </div>
                    </button>

                    {/* GAUNTLET MODE */}
                    <button 
                        onClick={handleEnterGauntlet}
                        className="relative h-32 bg-black/60 backdrop-blur-md border border-red-900/50 hover:border-red-500 group transition-all flex items-center px-8 overflow-hidden"
                    >
                         <div className="absolute inset-0 bg-red-600/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                         <div className="p-3 bg-red-900/20 border border-red-500/30 mr-6 group-hover:scale-110 transition-transform">
                            <Trophy className="w-8 h-8 text-red-600 group-hover:text-red-400 transition-colors" />
                         </div>
                         <div className="text-left relative z-10">
                            <h4 className="text-2xl font-black text-red-600 italic tracking-tighter uppercase group-hover:text-red-400 transition-colors">The Gauntlet</h4>
                            <p className="text-xs text-red-800 font-mono mt-1 group-hover:text-red-400/70">High Stakes Tournament // 10 Floors</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* SECTION 3: ENGINEERING & LOGISTICS */}
            <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Engineering & Logistics
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                    
                    {[
                        { title: 'Workshop', desc: 'Config & Loadout', icon: Wrench, path: '/workshop', color: 'text-blue-500', border: 'hover:border-blue-500' },
                        { title: 'The Forge', desc: 'Part Fusion', icon: Hammer, path: '/forge', color: 'text-orange-500', border: 'hover:border-orange-500' },
                        { title: 'Supply Depot', desc: 'Acquisition', icon: ShoppingCart, path: '/shop', color: 'text-purple-500', border: 'hover:border-purple-500' }
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <button 
                                key={item.title}
                                onClick={() => navigate(item.path)}
                                className={`h-24 bg-black/60 backdrop-blur-md border border-gray-800 ${item.border} group transition-all flex items-center justify-center gap-4`}
                            >
                                <Icon className={`w-6 h-6 text-gray-600 group-hover:${item.color} transition-colors`} />
                                <div className="text-left">
                                    <h4 className={`text-lg font-bold text-gray-300 uppercase tracking-wide group-hover:text-white`}>{item.title}</h4>
                                    <p className="text-[10px] text-gray-600 font-mono">{item.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>

        {/* FIXED TICKER */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <SystemTicker />
        </div>
      </div>
    </>
  );
};

export default Hub;