import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hammer, Plus, Coins, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { getPartById, parts } from '@/data/parts'; 
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast'; 
import { RARITY_COLORS } from '@/constants/gameConstants';
import RarityBadge from '@/components/RarityBadge';
import FusionInterface from '@/components/FusionInterface';
import { cn } from '@/lib/utils';

const ForgeScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { gameState, performFusion, setGameState } = useGameContext();
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isFusing, setIsFusing] = useState(false);
  const [fusionResult, setFusionResult] = useState(null);

  const CRAFT_COSTS = {
    COMMON: 100,
    UNCOMMON: 300,
    UNSTABLE: 50 
  };

  // --- FUSION LOGIC ---
  // Commons require 4 to fuse. Uncommons+ require 3.
  const fusibleItems = useMemo(() => {
    if (!gameState?.inventory) return [];
    
    const counts = {};
    gameState.inventory.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([id, count]) => {
         const part = getPartById(id);
         if (!part) return false;
         // Logic: Tier 1 needs 4 copies. Tier 2+ needs 3 copies.
         const required = part.tier === 1 ? 4 : 3;
         return count >= required;
      })
      .map(([id, count]) => {
        const part = getPartById(id);
        const required = part.tier === 1 ? 4 : 3;
        return { ...part, count, required };
      })
      .filter(item => item && item.tier < 4) // Can't fuse Epics into Legendary yet (optional limit)
      .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
  }, [gameState.inventory]);

  const selectedItem = selectedItemId ? fusibleItems.find(i => i.id === selectedItemId) : null;

  // --- HANDLERS ---
  const handleFuse = async () => {
    if (!selectedItemId) return;
    
    setIsFusing(true);
    
    setTimeout(() => {
        try {
            const newItem = performFusion(selectedItemId);
            
            if (newItem) {
                setFusionResult(newItem);
                toast({
                    title: "FUSION COMPLETE",
                    description: `Fabricated: ${newItem.name}`,
                    className: "bg-green-900 border-green-500 text-white font-mono"
                });
            } else {
                 throw new Error("Fusion returned null");
            }
        } catch (error) {
             console.error("Fusion Error:", error);
             toast({
                title: "FUSION ERROR",
                description: "Material destabilized. Try again.",
                variant: "destructive"
             });
        } finally {
            setIsFusing(false);
        }
    }, 1500); // 1.5s crafting time
  };

  const handleCraft = (tier) => {
    try {
        const cost = tier === 1 ? CRAFT_COSTS.COMMON : CRAFT_COSTS.UNCOMMON;
        
        if (gameState.scrap < cost) {
          toast({ title: "INSUFFICIENT FUNDS", description: `Required: ${cost} Scrap`, variant: "destructive" });
          return;
        }

        const possibleParts = parts.filter(p => p.tier === tier);
        if (possibleParts.length === 0) return;

        const randomPart = possibleParts[Math.floor(Math.random() * possibleParts.length)];

        setGameState(prev => ({
          ...prev,
          scrap: prev.scrap - cost,
          inventory: [...prev.inventory, randomPart.id]
        }));

        toast({
          title: "FABRICATION SUCCESSFUL",
          description: `Acquired: ${randomPart.name}`,
           className: cn("border-l-4 bg-black text-white font-mono", RARITY_COLORS[tier].border)
        });
    } catch (err) {
        console.error("Crafting Error:", err);
    }
  };

  const handleUnstableCraft = () => {
      try {
          if (gameState.scrap < CRAFT_COSTS.UNSTABLE) {
              toast({ title: "INSUFFICIENT FUNDS", description: "Required: 50 Scrap", variant: "destructive" });
              return;
          }

          const roll = Math.random();
          let tier = 1;
          // 1% Epic, 9% Rare, 30% Uncommon, 60% Common
          if (roll > 0.99) tier = 4;
          else if (roll > 0.90) tier = 3; 
          else if (roll > 0.60) tier = 2; 

          const possibleParts = parts.filter(p => p.tier === tier);
          const randomPart = possibleParts[Math.floor(Math.random() * possibleParts.length)];

          setGameState(prev => ({
              ...prev,
              scrap: prev.scrap - CRAFT_COSTS.UNSTABLE,
              inventory: [...prev.inventory, randomPart.id]
          }));

          const isRare = tier >= 3;
          toast({
              title: isRare ? "CRITICAL SUCCESS! ⚡" : "FABRICATION COMPLETE",
              description: `Created: ${randomPart.name} [${RARITY_COLORS[tier].name}]`,
              className: isRare ? "bg-purple-900 border-purple-500 text-white font-mono" : "bg-black border-gray-700 text-white font-mono"
          });
      } catch (err) {
          console.error("Unstable Craft Error:", err);
      }
  };

  const handleSelect = (id) => {
      if (isFusing) return;
      setFusionResult(null);
      setSelectedItemId(id);
  };

  return (
    <>
      <Helmet>
        <title>The Forge // FABRICATION</title>
      </Helmet>

      <div className="h-screen bg-[#050505] text-gray-300 font-mono flex flex-col overflow-hidden selection:bg-[var(--accent-color)] selection:text-black">
        
        {/* Header */}
        <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-20 relative">
            <div className="flex items-center gap-4">
                <Button 
                    onClick={() => navigate('/hub')} 
                    variant="ghost" 
                    className="text-gray-500 hover:text-white hover:bg-white/5"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> EXIT
                </Button>
                <div className="h-8 w-px bg-gray-800" />
                <h1 className="text-xl font-black uppercase tracking-[0.2em] text-[var(--accent-color)] flex items-center gap-3">
                    <Hammer className="w-5 h-5" /> The Forge
                </h1>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 border border-gray-700 rounded-sm">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 font-bold tracking-wider">{gameState.scrap}</span>
            </div>
        </header>

        {/* Main Content Area - Fixed Height with Internal Scroll */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT: INVENTORY SCROLLER */}
            <div className="w-80 border-r border-gray-800 bg-[#080808] flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="w-3 h-3" /> Available for Fusion
                    </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {fusibleItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-700 gap-2 opacity-50">
                            <ShieldAlert className="w-8 h-8" />
                            <span className="text-xs uppercase">No Matches Found</span>
                        </div>
                    ) : (
                        fusibleItems.map((item) => {
                            const isSelected = selectedItemId === item.id;
                            return (
                                <motion.div
                                    key={item.id}
                                    onClick={() => handleSelect(item.id)}
                                    className={cn(
                                        "relative p-3 border cursor-pointer transition-all group",
                                        isSelected 
                                            ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)]" 
                                            : "bg-black border-gray-800 hover:border-gray-600"
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className={cn("text-xs font-bold uppercase mb-1", isSelected ? "text-white" : "text-gray-400 group-hover:text-gray-200")}>
                                                {item.name}
                                            </div>
                                            <RarityBadge tier={item.tier} className="scale-75 origin-top-left" />
                                        </div>
                                        <div className="text-[10px] font-mono bg-gray-900 px-1.5 py-0.5 text-gray-500 border border-gray-800">
                                            {item.count}/{item.required}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <motion.div layoutId="active-bar" className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--accent-color)]" />
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* MIDDLE: FUSION CHAMBER */}
            <div className="flex-1 bg-black/50 relative flex flex-col p-8 items-center justify-center border-r border-gray-800">
                 {/* Background Grid */}
                 <div className="absolute inset-0 opacity-5 pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
                 />
                 
                 <div className="relative z-10 w-full max-w-md aspect-square border border-gray-800 bg-[#050505] flex flex-col items-center justify-center shadow-2xl">
                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-500" />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-500" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-500" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-500" />

                      <FusionInterface 
                          selectedItem={selectedItem} // Now passing the full item object with 'required' count
                          onFuse={handleFuse}
                          isFusing={isFusing}
                          fusionResult={fusionResult}
                          onReset={() => {
                              setFusionResult(null);
                              setSelectedItemId(null);
                          }}
                      />
                 </div>
            </div>

            {/* RIGHT: CRAFTING PANEL */}
            <div className="w-80 bg-[#080808] flex flex-col shrink-0 border-l border-gray-800">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Plus className="w-3 h-3" /> Fabrication
                    </h2>
                </div>

                <div className="p-4 flex flex-col gap-4 overflow-y-auto">
                    {/* Common Craft */}
                    <button 
                        onClick={() => handleCraft(1)}
                        className="group relative w-full h-24 bg-black border border-gray-800 hover:border-gray-500 transition-all flex flex-col items-center justify-center overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gray-900/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10 text-gray-300 font-bold uppercase tracking-wider text-sm">Standard Print</span>
                        <span className="relative z-10 text-xs text-gray-600 mt-1 font-mono">{CRAFT_COSTS.COMMON} SCRAP</span>
                    </button>

                    {/* Uncommon Craft */}
                    <button 
                        onClick={() => handleCraft(2)}
                        className="group relative w-full h-24 bg-black border border-green-900/30 hover:border-green-500 transition-all flex flex-col items-center justify-center overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-green-900/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10 text-green-500 font-bold uppercase tracking-wider text-sm">Precision Print</span>
                        <span className="relative z-10 text-xs text-green-700 mt-1 font-mono">{CRAFT_COSTS.UNCOMMON} SCRAP</span>
                    </button>

                    {/* Unstable Craft */}
                    <button 
                        onClick={handleUnstableCraft}
                        className="group relative w-full h-32 bg-black border border-red-900/30 hover:border-red-500 transition-all flex flex-col items-center justify-center overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                        <Zap className="w-6 h-6 text-red-500 mb-2 relative z-10" />
                        <span className="relative z-10 text-red-500 font-bold uppercase tracking-wider text-sm">Unstable Fusion</span>
                        <span className="relative z-10 text-[10px] text-red-700 mt-1 font-mono text-center px-4">
                            High Risk // High Reward
                            <br/>
                            {CRAFT_COSTS.UNSTABLE} SCRAP
                        </span>
                    </button>
                </div>
            </div>

        </div>
      </div>
    </>
  );
};

export default ForgeScreen;