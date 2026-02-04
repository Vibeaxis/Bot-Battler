import React, { useState } from 'react';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { RARITY_COLORS } from '@/constants/gameConstants'; 
import RarityBadge from './RarityBadge';
import { cn } from '@/lib/utils';
import { calculateBotStats } from '@/utils/statCalculator';
import { useToast } from '@/components/ui/use-toast'; 

// --- SKELETON (Adjusted for tighter layout) ---
const SchematicSkeleton = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
    {/* Central Spine */}
    <path d="M 50 10 L 50 90" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-800 opacity-50" vectorEffect="non-scaling-stroke" />
    
    {/* Horizontal Bus (Arms) - Moved slightly up */}
    <path d="M 25 35 L 75 35" stroke="currentColor" strokeWidth="1" fill="none" className="text-gray-800 opacity-50" vectorEffect="non-scaling-stroke" />
    
    {/* Nodes */}
    <circle cx="50" cy="15" r="2" className="fill-gray-800" />
    <circle cx="50" cy="35" r="4" className="fill-black stroke-gray-700 stroke-2" />
    <circle cx="50" cy="35" r="1.5" className="fill-[var(--accent-color)] animate-pulse" />
    <circle cx="25" cy="35" r="2" className="fill-gray-800" />
    <circle cx="75" cy="35" r="2" className="fill-gray-800" />
    <circle cx="50" cy="80" r="2" className="fill-gray-800" />
  </svg>
);

const BlueprintGrid = () => (
    <div 
        className="absolute inset-0 pointer-events-none opacity-5"
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
        className={isActive ? "text-[var(--accent-color)] drop-shadow-[0_0_5px_var(--accent-color)]" : "text-gray-800"}
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

  // Safeguard: Ensure bot exists before calc
  if (!bot) return null;

  const stats = calculateBotStats({ ...bot, slotLevels: slotLevels || bot.slotLevels });
  
  const slots = [
    { key: 'Head', partId: bot.equipment?.Head, gridClass: 'col-span-2 w-2/3 mx-auto' }, // Reduced width
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
    <div className="flex items-center justify-between px-2 py-1 border-b border-gray-800 bg-[#0a0a0a]/50">
        <div className="flex items-center gap-2 text-gray-500">
            <Icon className="w-3 h-3" />
            <span className="text-[9px] font-mono font-bold uppercase">{label}</span>
        </div>
        <span className={`text-xs font-bold ${colorClass} font-mono tracking-tighter`}>
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
      "flex flex-col shrink-0 w-64 md:w-72 h-auto bg-[#030303] border border-gray-800 shadow-[0_0_30px_-5px_rgba(0,0,0,0.7)] relative z-10 transition-all duration-300",
      className
    )}>
      
      <BlueprintGrid />

      {/* COMPACT Header */}
      <div className="p-3 flex items-center gap-3 relative bg-[#080808] border-b border-gray-800">
        <div className="p-1.5 shrink-0 bg-black border border-gray-700 rounded-sm shadow-inner">
          <BotIcon className="w-5 h-5 text-[var(--accent-color)]" />
        </div>
        <div className="flex-1 min-w-0 z-10">
          <h3 className={cn(
             "text-sm font-black truncate font-mono uppercase tracking-widest leading-none mb-1",
             nameColorClass
          )}>
            {bot.name}
          </h3>
          <div className="text-[9px] text-gray-500 font-mono font-bold flex items-center gap-2">
            <span className="bg-gray-800 px-1 py-px text-gray-300">LVL {bot.level || 1}</span>
            <span className="text-gray-600">{bot.rarity ? bot.rarity.toUpperCase() : (side === 'player' ? 'OPERATOR' : 'TARGET')}</span>
          </div>
        </div>
      </div>
      
      {/* TIGHTER Schematic Area */}
      <div className="relative p-3 flex-1">
        <SchematicSkeleton />

        {/* Tighter Grid Gap */}
        <div className="grid grid-cols-2 gap-2 relative z-10">
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
                            // Reduced Height from 20 to 16
                            className="w-full aspect-[4/3] max-h-16 transition-all duration-300 cursor-pointer"
                            isActive={shouldAnimateArm || (hoveredPart && hoveredPart.id === part?.id)}
                            colorClass={part ? "text-gray-700" : "text-gray-800"} 
                        >
                            <div className={cn(
                                "absolute inset-0 flex flex-col items-center justify-center transition-all duration-300",
                                part ? "bg-[#0a0a0a]" : "bg-[#050505]",
                                (hoveredPart && hoveredPart.id === part?.id) && "bg-[var(--accent-color)]/10"
                            )}>
                                {/* Hidden on small cards for cleaner look, shown on hover */}
                                <span className="absolute top-0.5 left-1.5 text-[6px] font-mono text-gray-700 uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                    {key.replace('Arm', '')}
                                </span>

                                <Icon className={cn(
                                    "w-6 h-6 mb-0.5 transition-transform duration-300 drop-shadow-md", 
                                    part ? colors.text : "text-gray-800",
                                    (hoveredPart && hoveredPart.id === part?.id) ? "scale-110 brightness-150" : "opacity-80"
                                )} />
                                
                                {part && (
                                    <RarityBadge tier={tier} className="scale-[0.6] origin-center border border-white/5 bg-black p-0.5" />
                                )}
                            </div>
                        </TechFrame>
                    </div>
                );
            })}
        </div>
      </div>
      
      {/* Compact Footer */}
      <div className="bg-[#050505] border-t border-gray-800 p-2 relative z-20">
         <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <StatBox label="DMG" value={stats.Damage} icon={DmgIcon} colorClass="text-red-500" />
              <StatBox label="SPD" value={stats.Speed} icon={SpdIcon} colorClass="text-cyan-400" />
              <StatBox label="ARM" value={stats.Armor} icon={ArmIcon} colorClass="text-emerald-500" />
              <StatBox label="WGT" value={stats.Weight} icon={WgtIcon} colorClass="text-amber-500" />
         </div>
         <div className="text-[8px] text-center text-gray-800 mt-2 font-mono uppercase tracking-widest">
            {hoveredPart ? `[ ${hoveredPart.name} ]` : "SYSTEM READY"}
         </div>
      </div>
    </div>
  );
};

export default BotCard;