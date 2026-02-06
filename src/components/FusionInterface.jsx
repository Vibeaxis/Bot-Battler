import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react'; // 1. Full Import
import { Button } from '@/components/ui/button';
import { useSoundContext } from '@/context/SoundContext';
import RarityBadge from '@/components/RarityBadge';
import StatDisplay from '@/components/StatDisplay';
import { RARITY_COLORS } from '@/constants/gameConstants';

// 2. Helper to safely get the icon component
const getIcon = (iconName) => {
  return LucideIcons[iconName] || LucideIcons.Box; // Fallback to Box if not found
};

const PartCard = ({ part, index, className }) => {
  if (!part) return null;
  const colors = RARITY_COLORS[part.tier];
  const Icon = getIcon(part.icon); // Dynamic Icon Lookup
  
  return (
    <motion.div
      layoutId={`input-slot-${index}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: 50, transition: { duration: 0.5 } }}
      transition={{ delay: index * 0.1 }}
      className={`relative p-4 rounded-xl border-2 ${colors.bg} ${colors.border} bg-opacity-20 backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/30 ${colors.text}`}>
           {/* Render the dynamic icon */}
           <Icon className="w-6 h-6" />
        </div>
        
        <div>
          <h4 className={`font-bold text-sm ${colors.text}`}>{part.name}</h4>
          <RarityBadge tier={part.tier} className="mt-1" />
        </div>
      </div>
    </motion.div>
  );
};

const ResultCard = ({ part }) => {
  if (!part) return null;
  const colors = RARITY_COLORS[part.tier];
  const Icon = getIcon(part.icon); // Dynamic Icon Lookup

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={`relative p-6 rounded-2xl border-4 ${colors.border} ${colors.bgTint} shadow-2xl ${colors.glow} w-full max-w-xs mx-auto`}
    >
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/5 to-transparent z-0 pointer-events-none"
      />
      
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-black/40 ${colors.text} shadow-inner`}>
          {/* Render the dynamic icon */}
          <Icon className="w-10 h-10 animate-pulse" />
        </div>
        
        <div>
          <h3 className={`text-xl font-black uppercase ${colors.text}`}>{part.name}</h3>
          <RarityBadge tier={part.tier} className="mt-2 text-xs py-1 px-3" />
        </div>

        <StatDisplay stats={part.stats} className="w-full bg-black/20 p-3 rounded-lg" />
      </div>
    </motion.div>
  );
};

const FusionInterface = ({ selectedItem, onFuse, isFusing, fusionResult, onReset }) => {
  const { playSound } = useSoundContext();
  
  const inputItems = selectedItem ? [selectedItem, selectedItem, selectedItem] : [];

  useEffect(() => {
    if (selectedItem && !isFusing && !fusionResult) {
      playSound('EQUIP');
    }
  }, [selectedItem, isFusing, fusionResult, playSound]);

  useEffect(() => {
    if (fusionResult) {
      playSound('VICTORY'); 
    }
  }, [fusionResult, playSound]);

  const handleFuseClick = () => {
    playSound('FUSE');
    onFuse();
  };

  const handleResetClick = () => {
    playSound('CLICK');
    onReset();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center py-8 relative">
       
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {!fusionResult && selectedItem && (
            <motion.div 
              key="inputs"
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="grid grid-cols-3 gap-4 mb-8"
            >
              {inputItems.map((item, idx) => (
                <PartCard key={`slot-${idx}`} part={item} index={idx} />
              ))}
            </motion.div>
          )}

          {fusionResult && (
            <div key="result" className="mb-8">
               <ResultCard part={fusionResult} />
            </div>
          )}
          
          {!selectedItem && !fusionResult && (
            <motion.div 
                key="empty"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center py-20 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 text-gray-500"
            >
                {/* Static UI Icon */}
                <LucideIcons.Hammer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select an item from your inventory to begin fusion</p>
                <p className="text-sm mt-2 opacity-60">Requires 3 duplicates</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedItem && !fusionResult && (
        <Button 
            size="lg"
            onClick={handleFuseClick} 
            disabled={isFusing}
            className="relative px-12 py-6 text-lg font-bold tracking-widest bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-orange-500/20 transition-all transform hover:scale-105 active:scale-95"
        >
            {isFusing ? (
                <span className="flex items-center gap-2">
                    {/* Static UI Icon */}
                    <LucideIcons.Sparkles className="w-5 h-5 animate-spin" /> Fusing...
                </span>
            ) : (
                "FUSE ITEMS"
            )}
        </Button>
      )}

      {fusionResult && (
         <Button 
            onClick={handleResetClick} 
            variant="outline"
            className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
         >
            Fuse Another Item
         </Button>
      )}

    </div>
  );
};

export default FusionInterface;