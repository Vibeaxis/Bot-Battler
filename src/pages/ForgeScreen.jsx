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
  const fusibleItems = useMemo(() => {
    if (!gameState?.inventory) return [];
    
    const counts = {};
    gameState.inventory.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([id, count]) => {
        const part = getPartById(id);
        if (!part) return null;
        // LOGIC: Tier 1 (Common) needs 4. Others need 3.
        const required = part.tier === 1 ? 4 : 3;
        return { ...part, count, required };
      })
      .filter(item => item && item.count >= item.required && item.tier < 4) 
      .sort((a, b) => b.tier - a.tier || a.name.localeCompare(b.name));
  }, [gameState.inventory]);

  const selectedItem = selectedItemId ? fusibleItems.find(i => i.id === selectedItemId) : null;
  if (selectedItemId && !selectedItem && !fusionResult) {
      setSelectedItemId(null);
  }

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
            }
        } catch (error) {
             console.error("Fusion Error:", error);
        } finally {
            setIsFusing(false);
        }
    }, 1500);
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
        <header className="h-16 bg-black/90 border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-20 backdrop-blur-md relative">
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
            
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 border border-gray-700 rounded-sm shadow-inner">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 font-bold tracking-wider">{gameState.scrap}</span>
            </div>
        </header>

        {/* WORKSPACE - This consumes the rest of the height */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6 relative z-10">
            
            {/* LEFT: INVENTORY LIST (Restored to original style but fixed scroll) */}
            <div className="w-80 bg-black/40 border border-gray-800 backdrop-blur-sm flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-800 bg-black/60 shrink-0">
                    <h2 className="text-xs font-bold text-[var(--accent-color)] uppercase tracking-widest">
                        Fusion Candidates
                    </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
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
                                        "cursor-pointer p-3 border transition-all relative overflow-hidden group rounded-sm",
                                        isSelected 
                                            ? `bg-[rgba(var(--accent-rgb),0.1)] border-[var(--accent-color)]` 
                                            : "bg-black border-gray-800 hover:border-gray-600"
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className={cn("font-bold text-sm mb-1 uppercase", isSelected ? 'text-[var(--accent-color)]' : 'text-gray-300')}>
                                                {item.name}
                                            </div>
                                            <RarityBadge tier={item.tier} className="scale-75 origin-left" />
                                        </div>
                                        <div className="bg-[#111] px-2 py-1 border border-gray-700 text-xs font-mono text-gray-400">
                                            x{item.count}
                                        </div>
                                    </div>
                                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-color)]" />}
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* MIDDLE: FUSION CHAMBER (Takes up remaining space) */}
            <div className="flex-1 flex flex-col gap-6 min-w-[400px]">
                
                {/* 1. FUSION CHAMBER */}
                <div className="flex-[3] bg-black/40 border border-gray-800 relative flex flex-col items-center justify-center overflow-hidden">
                    <h2 className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Hammer className="w-3 h-3" /> Fusion Chamber
                    </h2>

                    <div className="w-full h-full p-8 flex items-center justify-center">
                        <FusionInterface 
                            selectedItem={selectedItem} 
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

                {/* 2. COMPACT FABRICATOR */}
                <div className="flex-1 bg-black/40 border border-gray-800 flex flex-col shrink-0 min-h-[140px]">
                    <div className="p-2 px-4 border-b border-gray-800 bg-black/60">
                        <h2 className="text-xs font-bold text-[var(--accent-color)] uppercase tracking-widest flex items-center gap-2">
                            <Plus className="w-3 h-3" /> Material Fabrication
                        </h2>
                    </div>
                    
                    <div className="flex-1 p-4 grid grid-cols-3 gap-4 items-center">
                        <Button 
                            onClick={() => handleCraft(1)}
                            className="h-full bg-black border border-gray-700 hover:border-gray-400 flex flex-col items-center justify-center gap-1 rounded-sm group"
                        >
                            <span className="text-xs font-bold text-white group-hover:text-[var(--accent-color)]">COMMON</span>
                            <span className="text-[10px] text-yellow-600 font-mono">{CRAFT_COSTS.COMMON} SCRAP</span>
                        </Button>
                        
                        <Button 
                            onClick={() => handleCraft(2)}
                            className="h-full bg-black border border-green-900 hover:border-green-500 flex flex-col items-center justify-center gap-1 rounded-sm group"
                        >
                            <span className="text-xs font-bold text-green-500 group-hover:text-green-400">UNCOMMON</span>
                            <span className="text-[10px] text-yellow-600 font-mono">{CRAFT_COSTS.UNCOMMON} SCRAP</span>
                        </Button>

                        <Button 
                            onClick={handleUnstableCraft}
                            className="h-full bg-black border border-red-900 hover:border-red-500 flex flex-col items-center justify-center gap-1 rounded-sm group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-xs font-bold text-red-500 flex items-center gap-1 relative z-10">
                                <Zap className="w-3 h-3" /> UNSTABLE
                            </span>
                            <span className="text-[10px] text-yellow-600 font-mono relative z-10">{CRAFT_COSTS.UNSTABLE} SCRAP</span>
                        </Button>
                    </div>
                </div>

            </div>

        </div>
      </div>
    </>
  );
};

export default ForgeScreen;