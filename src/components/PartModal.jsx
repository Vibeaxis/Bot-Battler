
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatDisplay from './StatDisplay';
import { RARITY_COLORS } from '@/constants/gameConstants';
import RarityBadge from '@/components/RarityBadge';
import { cn } from '@/lib/utils';

// Create a safe map of icons to avoid computed namespace access issues
const IconMap = { ...LucideIcons };

const PartModal = ({ isOpen, onClose, slot, currentPartId, availableParts, onEquip }) => {
  const parts = availableParts
    .map(id => getPartById(id))
    .filter(part => part && part.slot === slot);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-950 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select {slot} Part</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
          {parts.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
              <p>No parts available for this slot</p>
              <p className="text-xs mt-2">Visit the Shop to get more parts!</p>
            </div>
          ) : (
            parts.map((part, index) => { // Added index here
              const Icon = IconMap[part.icon] || IconMap.Box;
              const colors = RARITY_COLORS[part.tier];
              
              return (
                <div
                  key={`${part.id}-${index}`} // Updated key format
                  className={cn(
                    "rounded-xl p-4 border transition-all duration-300",
                    "bg-gray-900/50 hover:bg-gray-900",
                    colors.border,
                    part.tier >= 3 ? colors.glow : "hover:shadow-md"
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn("p-2 rounded-lg border", colors.bgTint, colors.border)}>
                       <Icon className={cn("w-8 h-8", colors.text)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={cn("font-bold truncate", colors.text)}>{part.name}</h4>
                      <div className="flex gap-2 mt-1 items-center">
                        <RarityBadge tier={part.tier} />
                      </div>
                    </div>
                  </div>
                  
                  <StatDisplay stats={part.stats} className="mb-4 grid-cols-2 gap-x-4 text-xs" />
                  
                  <Button
                    onClick={() => {
                      onEquip(part.id, slot);
                      onClose();
                    }}
                    className={cn(
                      "w-full font-bold",
                      colors.bg,
                      "hover:opacity-90 text-white border-none"
                    )}
                  >
                    Equip
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartModal;
