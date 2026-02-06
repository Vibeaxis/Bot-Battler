import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Swords, Skull, Trophy, ShieldAlert, Lock } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import BotCard from '@/components/BotCard';
import ScreenBackground from '@/components/ScreenBackground';
import { cn } from '@/lib/utils';
import gauntletBg from '@/assets/gauntlet_bg.jpg'; 

const GauntletScreen = () => {
  const navigate = useNavigate();
  // Assuming 'gameState.gauntlet' is where the data lives based on previous Hub code
  const { gameState, startGauntletLevel, surrenderGauntlet } = useGameContext();
  const { playSound } = useSoundContext();

  // 1. Safety Check: Redirect if no active gauntlet run
  useEffect(() => {
    if (!gameState.gauntlet) {
      navigate('/hub');
    }
  }, [gameState.gauntlet, navigate]);

  if (!gameState.gauntlet) return null;

  const currentFloor = gameState.gauntlet.floor;
  // Get the enemy for the CURRENT floor (array index = floor - 1)
  const enemyBot = gameState.gauntlet.ladder[currentFloor - 1];

  const handleEngage = () => {
    playSound('FUSE'); 
    startGauntletLevel(); // Ensure this sets the battle state correctly
    navigate('/battle');
  };

  const handleSurrender = () => {
    if (window.confirm("Surrendering will end your run. You will keep collected scrap but lose the streak bonus. Confirm?")) {
        playSound('DEFEAT');
        surrenderGauntlet();
        navigate('/hub');
    }
  };

  return (
    <>
      <Helmet>
        <title>The Gauntlet - Floor {currentFloor}</title>
      </Helmet>

      {/* 1. BACKGROUND */}
      <ScreenBackground image={gauntletBg} opacity={0.4} />

      <div className="min-h-screen bg-transparent font-mono text-red-500 flex flex-col relative z-10 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 flex justify-between items-center bg-black/80 border-b border-red-900/50 backdrop-blur-md relative z-20">
            <Button 
                variant="ghost" 
                onClick={handleSurrender}
                className="text-red-700 hover:text-red-500 hover:bg-red-900/20"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> SURRENDER
            </Button>
            <h1 className="text-2xl font-black italic tracking-widest text-red-600 animate-pulse">
                THE GAUNTLET
            </h1>
            <div className="w-24" /> {/* Spacer */}
        </div>

        <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT: FLOOR LIST */}
            <div className="w-80 border-r border-red-900/30 bg-black/60 backdrop-blur-sm hidden md:flex flex-col relative z-20">
                <div className="p-4 border-b border-red-900/30">
                    <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest">Tower Progress</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {[...Array(10)].map((_, i) => {
                        const floorNum = 10 - i; // 10 down to 1
                        const isCurrent = floorNum === currentFloor;
                        const isPast = floorNum < currentFloor;
                        const isFuture = floorNum > currentFloor;

                        return (
                            <div 
                                key={floorNum}
                                className={cn(
                                    "p-4 border flex items-center justify-between transition-all",
                                    isCurrent ? "bg-red-900/20 border-red-500 scale-105 shadow-[0_0_15px_rgba(220,38,38,0.2)]" : "border-gray-900",
                                    isPast ? "opacity-30 grayscale" : "",
                                    isFuture ? "opacity-50" : ""
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn("text-lg font-black w-6", isCurrent ? "text-white" : "text-red-900")}>
                                        {floorNum}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-red-400">
                                            {floorNum === 10 ? "APEX PREDATOR" : `Guardian Lvl ${floorNum}`}
                                        </span>
                                        <span className="text-[8px] text-red-700">
                                            {floorNum === 10 ? "LEGENDARY CLASS" : floorNum > 7 ? "EPIC CLASS" : floorNum > 4 ? "RARE CLASS" : "COMMON CLASS"}
                                        </span>
                                    </div>
                                </div>
                                {isFuture && <Lock className="w-4 h-4 text-red-900" />}
                                {isPast && <Skull className="w-4 h-4 text-gray-600" />}
                                {isCurrent && <Swords className="w-4 h-4 text-red-500 animate-pulse" />}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* RIGHT: MAIN STAGE */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-8">
                
                {/* GIANT BACKGROUND TEXT (Fixed Z-Index to stay behind) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                    <h1 className="text-[20vw] font-black text-red-950/20 tracking-tighter select-none blur-sm">
                        FLOOR {currentFloor}
                    </h1>
                </div>

                {/* CONTENT CONTAINER (Fixed Z-Index to stay front) */}
                <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl">
                    
                    <div className="text-center space-y-2">
                        <p className="text-red-500 text-xs font-mono tracking-[0.5em] uppercase">Next Opponent</p>
                        <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                            FLOOR {currentFloor}
                        </h2>
                    </div>

                    {/* ENEMY CARD - Added vertical padding to container to prevent cropping */}
                    <div className="py-12 transform hover:scale-105 transition-transform duration-500">
                        {enemyBot && (
                            <BotCard 
                                bot={enemyBot} 
                                currentHealth={enemyBot.health} 
                                maxHealth={enemyBot.health} 
                                side="enemy"
                                className="shadow-[0_0_50px_rgba(220,38,38,0.3)] border-red-900"
                            />
                        )}
                    </div>

                    <Button 
                        onClick={handleEngage}
                        size="lg"
                        className="h-16 px-12 text-xl bg-red-600 hover:bg-red-500 text-black font-black uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] hover:scale-105 transition-all border border-white/20"
                    >
                        <Swords className="w-6 h-6 mr-3" /> ENGAGE
                    </Button>

                    <p className="text-[10px] text-red-800 font-mono mt-4 flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3" />
                        WARNING: DEFEAT RESETS GAUNTLET PROGRESS COMPLETELY.
                    </p>
                </div>

            </div>
        </div>
      </div>
    </>
  );
};

export default GauntletScreen;