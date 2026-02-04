import React, { useState } from 'react';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { RARITY_COLORS } from '@/constants/gameConstants'; 
import RarityBadge from './RarityBadge';
import { cn } from '@/lib/utils';
import { calculateBotStats } from '@/utils/statCalculator';
import { useToast } from '@/components/ui/use-toast'; 

// --- SKELETON ---
const SchematicSkeleton = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
    {/* Central Spine */}
    <path d="M 50 15 L 50 85" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-800 opacity-60" vectorEffect="non-scaling-stroke" />
    
    {/* Horizontal Bus (Arms) */}
    <path d="M 25 38 L 75 38" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-gray-800 opacity-60" vectorEffect="non-scaling-stroke" />
    
    {/* Nodes */}
    <circle cx="50" cy="18" r="2.5" className="fill-gray-700" />
    <circle cx="50" cy="38" r="5" className="fill-black stroke-gray-600 stroke-2" />
    <circle cx="50" cy="38" r="2" className="fill-[var(--accent-color)] animate-pulse" />
    <circle cx="25" cy="38" r="2.5" className="fill-gray-700" />
    <circle cx="75" cy="38" r="2.5" className="fill-gray-700" />
    <circle cx="50" cy="82" r="2.5" className="fill-gray-700" />
  </svg>
);

const BlueprintGrid = () => (
    <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
            backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
        }}
    />
);

const TechFrame = ({ children, className, isActive, colorClass = "text-gray-800" }) => (
  <div className={`relative ${className}`}>
    <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300" style={{ zIndex: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
      <path 
        d="M 0 10 L 10 0 L 90 0 L 100 10 L 100 90 L 90 100 L 10 100 L 0 90 Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={isActive ? "2" : "1"} 
        vectorEffect="non-scaling-stroke"
        className={isActive ? "text-[var(--accent-color)] drop-shadow-[0_0_5px_var(--accent-color)]" : "text-gray-700"}
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
    @keyframes lunge-right { 0% { transform: translateX(0); } 20% { transform: translateX(-10px); } 40% { transform: translateX(30px); } 100% { transform: translateX(0); } }
    @keyframes lunge-left { 0% { transform: translateX(0); } 20% { transform: translateX(10px); } 40% { transform: translateX(-30px); } 100% { transform: translateX(0); } }
    .animate-attack-right { animation: lunge-right 0.3s ease-out !important; }
    .animate-attack-left { animation: lunge-left 0.3s ease-out !important; }
  `;
  document.head.appendChild(style);
};
injectStyles();

const IconMap = { ...LucideIcons };

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
  const { toast } = useToast();

  if (!bot) return null;

  const stats = calculateBotStats({ ...bot, slotLevels: slotLevels || bot.slotLevels });
  
  const slots = [
    { key: 'Head', partId: bot.equipment?.Head, gridClass: 'col-span-2 w-3/5 mx-auto' }, 
    { key: 'LeftArm', partId: bot.equipment?.LeftArm, gridClass: 'col-span-1' },
    { key: 'RightArm', partId: bot.equipment?.RightArm, gridClass: 'col-span-1' },
    { key: 'Chassis', partId: bot.equipment?.Chassis, gridClass: 'col-span-2 w-full' }
  ];

  const BotIcon = IconMap[bot.icon] || IconMap.Cpu;
  const DmgIcon = IconMap.Zap;
  const SpdIcon = IconMap.Activity;
  const ArmIcon = IconMap.Shield;
  const WgtIcon = IconMap.Weight;

  let nameColorClass = 'text-white';
  if (bot.rarityId && RARITY_MAP[bot.rarityId]) {
      const tier = RARITY_MAP[bot.rarityId];
      if (RARITY_COLORS[tier]) {
          nameColorClass = RARITY_COLORS[tier].text;
      }
  }

  const StatBox = ({ label, value, icon: Icon, colorClass }) => (
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-[#0a0a0a]/80">
        <div className="flex items-center gap-2 text-gray-500">
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold uppercase">{label}</span>
        </div>
        <span className={`text-sm font-bold ${colorClass} font-mono tracking-tighter`}>
            {value}
        </span>
    </div>
  );

  const handlePartClick = (part) => {
      if (!part) return;
      const colors = RARITY_COLORS[part.tier];
      toast({
          title: part.name.toUpperCase(),
          description: (
              <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-gray-500">DMG</span> <span className="text-red-400 font-mono">{part.stats.Damage || 0}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">SPD</span> <span className="text-cyan-400 font-mono">{part.stats.Speed || 0}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">ARM</span> <span className="text-emerald-400 font-mono">{part.stats.Armor || 0}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">WGT</span> <span className="text-amber-400 font-mono">{part.stats.Weight || 0}</span></div>
              </div>
          ),
          className: `border-l-4 ${colors.border} bg-black/95`
      });
  };

  return (
    <div className={cn(
      // FIXED: Width restored to w-80 (320px)
      "flex flex-col shrink-0 w-80 h-auto bg-[#030303] border border-gray-800 shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)] relative z-10 transition-all duration-300",
      className
    )}>
      
      <BlueprintGrid />

      {/* HEADER */}
      <div className="p-4 flex items-center gap-4 relative bg-[#080808] border-b border-gray-800">
        <div className="p-2 shrink-0 bg-black border border-gray-700 rounded-sm shadow-inner">
          <BotIcon className="w-6 h-6 text-[var(--accent-color)]" />
        </div>
        <div className="flex-1 min-w-0 z-10">
          <h3 className={cn(
             "text-base font-black truncate font-mono uppercase tracking-widest leading-none mb-1",
             nameColorClass
          )}>
            {bot.name}
          </h3>
          <div className="text-[10px] text-gray-500 font-mono font-bold flex items-center gap-2">
            <span className="bg-gray-800 px-1.5 py-0.5 text-gray-300 border border-gray-700">LVL {bot.level || 1}</span>
            <span className="text-gray-600 tracking-wide">{bot.rarity ? bot.rarity.toUpperCase() : (side === 'player' ? 'OPERATOR' : 'TARGET')}</span>
          </div>
        </div>
      </div>
      
      {/* SCHEMATIC LAYOUT */}
      <div className="relative p-5 flex-1">
        <SchematicSkeleton />

        <div className="grid grid-cols-2 gap-4 relative z-10">
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
                        onClick={() => handlePartClick(part)}
                    >
                        <TechFrame 
                            // FIXED: Increased height to h-20 (80px) for visibility
                            className="w-full h-20 transition-all duration-300 cursor-pointer"
                            isActive={shouldAnimateArm || (hoveredPart && hoveredPart.id === part?.id)}
                            colorClass={part ? "text-gray-600" : "text-gray-800"} 
                        >
                            <div className={cn(
                                "absolute inset-0 flex flex-col items-center justify-center transition-all duration-300",
                                // FIXED: Lighter background (gray-900) so it's not pitch black
                                part ? "bg-gray-900/90" : "bg-black/50",
                                (hoveredPart && hoveredPart.id === part?.id) && "bg-[var(--accent-color)]/10"
                            )}>
                                {/* FIXED: Labels are always visible now, placed top-left */}
                                <span className="absolute top-1 left-2 text-[8px] font-mono text-gray-500 font-bold uppercase tracking-widest pointer-events-none">
                                    {key.replace('Arm', '')}
                                </span>

                                <Icon className={cn(
                                    "w-8 h-8 mb-1 transition-transform duration-300 drop-shadow-md", 
                                    part ? colors.text : "text-gray-800",
                                    (hoveredPart && hoveredPart.id === part?.id) ? "scale-110 brightness-150" : "opacity-80"
                                )} />
                                
                                {part && (
                                    <RarityBadge tier={tier} className="scale-[0.7] origin-center border border-white/5 bg-black/80 px-1.5" />
                                )}
                            </div>
                        </TechFrame>
                    </div>
                );
            })}
        </div>
      </div>
      
      {/* STATS FOOTER */}
      <div className="bg-[#050505] border-t border-gray-800 p-3 relative z-20">
         <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <StatBox label="DMG" value={stats.Damage} icon={DmgIcon} colorClass="text-red-500" />
              <StatBox label="SPD" value={stats.Speed} icon={SpdIcon} colorClass="text-cyan-400" />
              <StatBox label="ARM" value={stats.Armor} icon={ArmIcon} colorClass="text-emerald-500" />
              <StatBox label="WGT" value={stats.Weight} icon={WgtIcon} colorClass="text-amber-500" />
         </div>
         <div className="text-[9px] text-center text-gray-700 mt-3 font-mono uppercase tracking-widest border-t border-gray-900 pt-2">
            {hoveredPart ? `[ ${hoveredPart.name} ]` : "SYSTEM READY"}
         </div>
      </div>
    </div>
  );
};

export default BotCard;