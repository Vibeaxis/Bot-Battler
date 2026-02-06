import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RARITY_COLORS } from '@/constants/gameConstants';
import RarityBadge from '@/components/RarityBadge';
import { cn } from '@/lib/utils';
import { ArrowRight, Zap, Activity, Shield, Weight } from 'lucide-react';

const IconMap = { ...LucideIcons };

// Helper to render compact stats row
const CompactStatRow = ({ stats }) => (
  <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
    <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-red-500" /> {stats.Damage || 0}</div>
    <div className="flex items-center gap-1"><Activity className="w-3 h-3 text-cyan-400" /> {stats.Speed || 0}</div>
    <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> {stats.Armor || 0}</div>
    <div className="flex items-center gap-1"><Weight className="w-3 h-3 text-amber-500" /> {stats.Weight || 0}</div>
  </div>
);

const PartModal = ({ isOpen, onClose, slot, currentPartId, availableParts, onEquip }) => {
  const parts = availableParts
    .map(id => getPartById(id))
    .filter(part => part && part.slot === slot);

  const currentPart = currentPartId ? getPartById(currentPartId) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 bg-[#0a0a12] border-gray-800 text-gray-100 overflow-hidden">
        
        {/* HEADER */}
        <DialogHeader className="p-6 pb-2 border-b border-gray-800 bg-black/40">
          <DialogTitle className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
             <LucideIcons.Wrench className="w-5 h-5 text-[var(--accent-color)]" />
             Select {slot} Component
          </DialogTitle>
        </DialogHeader>

        {/* COMPARISON SECTION (Pinned Top) */}
        <div className="p-4 bg-black/60 border-b border-gray-800 shrink-0">
            <h4 className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Currently Equipped</h4>
            {currentPart ? (
                <div className="flex items-center justify-between bg-gray-900/50 border border-gray-700 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded border ${RARITY_COLORS[currentPart.tier].bgTint} ${RARITY_COLORS[currentPart.tier].border}`}>
                            {React.createElement(IconMap[currentPart.icon] || IconMap.Box, { className: "w-6 h-6" })}
                        </div>
                        <div>
                            <div className="font-bold text-sm">{currentPart.name}</div>
                            <CompactStatRow stats={currentPart.stats} />
                        </div>
                    </div>
                    <RarityBadge tier={currentPart.tier} className="scale-75 origin-right" />
                </div>
            ) : (
                <div className="text-gray-500 text-sm font-mono italic p-2 border border-dashed border-gray-800 rounded">
                    [ EMPTY SLOT ]
                </div>
            )}
        </div>
        
        {/* SCROLLABLE LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {parts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl bg-black/20">
              <LucideIcons.PackageOpen className="w-12 h-12 opacity-20 mb-2" />
              <p>No compatible parts found.</p>
              <p className="text-xs mt-2 opacity-50">Check the Supply Depot to acquire more.</p>
            </div>
          ) : (
            parts.map((part, index) => {
              const Icon = IconMap[part.icon] || IconMap.Box;
              const colors = RARITY_COLORS[part.tier];
              const isEquipped = part.id === currentPartId;
              
              return (
                <div
                  key={`${part.id}-${index}`}
                  className={cn(
                    "relative flex items-center justify-between p-3 rounded-lg border transition-all duration-200 group",
                    isEquipped ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)] opacity-50 pointer-events-none" : "bg-black border-gray-800 hover:border-gray-600 hover:bg-gray-900"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon Box */}
                    <div className={cn("p-2 rounded-md border shrink-0 bg-black", colors.border)}>
                       <Icon className={cn("w-8 h-8", colors.text)} />
                    </div>
                    
                    {/* Info */}
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2">
                           <span className={cn("font-bold text-sm group-hover:text-white transition-colors", colors.text)}>
                               {part.name}
                           </span>
                           <RarityBadge tier={part.tier} className="scale-75 origin-left" />
                       </div>
                       <CompactStatRow stats={part.stats} />
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {!isEquipped && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onEquip(part.id, slot);
                          onClose();
                        }}
                        className={cn(
                          "h-8 px-4 font-bold uppercase tracking-wider text-[10px] transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0",
                          "bg-white text-black hover:bg-gray-200"
                        )}
                      >
                        Equip <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                  )}
                  
                  {isEquipped && (
                      <span className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest px-3">
                          Equipped
                      </span>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {/* FOOTER */}
        <div className="p-3 bg-black border-t border-gray-800 text-center text-[10px] text-gray-600 font-mono uppercase tracking-widest">
            {parts.length} items available
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default PartModal;