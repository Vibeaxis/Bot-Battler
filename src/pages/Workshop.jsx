import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext, THEMES } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronUp, Palette, X, Zap, Activity, Shield, Weight, Plus } from 'lucide-react';
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

// --- STAT CONFIGURATION ---
const STAT_CONFIG = {
  Damage: { icon: Zap, color: "text-red-500", label: "Core Output", desc: "Base Damage Bonus" },
  Speed: { icon: Activity, color: "text-cyan-400", label: "Clock Speed", desc: "Base Speed Bonus" },
  Armor: { icon: Shield, color: "text-emerald-500", label: "Hull Integrity", desc: "Base Armor Bonus" },
  Weight: { icon: Weight, color: "text-amber-500", label: "Hydraulics", desc: "Max Weight Capacity" }
};

// --- 1. CURATED AVATAR LIST ---
const AVATAR_ICONS = [
  { id: 'Bot', icon: LucideIcons.Bot, label: 'Droid' },
  { id: 'Cpu', icon: LucideIcons.Cpu, label: 'Core' },
  { id: 'Skull', icon: LucideIcons.Skull, label: 'Reaper' },
  { id: 'Ghost', icon: LucideIcons.Ghost, label: 'Phantom' },
  { id: 'Zap', icon: LucideIcons.Zap, label: 'Volt' },
  { id: 'Shield', icon: LucideIcons.Shield, label: 'Guardian' },
  { id: 'Crosshair', icon: LucideIcons.Crosshair, label: 'Sniper' },
  { id: 'Swords', icon: LucideIcons.Swords, label: 'Brawler' },
  { id: 'Gamepad2', icon: LucideIcons.Gamepad2, label: 'Pilot' },
  { id: 'Radio', icon: LucideIcons.Radio, label: 'Comms' },
  { id: 'Fingerprint', icon: LucideIcons.Fingerprint, label: 'ID' },
  { id: 'Eye', icon: LucideIcons.Eye, label: 'Watcher' },
];

const IconMap = { ...LucideIcons };

// --- 2. AVATAR SELECTOR MODAL ---
const AvatarModal = ({ isOpen, onClose, currentIcon, onSelect }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
          className="bg-[#0a0a0a] border border-[var(--accent-color)] w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <LucideIcons.ScanFace className="text-[var(--accent-color)]" /> Select Avatar
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white"><X /></button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {AVATAR_ICONS.map((item) => {
              const Icon = item.icon;
              const isSelected = currentIcon === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center gap-2 border transition-all duration-200 group",
                    isSelected 
                      ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-black" 
                      : "bg-black border-gray-800 text-gray-500 hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                  )}
                >
                  <Icon className="w-8 h-8" />
                  <span className="text-[9px] uppercase font-bold tracking-wider">{item.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Workshop = () => {
  const navigate = useNavigate();
  const { gameState, setGameState, equipPart, unequipPart, upgradeSlot, setCurrentTheme, updateBotIcon } = useGameContext();
  const { playSound } = useSoundContext();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  
  const stats = calculateBotStats({
    ...gameState.playerBot,
    slotLevels: gameState.slotLevels
  });
  
  const CurrentBotIcon = IconMap[gameState.playerBot.icon] || IconMap.Cpu;

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

  const handleAvatarSelect = (iconId) => {
    updateBotIcon(iconId);
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
        <meta name="description" content="Customize your battle bot with different parts and equipment." />
      </Helmet>
      
      <div className="min-h-screen bg-[#0a0a12] p-4 pb-32 font-mono text-[#e0e0e0] selection:bg-[var(--accent-color)] selection:text-black">
        
        <div className="relative max-w-6xl mx-auto py-8">
          {/* Header Bar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 flex justify-between items-center"
          >
            <Button
              onClick={() => navigate('/hub')}
              variant="outline"
              className="bg-black text-[var(--accent-color)] border-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.1)] rounded-none uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>

            <div className="bg-black/80 px-4 py-2 border border-yellow-500/50 text-yellow-500 font-bold font-mono tracking-wider rounded-none">
              SCRAP: {gameState.scrap}
            </div>
          </motion.div>
          
          {/* Bot Identity Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 relative"
          >
            <h1 className="text-5xl font-bold text-[var(--accent-color)] mb-2 uppercase tracking-widest [text-shadow:0_0_10px_var(--accent-color)]">Workshop</h1>
            <p className="text-xl text-gray-500 uppercase tracking-[0.2em] mb-8">System Configuration</p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-black/40 border border-gray-800 p-6 max-w-3xl mx-auto">
                
                {/* AVATAR */}
                <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
                    <div className="w-24 h-24 border-2 border-[var(--accent-color)] flex items-center justify-center bg-black shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)] group-hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)] transition-all">
                        <CurrentBotIcon className="w-12 h-12 text-[var(--accent-color)]" />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--accent-color)] text-black text-[9px] font-bold px-2 py-0.5 uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Change Avatar
                    </div>
                </div>

                <div className="flex-1 space-y-4 w-full md:w-auto">
                    <div className="flex justify-center md:justify-start">
                        <BotNameEditor />
                    </div>

                    {/* Theme Selector */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                            <Palette className="w-4 h-4" />
                            <span>System Theme</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative inline-block">
                                <select 
                                value={gameState.currentTheme}
                                onChange={(e) => setCurrentTheme(e.target.value)}
                                className="appearance-none bg-black border border-gray-700 hover:border-[var(--accent-color)] text-[var(--accent-color)] px-4 py-2 pr-8 rounded-none uppercase text-xs font-bold tracking-wider cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] w-48"
                                >
                                {gameState.unlockedThemes.map(theme => (
                                    <option key={theme} value={theme}>{theme}</option>
                                ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--accent-color)]">
                                    <ChevronUp className="h-3 w-3 transform rotate-180" />
                                </div>
                            </div>
                            <div 
                                className="w-8 h-8 border border-white/20 transition-colors duration-300" 
                                style={{ 
                                backgroundColor: THEMES[gameState.currentTheme]?.hex || '#00ff9d',
                                boxShadow: `0 0 10px ${THEMES[gameState.currentTheme]?.hex || '#00ff9d'}`
                                }} 
                            />
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
          
          {/* Main Layout Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            
            {/* Equipment Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/80 rounded-none p-6 border border-[var(--accent-color)] flex flex-col h-full"
            >
              <h3 className="text-xl font-bold text-[#e0e0e0] mb-4 uppercase tracking-widest border-b border-gray-800 pb-2 text-center flex items-center justify-center gap-2">
                 <LucideIcons.Wrench className="w-5 h-5" /> Components
              </h3>

              <div className="grid grid-cols-2 gap-4 mt-4 flex-1">
                {slots.map(({ key, label, internalKey }) => {
                  const partId = gameState.playerBot.equipment[key];
                  const part = partId ? getPartById(partId) : null;
                  const Icon = part ? IconMap[part.icon] : IconMap.Box;
                  const colors = part ? RARITY_COLORS[part.tier] : null;
                  const currentLevel = gameState.slotLevels[internalKey] || 0;
                  const upgradeCost = 100 * (currentLevel + 1);
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center text-xs uppercase font-bold tracking-wider">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-[var(--accent-color)] opacity-70">Lv. {currentLevel}</span>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSlotClick(key)}
                        className={cn(
                          "rounded-none p-4 border cursor-pointer transition-all h-32 flex flex-col items-center justify-center relative bg-black",
                          part ? colors.border : "border-gray-800 hover:border-[var(--accent-color)]",
                          part ? "hover:bg-[rgba(var(--accent-rgb),0.05)]" : "border-dashed"
                        )}
                      >
                        <Icon className={cn("w-10 h-10 mb-2", part ? colors.text : "text-gray-700")} />
                        <div className="text-[10px] text-[#e0e0e0] text-center font-bold truncate w-full px-2 uppercase tracking-widest">
                          {part ? part.name : 'EMPTY SLOT'}
                        </div>
                        {part && (
                           <div className="mt-1">
                             <RarityBadge tier={part.tier} className="rounded-none scale-75 origin-top" />
                           </div>
                        )}
                      </motion.div>
                      
                      <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpgrade(key, label)}
                            size="sm"
                            className="flex-1 bg-green-900/10 border border-green-600/30 text-green-400 hover:bg-green-600/20 text-[9px] rounded-none uppercase tracking-tight h-7"
                          >
                            <ChevronUp className="w-3 h-3 mr-1" />
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
                              className="bg-red-900/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 px-2 rounded-none h-7"
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
              className="bg-black/80 rounded-none p-6 border border-[var(--accent-color)] h-full flex flex-col"
            >
              <h3 className="text-xl font-bold text-[#e0e0e0] mb-6 uppercase tracking-widest border-b border-gray-800 pb-2 flex items-center gap-2">
                 <LucideIcons.Activity className="w-5 h-5" /> Diagnostics
              </h3>
              <StatDisplay stats={stats} className="gap-4 font-mono" />
              
              <div className="mt-auto pt-8 space-y-4 font-mono text-xs">
                <div className="p-4 bg-blue-900/10 rounded-none border-l-4 border-blue-500">
                  <p className="text-blue-400 uppercase tracking-wide flex gap-2">
                    <LucideIcons.Info className="w-4 h-4 shrink-0" />
                    <span>Slot Upgrades Boost equipped item stats by <span className="text-white font-bold">10%</span> per level.</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- NEW SECTION: CORE UPGRADES (Injected Here) --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-12 gap-8 border-t border-gray-800 pt-8"
          >
             {/* LEFT: Firmware Upgrade */}
             <div className="md:col-span-4 bg-black/40 border border-gray-800 p-6 flex flex-col justify-between">
                 <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[var(--accent-color)]" />
                        Firmware Upgrade
                    </h3>
                    <p className="text-xs text-gray-500 mb-6 font-mono">
                        Increase Core Level to unlock stat points. <br/>
                        Current Level: <span className="text-[var(--accent-color)] font-bold text-lg">{currentLevel}</span>
                    </p>
                 </div>
                 
                 <Button 
                    onClick={handleLevelUp}
                    disabled={gameState.scrap < upgradeCost}
                    className={cn(
                        "w-full h-16 flex flex-col items-center justify-center rounded-sm transition-all border",
                        gameState.scrap >= upgradeCost 
                            ? "bg-[var(--accent-color)] text-black border-white hover:bg-white" 
                            : "bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed"
                    )}
                 >
                    <span className="font-black uppercase tracking-widest">LEVEL UP</span>
                    <span className="text-xs font-mono">{upgradeCost} SCRAP</span>
                 </Button>
             </div>

             {/* RIGHT: Core Optimization (Stats) */}
             <div className="md:col-span-8 bg-black/40 border border-gray-800 p-6">
                 <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-2">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Core Optimization
                    </h3>
                    <span className={cn("text-xs font-mono font-bold px-2 py-1 border", availablePoints > 0 ? "bg-[var(--accent-color)] text-black border-[var(--accent-color)] animate-pulse" : "text-gray-600 border-gray-800")}>
                        {availablePoints} POINTS AVAILABLE
                    </span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(STAT_CONFIG).map(([key, config]) => {
                        const currentVal = gameState.playerBot?.baseStats?.[key] || 0;
                        const Icon = config.icon;
                        
                        return (
                            <div key={key} className="bg-black border border-gray-800 p-3 flex items-center justify-between group hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 bg-gray-900 rounded-sm", config.color)}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">{config.label}</div>
                                        <div className="text-[9px] text-gray-600 font-mono">{config.desc}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-lg text-white">+{currentVal}</span>
                                    <Button
                                        onClick={() => handleAllocatePoint(key)}
                                        disabled={availablePoints <= 0}
                                        size="sm"
                                        className={cn(
                                            "h-8 w-8 p-0 rounded-sm border",
                                            availablePoints > 0 
                                                ? "bg-gray-800 hover:bg-[var(--accent-color)] hover:text-black border-gray-600 hover:border-white" 
                                                : "bg-black text-gray-700 border-gray-900 cursor-not-allowed"
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
          </motion.div>

        </div>
      </div>
      
      {/* Modals */}
      <AvatarModal 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)} 
        currentIcon={gameState.playerBot.icon}
        onSelect={handleAvatarSelect}
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