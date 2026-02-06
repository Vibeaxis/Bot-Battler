import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Package, Sword, ArrowLeft, Hexagon } from 'lucide-react';
import BotCard from './BotCard';
import { RARITY_COLORS } from '@/constants/gameConstants';
import RarityBadge from './RarityBadge';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameContext, THEMES } from '@/context/GameContext';

const IconMap = { ...LucideIcons };

// --- TECH LOOT CARD ---
const LootCard = ({ icon: DefaultIcon, name, quantity, tier = 1, delay, partId }) => {
  const colors = RARITY_COLORS[tier];
  const part = partId ? getPartById(partId) : null;
  const Icon = part ? (IconMap[part.icon] || DefaultIcon) : DefaultIcon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className={cn(
        "relative group flex items-center gap-4 p-3 pr-6 rounded-sm border bg-black/60 overflow-hidden hover:bg-white/5 transition-colors shrink-0 max-w-full",
        colors.border
      )}
    >
      {/* Rarity Color Bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", colors.bg)} />
      
      {/* Icon Box */}
      <div className={cn("shrink-0 w-12 h-12 flex items-center justify-center border bg-black shadow-inner", colors.border)}>
         <Icon className={cn("w-6 h-6", colors.text)} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col items-start">
         <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 truncate w-full">
           Recovered Item
         </span>
         <span className={cn("text-sm font-black uppercase truncate w-full", colors.text)}>
           {name}
         </span>
      </div>

      {/* Quantity Badge */}
      {!partId && (
        <div className="flex flex-col items-end shrink-0 ml-2">
             <span className="text-[10px] text-gray-500 font-mono">QTY</span>
             <span className="text-lg font-mono font-bold text-white">x{quantity}</span>
        </div>
      )}
      
      {/* Part Tier Badge */}
      {partId && (
         <RarityBadge tier={tier} className="scale-75 origin-right shrink-0 ml-2" />
      )}
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
    </motion.div>
  );
};

const ScavengeModal = ({ isOpen, onNextBattle, onReturn, enemy, rewards }) => {
  const { gameState } = useGameContext();
  
  // Theme logic
  const themeKey = gameState?.currentTheme || 'Green';
  const currentTheme = THEMES[themeKey] || THEMES['Green'];
  const accentHex = currentTheme.hex;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Darkened Backdrop with Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
             <div className="absolute inset-0 opacity-10" 
                  style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
             />
        </motion.div>

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-5xl h-auto md:h-[600px] flex flex-col md:flex-row bg-[#080808] border border-gray-800 shadow-2xl overflow-hidden"
        >
           {/* Top Border Accent - Clean Gradient, No Shadow/Glow */}
           <div 
             className="absolute top-0 left-0 right-0 h-1" 
             style={{ 
               background: `linear-gradient(90deg, ${accentHex}, transparent, ${accentHex})`
             }} 
           />

          {/* --- LEFT SIDE: THE CASUALTY --- */}
          <div className="w-full md:w-1/2 p-8 relative flex flex-col items-center justify-center bg-black/40 border-b md:border-b-0 md:border-r border-gray-800">
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-transparent to-transparent" />
             
             <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 scale-90 md:scale-100"
             >
                <BotCard 
                    bot={enemy} 
                    currentHealth={0} 
                    maxHealth={100}
                    forceName={enemy.name} 
                    className="pointer-events-none shadow-2xl grayscale-[0.5]" 
                />
                
                {/* "DESTROYED" STAMP */}
                <motion.div 
                   initial={{ scale: 2, opacity: 0, rotate: -25 }}
                   animate={{ scale: 1, opacity: 1, rotate: -12 }}
                   transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[6px] border-red-600 px-8 py-2 rounded-lg text-red-600 font-black text-5xl uppercase tracking-tighter opacity-80 mix-blend-screen whitespace-nowrap z-20 pointer-events-none"
                   style={{ textShadow: "0 0 20px red" }}
                >
                   NEUTRALIZED
                </motion.div>
             </motion.div>
             
             <div className="mt-6 text-[10px] font-mono text-red-500/50 uppercase tracking-[0.5em]">
                 /// HOSTILE ELIMINATED ///
             </div>
          </div>

          {/* --- RIGHT SIDE: THE REWARD --- */}
          <div className="w-full md:w-1/2 p-8 flex flex-col relative h-full min-h-0 overflow-hidden">
             
             {/* Header */}
             <div className="mb-6 shrink-0">
                <motion.div 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="flex items-center gap-2 mb-2"
                >
                   <Hexagon 
                     className="w-4 h-4 animate-pulse" 
                     style={{ color: accentHex, fill: accentHex }} 
                   />
                   <span 
                     className="font-mono text-xs font-bold tracking-widest uppercase"
                     style={{ color: accentHex }}
                   >
                       Mission Successful
                   </span>
                </motion.div>
                
                {/* Clean VICTORY text - No Glow/Shadow */}
                <motion.h2 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 }}
                   className="text-5xl md:text-6xl font-black text-white italic tracking-tighter"
                >
                   VICTORY
                </motion.h2>
                <motion.div 
                   initial={{ w: 0 }}
                   animate={{ w: "100%" }}
                   transition={{ delay: 0.3, duration: 0.5 }}
                   className="h-px w-full mt-4 bg-gray-800"
                   style={{ 
                     backgroundImage: `linear-gradient(90deg, ${accentHex}, transparent)` 
                   }}
                />
             </div>

             {/* Loot Grid */}
             <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar min-h-0 w-full">
                <div className="flex flex-col gap-3 pb-2">
                   <span className="text-[10px] text-gray-500 font-mono uppercase mb-1 sticky top-0 bg-[#080808] z-10 py-1">
                       Salvage Manifest:
                   </span>
                   
                   <LootCard 
                       icon={Package} 
                       name="Scrap Metal" 
                       quantity={rewards.scrap} 
                       tier={1}
                       delay={0.3} 
                   />

                   {rewards.parts && rewards.parts.map((partId, i) => (
                       <LootCard 
                           key={i}
                           partId={partId}
                           tier={getPartById(partId)?.tier || 2}
                           name={getPartById(partId)?.name || "Unknown Part"}
                           delay={0.4 + (i * 0.1)}
                       />
                   ))}
                </div>
             </div>

             {/* Action Buttons */}
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 grid grid-cols-1 gap-3 shrink-0"
             >
                {/* Clean Button - Solid Color, No Glow */}
                <Button 
                   onClick={onNextBattle}
                   className="h-16 font-black text-lg uppercase tracking-wider relative overflow-hidden group clip-path-slant"
                   style={{ 
                       backgroundColor: accentHex,
                       color: 'black' // Force black text for readability
                   }}
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                   <span className="flex items-center gap-3 relative z-10">
                      Next Engagement <Sword className="w-5 h-5" />
                   </span>
                </Button>
                
                <Button 
                   onClick={onReturn}
                   variant="ghost"
                   className="h-12 text-gray-500 hover:text-white font-mono text-xs uppercase tracking-widest hover:bg-white/5 border border-transparent hover:border-gray-800"
                >
                   <ArrowLeft className="w-4 h-4 mr-2" /> Return to Base
                </Button>
             </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScavengeModal;