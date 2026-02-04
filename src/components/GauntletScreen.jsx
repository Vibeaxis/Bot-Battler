import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, Skull, Trophy, Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BotCard from '@/components/BotCard';

const GauntletScreen = () => {
  const navigate = useNavigate();
  const { gauntletState, exitGauntlet } = useGameContext();
  
  // If no gauntlet is active, redirect back to hub
  if (!gauntletState.active) {
    navigate('/hub');
    return null;
  }

  const currentEnemy = gauntletState.ladder[gauntletState.currentFloor];

  const handleFight = () => {
    // Navigate to battle, passing the specific gauntlet enemy
    navigate('/battle', { state: { enemy: currentEnemy, mode: 'gauntlet' } });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono flex">
      
      {/* LEFT PANEL: THE LADDER */}
      <div className="w-1/3 border-r border-gray-800 p-6 flex flex-col relative overflow-hidden">
        <div className="mb-6 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { exitGauntlet(); navigate('/hub'); }}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Surrender
            </Button>
            <h2 className="text-xl font-black italic tracking-tighter text-red-500">THE GAUNTLET</h2>
        </div>

        {/* Scrollable Ladder Container */}
        <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-2 pr-4 scrollbar-hide">
            {gauntletState.ladder.map((enemy, index) => {
                const isCurrent = index === gauntletState.currentFloor;
                const isDefeated = index < gauntletState.currentFloor;
                const isLocked = index > gauntletState.currentFloor;
                const isBoss = index === 9;

                return (
                    <div 
                        key={index}
                        className={cn(
                            "relative p-4 border transition-all duration-300 flex items-center justify-between",
                            isCurrent ? "bg-red-900/20 border-red-500 scale-105 z-10" : "border-gray-800 bg-black",
                            isDefeated && "opacity-30 grayscale",
                            isBoss && "border-yellow-600"
                        )}
                    >
                        {/* Connecting Line */}
                        {index > 0 && (
                            <div className={cn(
                                "absolute top-full left-1/2 w-0.5 h-4 -mb-2 z-0",
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
                                    "text-sm uppercase tracking-widest font-bold",
                                    isCurrent ? "text-white" : "text-gray-500",
                                    isBoss && "text-yellow-500"
                                )}>
                                    {isBoss ? "APEX PREDATOR" : enemy.name}
                                </span>
                                <span className="text-[10px] text-gray-600">
                                    {enemy.rarity.toUpperCase()} CLASS
                                </span>
                            </div>
                        </div>

                        {isCurrent && <Swords className="w-5 h-5 text-red-500 animate-pulse" />}
                        {isDefeated && <Skull className="w-4 h-4 text-gray-600" />}
                        {isLocked && <Lock className="w-4 h-4 text-gray-800" />}
                    </div>
                );
            })}
        </div>
      </div>

      {/* RIGHT PANEL: STAGING AREA */}
      <div className="flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-[#050505] to-[#050505] flex flex-col items-center justify-center p-12 relative">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,0,0,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,0,0,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

        {gauntletState.completed ? (
             <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
             >
                <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-6" />
                <h1 className="text-5xl font-black text-white mb-4">GAUNTLET CLEARED</h1>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">You have ascended the spire and proven your build is flawless.</p>
                <Button 
                    size="lg" 
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl px-12 py-8"
                    onClick={() => { exitGauntlet(); navigate('/hub'); }}
                >
                    CLAIM REWARDS & EXIT
                </Button>
             </motion.div>
        ) : (
            <>
                <div className="text-center mb-10 z-10">
                    <h3 className="text-red-500 tracking-[0.5em] text-sm font-bold mb-2">NEXT OPPONENT</h3>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase glitch-text">
                        FLOOR {gauntletState.currentFloor + 1}
                    </h1>
                </div>

                <div className="relative z-10 mb-12">
                    {/* Reuse your BotCard! */}
                    <BotCard bot={currentEnemy} side="enemy" className="scale-125 shadow-[0_0_50px_rgba(220,38,38,0.3)]" />
                    
                    {/* VS Badge */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-black font-black px-4 py-1 skew-x-[-10deg] border-2 border-white">
                        VS
                    </div>
                </div>

                <div className="flex gap-4 z-10">
                     <Button 
                        size="lg" 
                        className="bg-red-600 hover:bg-red-500 text-white font-bold text-xl px-12 py-8 border-2 border-red-400/30"
                        onClick={handleFight}
                    >
                        <Swords className="w-6 h-6 mr-3" />
                        ENGAGE
                    </Button>
                </div>
                
                {/* Stakes Warning */}
                <div className="absolute bottom-8 flex items-center gap-2 text-red-500/50 text-xs font-mono uppercase">
                    <ShieldAlert className="w-4 h-4" />
                    Warning: Defeat resets Gauntlet progress completely.
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default GauntletScreen;