import React from 'react';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { RARITY_COLORS } from '@/constants/gameConstants';
import RarityBadge from './RarityBadge';
import { cn } from '@/lib/utils';
import { calculateBotStats } from '@/utils/statCalculator';

// Keep your existing CSS injection for animations
const injectStyles = () => {
  if (typeof document === 'undefined') return;
  const styleId = 'bot-card-animations';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    @keyframes lunge-right {
      0% { transform: translateX(0); }
      20% { transform: translateX(-15px); }
      40% { transform: translateX(40px); }
      100% { transform: translateX(0); }
    }
    @keyframes lunge-left {
      0% { transform: translateX(0); }
      20% { transform: translateX(15px); }
      40% { transform: translateX(-40px); }
      100% { transform: translateX(0); }
    }
    .animate-attack-right { animation: lunge-right 0.3s ease-out !important; }
    .animate-attack-left { animation: lunge-left 0.3s ease-out !important; }
  `;
  document.head.appendChild(style);
};
injectStyles();

const IconMap = { ...LucideIcons };

const BotCard = ({ bot, slotLevels, isAttacking, side = 'player', className = '' }) => {
  const stats = calculateBotStats({
    ...bot,
    slotLevels: slotLevels || bot.slotLevels
  });

  const slots = [
    { key: 'Head', partId: bot.equipment.Head, gridClass: 'col-span-2 w-full' },
    { key: 'LeftArm', partId: bot.equipment.LeftArm, gridClass: 'col-span-1' },
    { key: 'RightArm', partId: bot.equipment.RightArm, gridClass: 'col-span-1' },
    { key: 'Chassis', partId: bot.equipment.Chassis, gridClass: 'col-span-2 w-full' }
  ];

  const BotIcon = IconMap[bot.icon] || IconMap.Cpu;

  // Stat Icons for the footer
  const DmgIcon = IconMap.Zap;
  const SpdIcon = IconMap.Activity;
  const ArmIcon = IconMap.Shield;
  const WgtIcon = IconMap.Weight; // Or Scale/Box

  return (
    // CHANGED: Reduced width (w-80/96 -> w-72/80) for a tighter fit
    <div className={cn(
      "flex flex-col shrink-0 w-72 md:w-80 h-auto bg-[#09090b] rounded-none border-2 border-[var(--accent-color)] shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] relative z-10",
      className
    )}>
      
      {/* DECORATIVE: Top "Tech" Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-70" />

      {/* Header Section - Compacted Padding */}
      <div className="p-3 bg-[#0a0a0a] border-b-2 border-[var(--accent-color)] flex items-center gap-3 relative overflow-hidden">
        {/* Subtle background glow */}
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
      
      {/* Slots Grid - Reduced gap and padding */}
      <div className="p-3 grid grid-cols-2 gap-3 bg-[#050505]">
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
              <div 
                className={cn(
                  // CHANGED: max-h-24 -> max-h-20 to make cards shorter
                  "w-full aspect-square max-h-20 flex flex-col items-center justify-center border-2 transition-all duration-200 relative",
                  part ? "bg-[#111] border-gray-800" : "bg-[#080808] border-gray-900 border-dashed",
                  part && "group-hover:border-[var(--accent-color)] group-hover:bg-[#151515]",
                  shouldAnimateArm && "border-[var(--accent-color)] bg-[#1a1a1a] shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] z-20"
                )}
              >
                {/* Slot Label */}
                <span className="absolute top-1 left-1.5 text-[8px] font-mono text-gray-700 uppercase tracking-widest pointer-events-none">
                    {key.replace('Arm', '')}
                </span>

                <Icon className={cn(
                    // CHANGED: Icons slightly smaller
                    "w-8 h-8 mb-1 transition-transform duration-300", 
                    part ? colors.text : "text-gray-800",
                    "group-hover:scale-110"
                )} />
                
                {part && (
                    <RarityBadge tier={tier} className="rounded-none text-[8px] px-1.5 py-0 border border-white/10" />
                )}
              </div>

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
      
      {/* Footer Stats - REBUILT TO LOOK SLICK */}
      <div className="p-3 bg-[#080808] border-t-2 border-[var(--accent-color)] mt-auto">
        <div className="grid grid-cols-2 gap-2">
            
            {/* Damage Stat */}
            <div className="bg-[#111] border border-red-900/30 px-2 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DmgIcon className="w-3 h-3 text-red-600" />
                    <span className="text-[10px] font-mono text-gray-500 font-bold">DMG</span>
                </div>
                <span className="text-sm font-bold text-red-500 font-mono tracking-tighter">{stats.Damage}</span>
            </div>
            
            {/* Speed Stat */}
            <div className="bg-[#111] border border-cyan-900/30 px-2 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SpdIcon className="w-3 h-3 text-cyan-500" />
                    <span className="text-[10px] font-mono text-gray-500 font-bold">SPD</span>
                </div>
                <span className="text-sm font-bold text-cyan-400 font-mono tracking-tighter">{stats.Speed}</span>
            </div>

            {/* Armor Stat */}
            <div className="bg-[#111] border border-emerald-900/30 px-2 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ArmIcon className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-mono text-gray-500 font-bold">ARM</span>
                </div>
                <span className="text-sm font-bold text-emerald-500 font-mono tracking-tighter">{stats.Armor}</span>
            </div>

            {/* Weight Stat */}
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