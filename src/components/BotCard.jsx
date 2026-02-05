import React, { useState, useEffect, useRef } from 'react';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { RARITY_COLORS } from '@/constants/gameConstants'; 
import RarityBadge from './RarityBadge';
import { cn } from '@/lib/utils';
import { calculateBotStats } from '@/utils/statCalculator';
import { useToast } from '@/components/ui/use-toast'; 

// --- 1. ANIMATIONS (Added "Hit Flash") ---
const injectStyles = () => {
  if (typeof document === 'undefined') return;
  const styleId = 'bot-card-animations';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    @keyframes lunge-right { 0% { transform: translateX(0); } 20% { transform: translateX(-10px); } 40% { transform: translateX(30px); } 100% { transform: translateX(0); } }
    @keyframes lunge-left { 0% { transform: translateX(0); } 20% { transform: translateX(10px); } 40% { transform: translateX(-30px); } 100% { transform: translateX(0); } }
    
    @keyframes glitch-pulse {
      0% { opacity: 1; } 20% { opacity: 0.8; } 40% { opacity: 0.9; } 60% { opacity: 0.2; } 80% { opacity: 1; } 100% { opacity: 1; }
    }
    
    /* NEW: IMPACT FLASH - Fires when damage is taken */
    @keyframes hit-flash {
      0% { background-color: rgba(255, 255, 255, 0.2); border-color: white; }
      100% { background-color: transparent; border-color: inherit; }
    }

    .animate-attack-right { animation: lunge-right 0.3s ease-out !important; }
    .animate-attack-left { animation: lunge-left 0.3s ease-out !important; }
    .animate-glitch { animation: glitch-pulse 0.3s infinite steps(3, end) !important; }
    .animate-hit { animation: hit-flash 0.15s ease-out !important; }
  `;
  document.head.appendChild(style);
};
injectStyles();

// --- 2. SKELETON (Thicker Lines for Visibility) ---
const SchematicSkeleton = ({ status = 'healthy' }) => {
  const styles = {
    healthy: {
      line: "text-gray-800",
      connector: "text-gray-700",
      core: "fill-[var(--accent-color)] animate-pulse", 
    },
    damaged: {
      line: "text-amber-600", // Brighter Amber
      connector: "text-amber-600",
      core: "fill-amber-500 animate-pulse duration-75", 
    },
    critical: {
      line: "text-red-600", // Brighter Red
      connector: "text-red-500",
      core: "fill-red-600 animate-glitch", 
    }
  };

  const currentStyle = styles[status];

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
      <line 
        x1="50" y1="15" x2="50" y2="85" 
        stroke="currentColor" strokeWidth={status === 'healthy' ? 1 : 2} // Thicker when damaged
        strokeDasharray="2 2"
        className={`transition-colors duration-300 ${currentStyle.line} ${status === 'critical' ? 'animate-glitch' : ''}`} 
      />
      
      <line x1="50" y1="20" x2="50" y2="28" stroke="currentColor" strokeWidth="1" className={`transition-colors duration-300 ${currentStyle.connector}`} />
      <circle cx="50" cy="20" r="1.5" className={`transition-colors duration-300 stroke-gray-900 ${status === 'critical' ? 'fill-red-900' : 'fill-gray-800'}`} />

      <path d="M 25 45 L 75 45" stroke="currentColor" strokeWidth={status === 'healthy' ? 1 : 2} fill="none" className={`transition-colors duration-300 ${currentStyle.line}`} />
      
      <line x1="25" y1="45" x2="25" y2="45" stroke="currentColor" strokeWidth="2" className={`transition-colors duration-300 ${currentStyle.connector}`} />
      <line x1="75" y1="45" x2="75" y2="45" stroke="currentColor" strokeWidth="2" className={`transition-colors duration-300 ${currentStyle.connector}`} />
      <line x1="50" y1="70" x2="50" y2="80" stroke="currentColor" strokeWidth="1" className={`transition-colors duration-300 ${currentStyle.connector}`} />
      
      {/* CORE: Thicker and brighter */}
      <circle cx="50" cy="45" r="3" className={`transition-colors duration-300 stroke-gray-900 ${status === 'critical' ? 'fill-red-950' : 'fill-black'}`} />
      <circle cx="50" cy="45" r={status === 'critical' ? 2 : 1.5} className={currentStyle.core} />
      
      {status === 'critical' && (
        <circle cx="50" cy="45" r="12" fill="none" stroke="red" strokeWidth="1" className="opacity-50 animate-ping" />
      )}
    </svg>
  );
};

// --- 3. HOLOGRAPHIC FRAME ---
const HolographicFrame = ({ children, className, isActive, colorClass }) => (
  <div className={cn("relative transition-all duration-300 group", className)}>
    <div className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-gray-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-gray-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-gray-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-gray-500" />
    </div>

    {isActive && (
       <div className="absolute inset-0 bg-[var(--accent-color)]/5 shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)] border border-[var(--accent-color)]/20 pointer-events-none" />
    )}

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
  
  // --- HIT DETECTION LOGIC ---
  const [isHit, setIsHit] = useState(false);
  const prevHealthRef = useRef(currentHealth);

  // DEBUG: Uncomment this line to FORCE CRITICAL STATE to see what it looks like
  // currentHealth = maxHealth * 0.2; 

  useEffect(() => {
    // If health dropped, trigger hit flash
    if (prevHealthRef.current > currentHealth) {
        setIsHit(true);
        const timer = setTimeout(() => setIsHit(false), 150); // Short sharp flash
        return () => clearTimeout(timer);
    }
    prevHealthRef.current = currentHealth;
  }, [currentHealth]);

  if (!bot) return null;

  const stats = calculateBotStats({ ...bot, slotLevels: slotLevels || bot.slotLevels });
  
  // Health Calculation
  const curHp = currentHealth !== undefined ? currentHealth : 100;
  const maxHp = maxHealth !== undefined ? maxHealth : 100;
  const healthPct = (curHp / maxHp) * 100;

  // Status Logic
  let systemStatus = 'healthy';
  let statusText = 'ONLINE';
  let statusColor = 'bg-emerald-500';
  let statusBorder = 'border-gray-800';

  if (healthPct <= 30) {
    systemStatus = 'critical';
    statusText = '! CRITICAL !';
    statusColor = 'bg-red-600 animate-glitch';
    statusBorder = 'border-red-600 shadow-[0_0_30px_-5px_rgba(220,38,38,0.4)]'; // Stronger glow
  } else if (healthPct <= 60) {
    systemStatus = 'damaged';
    statusText = 'WARNING';
    statusColor = 'bg-amber-500';
    statusBorder = 'border-amber-700/50';
  }

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
      "flex flex-col shrink-0 w-80 h-[480px] bg-[#030303] border shadow-[0_0_50px_-15px_rgba(0,0,0,0.9)] relative z-10 transition-all duration-100",
      statusBorder,
      // HIT FLASH TRIGGER
      isHit ? "animate-hit" : "",
      className
    )}>
      
      {/* Background Grid - VISIBLY TINTED ON DAMAGE */}
      <div className={cn(
          "absolute inset-0 pointer-events-none transition-colors duration-300",
          systemStatus === 'critical' ? "bg-red-950/40 opacity-100" : "opacity-5"
        )} 
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
      />

      {/* HEADER */}
      <div className="flex flex-col relative bg-[#080808] border-b border-gray-800">
        <div className="flex justify-between items-center px-3 py-1 bg-black/50 border-b border-gray-900 text-[9px] font-mono text-gray-600">
             <span>UNIT_ID: {bot.id ? bot.id.substring(0,6).toUpperCase() : 'UNK_ID'}</span>
             <span className={cn("flex items-center gap-1.5 transition-colors duration-300", systemStatus === 'critical' ? "text-red-500 font-bold" : "")}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} /> 
                {statusText}
             </span>
        </div>

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
      
      {/* SCHEMATIC */}
      <div className="relative flex-1 px-4 py-6 flex flex-col justify-center">
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
      
      {/* FOOTER */}
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