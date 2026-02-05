import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hammer, Plus, Coins, Zap, ShieldAlert, Cpu, Box } from 'lucide-react';
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
      .sort((a, b) => b.tier - a.tier || a.name.localeCompare(b.name)); // Sort High Tier -> Low Tier
  }, [gameState.inventory]);

  // If the selected item is no longer valid (fused away), deselect it
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

  return (
    <>
      <Helmet>
        <title>The Forge // FABRICATION</title>
      </Helmet>

      {/* Main Container - Fixed Screen Height to prevent window scrolling */}
      <div className="h-screen bg-[#050505] text-gray-300 font-mono flex flex-col overflow-hidden selection:bg-[var(--accent-color)] selection:text-black bg-[url('/grid-pattern.png')]">
        
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
            
            {/* LEFT: INVENTORY GRID (Takes up 2/3 space) */}
            <div className="flex-[2] flex flex-col bg-black/40 border border-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden relative">
                {/* Panel Header */}
                <div className="p-4 border-b border-gray-800 bg-black/60 flex justify-between items-center shrink-0">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Box className="w-4 h-4" /> Fusion Candidates
                    </h2>
                    <span className="text-[10px] text-gray-600 font-mono">
                        SHOWING {fusibleItems.length} UNITS
                    </span>
                </div>
                
                {/* Scrollable Grid Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {fusibleItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-4 opacity-50">
                            <div className="w-24 h-24 border-2 border-dashed border-gray-800 rounded-full flex items-center justify-center">
                                <Cpu className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold uppercase">No Match Found</p>
                                <p className="text-xs mt-1">Collect duplicate parts to enable fusion.</p>
                                <p className="text-[10px] mt-2 text-gray-600">Commons require 4x. Others require 3x.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                            {fusibleItems.map((item) => {
                                const isSelected = selectedItemId === item.id;
                                const colors = RARITY_COLORS[item.tier];
                                
                                return (
                                    <motion.div
                                        key={item.id}
                                        layoutId={item.id}
                                        onClick={() => {
                                            setFusionResult(null);
                                            setSelectedItemId(item.id);
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            "relative aspect-square border cursor-pointer flex flex-col items-center justify-center gap-2 p-2 transition-all duration-200 bg-black",
                                            isSelected 
                                                ? `border-[var(--accent-color)] shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)] bg-[var(--accent-color)]/5` 
                                                : "border-gray-800 hover:border-gray-600 hover:bg-gray-900"
                                        )}
                                    >
                                        {/* Count Badge */}
                                        <div className="absolute top-2 right-2 text-[10px] font-mono font-bold bg-gray-900 border border-gray-700 px-1.5 py-0.5 text-gray-400">
                                            {item.count}/{item.required}
                                        </div>

                                        {/* Rarity Stripe */}
                                        <div className={cn("absolute left-0 top-0 bottom-0 w-1", colors.bg)} />

                                        {/* Icon */}
                                        <div className={cn("text-gray-500", isSelected ? "text-[var(--accent-color)]" : "")}>
                                            {/* You would likely render the icon component here based on item.icon string */}
                                            <Cpu className="w-8 h-8" />
                                        </div>

                                        <div className="text-center w-full px-2">
                                            <div className={cn("text-[10px] font-bold uppercase truncate", colors.text)}>
                                                {item.name}
                                            </div>
                                            <div className="text-[9px] text-gray-600 font-mono uppercase mt-0.5">
                                                {item.rarity}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: OPERATIONS TERMINAL (Takes up 1/3 space) */}
            <div className="flex-1 flex flex-col gap-6 min-w-[320px]">
                
                {/* 1. FUSION CHAMBER (Top) */}
                <div className="flex-[2] bg-black border border-gray-800 relative flex flex-col shadow-2xl">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Header */}
                    <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                        <span className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest">
                            Fusion Chamber
                        </span>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-red-500 rounded-full" />
                            <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                            <div className="w-1 h-1 bg-green-500 rounded-full" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative">
                        {/* We render the FusionInterface directly here, removing the 'double box' feel */}
                        <div className="absolute inset-0 p-4">
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
                </div>

                {/* 2. FABRICATOR (Bottom) */}
                <div className="flex-1 bg-black border border-gray-800 flex flex-col">
                    <div className="p-3 border-b border-gray-800 bg-gray-900/50">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Material Fabrication
                        </span>
                    </div>
                    
                    <div className="flex-1 p-4 flex flex-col gap-3 justify-center">
                        <div className="grid grid-cols-2 gap-3">
                            <Button 
                                onClick={() => handleCraft(1)}
                                className="h-14 bg-[#111] border border-gray-700 hover:border-gray-400 hover:bg-[#222] flex flex-col items-center justify-center gap-1 rounded-sm"
                            >
                                <span className="text-xs font-bold text-gray-300">STANDARD</span>
                                <span className="text-[10px] text-yellow-600 font-mono">{CRAFT_COSTS.COMMON} G</span>
                            </Button>
                            
                            <Button 
                                onClick={() => handleCraft(2)}
                                className="h-14 bg-[#111] border border-green-900 hover:border-green-500 hover:bg-green-950/30 flex flex-col items-center justify-center gap-1 rounded-sm"
                            >
                                <span className="text-xs font-bold text-green-500">PRECISION</span>
                                <span className="text-[10px] text-yellow-600 font-mono">{CRAFT_COSTS.UNCOMMON} G</span>
                            </Button>
                        </div>

                        <Button 
                            onClick={handleUnstableCraft}
                            className="h-16 bg-[#111] border border-red-900 hover:border-red-500 hover:bg-red-950/20 flex items-center justify-between px-6 rounded-sm group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-bold text-red-500 flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> UNSTABLE FUSION
                                </span>
                                <span className="text-[9px] text-gray-500">High Risk // High Reward</span>
                            </div>
                            <span className="text-xs font-mono text-yellow-600 border border-yellow-900/50 bg-black/50 px-2 py-1">
                                {CRAFT_COSTS.UNSTABLE} G
                            </span>
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