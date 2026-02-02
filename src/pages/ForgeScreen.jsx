
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hammer } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { getPartById } from '@/data/parts';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { RARITY_COLORS } from '@/constants/gameConstants';
import RarityBadge from '@/components/RarityBadge';
import FusionInterface from '@/components/FusionInterface';

const ForgeScreen = () => {
  const navigate = useNavigate();
  const { gameState, performFusion } = useGameContext();
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isFusing, setIsFusing] = useState(false);
  const [fusionResult, setFusionResult] = useState(null);

  // Filter inventory for fusible items (3+ duplicates, Not Legendary)
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
      .filter(item => item && item.tier < 4) // Filter out nulls and Legendaries
      .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
  }, [gameState.inventory]);

  const selectedItem = selectedItemId ? getPartById(selectedItemId) : null;

  const handleFuse = async () => {
    if (!selectedItemId) return;
    
    setIsFusing(true);
    
    // Simulate delay for animation
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

      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-20 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/hub')} 
                variant="ghost" 
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Hub
              </Button>
              <h1 className="text-2xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                <Hammer className="w-6 h-6 text-orange-500" />
                The Forge
              </h1>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Panel: Inventory List */}
            <div className="lg:col-span-1 bg-gray-800/50 rounded-xl border border-gray-700 p-4 h-[calc(100vh-140px)] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4 text-gray-300 uppercase tracking-wider text-sm">Fusible Items</h2>
                
                {fusibleItems.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p>No items available for fusion.</p>
                        <p className="text-xs mt-2">Collect 3 duplicates of the same rarity to fuse.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {fusibleItems.map((item) => {
                            const colors = RARITY_COLORS[item.tier];
                            const isSelected = selectedItemId === item.id;
                            
                            return (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => handleSelect(item.id)}
                                    className={`
                                        cursor-pointer p-3 rounded-lg border transition-all relative overflow-hidden group
                                        ${isSelected ? `${colors.bgTint} ${colors.border} ring-1 ring-offset-1 ring-offset-gray-900 ring-gray-400` : 'bg-gray-800 border-gray-700 hover:border-gray-600'}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-bold ${isSelected ? colors.text : 'text-gray-200'}`}>{item.name}</span>
                                            </div>
                                            <RarityBadge tier={item.tier} />
                                        </div>
                                        <div className="bg-gray-900 px-2 py-1 rounded text-xs font-mono text-gray-400 border border-gray-700">
                                            x{item.count}
                                        </div>
                                    </div>
                                    {isSelected && <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bg}`} />}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right Panel: Fusion Interface */}
            <div className="lg:col-span-2 bg-gray-800/30 rounded-xl border border-gray-700 p-6 flex flex-col items-center justify-center relative overflow-hidden">
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
    </>
  );
};

export default ForgeScreen;
