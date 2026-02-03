import React from 'react';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { RARITY_COLORS } from '@/constants/gameConstants';
import RarityBadge from './RarityBadge';
import { cn } from '@/lib/utils';
import { calculateBotStats } from '@/utils/statCalculator';

// --- VISUAL ASSETS ---

// 1. The SVG Skeleton that connects the parts
const SchematicSkeleton = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 0 }}>
    <defs>
      <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
    </defs>
    
    {/* Central Spine */}
    <path 
      d="M 50% 15% L 50% 85%" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none" 
      className="text-[var(--accent-color)]"
    />
    
    {/* Shoulder Connections (Head to Arms) */}
    <path 
      d="M 50% 25% L 20% 25% L 20% 40%" 
      stroke="currentColor" 
      strokeWidth="1" 
      fill="none" 
      className="text-gray-500"
    />
    <path 
      d="M 50% 25% L 80% 25% L 80% 40%" 
      stroke="currentColor" 
      strokeWidth="1" 
      fill="none" 
      className="text-gray-500"
    />

    {/* Chassis Connection */}
    <circle cx="50%" cy="50%" r="3" fill="currentColor" className="text-[var(--accent-color)]" />
    <rect x="45%" y="45%" width="10%" height="10%" fill="none" stroke="currentColor" className="text-gray-700" />
  </svg>
);

// 2. The Custom SVG Border for Slots (Chamfered Corners)
const TechFrame = ({ children, className, isActive, colorClass = "text-gray-800" }) => (
  <div className={`relative ${className}`}>
    {/* The SVG Frame */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <path 
        d="M 1 10 L 10 1 L calc(100% - 10px) 1 L calc(100% - 1px) 10 L calc(100% - 1px) calc(100% - 10px) L calc(100% - 10px) calc(100% - 1px) L 10 calc(100% - 1px) L 1 calc(100% - 10px) Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        className={isActive ? "text-[var(--accent-color)] drop-shadow-[0_0_5px_rgba(var(--accent-rgb),0.8)]" : colorClass}
      />
      {/* Decorative Corners */}
      <path d="M 1 10 L 10 1" stroke="currentColor" strokeWidth="3" className={isActive ? "text-[var(--accent-color)]" : "text-gray-700"} />
      <path d="M calc(100% - 1px) calc(100% - 10px) L calc(100% - 10px) calc(100% - 1px)" stroke="currentColor" strokeWidth="3" className={isActive ? "text-[var(--accent-color)]" : "text-gray-700"} />
    </svg>
    
    {/* Content Container with Clip Path to match Frame */}
    <div 
        className="relative z-10 w-full h-full flex flex-col items-center justify-center overflow-hidden"
        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
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

const BotCard = ({ bot, slotLevels, isAttacking, side = 'player', className = '' }) => {
  const stats = calculateBotStats({ ...bot, slotLevels: slotLevels || bot.slotLevels });
  
  const slots = [
    { key: 'Head', partId: bot.equipment.Head, gridClass: 'col-span-2 w-3/4 mx-auto' }, // Centered Head
    { key: 'LeftArm', partId: bot.equipment.LeftArm, gridClass: 'col-span-1' },
    { key: 'RightArm', partId: bot.equipment.RightArm, gridClass: 'col-span-1' },
    { key: 'Chassis', partId: bot.equipment.Chassis, gridClass: 'col-span-2 w-full' }
  ];

  const BotIcon = IconMap[bot.icon] || IconMap.Cpu;
  const DmgIcon = IconMap.Zap;
  const SpdIcon = IconMap.Activity;
  const ArmIcon = IconMap.Shield;
  const WgtIcon = IconMap.Weight;

  return (
    <div className={cn(
      "flex flex-col shrink-0 w-72 md:w-80 h-auto bg-[#09090b] rounded-none border-2 border-[var(--accent-color)] shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] relative z-10",
      className
    )}>
      
      {/* Decorative Top Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-70" />

      {/* Header */}
      <div className="p-3 bg-[#0a0a0a] border-b-2 border-[var(--accent-color)] flex items-center gap-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--accent-color)] opacity-5" />
        <div className="p-1.5 shrink-0 bg-black border border-[var(--accent-color)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)]">
          <BotIcon className="w-5 h-5 text-[var(--accent-color)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-white truncate font-mono uppercase tracking-widest drop-shadow-md">
            {bot.name}
          </h3>
          <div className="text-[9px] text-gray-500 font-mono tracking-widest flex items-center gap-2">
            <span>LVL {bot.level || 1}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>{side === 'player' ? 'OPERATOR' : 'TARGET'}</span>
          </div>
        </div>
      </div>
      
      {/* --- THE SCHEMATIC GRID --- */}
      <div className="relative p-3 bg-[#050505] min-h-[220px]">
        {/* Background SVG connecting the parts */}
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
                >
                    {/* Replaced standard div with TechFrame */}
                    <TechFrame 
                        className="w-full aspect-square max-h-20 transition-all duration-200"
                        isActive={shouldAnimateArm}
                        colorClass={part ? "text-gray-700" : "text-gray-900"}
                    >
                        {/* Inner Content */}
                        <div className={cn(
                            "absolute inset-0 flex flex-col items-center justify-center transition-colors duration-300",
                            part ? "bg-[#111]" : "bg-[#080808]",
                            shouldAnimateArm && "bg-[#1a1a1a]"
                        )}>
                            <span className="absolute top-1 left-2 text-[8px] font-mono text-gray-700 uppercase tracking-widest pointer-events-none">
                                {key.replace('Arm', '')}
                            </span>

                            <Icon className={cn(
                                "w-8 h-8 mb-1 transition-transform duration-300", 
                                part ? colors.text : "text-gray-800",
                                "group-hover:scale-110",
                                shouldAnimateArm && "scale-110 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                            )} />
                            
                            {part && (
                                <RarityBadge tier={tier} className="rounded-none text-[8px] px-1.5 py-0 border border-white/10" />
                            )}
                        </div>
                    </TechFrame>

                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] z-[60] w-56 hidden group-hover:block pointer-events-none">
                        <div className="bg-gray-900 text-gray-100 text-xs p-2 border border-gray-700 shadow-2xl relative">
                            <div className={cn("font-bold text-xs mb-1 font-mono uppercase border-b border-gray-800 pb-1", part ? colors.text : "text-gray-400")}>
                                {part ? part.name : 'Empty Slot'}
                            </div>
                            {part && (
                                <div className="space-y-1 pt-1 font-mono text-[10px]">
                                    <div className="flex justify-between"><span>DMG:</span> <span className="text-white">{part.stats.Damage}</span></div>
                                    <div className="flex justify-between"><span>SPD:</span> <span className="text-white">{part.stats.Speed}</span></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
            })}
        </div>
      </div>
      
      {/* Footer Stats */}
      <div className="p-3 bg-[#080808] border-t-2 border-[var(--accent-color)] mt-auto relative z-20">
        <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#111] border border-red-900/30 px-2 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DmgIcon className="w-3 h-3 text-red-600" />
                    <span className="text-[10px] font-mono text-gray-500 font-bold">DMG</span>
                </div>
                <span className="text-sm font-bold text-red-500 font-mono tracking-tighter">{stats.Damage}</span>
            </div>
            
            <div className="bg-[#111] border border-cyan-900/30 px-2 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SpdIcon className="w-3 h-3 text-cyan-500" />
                    <span className="text-[10px] font-mono text-gray-500 font-bold">SPD</span>
                </div>
                <span className="text-sm font-bold text-cyan-400 font-mono tracking-tighter">{stats.Speed}</span>
            </div>

            <div className="bg-[#111] border border-emerald-900/30 px-2 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ArmIcon className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-mono text-gray-500 font-bold">ARM</span>
                </div>
                <span className="text-sm font-bold text-emerald-500 font-mono tracking-tighter">{stats.Armor}</span>
            </div>

            <div className="bg-[#111] border border-amber-900/30 px-2 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <WgtIcon className="w-3 h-3 text-amber-600" />
                    <span className="text-[10px] font-mono text-gray-500 font-bold">WGT</span>
                </div>
                <span className="text-sm font-bold text-amber-500 font-mono tracking-tighter">{stats.Weight}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BotCard;