
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext, THEMES } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronUp, Palette } from 'lucide-react';
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

const IconMap = { ...LucideIcons };

const Workshop = () => {
  const navigate = useNavigate();
  const { gameState, equipPart, unequipPart, upgradeSlot, setCurrentTheme } = useGameContext();
  const { playSound } = useSoundContext();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use utility with current slotLevels
  const stats = calculateBotStats({
    ...gameState.playerBot,
    slotLevels: gameState.slotLevels
  });
  
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
      playSound('EQUIP'); // Reusing equip sound for upgrade
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
      
      <div className="min-h-screen bg-[#0a0a12] p-4 font-mono text-[#e0e0e0] selection:bg-[var(--accent-color)] selection:text-black">
        
        <div className="relative max-w-6xl mx-auto py-8">
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
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold text-[var(--accent-color)] mb-2 uppercase tracking-widest [text-shadow:0_0_10px_var(--accent-color)]">Workshop</h1>
            <p className="text-xl text-gray-500 uppercase tracking-[0.2em] mb-6">System Configuration</p>
            
            <BotNameEditor />

            {/* Theme Selector */}
            <div className="mt-6 flex justify-center items-center gap-4">
              <label className="text-xs uppercase tracking-widest text-gray-500">System Theme:</label>
              <div className="relative inline-block">
                <select 
                  value={gameState.currentTheme}
                  onChange={(e) => setCurrentTheme(e.target.value)}
                  className="appearance-none bg-black border border-[var(--accent-color)] text-[var(--accent-color)] px-4 py-2 pr-8 rounded-none uppercase text-xs font-bold tracking-wider cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
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
                className="w-6 h-6 border border-white transition-colors duration-300" 
                style={{ 
                  backgroundColor: THEMES[gameState.currentTheme]?.hex || '#00ff9d',
                  boxShadow: `0 0 8px ${THEMES[gameState.currentTheme]?.hex || '#00ff9d'}`
                }} 
              />
            </div>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/80 rounded-none p-6 border border-[var(--accent-color)]"
            >
              <h3 className="text-xl font-bold text-[#e0e0e0] mb-4 uppercase tracking-widest border-b border-gray-800 pb-2 text-center">
                 Components
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6 mt-4">
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
                        <span className="text-blue-400">Lv. {currentLevel}</span>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSlotClick(key)}
                        className={cn(
                          "rounded-none p-4 border cursor-pointer transition-all h-40 flex flex-col items-center justify-center relative bg-black",
                          part ? colors.border : "border-gray-800 hover:border-[var(--accent-color)]",
                          part ? "hover:bg-[rgba(var(--accent-rgb),0.05)]" : "border-dashed"
                        )}
                      >
                        <Icon className={cn("w-12 h-12 mb-2", part ? colors.text : "text-gray-700")} />
                        <div className="text-[10px] text-[#e0e0e0] text-center font-bold truncate w-full px-2 uppercase tracking-widest">
                          {part ? part.name : 'EMPTY SLOT'}
                        </div>
                        {part && (
                           <div className="mt-2">
                             <RarityBadge tier={part.tier} className="rounded-none scale-90" />
                           </div>
                        )}
                      </motion.div>
                      
                      <div className="flex gap-2">
                         <Button
                            onClick={() => handleUpgrade(key, label)}
                            size="sm"
                            className="flex-1 bg-green-900/20 border border-green-600/50 text-green-400 hover:bg-green-600/20 text-[10px] rounded-none uppercase tracking-tight h-8"
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
                              className="bg-red-900/20 border border-red-600/50 text-red-400 hover:bg-red-600/20 px-2 rounded-none h-8"
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
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/80 rounded-none p-6 border border-[var(--accent-color)]"
            >
              <h3 className="text-xl font-bold text-[#e0e0e0] mb-6 uppercase tracking-widest border-b border-gray-800 pb-2">
                 System Diagnostics / Stats
              </h3>
              <StatDisplay stats={stats} className="gap-4 font-mono" />
              
              <div className="mt-8 space-y-4 font-mono text-xs">
                <div className="p-4 bg-blue-900/10 rounded-none border border-blue-500/30">
                  <p className="text-blue-400 uppercase tracking-wide">
                    [INFO] Slot Upgrades: Boost equipped item stats by <span className="text-white font-bold">10%</span> per level.
                  </p>
                </div>
                <div className="p-4 bg-purple-900/10 rounded-none border border-purple-500/30">
                   <p className="text-purple-400 uppercase tracking-wide">
                     [TIP] Upgrades are permanent to the chassis slot, persisting across weapon swaps.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
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
