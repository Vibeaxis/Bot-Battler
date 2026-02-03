import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hammer, Plus, Coins, Zap } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { getPartById, parts } from '@/data/parts'; // Import parts to generate random ones
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { RARITY_COLORS } from '@/constants/gameConstants';
import RarityBadge from '@/components/RarityBadge';
import FusionInterface from '@/components/FusionInterface';
import { cn } from '@/lib/utils'; // Assuming this exists

const ForgeScreen = () => {
  const navigate = useNavigate();
  // extracting setGameState to implement crafting locally if needed
  const { gameState, performFusion, setGameState } = useGameContext();
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isFusing, setIsFusing] = useState(false);
  const [fusionResult, setFusionResult] = useState(null);

  // Crafting Costs
  const CRAFT_COSTS = {
    COMMON: 100,
    UNCOMMON: 300,
    UNSTABLE: 50 // New gambling cost
  };

  // ... (fusibleItems logic remains the same) ...
  const fusibleItems = useMemo(() => {
    const counts = {};
    gameState.inventory.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([id, count]) => count >= 3)
      .map(([id, count]) => {
        const part = getPartById(id);
        return part ? { ...part, count } : null;
      })
      .filter(item => item && item.tier < 4)
      .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
  }, [gameState.inventory]);

  const selectedItem = selectedItemId ? getPartById(selectedItemId) : null;

  // ... (handleFuse logic remains similar) ...
  const handleFuse = async () => {
    if (!selectedItemId) return;
    
    setIsFusing(true);
    
    setTimeout(() => {
        const newItem = performFusion(selectedItemId);
        
        if (newItem) {
            setFusionResult(newItem);
            toast({
                title: "Fusion Successful! 🎉",
                description: `You crafted a ${newItem.name}!`,
                className: "bg-green-600 text-white border-none"
            });
        } else {
             toast({
                title: "Fusion Failed",
                description: "Something went wrong. Check your inventory.",
                variant: "destructive"
             });
        }
        setIsFusing(false);
    }, 2000);
  };

  // --- NEW CRAFTING LOGIC ---
  const handleCraft = (tier) => {
    const cost = tier === 1 ? CRAFT_COSTS.COMMON : CRAFT_COSTS.UNCOMMON;
    
    if (gameState.scrap < cost) {
      toast({
        title: "Insufficient Scrap",
        description: `You need ${cost} scrap to craft this.`,
        variant: "destructive"
      });
      return;
    }

    // Deduct Scrap
    // Add Item
    const possibleParts = parts.filter(p => p.tier === tier);
    const randomPart = possibleParts[Math.floor(Math.random() * possibleParts.length)];

    setGameState(prev => ({
      ...prev,
      scrap: prev.scrap - cost,
      inventory: [...prev.inventory, randomPart.id]
    }));

    toast({
      title: "Crafting Successful",
      description: `Fabricated: ${randomPart.name}`,
       className: cn("border-2", RARITY_COLORS[tier].border, "bg-black text-white")
    });
  };

  // --- UNSTABLE FABRICATION LOGIC ---
  const handleUnstableCraft = () => {
      if (gameState.scrap < CRAFT_COSTS.UNSTABLE) {
          toast({ title: "Insufficient Scrap", variant: "destructive" });
          return;
      }

      const roll = Math.random();
      let tier = 1;
      // Chances: 1% Epic, 9% Rare, 30% Uncommon, 60% Common
      if (roll > 0.99) tier = 4; // Epic
      else if (roll > 0.90) tier = 3; // Rare
      else if (roll > 0.60) tier = 2; // Uncommon
      // else Common

      const possibleParts = parts.filter(p => p.tier === tier);
      const randomPart = possibleParts[Math.floor(Math.random() * possibleParts.length)];

      setGameState(prev => ({
          ...prev,
          scrap: prev.scrap - CRAFT_COSTS.UNSTABLE,
          inventory: [...prev.inventory, randomPart.id]
      }));

      // Different toast for big wins
      if (tier >= 3) {
           toast({
              title: "CRITICAL SUCCESS! ⚡",
              description: `Unstable fusion stabilized! Created ${randomPart.name} (${RARITY_COLORS[tier].name})`,
              className: "bg-purple-600 text-white border-2 border-yellow-400"
          });
      } else {
          toast({
              title: "Fabrication Complete",
              description: `Created: ${randomPart.name}`,
              className: cn("border-2", RARITY_COLORS[tier].border, "bg-black text-white")
          });
      }
  };


  const handleReset = () => {
      setFusionResult(null);
      setSelectedItemId(null);
  };

  const handleSelect = (id) => {
      if (isFusing) return;
      setFusionResult(null);
      setSelectedItemId(id);
  };

  return (
    <>
      <Helmet>
        <title>The Forge - Robot Battle Arena</title>
        <meta name="description" content="Fuse duplicate parts to create powerful upgraded equipment." />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a12] text-[#e0e0e0] font-mono selection:bg-[var(--accent-color)] selection:text-black flex flex-col">
        {/* Header */}
        <div className="bg-black/80 border-b border-[var(--accent-color)] p-4 sticky top-0 z-20 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)] backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/hub')} 
                variant="ghost" 
                className="text-gray-400 hover:text-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.1)] rounded-none"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Hub
              </Button>
              <h1 className="text-2xl font-bold flex items-center gap-2 uppercase tracking-widest text-[var(--accent-color)] [text-shadow:0_0_10px_var(--accent-color)]">
                <Hammer className="w-6 h-6" />
                The Forge
              </h1>
            </div>
            
            {/* Scrap Display */}
            <div className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-800">
               <Coins className="w-4 h-4 text-yellow-500" />
               <span className="text-yellow-500 font-bold">{gameState.scrap}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Panel: Inventory List */}
            <div className="lg:col-span-1 bg-black/40 rounded-none border border-gray-800 p-4 h-[calc(100vh-140px)] flex flex-col">
                <h2 className="text-sm font-bold mb-4 text-[var(--accent-color)] uppercase tracking-widest border-b border-gray-800 pb-2">
                    Fusion Candidates
                </h2>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-800">
                    {fusibleItems.length === 0 ? (
                        <div className="text-center py-10 text-gray-600">
                            <Hammer className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No fusible items found.</p>
                            <p className="text-[10px] mt-2 uppercase tracking-wide">Collect 3 duplicates to fuse.</p>
                        </div>
                    ) : (
                        fusibleItems.map((item) => {
                            const colors = RARITY_COLORS[item.tier];
                            const isSelected = selectedItemId === item.id;
                            
                            return (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ scale: 1.01 }}
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
                                            <div className={`font-bold text-sm mb-1 ${isSelected ? 'text-[var(--accent-color)]' : 'text-gray-300'}`}>
                                                {item.name}
                                            </div>
                                            <RarityBadge tier={item.tier} className="scale-90 origin-left" />
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

            {/* Right Panel: Crafting & Fusion */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* 1. Crafting Station */}
                <div className="bg-black/40 border border-gray-800 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="w-32 h-32 text-[var(--accent-color)]" />
                    </div>
                    
                    <h2 className="text-sm font-bold mb-4 text-[var(--accent-color)] uppercase tracking-widest border-b border-gray-800 pb-2 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Material Fabrication
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        {/* Craft Common */}
                        <Button 
                            onClick={() => handleCraft(1)}
                            className="h-auto py-6 flex flex-col items-center bg-black border border-gray-700 hover:border-gray-400 hover:bg-gray-900 rounded-none group transition-all"
                        >
                            <div className="text-lg font-bold text-white mb-1 uppercase tracking-wider">Fabricate Common</div>
                            <div className="flex items-center gap-2 text-yellow-500 text-sm">
                                <Coins className="w-3 h-3" /> {CRAFT_COSTS.COMMON} Scrap
                            </div>
                            <div className="mt-2 text-[10px] text-gray-500 group-hover:text-gray-400">Generates Random Tier 1 Part</div>
                        </Button>

                        {/* Craft Uncommon */}
                        <Button 
                            onClick={() => handleCraft(2)}
                            className="h-auto py-6 flex flex-col items-center bg-black border border-green-900/50 hover:border-green-500 hover:bg-green-900/10 rounded-none group transition-all"
                        >
                            <div className="text-lg font-bold text-green-400 mb-1 uppercase tracking-wider">Fabricate Uncommon</div>
                            <div className="flex items-center gap-2 text-yellow-500 text-sm">
                                <Coins className="w-3 h-3" /> {CRAFT_COSTS.UNCOMMON} Scrap
                            </div>
                            <div className="mt-2 text-[10px] text-gray-500 group-hover:text-green-400/70">Generates Random Tier 2 Part</div>
                        </Button>

                        {/* Unstable Fabrication (Gambling) */}
                        <Button 
                            onClick={handleUnstableCraft}
                            className="sm:col-span-2 h-auto py-6 flex flex-col items-center bg-black border border-red-900/50 hover:border-red-500 hover:bg-red-900/10 rounded-none group transition-all relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            
                            <div className="text-lg font-bold text-red-500 mb-1 uppercase tracking-wider flex items-center gap-2">
                                <Zap className="w-5 h-5 animate-pulse" /> Unstable Fabrication
                            </div>
                            <div className="flex items-center gap-2 text-yellow-500 text-sm">
                                <Coins className="w-3 h-3" /> {CRAFT_COSTS.UNSTABLE} Scrap
                            </div>
                            <div className="mt-2 text-[10px] text-gray-500 group-hover:text-red-400/70">
                                Risk of failure. Chance of <span className="text-purple-400 font-bold">EPIC</span> loot.
                            </div>
                        </Button>
                    </div>
                </div>

                {/* 2. Fusion Interface (Existing) */}
                <div className="flex-1 bg-black/40 border border-gray-800 p-6 relative flex flex-col items-center justify-center min-h-[400px]">
                      <h2 className="absolute top-6 left-6 text-sm font-bold text-[var(--accent-color)] uppercase tracking-widest flex items-center gap-2">
                        <Hammer className="w-4 h-4" /> Fusion Chamber
                    </h2>

                    <FusionInterface 
                        selectedItem={selectedItem}
                        onFuse={handleFuse}
                        isFusing={isFusing}
                        fusionResult={fusionResult}
                        onReset={handleReset}
                    />
                </div>

            </div>

        </div>
      </div>
    </>
  );
};

export default ForgeScreen;