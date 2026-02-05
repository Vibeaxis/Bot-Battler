import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hammer, Shield, Zap, Activity, Cpu, ChevronRight, User, Plus, Weight } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast'; 
import { RARITY_COLORS } from '@/constants/gameConstants';
import BotCard from '@/components/BotCard';
import { cn } from '@/lib/utils';

// --- STAT CONFIGURATION ---
const STAT_CONFIG = {
  Damage: { icon: Zap, color: "text-red-500", label: "Core Output", desc: "Base Damage Bonus" },
  Speed: { icon: Activity, color: "text-cyan-400", label: "Clock Speed", desc: "Base Speed Bonus" },
  Armor: { icon: Shield, color: "text-emerald-500", label: "Hull Integrity", desc: "Base Armor Bonus" },
  Weight: { icon: Weight, color: "text-amber-500", label: "Hydraulics", desc: "Max Weight Capacity" }
};

const Workshop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { gameState, setGameState, updatePlayerProfile } = useGameContext();
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upgrade'); // 'upgrade' or 'cosmetic'

  // --- LEVELING LOGIC ---
  // Cost Formula: Base 500 * 1.5 ^ (CurrentLevel - 1)
  const currentLevel = gameState.playerBot?.level || 1;
  const upgradeCost = Math.floor(500 * Math.pow(1.5, currentLevel - 1));
  const availablePoints = gameState.playerBot?.statPoints || 0;

  // --- HANDLERS ---
  
  const handleLevelUp = () => {
    if (gameState.scrap < upgradeCost) {
        toast({ title: "INSUFFICIENT FUNDS", description: `Required: ${upgradeCost} Scrap`, variant: "destructive" });
        return;
    }

    setGameState(prev => ({
        ...prev,
        scrap: prev.scrap - upgradeCost,
        playerBot: {
            ...prev.playerBot,
            level: (prev.playerBot.level || 1) + 1,
            statPoints: (prev.playerBot.statPoints || 0) + 3 // Give 3 points per level
        }
    }));

    toast({
        title: "SYSTEM UPGRADE SUCCESSFUL",
        description: `Unit upgraded to Level ${currentLevel + 1}. +3 Stat Points acquired.`,
        className: "bg-green-900 border-green-500 text-white"
    });
  };

  const handleAllocatePoint = (statKey) => {
    if (availablePoints <= 0) return;

    setGameState(prev => {
        const currentBonus = prev.playerBot.baseStats?.[statKey] || 0;
        return {
            ...prev,
            playerBot: {
                ...prev.playerBot,
                statPoints: prev.playerBot.statPoints - 1,
                baseStats: {
                    ...(prev.playerBot.baseStats || {}),
                    [statKey]: currentBonus + 1 // Add 1 to the base stat
                }
            }
        };
    });
  };

  return (
    <>
      <Helmet>
        <title>Workshop // UPGRADE</title>
      </Helmet>

      <div className="min-h-screen bg-[#050505] text-gray-300 font-mono flex flex-col selection:bg-[var(--accent-color)] selection:text-black bg-[url('/grid-pattern.png')]">
        
        {/* Header */}
        <header className="h-16 bg-black/90 border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-20 backdrop-blur-md sticky top-0">
            <div className="flex items-center gap-4">
                <Button 
                    onClick={() => navigate('/hub')} 
                    variant="ghost" 
                    className="text-gray-500 hover:text-white hover:bg-white/5"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> HUB
                </Button>
                <div className="h-8 w-px bg-gray-800" />
                <h1 className="text-xl font-black uppercase tracking-[0.2em] text-[var(--accent-color)] flex items-center gap-3">
                    <Cpu className="w-5 h-5" /> Workshop
                </h1>
            </div>
            
            {/* Scrap Display */}
            <div className="flex items-center gap-2 text-yellow-500 font-bold border border-yellow-900/30 bg-yellow-950/10 px-4 py-1 rounded-sm">
               {gameState.scrap} SCRAP
            </div>
        </header>

        <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: BOT PREVIEW (Col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Bot Card Visualization */}
                <div className="relative group">
                    <BotCard 
                        bot={gameState.playerBot} 
                        className="w-full scale-100 shadow-2xl"
                    />
                    {/* Level Badge Overlay */}
                    <div className="absolute -top-3 -right-3 bg-[var(--accent-color)] text-black font-black px-3 py-1 text-sm border-2 border-white shadow-lg rotate-3">
                        LVL {currentLevel}
                    </div>
                </div>

                {/* Profile Edit Button (Unified) */}
                <Button 
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="w-full bg-black border border-gray-700 hover:border-white hover:bg-gray-900 text-gray-400 hover:text-white transition-all h-12 uppercase tracking-widest text-xs font-bold"
                >
                    <User className="w-4 h-4 mr-2" /> Edit Pilot Profile
                </Button>
            </div>

            {/* RIGHT: UPGRADE TERMINAL (Col-span-8) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* 1. LEVEL UP SECTION */}
                <div className="bg-black/40 border border-gray-800 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Cpu className="w-32 h-32 text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">
                                Firmware Upgrade
                            </h2>
                            <p className="text-gray-500 text-xs font-mono max-w-md">
                                Increase Core Level to unlock additional stat allocation points.
                                Higher levels improve base efficiency.
                            </p>
                        </div>

                        <Button 
                            onClick={handleLevelUp}
                            disabled={gameState.scrap < upgradeCost}
                            className={cn(
                                "h-16 min-w-[200px] flex flex-col items-center justify-center border-2 transition-all",
                                gameState.scrap >= upgradeCost 
                                    ? "bg-[var(--accent-color)] border-white text-black hover:scale-105" 
                                    : "bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed"
                            )}
                        >
                            <span className="text-sm font-black uppercase tracking-widest">
                                Level Up
                            </span>
                            <span className="text-xs font-mono mt-1">
                                {upgradeCost} SCRAP
                            </span>
                        </Button>
                    </div>
                </div>

                {/* 2. STAT ALLOCATION */}
                <div className="flex-1 bg-black/40 border border-gray-800 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Core Optimization
                        </h3>
                        
                        {availablePoints > 0 ? (
                            <div className="animate-pulse bg-[var(--accent-color)] text-black px-3 py-1 text-xs font-bold uppercase tracking-wide">
                                {availablePoints} Points Available
                            </div>
                        ) : (
                            <div className="text-gray-600 text-xs font-mono uppercase">
                                Systems Optimized
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(STAT_CONFIG).map(([key, config]) => {
                            const currentVal = gameState.playerBot?.baseStats?.[key] || 0;
                            const Icon = config.icon;

                            return (
                                <div key={key} className="bg-black border border-gray-800 p-4 flex items-center justify-between group hover:border-gray-600 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2 bg-gray-900 rounded-sm", config.color)}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                                                {config.label}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-mono">
                                                {config.desc}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-black font-mono text-white">
                                            +{currentVal}
                                        </span>
                                        <Button
                                            onClick={() => handleAllocatePoint(key)}
                                            disabled={availablePoints <= 0}
                                            size="sm"
                                            className={cn(
                                                "h-8 w-8 p-0 rounded-sm border",
                                                availablePoints > 0 
                                                    ? "bg-gray-800 border-gray-600 hover:bg-[var(--accent-color)] hover:text-black hover:border-white" 
                                                    : "bg-black border-gray-800 text-gray-700 cursor-not-allowed"
                                            )}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>

        {/* MODAL */}
        <AvatarSelectionModal 
            isOpen={isAvatarModalOpen}
            onClose={() => setIsAvatarModalOpen(false)}
            currentName={gameState.playerBot?.name}
            currentIcon={gameState.playerBot?.icon}
            onSave={updatePlayerProfile}
        />

      </div>
    </>
  );
};

export default Workshop;