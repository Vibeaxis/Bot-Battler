import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Shield, Wifi } from 'lucide-react';
import { PROTOCOLS } from '@/data/tactics';
import { cn } from '@/lib/utils';

// Icon Map with Lucide icons
const ICON_MAP = {
  Sword: Sword,
  Shield: Shield,
  Wifi: Wifi
};

const ProtocolSelector = ({ selectedProtocol, onSelectProtocol, disabled }) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {/* Label - Compact & Technical */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-gray-500 font-mono font-bold tracking-widest uppercase">
          Combat Protocol
        </span>
        {selectedProtocol && (
             <span className={cn("text-[9px] font-mono font-bold uppercase", selectedProtocol.twColor)}>
                {selectedProtocol.name} // ONLINE
             </span>
        )}
      </div>

      {/* The Selector Grid - Compact Height (h-12) */}
      <div className="grid grid-cols-3 gap-2 bg-black/40 p-1 rounded-sm border border-gray-800/50 backdrop-blur-sm">
        {Object.values(PROTOCOLS).map((protocol) => {
          const Icon = ICON_MAP[protocol.icon];
          const isSelected = selectedProtocol?.id === protocol.id;
          
          return (
            <motion.button
              key={protocol.id}
              whileTap={!disabled ? { scale: 0.96 } : {}}
              onClick={() => !disabled && onSelectProtocol(protocol)}
              className={cn(
                "relative flex items-center justify-center gap-2 h-10 px-2 rounded-sm transition-all duration-200 group overflow-hidden",
                disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-white/5",
                // Active State Styling
                isSelected 
                  ? "bg-gradient-to-r from-gray-900 to-black border border-gray-700 shadow-inner" 
                  : "bg-transparent border border-transparent"
              )}
            >
              {/* Active Selection Indicator (The "Light") */}
              {isSelected && (
                <motion.div 
                    layoutId="active-highlight"
                    className={cn("absolute left-0 top-0 bottom-0 w-1", protocol.twBg.replace('bg-', 'bg-'))} 
                />
              )}

              {/* Icon */}
              <Icon className={cn(
                "w-4 h-4 transition-colors duration-300", 
                isSelected ? protocol.twColor : "text-gray-600 group-hover:text-gray-400"
              )} />
              
              {/* Text - Hidden on very small screens if needed, but fits on most mobiles */}
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider font-mono transition-colors duration-300",
                isSelected ? "text-white" : "text-gray-500 group-hover:text-gray-300"
              )}>
                {protocol.name.split(' ')[0]}
              </span>

              {/* Holographic Scanline (Decoration) */}
              {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-20 pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Description / Hint Area - Fixed Height to prevent jumping */}
      <div className="h-4 flex items-center justify-center">
         {selectedProtocol ? (
            <motion.span 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedProtocol.id}
                className={cn("text-[9px] font-mono tracking-wide", selectedProtocol.twColor)}
            >
              [{selectedProtocol.description}]
            </motion.span>
         ) : (
            <span className="text-[9px] text-gray-700 font-mono tracking-widest animate-pulse">
               // AWAITING INPUT...
            </span>
         )}
      </div>
    </div>
  );
};

export default ProtocolSelector;