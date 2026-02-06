import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext, THEMES } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronUp, Palette, Zap, Activity, Shield, Weight, Plus, Coins } from 'lucide-react';
import { getPartById, PART_SLOTS } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import PartModal from '@/components/PartModal';
import StatDisplay from '@/components/StatDisplay';
import { toast } from '@/components/ui/use-toast';
import { RARITY_COLORS } from '@/constants/gameConstants';
import RarityBadge from '@/components/RarityBadge';
import { cn } from '@/lib/utils';
import { calculateBotStats } from '@/utils/statCalculator';
import BotNameEditor from '@/components/BotNameEditor';
import ScreenBackground from '@/components/ScreenBackground';
import weapDepot from '@/assets/weap_depot.jpg'; 
import AvatarSelectionModal from '@/components/AvatarSelectionModal'; // IMPORT THE NEW MODAL

// --- STAT CONFIGURATION ---
const STAT_CONFIG = {
  Damage: { icon: Zap, color: "text-red-500", label: "Core Output", desc: "Base Damage Bonus" },
  Speed: { icon: Activity, color: "text-cyan-400", label: "Clock Speed", desc: "Base Speed Bonus" },
  Armor: { icon: Shield, color: "text-emerald-500", label: "Hull Integrity", desc: "Base Armor Bonus" },
  Weight: { icon: Weight, color: "text-amber-500", label: "Hydraulics", desc: "Max Weight Capacity" }
};

const IconMap = { ...LucideIcons };

const Workshop = () => {
  const navigate = useNavigate();
  const { gameState, setGameState, equipPart, unequipPart, upgradeSlot, setCurrentTheme, updateBotIcon, updateBotName } = useGameContext();
  const { playSound } = useSoundContext();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  
  const stats = calculateBotStats({
    ...gameState.playerBot,
    slotLevels: gameState.slotLevels
  });
  
  // --- ICON RENDER LOGIC ---
  const currentIconId = gameState.playerBot.icon;
  const isDiceBear = currentIconId === 'DiceBear';
  const CurrentIconComponent = !isDiceBear ? (IconMap[currentIconId] || IconMap.Cpu) : null;

  // --- LEVELING LOGIC ---
  const currentLevel = gameState.playerBot?.level || 1;
  const upgradeCost = Math.floor(500 * Math.pow(1.5, currentLevel - 1));
  const availablePoints = gameState.playerBot?.statPoints || 0;

  const handleLevelUp = () => {
    if (gameState.scrap < upgradeCost) {
        toast({ title: "INSUFFICIENT FUNDS", description: `Required: ${upgradeCost} Scrap`, variant: "destructive", className: "font-mono" });
        return;
    }

    setGameState(prev => ({
        ...prev,
        scrap: prev.scrap - upgradeCost,
        playerBot: {
            ...prev.playerBot,
            level: (prev.playerBot.level || 1) + 1,
            statPoints: (prev.playerBot.statPoints || 0) + 3 
        }
    }));
    playSound('LEVEL_UP');
    toast({
        title: "SYSTEM UPGRADE",
        description: `Unit upgraded to Level ${currentLevel + 1}. +3 Stat Points acquired.`,
        className: "bg-green-900 border-green-500 text-white font-mono"
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
                    [statKey]: currentBonus + 1 
                }
            }
        };
    });
    playSound('CLICK');
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };
  
  const handleUnequip = (slot) => {
    unequipPart(slot);
    toast({
      title: "PART UNEQUIPPED",
      description: "COMPONENT RETURNED TO INVENTORY",
      className: "font-mono uppercase bg-black border border-[var(--accent-color)] text-[var(--accent-color)]"
    });
  };

  const handleUpgrade = (slotKey, slotNameLabel) => {
    const slotMapping = {
      [PART_SLOTS.HEAD]: 'head',
      [PART_SLOTS.RIGHT_ARM]: 'rightArm',
      [PART_SLOTS.LEFT_ARM]: 'leftArm',
      [PART_SLOTS.CHASSIS]: 'chassis'
    };

    const internalSlotName = slotMapping[slotKey];
    
    if (upgradeSlot(internalSlotName)) {
      playSound('EQUIP'); 
      toast({
        title: "UPGRADE SUCCESSFUL",
        description: `${slotNameLabel} SYSTEM OPTIMIZED TO LEVEL ${gameState.slotLevels[internalSlotName] + 1}`,
        className: "bg-[rgba(var(--accent-rgb),0.1)] border border-[var(--accent-color)] text-[var(--accent-color)] font-mono uppercase"
      });
    } else {
      toast({
        title: "INSUFFICIENT RESOURCES",
        description: "ADDITIONAL SCRAP REQUIRED FOR OPTIMIZATION.",
        variant: "destructive",
        className: "font-mono uppercase"
      });
    }
  };

  const handleProfileSave = (newName, newIconId) => {
    // 1. Update Icon
    updateBotIcon(newIconId);
    
    // 2. Update Name (You might need to expose updateBotName in GameContext or just do it manually here)
    // Assuming updateBotName doesn't exist, we do it manually via setGameState
    if (newName !== gameState.playerBot.name) {
        setGameState(prev => ({
            ...prev,
            playerBot: {
                ...prev.playerBot,
                name: newName
            }
        }));
    }

    playSound('CLICK');
    setIsAvatarModalOpen(false);
  };
  
  const slots = [
    { key: PART_SLOTS.HEAD, label: 'Head', internalKey: 'head' },
    { key: PART_SLOTS.RIGHT_ARM, label: 'Right Arm', internalKey: 'rightArm' },
    { key: PART_SLOTS.LEFT_ARM, label: 'Left Arm', internalKey: 'leftArm' },
    { key: PART_SLOTS.CHASSIS, label: 'Chassis', internalKey: 'chassis' }
  ];

  return (
    <>
      <Helmet>
        <title>Workshop - Robot Battle Arena</title>
      </Helmet>
      
      {/* 1. BACKGROUND LAYER */}
      <ScreenBackground image={weapDepot} opacity={0.4} />

      {/* 2. MAIN CONTENT */}
      <div className="min-h-screen bg-transparent font-mono text-[#e0e0e0] flex flex-col overflow-y-auto relative z-10 pb-12">
        
        {/* HEADER SECTION */}
        <div className="bg-black/80 border-b border-[var(--accent-color)] backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                
                <div className="text-center md:text-left flex items-center gap-4">
                    <Button 
                        onClick={() => navigate('/hub')} 
                        variant="ghost" 
                        className="text-gray-400 hover:text-[var(--accent-color)] p-0 h-auto hover:bg-transparent"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--accent-color)] uppercase tracking-widest [text-shadow:0_0_15px_rgba(var(--accent-rgb),0.5)] leading-none">
                            Workshop
                        </h1>
                        <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                            <span className="w-2 h-2 bg-green-500 animate-pulse rounded-full" />
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">System Configuration</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8 bg-[#050505] border border-gray-800 rounded-sm px-6 py-2">
                    <div className="flex items-center gap-3">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Scrap</span>
                            <span className="text-lg font-bold text-yellow-500 leading-none">{gameState.scrap}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* WORKSHOP CONTENT */}
        <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6">
          
          {/* COMPACT IDENTITY SECTION */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 bg-black/60 border border-gray-800 p-4 max-w-2xl mx-auto backdrop-blur-md">
                
                <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
                    <div className="w-16 h-16 border-2 border-[var(--accent-color)] flex items-center justify-center bg-black shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)] group-hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)] transition-all overflow-hidden">
                        {isDiceBear ? (
                             <img 
                                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(gameState.playerBot.name)}`}
                                alt="Bot Avatar"
                                className="w-full h-full object-contain"
                             />
                        ) : (
                             <CurrentIconComponent className="w-8 h-8 text-[var(--accent-color)]" />
                        )}
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--accent-color)] text-black text-[8px] font-bold px-2 py-0.5 uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Edit Profile
                    </div>
                </div>

                <div className="flex-1 space-y-2 w-full md:w-auto text-left">
                    <div className="flex justify-center md:justify-start">
                        {/* We removed BotNameEditor here because the Modal handles editing now. 
                            We just display the name nicely. */}
                        <div 
                            onClick={() => setIsAvatarModalOpen(true)}
                            className="text-2xl font-black uppercase tracking-widest text-white hover:text-[var(--accent-color)] cursor-pointer transition-colors border-b border-transparent hover:border-[var(--accent-color)]"
                        >
                            {gameState.playerBot.name}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
                            <Palette className="w-3 h-3" />
                            <span>Theme</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative inline-block">
                                <select 
                                value={gameState.currentTheme}
                                onChange={(e) => setCurrentTheme(e.target.value)}
                                className="appearance-none bg-black border border-gray-700 hover:border-[var(--accent-color)] text-[var(--accent-color)] px-2 py-1 pr-6 rounded-none uppercase text-[10px] font-bold tracking-wider cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] w-32"
                                >
                                {gameState.unlockedThemes.map(theme => (
                                    <option key={theme} value={theme}>{theme}</option>
                                ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--accent-color)]">
                                    <ChevronUp className="h-2 w-2 transform rotate-180" />
                                </div>
                            </div>
                            <div 
                                className="w-6 h-6 border border-white/20 transition-colors duration-300" 
                                style={{ 
                                backgroundColor: THEMES[gameState.currentTheme]?.hex || '#00ff9d',
                                boxShadow: `0 0 5px ${THEMES[gameState.currentTheme]?.hex || '#00ff9d'}`
                                }} 
                            />
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
          
          {/* Main Layout Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            
            {/* Equipment Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/60 backdrop-blur-md rounded-none p-4 border border-[var(--accent-color)] flex flex-col h-full"
            >
              <h3 className="text-sm font-bold text-[#e0e0e0] mb-2 uppercase tracking-widest border-b border-gray-800 pb-2 text-center flex items-center justify-center gap-2">
                 <LucideIcons.Wrench className="w-4 h-4" /> Components
              </h3>

              <div className="grid grid-cols-2 gap-2 mt-2 flex-1">
                {slots.map(({ key, label, internalKey }) => {
                  const partId = gameState.playerBot.equipment[key];
                  const part = partId ? getPartById(partId) : null;
                  const Icon = part ? IconMap[part.icon] : IconMap.Box;
                  const colors = part ? RARITY_COLORS[part.tier] : null;
                  const currentLevel = gameState.slotLevels[internalKey] || 0;
                  const upgradeCost = 100 * (currentLevel + 1);
                  
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-[var(--accent-color)] opacity-70">Lv. {currentLevel}</span>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSlotClick(key)}
                        className={cn(
                          "rounded-none p-2 border cursor-pointer transition-all h-24 flex flex-col items-center justify-center relative bg-black/80",
                          part ? colors.border : "border-gray-800 hover:border-[var(--accent-color)]",
                          part ? "hover:bg-[rgba(var(--accent-rgb),0.05)]" : "border-dashed"
                        )}
                      >
                        <Icon className={cn("w-8 h-8 mb-1", part ? colors.text : "text-gray-700")} />
                        <div className="text-[9px] text-[#e0e0e0] text-center font-bold truncate w-full px-1 uppercase tracking-widest">
                          {part ? part.name : 'EMPTY'}
                        </div>
                        {part && (
                           <div className="mt-1">
                             <RarityBadge tier={part.tier} className="rounded-none scale-[0.6] origin-top" />
                           </div>
                        )}
                      </motion.div>
                      
                      <div className="flex gap-1">
                          <Button
                            onClick={() => handleUpgrade(key, label)}
                            size="sm"
                            className="flex-1 bg-green-900/10 border border-green-600/30 text-green-400 hover:bg-green-600/20 text-[8px] rounded-none uppercase tracking-tight h-6"
                          >
                            <ChevronUp className="w-2 h-2 mr-1" />
                            Up ({upgradeCost})
                          </Button>
                          
                          {part && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnequip(key);
                              }}
                              variant="outline"
                              size="sm"
                              className="bg-red-900/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 px-2 rounded-none h-6"
                            >
                              X
                            </Button>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
            
            {/* Stats Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/60 backdrop-blur-md rounded-none p-4 border border-[var(--accent-color)] h-full flex flex-col"
            >
              <h3 className="text-sm font-bold text-[#e0e0e0] mb-4 uppercase tracking-widest border-b border-gray-800 pb-2 flex items-center gap-2">
                 <LucideIcons.Activity className="w-4 h-4" /> Diagnostics
              </h3>
              <StatDisplay stats={stats} className="gap-2 font-mono" />
              
              <div className="mt-auto pt-4 space-y-2 font-mono text-xs">
                <div className="p-3 bg-blue-900/10 rounded-none border-l-4 border-blue-500">
                  <p className="text-blue-400 uppercase tracking-wide flex gap-2 text-[10px]">
                    <LucideIcons.Info className="w-3 h-3 shrink-0" />
                    <span>Slot Upgrades Boost equipped item stats by <span className="text-white font-bold">10%</span> per level.</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FIRMWARE SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-12 gap-4 border-t border-gray-800 pt-4"
          >
              <div className="md:col-span-4 bg-black/60 backdrop-blur-md border border-gray-800 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[var(--accent-color)]" />
                        Firmware
                    </h3>
                    <p className="text-[10px] text-gray-500 mb-4 font-mono">
                        Increase Core Level to unlock stat points. <br/>
                        Level: <span className="text-[var(--accent-color)] font-bold text-sm">{currentLevel}</span>
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleLevelUp}
                    disabled={gameState.scrap < upgradeCost}
                    className={cn(
                        "w-full h-12 flex flex-col items-center justify-center rounded-sm transition-all border",
                        gameState.scrap >= upgradeCost 
                            ? "bg-[var(--accent-color)] text-black border-white hover:bg-white" 
                            : "bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed"
                    )}
                  >
                    <span className="font-black uppercase tracking-widest text-xs">LEVEL UP</span>
                    <span className="text-[10px] font-mono">{upgradeCost} SCRAP</span>
                  </Button>
              </div>

              <div className="md:col-span-8 bg-black/60 backdrop-blur-md border border-gray-800 p-4">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Optimization
                    </h3>
                    <span className={cn("text-[10px] font-mono font-bold px-2 py-1 border", availablePoints > 0 ? "bg-[var(--accent-color)] text-black border-[var(--accent-color)] animate-pulse" : "text-gray-600 border-gray-800")}>
                        {availablePoints} PTS AVAILABLE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(STAT_CONFIG).map(([key, config]) => {
                        const currentVal = gameState.playerBot?.baseStats?.[key] || 0;
                        const Icon = config.icon;
                        
                        return (
                            <div key={key} className="bg-black border border-gray-800 p-2 flex items-center justify-between group hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-1.5 bg-gray-900 rounded-sm", config.color)}>
                                        <Icon className="w-3 h-3" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{config.label}</div>
                                        <div className="text-[8px] text-gray-600 font-mono">{config.desc}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-sm text-white">+{currentVal}</span>
                                    <Button
                                        onClick={() => handleAllocatePoint(key)}
                                        disabled={availablePoints <= 0}
                                        size="sm"
                                        className={cn(
                                            "h-6 w-6 p-0 rounded-sm border",
                                            availablePoints > 0 
                                                ? "bg-gray-800 hover:bg-[var(--accent-color)] hover:text-black border-gray-600 hover:border-white" 
                                                : "bg-black text-gray-700 border-gray-900 cursor-not-allowed"
                                        )}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                  </div>
              </div>
          </motion.div>

        </div>
      </div>
      
      {/* 4. MODALS */}
      {/* Use the new unified modal */}
      <AvatarSelectionModal 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)} 
        currentName={gameState.playerBot.name}
        currentIcon={gameState.playerBot.icon}
        onSave={handleProfileSave}
      />

      {selectedSlot && (
        <PartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          slot={selectedSlot}
          currentPartId={gameState.playerBot.equipment[selectedSlot]}
          availableParts={gameState.inventory}
          onEquip={(id, slot) => {
            playSound('EQUIP');
            equipPart(id, slot);
          }}
        />
      )}
    </>
  );
};

export default Workshop;