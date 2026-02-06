import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { 
  Wrench, ShoppingCart, Swords, Trophy, Flame, Coins, Hammer, 
  Trash2, FileText, ChevronRight, Globe, Cpu
} from 'lucide-react';
import * as LucideIcons from 'lucide-react'; 
import ProfileModal from '@/components/ProfileModal';
import CombatLogModal from '@/components/CombatLogModal';
import SystemTicker from '@/components/SystemTicker';
import { cn } from '@/lib/utils';
import ScreenBackground from '@/components/ScreenBackground';
import hubBg from '@/assets/hub_bg.jpg';

const IconMap = { ...LucideIcons };

const Hub = () => {
  const navigate = useNavigate();
  const { gameState, factoryReset, startGauntlet } = useGameContext();
  const { playSound } = useSoundContext();
  const [isHangarOpen, setIsHangarOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const lastBattle = gameState.battleHistory[0];

  const currentIconId = gameState.playerBot.icon;
  const isDiceBear = currentIconId === 'DiceBear';
  const BotIcon = !isDiceBear ? (IconMap[currentIconId] || IconMap.Cpu) : null;

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
      </Helmet>
      
      <ScreenBackground image={hubBg} opacity={0.35} />

      <ProfileModal isOpen={isHangarOpen} onClose={() => setIsHangarOpen(false)} />
      <CombatLogModal isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} battle={lastBattle} />

      {/* MAIN CONTENT CONTAINER */}
      <div className="min-h-screen bg-transparent font-mono text-[#e0e0e0] flex flex-col pb-16 relative z-10">
        
        {/* HEADER SECTION - More Breathing Room */}
        <div className="bg-black/80 border-b border-[var(--accent-color)] backdrop-blur-md sticky top-0 z-40 shadow-2xl">
            <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Title Block */}
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-black text-[var(--accent-color)] uppercase tracking-widest [text-shadow:0_0_20px_rgba(var(--accent-rgb),0.4)] leading-none">
                        Command Center
                    </h1>
                    <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                        <span className="w-2 h-2 bg-green-500 animate-pulse rounded-full shadow-[0_0_10px_#0f0]" />
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em]">System Online</p>
                    </div>
                </div>

                {/* STATS BAR */}
                <div className="flex items-center gap-6 md:gap-10 bg-[#050505] border border-gray-800 rounded-sm px-8 py-3 shadow-inner">
                    <div className="flex items-center gap-3">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Scrap</span>
                            <span className="text-xl font-bold text-yellow-500 leading-none">{gameState.scrap}</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-gray-800" />
                    <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-green-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Wins</span>
                            <span className="text-xl font-bold text-green-500 leading-none">{gameState.winStreak}</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-gray-800" />
                    <div className="flex items-center gap-3">
                        <Flame className="w-5 h-5 text-red-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Losses</span>
                            <span className="text-xl font-bold text-red-500 leading-none">{gameState.lossStreak}</span>
                        </div>
                    </div>
                </div>

                <Button 
                    onClick={handleFactoryReset}
                    variant="ghost" 
                    size="sm"
                    className="absolute top-4 right-4 md:static text-red-900 hover:text-red-500 hover:bg-red-900/10 transition-colors"
                    title="Factory Reset"
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            </div>
        </div>

        {/* BODY CONTENT - Increased Spacing */}
        <div className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-10">
            
            {/* ROW 1: ACTIVE UNIT & LOG */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Bot Card */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setIsHangarOpen(true)}
                    className="lg:col-span-1 bg-black/60 backdrop-blur-md border border-[var(--accent-color)] relative cursor-pointer group hover:bg-[rgba(var(--accent-rgb),0.05)] transition-all min-h-[200px] flex items-center p-8 gap-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                >
                    <div className="absolute top-0 left-0 bg-[var(--accent-color)] text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-lg">
                        Active Unit
                    </div>
                    
                    {/* AVATAR */}
                    <div className="p-4 border-2 border-[var(--accent-color)] bg-black shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)] group-hover:scale-105 transition-transform overflow-hidden w-24 h-24 flex items-center justify-center rounded-sm">
                        {isDiceBear ? (
                             <img 
                                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(gameState.playerBot.name)}`}
                                alt="Bot Avatar"
                                className="w-full h-full object-contain"
                             />
                        ) : (
                             <BotIcon className="w-14 h-14 text-[var(--accent-color)]" />
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                        <h2 className="text-3xl font-black text-white uppercase tracking-widest group-hover:text-[var(--accent-color)] transition-colors truncate">
                            {gameState.playerBot.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 font-mono">
                            <span className="px-2 py-0.5 bg-gray-800 text-white rounded-sm">LVL {gameState.playerBot.level || 1}</span>
                            <span className="text-[var(--accent-color)] font-bold tracking-wider">OPERATOR CLASS</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-3 uppercase tracking-widest group-hover:text-white transition-colors">
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
                            className="h-full bg-black/40 backdrop-blur-md border border-gray-800 p-8 cursor-pointer group hover:border-[var(--accent-color)] transition-all flex flex-col justify-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FileText className="w-48 h-48 text-white" />
                            </div>

                            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-2 relative z-10">
                                <div className="flex items-center gap-3 text-gray-500 group-hover:text-[var(--accent-color)] transition-colors">
                                    <FileText className="w-5 h-5" />
                                    <span className="text-sm uppercase tracking-widest font-bold">Latest Report</span>
                                </div>
                                <span className="text-xs text-gray-600 font-mono">{new Date(lastBattle.timestamp).toLocaleTimeString()}</span>
                            </div>
                            
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-6">
                                    <span className={`text-5xl font-black italic tracking-tighter ${lastBattle.playerWon ? 'text-green-500 [text-shadow:0_0_20px_rgba(34,197,94,0.3)]' : 'text-red-500 [text-shadow:0_0_20px_rgba(239,68,68,0.3)]'}`}>
                                        {lastBattle.playerWon ? 'VICTORY' : 'DEFEAT'}
                                    </span>
                                    <div className="h-12 w-[1px] bg-gray-700" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Target Neutralized</p>
                                        <p className="text-2xl font-bold text-white group-hover:text-[var(--accent-color)] transition-colors">{lastBattle.enemyName}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-8 h-8 text-gray-700 group-hover:text-white group-hover:translate-x-2 transition-all" />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full bg-black/40 border border-gray-800 border-dashed p-6 flex flex-col items-center justify-center text-gray-600">
                            <p className="uppercase tracking-widest text-sm font-mono">No Combat Data Logged</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ROW 2: COMBAT OPERATIONS (The "Ghost" Buttons) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* BATTLE ARENA */}
                <Button 
                    variant="outline" 
                    onClick={() => navigate('/battle')}
                    className="h-40 border-white/10 hover:border-white/40 hover:bg-white/5 flex flex-col items-center justify-center gap-3 group transition-all"
                >
                    <Swords className="w-10 h-10 text-gray-500 group-hover:text-white transition-colors" />
                    <div className="text-center space-y-1">
                        <span className="block text-2xl font-black italic text-white tracking-tighter group-hover:scale-105 transition-transform">BATTLE ARENA</span>
                        <span className="text-xs text-gray-600 font-mono group-hover:text-gray-400 uppercase tracking-widest">Standard Ops • Scavenge</span>
                    </div>
                </Button>

              {/* 2. THE GAUNTLET (Hardcore - Red) */}
<Button 
    variant="outline"
    onClick={handleEnterGauntlet} // <--- FIX: Use the helper, don't just navigate!
    className="h-40 border-red-500/20 hover:border-red-500/60 hover:bg-red-900/5 flex flex-col items-center justify-center gap-3 group transition-all"
>
    <Trophy className="w-10 h-10 text-red-900 group-hover:text-red-500 transition-colors" />
    <div className="text-center space-y-1">
        <span className="block text-2xl font-black italic text-white tracking-tighter group-hover:scale-105 transition-transform">THE GAUNTLET</span>
        <span className="text-xs text-red-900 font-mono group-hover:text-red-400 uppercase tracking-widest">High Stakes • Survival</span>
    </div>
</Button>

                {/* ARENA LEAGUE */}
                <Button 
                    variant="outline"
                    onClick={() => { playSound('CLICK'); navigate('/arena'); }}
                    className="h-40 border-cyan-500/20 hover:border-cyan-500/60 hover:bg-cyan-900/5 flex flex-col items-center justify-center gap-3 group transition-all"
                >
                    <Globe className="w-10 h-10 text-cyan-900 group-hover:text-cyan-500 transition-colors" />
                    <div className="text-center space-y-1">
                        <span className="block text-2xl font-black italic text-white tracking-tighter group-hover:scale-105 transition-transform">ARENA LEAGUE</span>
                        <span className="text-xs text-cyan-900 font-mono group-hover:text-cyan-400 uppercase tracking-widest">Async PVP • Ranked</span>
                    </div>
                </Button>
            </div>

            {/* ROW 3: ENGINEERING (Unified Theme Colors) */}
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { title: 'Workshop', desc: 'Config & Loadout', icon: Wrench, path: '/workshop' },
                    { title: 'The Forge', desc: 'Part Fusion', icon: Hammer, path: '/forge' },
                    { title: 'Supply Depot', desc: 'Acquisition', icon: ShoppingCart, path: '/shop' }
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <button 
                            key={item.title}
                            onClick={() => navigate(item.path)}
                            // CLEAN LOGIC: Hover turns text/border to ACCENT COLOR, no more random rainbows
                            className="h-32 bg-black/40 backdrop-blur-md border border-gray-800 hover:border-[var(--accent-color)] group transition-all flex items-center justify-center gap-6 relative overflow-hidden"
                        >
                            {/* Accent Glow on Hover */}
                            <div className="absolute inset-0 bg-[var(--accent-color)] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                            
                            <Icon className="w-8 h-8 text-gray-700 group-hover:text-[var(--accent-color)] transition-colors" />
                            <div className="text-left">
                                <h4 className="text-xl font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">{item.title}</h4>
                                <p className="text-xs text-gray-600 font-mono group-hover:text-[var(--accent-color)] transition-colors">{item.desc}</p>
                            </div>
                        </button>
                    );
                })}
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