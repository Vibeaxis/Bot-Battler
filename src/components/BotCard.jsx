import React from 'react';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import StatDisplay from './StatDisplay';
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
    { key: 'Head', partId: bot.equipment.Head, gridClass: 'col-span-2 w-full' }, // CHANGED: w-2/3 -> w-full for a bulkier look
    { key: 'LeftArm', partId: bot.equipment.LeftArm, gridClass: 'col-span-1' },
    { key: 'RightArm', partId: bot.equipment.RightArm, gridClass: 'col-span-1' },
    { key: 'Chassis', partId: bot.equipment.Chassis, gridClass: 'col-span-2 w-full' }
  ];

  const BotIcon = IconMap[bot.icon] || IconMap.Cpu;

  return (
    // CHANGED: 
    // 1. w-80 md:w-96 (Fixed width, no longer skinny)
    // 2. bg-[#09090b] (Solid nearly-black, no transparency)
    // 3. border-2 (Thicker borders)
    // 4. shadow-2xl (High lift off background)
    <div className={cn(
      "flex flex-col shrink-0 w-80 md:w-96 h-auto bg-[#09090b] rounded-none border-2 border-[var(--accent-color)] shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] relative z-10",
      className
    )}>
      
      {/* DECORATIVE: Top "Tech" Line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-50" />

      {/* Header Section */}
      <div className="p-4 bg-[#0a0a0a] border-b-2 border-[var(--accent-color)] flex items-center gap-4 relative overflow-hidden">
        {/* Subtle background glow in header */}
        <div className="absolute inset-0 bg-[var(--accent-color)] opacity-5" />
        
        <div className="p-2 shrink-0 bg-black border border-[var(--accent-color)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)]">
          <BotIcon className="w-6 h-6 text-[var(--accent-color)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-white truncate font-mono uppercase tracking-widest drop-shadow-md">
            {bot.name}
          </h3>
          <div className="text-[10px] text-gray-500 font-mono tracking-widest flex items-center gap-2">
            <span>LVL {bot.level || 1}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>{side === 'player' ? 'OPERATOR' : 'TARGET'}</span>
          </div>
        </div>
      </div>
      
      {/* Slots Grid */}
      <div className="p-5 grid grid-cols-2 gap-4 bg-[#050505]">
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
                  "w-full aspect-square max-h-28 flex flex-col items-center justify-center border-2 transition-all duration-200 relative",
                  // CHANGED: Solid backgrounds for slots
                  part ? "bg-[#111] border-gray-800" : "bg-[#080808] border-gray-900 border-dashed",
                  part && "group-hover:border-[var(--accent-color)] group-hover:bg-[#151515]",
                  shouldAnimateArm && "border-[var(--accent-color)] bg-[#1a1a1a] shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] z-20"
                )}
              >
                {/* Slot Label (Tiny, in corner) */}
                <span className="absolute top-1 left-2 text-[9px] font-mono text-gray-600 uppercase tracking-widest pointer-events-none">
                    {key}
                </span>

                <Icon className={cn(
                    "w-10 h-10 mb-2 transition-transform duration-300", 
                    part ? colors.text : "text-gray-800",
                    "group-hover:scale-110"
                )} />
                
                {part && (
                    <RarityBadge tier={tier} className="rounded-none text-[10px] px-2 py-0.5 border border-white/10" />
                )}
              </div>

              {/* Tooltip (Kept mostly same, just ensured z-index safety) */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] z-[60] w-64 hidden group-hover:block pointer-events-none">
                <div className="bg-gray-900 text-gray-100 text-xs p-3 border border-gray-700 shadow-2xl relative">
                   <div className={cn("font-bold text-sm mb-1 font-mono uppercase border-b border-gray-800 pb-1", part ? colors.text : "text-gray-400")}>
                     {part ? part.name : 'Empty Slot'}
                   </div>
                   {part && (
                     <div className="space-y-1 pt-2 font-mono">
                       <div className="flex justify-between"><span>DMG:</span> <span className="text-white">{part.stats.Damage}</span></div>
                       <div className="flex justify-between"><span>SPD:</span> <span className="text-white">{part.stats.Speed}</span></div>
                       <div className="flex justify-between"><span>ARM:</span> <span className="text-white">{part.stats.Armor}</span></div>
                     </div>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Stats - Made Solid */}
      <div className="p-4 bg-[#0a0a0a] border-t-2 border-[var(--accent-color)] mt-auto">
        <StatDisplay stats={stats} className="grid-cols-2 gap-y-2 gap-x-4 font-mono text-xs" />
      </div>
    </div>
  );
};

export default BotCard;