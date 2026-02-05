import React, { useState } from 'react';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { RARITY_COLORS } from '@/constants/gameConstants'; 
import RarityBadge from './RarityBadge';
import { cn } from '@/lib/utils';
import { calculateBotStats } from '@/utils/statCalculator';
import { useToast } from '@/components/ui/use-toast'; 

// --- 1. GLOBAL STYLES (Animations) ---
const injectStyles = () => {
  if (typeof document === 'undefined') return;
  const styleId = 'bot-card-animations';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    @keyframes lunge-right { 0% { transform: translateX(0); } 20% { transform: translateX(-10px); } 40% { transform: translateX(30px); } 100% { transform: translateX(0); } }
    @keyframes lunge-left { 0% { transform: translateX(0); } 20% { transform: translateX(10px); } 40% { transform: translateX(-30px); } 100% { transform: translateX(0); } }
    
    /* NEW: Erratic Glitch Flash for Critical Health */
    @keyframes glitch-pulse {
      0% { opacity: 1; }
      10% { opacity: 0.4; }
      20% { opacity: 1; }
      30% { opacity: 0.1; }
      40% { opacity: 1; }
      90% { opacity: 1; }
      95% { opacity: 0.2; }
      100% { opacity: 1; }
    }
    
    .animate-attack-right { animation: lunge-right 0.3s ease-out !important; }
    .animate-attack-left { animation: lunge-left 0.3s ease-out !important; }
    .animate-glitch { animation: glitch-pulse 0.5s infinite steps(5, end) !important; }
  `;
  document.head.appendChild(style);
};
injectStyles();

// --- 2. SKELETON (Updates based on Status) ---
const SchematicSkeleton = ({ status = 'healthy' }) => {
  // Define visual states based on health status
  const styles = {
    healthy: {
      line: "text-gray-800",
      connector: "text-gray-700",
      core: "fill-[var(--accent-color)] animate-pulse", 
    },
    damaged: {
      line: "text-amber-900", // Dark orange/brown wiring
      connector: "text-amber-700",
      core: "fill-amber-500 animate-pulse duration-75", // Fast anxiety pulse
    },
    critical: {
      line: "text-red-900",
      connector: "text-red-600",
      core: "fill-red-600 animate-glitch", // Erratic glitching
    }
  };

  const currentStyle = styles[status];

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Main Vertical Bus (Spine) */}
      <line 
        x1="50" y1="15" x2="50" y2="85" 
        stroke="currentColor" strokeWidth="1" 
        strokeDasharray="2 2"
        className={`transition-colors duration-500 ${currentStyle.line} ${status === 'critical' ? 'animate-glitch' : ''}`} 
      />
      
      {/* Head Connector */}
      <line x1="50" y1="20" x2="50" y2="28" stroke="currentColor" strokeWidth="1" className={`transition-colors duration-500 ${currentStyle.connector}`} />
      <circle cx="50" cy="20" r="1.5" className={`transition-colors duration-500 stroke-gray-900 ${status === 'critical' ? 'fill-red-900' : 'fill-gray-800'}`} />

      {/* Arms Cross-Bus */}
      <path d="M 25 45 L 75 45" stroke="currentColor" strokeWidth="1" fill="none" className={`transition-colors duration-500 ${currentStyle.line}`} />
      
      {/* Arm Connectors (Vertical drops) */}
      <line x1="25" y1="45" x2="25" y2="45" stroke="currentColor" strokeWidth="2" className={`transition-colors duration-500 ${currentStyle.connector}`} />
      <line x1="75" y1="45" x2="75" y2="45" stroke="currentColor" strokeWidth="2" className={`transition-colors duration-500 ${currentStyle.connector}`} />
      
      {/* Chassis Connector */}
      <line x1="50" y1="70" x2="50" y2="80" stroke="currentColor" strokeWidth="1" className={`transition-colors duration-500 ${currentStyle.connector}`} />
      
      {/* CENTRAL CORE NODE */}
      <circle cx="50" cy="45" r="3" className={`transition-colors duration-300 stroke-gray-900 ${status === 'critical' ? 'fill-red-950' : 'fill-black'}`} />
      <circle cx="50" cy="45" r="1.5" className={currentStyle.core} />
      
      {/* Critical Warning Rings (Only visible when critical) */}
      {status === 'critical' && (
        <circle cx="50" cy="45" r="8" fill="none" stroke="red" strokeWidth="0.5" className="opacity-30 animate-ping" />
      )}
    </svg>
  );
};

// --- 3. HOLOGRAPHIC FRAME (The Bracket UI) ---
const HolographicFrame = ({ children, className, isActive, colorClass }) => (
  <div className={cn("relative transition-all duration-300 group", className)}>
    {/* Corner Brackets */}
    <div className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-gray-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-gray-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-gray-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-gray-500" />
    </div>

    {/* Selection Glow */}
    {isActive && (
       <div className="absolute inset-0 bg-[var(--accent-color)]/5 shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)] border border-[var(--accent-color)]/20 pointer-events-none" />
    )}

    {/* Content Container */}
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {children}
    </div>
  </div>
);

// --- 4. MAIN COMPONENT ---
const IconMap = { ...LucideIcons };

const RARITY_MAP = {
    'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5, 'omega': 6, 'mythic': 7
};

const BotCard = ({ bot, currentHealth, maxHealth, slotLevels, isAttacking, side = 'player', className = '' }) => {
  const [hoveredPart, setHoveredPart] = useState(null);
  const { toast } = useToast();

  if (!bot) return null;

  const stats = calculateBotStats({ ...bot, slotLevels: slotLevels || bot.slotLevels });
  
  // --- HEALTH CALCULATION LOGIC ---
  const curHp = currentHealth !== undefined ? currentHealth : 100;
  const maxHp = maxHealth !== undefined ? maxHealth : 100;
  const healthPct = (curHp / maxHp) * 100;

  let systemStatus = 'healthy';
  let statusText = 'ONLINE';
  let statusColor = 'bg-emerald-500';

  if (healthPct <= 30) {
    systemStatus = 'critical';
    statusText = '! CRITICAL !';
    statusColor = 'bg-red-600 animate-glitch'; 
  } else if (healthPct <= 60) {
    systemStatus = 'damaged';
    statusText = 'WARNING';
    statusColor = 'bg-amber-500';
  }

  // --- SLOTS CONFIG ---
  const slots = [
    { key: 'Head', partId: bot.equipment?.Head, gridClass: 'col-span-2 w-1/2 mx-auto' }, 
    { key: 'LeftArm', partId: bot.equipment?.LeftArm, gridClass: 'col-span-1' },
    { key: 'RightArm', partId: bot.equipment?.RightArm, gridClass: 'col-span-1' },
    { key: 'Chassis', partId: bot.equipment?.Chassis, gridClass: 'col-span-2 w-full mt-2' }
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
    <div className="flex flex-col items-center justify-center p-2 border-r last:border-r-0 border-gray-900/50 bg-[#0a0a0a]/40">
        <span className="text-[9px] font-mono font-bold text-gray-600 uppercase mb-0.5">{label}</span>
        <div className="flex items-center gap-1">
             <Icon className={`w-3 h-3 ${colorClass}`} />
             <span className="text-sm font-bold text-gray-200 font-mono leading-none">{value}</span>
        </div>
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
      "flex flex-col shrink-0 w-80 h-[480px] bg-[#030303] border shadow-[0_0_50px_-15px_rgba(0,0,0,0.9)] relative z-10 transition-all duration-300",
      // DYNAMIC BORDER: Glows red when critical
      systemStatus === 'critical' ? "border-red-900/50 shadow-[0_0_30px_-5px_rgba(255,0,0,0.15)]" : "border-gray-800",
      className
    )}>
      
      {/* Background Grid Pattern - DYNAMIC TINT */}
      <div className={cn(
          "absolute inset-0 pointer-events-none opacity-5 transition-colors duration-500",
          systemStatus === 'critical' ? "bg-red-900/20" : ""
        )} 
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col relative bg-[#080808] border-b border-gray-800">
        {/* Status Line */}
        <div className="flex justify-between items-center px-3 py-1 bg-black/50 border-b border-gray-900 text-[9px] font-mono text-gray-600">
             <span>UNIT_ID: {bot.id ? bot.id.substring(0,6).toUpperCase() : 'UNK_ID'}</span>
             <span className={cn("flex items-center gap-1.5 transition-colors duration-300", systemStatus === 'critical' ? "text-red-500 font-bold" : "")}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} /> 
                {statusText}
             </span>
        </div>

        {/* Main Title Area */}
        <div className="p-4 flex items-center gap-3">
            <div className="p-2 shrink-0 bg-black border border-gray-800 rounded-sm shadow-inner">
                 <BotIcon className="w-6 h-6 text-[var(--accent-color)]" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className={cn("text-lg font-black truncate font-mono uppercase tracking-tighter leading-none mb-1", nameColorClass)}>
                    {bot.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
                    <span className="bg-gray-900 text-gray-400 px-1.5 py-0.5 border border-gray-800">LVL {bot.level || 1}</span>
                    <span className="text-gray-600">{bot.rarity ? bot.rarity.toUpperCase() : (side === 'player' ? 'OPERATOR' : 'TARGET')}</span>
                </div>
            </div>
        </div>
      </div>
      
      {/* --- SCHEMATIC VIEW --- */}
      <div className="relative flex-1 px-4 py-6 flex flex-col justify-center">
        {/* Pass status to skeleton for color changes */}
        <SchematicSkeleton status={systemStatus} />

        <div className="grid grid-cols-2 gap-y-6 gap-x-2 relative z-10">
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
                        <HolographicFrame 
                            className="w-full h-16 cursor-pointer"
                            isActive={shouldAnimateArm || (hoveredPart && hoveredPart.id === part?.id)}
                            colorClass={part ? "text-gray-600" : "text-gray-800"} 
                        >
                            <Icon className={cn(
                                "w-9 h-9 transition-all duration-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]", 
                                part ? colors.text : "text-gray-800 opacity-30",
                                (hoveredPart && hoveredPart.id === part?.id) ? "scale-110 brightness-150" : ""
                            )} />
                            
                            <span className="absolute -top-3 text-[8px] font-mono text-gray-600 font-bold uppercase tracking-widest bg-[#030303] px-1">
                                {key.replace('Arm', '')}
                            </span>
                            
                            {part && (
                                <RarityBadge tier={tier} className="scale-[0.6] origin-center absolute -bottom-2 border border-black/50 bg-black" />
                            )}
                        </HolographicFrame>
                    </div>
                );
            })}
        </div>
      </div>
      
      {/* --- FOOTER --- */}
      <div className="bg-[#050505] border-t border-gray-800">
         <div className="grid grid-cols-4 divide-x divide-gray-900/50">
             <StatBox label="DMG" value={stats.Damage} icon={DmgIcon} colorClass="text-red-500" />
             <StatBox label="SPD" value={stats.Speed} icon={SpdIcon} colorClass="text-cyan-400" />
             <StatBox label="ARM" value={stats.Armor} icon={ArmIcon} colorClass="text-emerald-500" />
             <StatBox label="WGT" value={stats.Weight} icon={WgtIcon} colorClass="text-amber-500" />
         </div>
         <div className="p-1.5 text-[9px] text-center text-gray-700 font-mono uppercase tracking-[0.2em] border-t border-gray-900 bg-black">
            {hoveredPart ? `>> ANALYZING: ${hoveredPart.name} <<` : "SYSTEM READY"}
         </div>
      </div>
    </div>
  );
};

export default BotCard;