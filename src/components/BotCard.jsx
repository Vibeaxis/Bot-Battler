import React, { useState } from 'react';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
// Import the full Rarity Object so we can look up colors by ID
import { RARITY_COLORS } from '@/constants/gameConstants'; 
import RarityBadge from './RarityBadge';
import { cn } from '@/lib/utils';
import { calculateBotStats } from '@/utils/statCalculator';

// --- FIXED SVG COMPONENTS (No Changes Needed Here) ---
const SchematicSkeleton = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
    </defs>
    <path d="M 50 15 L 50 85" stroke="currentColor" strokeWidth="2" fill="none" className="text-[var(--accent-color)]" vectorEffect="non-scaling-stroke" />
    <path d="M 50 25 L 20 25 L 20 40" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-500" vectorEffect="non-scaling-stroke" />
    <path d="M 50 25 L 80 25 L 80 40" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-500" vectorEffect="non-scaling-stroke" />
    <circle cx="50" cy="50" r="3" fill="currentColor" className="text-[var(--accent-color)]" />
  </svg>
);

const TechFrame = ({ children, className, isActive, colorClass = "text-gray-800" }) => (
  <div className={`relative ${className}`}>
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
      <path 
        d="M 0 10 L 10 0 L 90 0 L 100 10 L 100 90 L 90 100 L 10 100 L 0 90 Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        className={isActive ? "text-[var(--accent-color)] drop-shadow-[0_0_5px_rgba(var(--accent-rgb),0.8)]" : colorClass}
      />
    </svg>
    <div 
        className="relative z-10 w-full h-full flex flex-col items-center justify-center overflow-hidden"
        style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%)' }}
    >
        {children}
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const injectStyles = () => {
  if (typeof document === 'undefined') return;
  const styleId = 'bot-card-animations';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    @keyframes lunge-right { 0% { transform: translateX(0); } 20% { transform: translateX(-15px); } 40% { transform: translateX(40px); } 100% { transform: translateX(0); } }
    @keyframes lunge-left { 0% { transform: translateX(0); } 20% { transform: translateX(15px); } 40% { transform: translateX(-40px); } 100% { transform: translateX(0); } }
    .animate-attack-right { animation: lunge-right 0.3s ease-out !important; }
    .animate-attack-left { animation: lunge-left 0.3s ease-out !important; }
  `;
  document.head.appendChild(style);
};
injectStyles();

const IconMap = { ...LucideIcons };

// Helper map to convert string IDs (common, rare) to integer Tiers (1, 3) for color lookup
const RARITY_MAP = {
    'common': 1,
    'uncommon': 2,
    'rare': 3,
    'epic': 4,
    'legendary': 5,
    'omega': 6,
    'mythic': 7
};

const BotCard = ({ bot, slotLevels, isAttacking, side = 'player', className = '' }) => {
  const [hoveredPart, setHoveredPart] = useState(null);

  const stats = calculateBotStats({ ...bot, slotLevels: slotLevels || bot.slotLevels });
  
  const slots = [
    { key: 'Head', partId: bot.equipment.Head, gridClass: 'col-span-2 w-3/4 mx-auto' },
    { key: 'LeftArm', partId: bot.equipment.LeftArm, gridClass: 'col-span-1' },
    { key: 'RightArm', partId: bot.equipment.RightArm, gridClass: 'col-span-1' },
    { key: 'Chassis', partId: bot.equipment.Chassis, gridClass: 'col-span-2 w-full' }
  ];

  const BotIcon = IconMap[bot.icon] || IconMap.Cpu;
  const DmgIcon = IconMap.Zap;
  const SpdIcon = IconMap.Activity;
  const ArmIcon = IconMap.Shield;
  const WgtIcon = IconMap.Weight;

  // Determine Bot Rarity Color
  // 1. If it has a rarityId (from enemy generator), use that.
  // 2. Otherwise default to 'text-white'
  let nameColorClass = 'text-white';
  
  if (bot.rarityId && RARITY_MAP[bot.rarityId]) {
      const tier = RARITY_MAP[bot.rarityId];
      if (RARITY_COLORS[tier]) {
          nameColorClass = RARITY_COLORS[tier].text;
      }
  }

  const StatBox = ({ label, value, icon: Icon, colorClass, borderClass }) => (
    <div className={`bg-[#111] border ${borderClass} px-2 py-1.5 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
            <Icon className={`w-3 h-3 ${colorClass}`} />
            <span className="text-[10px] font-mono text-gray-500 font-bold">{label}</span>
        </div>
        <span className={`text-sm font-bold ${colorClass.replace('text-', 'text-opacity-80 ')} font-mono tracking-tighter`}>
            {value}
        </span>
    </div>
  );

  return (
    <div className={cn(
      "flex flex-col shrink-0 w-72 md:w-80 h-auto bg-[#09090b] rounded-none border-2 border-[var(--accent-color)] shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] relative z-10",
      className
    )}>
      
      {/* Top Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-70" />

      {/* Header */}
      <div className="p-3 bg-[#0a0a0a] border-b-2 border-[var(--accent-color)] flex items-center gap-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--accent-color)] opacity-5" />
        <div className="p-1.5 shrink-0 bg-black border border-[var(--accent-color)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)]">
          <BotIcon className="w-5 h-5 text-[var(--accent-color)]" />
        </div>
        <div className="flex-1 min-w-0">
          {/* CHANGED: Added nameColorClass to h3 */}
          <h3 className={cn(
             "text-lg font-black truncate font-mono uppercase tracking-widest drop-shadow-md",
             nameColorClass // Applies the rarity color (e.g., text-blue-400)
          )}>
            {bot.name}
          </h3>
          <div className="text-[9px] text-gray-500 font-mono tracking-widest flex items-center gap-2">
            <span>LVL {bot.level || 1}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            {/* Added Bot Rarity text if available */}
            {bot.rarity ? (
                <span className={nameColorClass}>{bot.rarity.toUpperCase()}</span>
            ) : (
                <span>{side === 'player' ? 'OPERATOR' : 'TARGET'}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Grid */}
      <div className="relative p-3 bg-[#050505] min-h-[220px]">
        <SchematicSkeleton />

        <div className="grid grid-cols-2 gap-3 relative z-10">
            {slots.map(({ key, partId, gridClass }, index) => {
                const part = partId ? getPartById(partId) : null;
                const Icon = (part ? IconMap[part.icon] : null) || IconMap.Box;
                const tier = part ? part.tier : 1;
                const colors = RARITY_COLORS[tier] || RARITY_COLORS[1];
                
                const shouldAnimateArm = isAttacking && (
                    (side === 'player' && key === 'RightArm') || 
                    (side === 'enemy' && key === 'LeftArm')
                );

                return (
                    <div 
                        key={`${key}-${index}`} 
                        className={cn(
                            `relative group ${gridClass}`,
                            shouldAnimateArm && (side === 'player' ? 'animate-attack-right' : 'animate-attack-left')
                        )}
                        onMouseEnter={() => part && setHoveredPart({ ...part, slotKey: key })}
                        onMouseLeave={() => setHoveredPart(null)}
                    >
                        <TechFrame 
                            className="w-full aspect-square max-h-20 transition-all duration-200 cursor-help"
                            isActive={shouldAnimateArm || (hoveredPart && hoveredPart.id === part?.id)}
                            colorClass={part ? "text-gray-700" : "text-gray-900"}
                        >
                            <div className={cn(
                                "absolute inset-0 flex flex-col items-center justify-center transition-colors duration-300",
                                part ? "bg-[#111]" : "bg-[#080808]",
                                shouldAnimateArm && "bg-[#1a1a1a]",
                                hoveredPart && hoveredPart.id === part?.id && "bg-[#161616]"
                            )}>
                                <span className="absolute top-1 left-2 text-[8px] font-mono text-gray-700 uppercase tracking-widest pointer-events-none">
                                    {key.replace('Arm', '')}
                                </span>

                                <Icon className={cn(
                                    "w-8 h-8 mb-1 transition-transform duration-300", 
                                    part ? colors.text : "text-gray-800",
                                    (hoveredPart && hoveredPart.id === part?.id) ? "scale-110 brightness-125" : ""
                                )} />
                                
                                {part && (
                                    <RarityBadge tier={tier} className="rounded-none text-[8px] px-1.5 py-0 border border-white/10" />
                                )}
                            </div>
                        </TechFrame>
                    </div>
                );
            })}
        </div>
      </div>
      
      {/* Contextual Footer */}
      <div className="p-3 bg-[#080808] border-t-2 border-[var(--accent-color)] mt-auto relative z-20 min-h-[85px] flex flex-col justify-center">
        
        {hoveredPart ? (
            // MODE A: ITEM SCAN (Hover)
            <div className="animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-800">
                    <span className={`text-xs font-bold uppercase font-mono ${RARITY_COLORS[hoveredPart.tier].text}`}>
                        {hoveredPart.name}
                    </span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">
                        {hoveredPart.slotKey}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                      <StatBox label="DMG" value={hoveredPart.stats.Damage || 0} icon={DmgIcon} colorClass="text-red-500" borderClass="border-red-900/30" />
                      <StatBox label="SPD" value={hoveredPart.stats.Speed || 0} icon={SpdIcon} colorClass="text-cyan-400" borderClass="border-cyan-900/30" />
                      <StatBox label="ARM" value={hoveredPart.stats.Armor || 0} icon={ArmIcon} colorClass="text-emerald-500" borderClass="border-emerald-900/30" />
                      <StatBox label="WGT" value={hoveredPart.stats.Weight || 0} icon={WgtIcon} colorClass="text-amber-500" borderClass="border-amber-900/30" />
                </div>
            </div>
        ) : (
            // MODE B: BOT TOTALS (Default)
            <div className="animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-2">
                    <StatBox label="DMG" value={stats.Damage} icon={DmgIcon} colorClass="text-red-500" borderClass="border-red-900/30" />
                    <StatBox label="SPD" value={stats.Speed} icon={SpdIcon} colorClass="text-cyan-400" borderClass="border-cyan-900/30" />
                    <StatBox label="ARM" value={stats.Armor} icon={ArmIcon} colorClass="text-emerald-500" borderClass="border-emerald-900/30" />
                    <StatBox label="WGT" value={stats.Weight} icon={WgtIcon} colorClass="text-amber-500" borderClass="border-amber-900/30" />
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default BotCard;