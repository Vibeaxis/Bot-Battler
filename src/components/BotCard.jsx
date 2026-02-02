import React from 'react';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import StatDisplay from './StatDisplay';
import { RARITY_COLORS } from '@/constants/gameConstants';
import RarityBadge from './RarityBadge';
import { cn } from '@/lib/utils';
import { calculateBotStats } from '@/utils/statCalculator';

const IconMap = { ...LucideIcons };

const BotCard = ({ bot, slotLevels, className = '' }) => {
  // Use the utility for consistent stat calculation including multipliers
  const stats = calculateBotStats({
    ...bot,
    slotLevels: slotLevels || bot.slotLevels
  });

  const slots = [
    { key: 'Head', partId: bot.equipment.Head },
    { key: 'RightArm', partId: bot.equipment.RightArm },
    { key: 'LeftArm', partId: bot.equipment.LeftArm },
    { key: 'Chassis', partId: bot.equipment.Chassis }
  ];

  const BotIcon = IconMap[bot.icon] || IconMap.Cpu;

  return (
    // CHANGED: Removed 'h-full' and added 'h-fit' so the card doesn't stretch to fill the 600px grid column
    <div className={`flex flex-col h-fit bg-black/80 rounded-none border border-[var(--accent-color)] ${className}`}>
      {/* Header Section */}
      <div className="p-3 bg-black/90 border-b border-[var(--accent-color)] flex items-center justify-center gap-3">
        <div className="p-1.5 rounded-none bg-[rgba(var(--accent-rgb),0.1)] border border-[rgba(var(--accent-rgb),0.3)]">
          <BotIcon className="w-5 h-5 text-[var(--accent-color)]" />
        </div>
        <h3 className="text-lg font-bold text-[#e0e0e0] truncate font-mono uppercase tracking-widest">{bot.name}</h3>
      </div>

      {/* Slots Grid */}
      {/* CHANGED: Removed 'flex-1' so it doesn't push the stats down unnecessarily */}
      <div className="p-4 flex flex-col gap-3 justify-center">
        {slots.map(({ key, partId }, index) => {
          const part = partId ? getPartById(partId) : null;
          const Icon = (part ? IconMap[part.icon] : null) || IconMap.Box;
          const tier = part ? part.tier : 1;
          const colors = RARITY_COLORS[tier] || RARITY_COLORS[1];

          return (
            <div key={`${key}-${index}`} className="relative group z-10 hover:z-50">
              <div
                className={cn(
                  "w-full aspect-square max-h-24 flex flex-col items-center justify-center rounded-none border transition-all duration-300 relative overflow-hidden",
                  part ? "bg-[rgba(var(--accent-rgb),0.05)]" : "bg-black/50",
                  part ? colors.border : "border-gray-800 border-dashed",
                  "group-hover:bg-[rgba(var(--accent-rgb),0.1)]"
                )}
              >
                <Icon className={cn("w-8 h-8 mb-1", part ? colors.text : "text-gray-700")} />
                {part && <RarityBadge tier={tier} className="scale-75 origin-center rounded-none" />}
              </div>

              {/* Hover Tooltip */}
              <div className="absolute left-[calc(100%+10px)] top-0 z-[100] w-64 hidden group-hover:block pointer-events-none">
                <div className="bg-black/95 text-[#e0e0e0] text-xs rounded-none p-3 border border-[var(--accent-color)] shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-md relative">
                  {/* Tooltip Arrow */}
                  <div className="absolute top-4 -left-2.5 w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-r-[var(--accent-color)] border-b-[6px] border-b-transparent"></div>

                  <div className={cn("font-bold text-sm mb-1 font-mono uppercase border-b border-gray-800 pb-1", part ? colors.text : "text-gray-400")}>
                    {part ? part.name : 'Empty Slot'}
                  </div>
                  <div className="flex justify-between items-center mb-2 font-mono text-[10px] mt-1">
                    <span className="text-gray-500 italic uppercase">{key}</span>
                    {part && <RarityBadge tier={tier} className="rounded-none scale-90" />}
                  </div>

                  {part && (
                    <div className="space-y-1 pt-2 font-mono">
                      <div className="flex justify-between"><span>DMG:</span> <span className="text-red-400 font-bold">{part.stats.Damage}</span></div>
                      <div className="flex justify-between"><span>SPD:</span> <span className="text-yellow-400 font-bold">{part.stats.Speed}</span></div>
                      <div className="flex justify-between"><span>ARM:</span> <span className="text-green-400 font-bold">{part.stats.Armor}</span></div>
                      <div className="flex justify-between"><span>WGT:</span> <span className="text-gray-400">{part.stats.Weight}</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="p-3 bg-black/60 border-t border-[var(--accent-color)]">
        <StatDisplay stats={stats} className="grid-cols-1 gap-1 font-mono" />
      </div>
    </div>
  );
};

export default BotCard;