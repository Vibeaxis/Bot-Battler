import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Swords, Skull, Trophy, Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BotCard from '@/components/BotCard';
import ScreenBackground from '@/components/ScreenBackground';
import gauntletBg from '@/assets/gauntlet_bg.jpg';

const GauntletScreen = () => {
  const navigate = useNavigate();
  const { gauntletState, exitGauntlet } = useGameContext();
  const { playSound } = useSoundContext();
  
  useEffect(() => {
    if (!gauntletState || !gauntletState.active) {
      navigate('/hub');
    }
  }, [gauntletState, navigate]);

  if (!gauntletState || !gauntletState.active) {
      return null;
  }

  const currentEnemy = gauntletState.ladder[gauntletState.currentFloor];

  const handleFight = () => {
    playSound('FUSE'); 
    navigate('/battle', { state: { enemy: currentEnemy, mode: 'gauntlet' } });
  };

  const handleSurrender = () => {
      if (window.confirm("Surrender? You will lose your streak bonus.")) {
          playSound('DEFEAT');
          exitGauntlet();
          navigate('/hub');
      }
  };

  return (
    <>
      <Helmet>
        <title>The Gauntlet - Floor {gauntletState.currentFloor + 1}</title>
      </Helmet>

      {/* 1. BACKGROUND */}
      <ScreenBackground image={gauntletBg} opacity={0.4} />

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="min-h-screen bg-transparent font-mono text-white flex relative z-10 overflow-hidden">
      
        {/* LEFT PANEL: THE LADDER */}
        <div className="w-80 border-r border-red-900/30 bg-black/80 backdrop-blur-md flex flex-col relative z-20 hidden md:flex">
            <div className="p-6 border-b border-red-900/30 flex items-center justify-between">
                <h2 className="text-xl font-black italic tracking-tighter text-red-600 animate-pulse">THE GAUNTLET</h2>
                <Button variant="ghost" size="icon" onClick={handleSurrender} className="text-red-700 hover:text-red-500 hover:bg-red-900/20">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </div>

            {/* Scrollable Ladder Container */}
            <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-2 p-4 custom-scrollbar">
                {gauntletState.ladder.map((enemy, index) => {
                    const isCurrent = index === gauntletState.currentFloor;
                    const isDefeated = index < gauntletState.currentFloor;
                    const isLocked = index > gauntletState.currentFloor;
                    const isBoss = index === 9; // Floor 10

                    return (
                        <div 
                            key={index}
                            className={cn(
                                "relative p-4 border transition-all duration-300 flex items-center justify-between",
                                isCurrent ? "bg-red-900/20 border-red-500 scale-105 z-10 shadow-[0_0_15px_rgba(220,38,38,0.2)]" : "border-gray-900 bg-black/50",
                                isDefeated && "opacity-30 grayscale",
                                isBoss && "border-yellow-600"
                            )}
                        >
                            {/* Connecting Line */}
                            {index > 0 && (
                                <div className={cn(
                                    "absolute top-full left-4 w-0.5 h-4 -mb-2 z-0",
                                    isDefeated ? "bg-red-900" : "bg-gray-800"
                                )} />
                            )}

                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "text-sm font-bold w-6 h-6 flex items-center justify-center border",
                                    isCurrent ? "bg-red-500 text-black border-red-500" : "border-gray-700 text-gray-500"
                                )}>
                                    {index + 1}
                                </span>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-[10px] uppercase tracking-widest font-bold truncate max-w-[120px]",
                                        isCurrent ? "text-white" : "text-gray-500",
                                        isBoss && "text-yellow-500"
                                    )}>
                                        {isBoss ? "APEX PREDATOR" : enemy.name}
                                    </span>
                                    <span className="text-[8px] text-gray-600 uppercase">
                                        {(enemy.rarityId || 'common')} CLASS
                                    </span>
                                </div>
                            </div>

                            {isCurrent && <Swords className="w-4 h-4 text-red-500 animate-pulse" />}
                            {isDefeated && <Skull className="w-4 h-4 text-gray-600" />}
                            {isLocked && <Lock className="w-4 h-4 text-gray-800" />}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* RIGHT PANEL: STAGING AREA */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            
            {/* Giant Background Text (Fixed Z-Index) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                <h1 className="text-[20vw] font-black text-red-950/20 tracking-tighter select-none blur-sm">
                    FLOOR {gauntletState.currentFloor + 1}
                </h1>
            </div>

            {/* Victory State */}
            {gauntletState.completed ? (
                 <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center z-10 bg-black/80 p-12 border border-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.2)]"
                 >
                    <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-6" />
                    <h1 className="text-5xl font-black text-white mb-4 italic tracking-tighter">GAUNTLET CLEARED</h1>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto font-mono text-sm">
                        You have ascended the spire. Your build is flawless.
                    </p>
                    <Button 
                        size="lg" 
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl px-12 py-8 uppercase tracking-widest"
                        onClick={() => { exitGauntlet(); navigate('/hub'); }}
                    >
                        Claim Rewards & Exit
                    </Button>
                 </motion.div>
            ) : (
                /* Active Floor State */
                <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
                    
                    <div className="text-center mb-8 space-y-2">
                        <h3 className="text-red-500 tracking-[0.5em] text-xs font-bold uppercase animate-pulse">Next Opponent</h3>
                        <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_0_25px_rgba(220,38,38,0.6)]">
                            FLOOR {gauntletState.currentFloor + 1}
                        </h1>
                    </div>

                    {/* ENEMY CARD - Added Padding to fix crop */}
                    <div className="py-12 transform hover:scale-105 transition-transform duration-500">
                        <BotCard 
                            bot={currentEnemy} 
                            currentHealth={currentEnemy.health} 
                            maxHealth={currentEnemy.health} 
                            side="enemy" 
                            className="scale-110 shadow-[0_0_60px_rgba(220,38,38,0.4)] border-red-900" 
                        />
                        
                        {/* VS Badge */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-black font-black px-6 py-2 skew-x-[-12deg] border-2 border-white shadow-lg">
                            VS
                        </div>
                    </div>

                    <div className="mt-8">
                         <Button 
                            size="lg" 
                            className="bg-red-600 hover:bg-red-500 text-white font-black text-2xl px-16 py-10 border-2 border-red-400/30 uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_50px_rgba(220,38,38,0.8)] hover:scale-105 transition-all"
                            onClick={handleFight}
                        >
                            <Swords className="w-8 h-8 mr-4" />
                            ENGAGE
                        </Button>
                    </div>
                    
                    {/* Stakes Warning */}
                    <div className="mt-8 flex items-center gap-2 text-red-500/70 text-[10px] font-mono uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full border border-red-900/30">
                        <ShieldAlert className="w-3 h-3" />
                        Warning: Defeat resets Gauntlet progress completely.
                    </div>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default GauntletScreen;