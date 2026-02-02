
import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Shield, Wifi } from 'lucide-react';
import { PROTOCOLS } from '@/data/tactics';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  Sword: Sword,
  Shield: Shield,
  Wifi: Wifi
};

const ProtocolSelector = ({ selectedProtocol, onSelectProtocol, disabled }) => {
  return (
    <div className="w-full mb-4">
      <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2 text-center">
        Select Combat Protocol
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {Object.values(PROTOCOLS).map((protocol) => {
          const Icon = ICON_MAP[protocol.icon];
          const isSelected = selectedProtocol?.id === protocol.id;
          
          return (
            <motion.div
              key={protocol.id}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              onClick={() => !disabled && onSelectProtocol(protocol)}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-colors duration-200 min-h-[100px]",
                isSelected 
                  ? `${protocol.twBorder} ${protocol.twBg} ${protocol.twShadow} shadow-lg` 
                  : "border-gray-700 bg-gray-800/50 hover:bg-gray-700/50",
                disabled && "opacity-50 cursor-not-allowed hover:scale-100"
              )}
            >
              <div className={cn(
                "mb-2 p-2 rounded-full bg-black/30",
                isSelected ? protocol.twColor : "text-gray-400"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              
              <span className={cn(
                "text-[10px] md:text-xs font-bold uppercase tracking-wider text-center",
                isSelected ? "text-white" : "text-gray-400"
              )}>
                {protocol.name.split(' ')[0]}
              </span>
              
              {isSelected && (
                <motion.div
                  layoutId="active-glow"
                  className={cn(
                    "absolute inset-0 rounded-lg ring-1 ring-inset",
                    protocol.twColor.replace('text-', 'ring-')
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="h-6 mt-1 text-center">
         {selectedProtocol ? (
            <span className={cn("text-[10px] font-mono", selectedProtocol.twColor)}>
              {selectedProtocol.description}
            </span>
         ) : (
            <span className="text-[10px] text-gray-600 font-mono italic">
               Required to Engage
            </span>
         )}
      </div>
    </div>
  );
};

export default ProtocolSelector;
