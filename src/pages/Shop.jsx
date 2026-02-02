
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext, THEMES } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Coins, Palette, Check, Trash2, Banknote, ShieldCheck, Box } from 'lucide-react';
import { MYSTERY_CRATE_COST, RARITY_COLORS } from '@/constants/gameConstants';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import RarityBadge from '@/components/RarityBadge';
import { cn } from '@/lib/utils';

// Create a safe map of icons to avoid computed namespace access issues
const IconMap = { ...LucideIcons };

const THEME_PRICE = 500;

const Shop = () => {
  const navigate = useNavigate();
  const { gameState, updateScrap, addToInventory, purchaseMysteryBox, unlockTheme, getSellValue, sellItem, sellAllCommonItems } = useGameContext();
  const { playSound } = useSoundContext();
  
  const handlePurchase = () => {
    if (gameState.scrap < MYSTERY_CRATE_COST) {
      toast({
        title: "Insufficient Scrap",
        description: `You need ${MYSTERY_CRATE_COST} scrap to purchase a Mystery Crate`,
        variant: "destructive"
      });
      return;
    }
    
    const newPart = purchaseMysteryBox();
    updateScrap(-MYSTERY_CRATE_COST);
    addToInventory(newPart.id);
    playSound('BUY');
    
    toast({
      title: "Mystery Crate Opened! 🎁",
      description: `Acquired ${newPart.name} (${newPart.rarity})!`,
      className: cn("text-white border", RARITY_COLORS[newPart.tier].bg, RARITY_COLORS[newPart.tier].border)
    });
  };

  const handleThemePurchase = (themeName) => {
    if (gameState.unlockedThemes.includes(themeName)) return;

    if (gameState.scrap < THEME_PRICE) {
      toast({
        title: "Insufficient Scrap",
        description: `You need ${THEME_PRICE} scrap to unlock this theme.`,
        variant: "destructive"
      });
      return;
    }

    updateScrap(-THEME_PRICE);
    unlockTheme(themeName);
    playSound('BUY');
    toast({
      title: "Theme Unlocked! 🎨",
      description: `You can now apply the ${themeName} theme in the Workshop.`,
      className: "bg-[var(--accent-color)] text-black border border-white font-bold"
    });
  };

  const handleSell = (itemId, itemName) => {
    const value = sellItem(itemId);
    if (value) {
      playSound('SELL'); // Ensure this sound exists or gracefully fails
      toast({
        title: "Item Sold",
        description: `Sold ${itemName} for ${value} Scrap`,
        className: "bg-green-900/50 border-green-500 text-green-200"
      });
    }
  };

  const handleSellAllCommons = () => {
    const { soldCount, totalValue } = sellAllCommonItems();
    if (soldCount > 0) {
      playSound('SELL');
      toast({
        title: "Bulk Sale Complete",
        description: `Recycled ${soldCount} common items for ${totalValue} Scrap`,
        className: "bg-green-900/50 border-green-500 text-green-200"
      });
    }
  };
  
  // Separate inventory parts (sellable) and equipped parts (read-only in shop)
  const inventoryParts = gameState.inventory.map(id => getPartById(id)).filter(Boolean);
  // NEW: Filter logic
  const filteredParts = activeCategory === 'ALL' 
    ? inventoryParts 
    : inventoryParts.filter(p => p.slot === activeCategory);
  const equippedParts = Object.values(gameState.playerBot.equipment)
    .filter(id => id)
    .map(id => getPartById(id))
    .filter(Boolean);

  const commonItemsCount = inventoryParts.filter(p => p.tier === 1).length;
  
const purchasableThemes = [
    { name: 'Cyber Blue', color: THEMES['Cyber Blue'].hex },
    { name: 'Crimson Red', color: THEMES['Crimson Red'].hex },
    { name: 'Midas Gold', color: THEMES['Midas Gold'].hex },
    { name: 'Neon Violet', color: THEMES['Neon Violet'].hex },
    { name: 'Toxic Acid', color: THEMES['Toxic Acid'].hex },
    { name: 'Ice White', color: THEMES['Ice White'].hex }
  ];
return (
    <>
      <Helmet>
        <title>Shop - Robot Battle Arena</title>
        <meta name="description" content="Purchase mystery crates and view your inventory of robot parts." />
      </Helmet>
      
      {/* CRITICAL FIX: 
          1. Changed min-h-screen to h-screen.
          2. Added overflow-y-auto to force scrolling WITHIN this container.
          3. Added scroll-smooth for nicer feel.
      */}
      <div className="h-screen overflow-y-auto bg-[#0a0a12] p-4 font-mono text-[#e0e0e0] selection:bg-[var(--accent-color)] selection:text-black scroll-smooth">
        <div className="max-w-6xl mx-auto py-8 pb-32">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 flex justify-between items-center"
          >
            <Button
              onClick={() => navigate('/hub')}
              variant="outline"
              className="bg-black text-[var(--accent-color)] border-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.1)] rounded-lg uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
            
            <div className="text-right flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg border border-gray-800">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 font-bold">{gameState.scrap}</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold text-[var(--accent-color)] mb-2 uppercase tracking-widest [text-shadow:0_0_10px_var(--accent-color)]">Logistics</h1>
            <p className="text-xl text-gray-500 uppercase tracking-[0.2em]">Acquire & Liquidate Assets</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Mystery Crate */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/80 rounded-xl p-8 border border-[var(--accent-color)] shadow-[0_0_15px_rgba(var(--accent-rgb),0.05)]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 border border-purple-500 bg-purple-500/10 rounded-lg">
                     <Package className="w-10 h-10 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#e0e0e0] uppercase tracking-wider">Mystery Crate</h3>
                    <p className="text-gray-500 text-xs uppercase tracking-widest">Random Tier 1-4 part</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-500">{MYSTERY_CRATE_COST}</div>
                  <div className="text-xs text-gray-500 uppercase">Scrap</div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-6 text-center text-xs uppercase tracking-wider font-mono">
                <div className="bg-gray-900 border border-gray-600 p-2 rounded-lg">
                  <div className="text-gray-400 mb-1">Common</div>
                  <div className="text-white font-bold">50%</div>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-600 p-2 rounded-lg">
                  <div className="text-emerald-400 mb-1">Uncommon</div>
                  <div className="text-white font-bold">30%</div>
                </div>
                <div className="bg-blue-900/20 border border-blue-600 p-2 rounded-lg">
                  <div className="text-blue-400 mb-1">Rare</div>
                  <div className="text-white font-bold">15%</div>
                </div>
                 <div className="bg-amber-900/20 border border-amber-600 p-2 rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                  <div className="text-amber-400 mb-1">Legendary</div>
                  <div className="text-white font-bold">5%</div>
                </div>
              </div>
              
              <Button
                onClick={handlePurchase}
                disabled={gameState.scrap < MYSTERY_CRATE_COST}
                className="w-full bg-purple-900/20 border border-purple-500 text-purple-400 hover:bg-purple-900/40 hover:text-purple-300 text-lg py-8 rounded-lg uppercase tracking-[0.2em] font-bold shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
              >
                [ Purchase Mystery Crate ]
              </Button>
            </motion.div>

            {/* Cosmetics Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/80 rounded-xl p-8 border border-[var(--accent-color)] shadow-[0_0_15px_rgba(var(--accent-rgb),0.05)]"
            >
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 border border-[var(--accent-color)] bg-[rgba(var(--accent-rgb),0.1)] rounded-lg">
                       <Palette className="w-10 h-10 text-[var(--accent-color)]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#e0e0e0] uppercase tracking-wider">Cosmetics</h3>
                      <p className="text-gray-500 text-xs uppercase tracking-widest">System Interfaces</p>
                    </div>
                 </div>
               </div>

               <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                 {purchasableThemes.map((theme) => {
                   const isOwned = gameState.unlockedThemes.includes(theme.name);
                   return (
                     <div key={theme.name} className="flex items-center justify-between p-3 border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-colors rounded-lg">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 border border-white rounded-md" style={{ backgroundColor: theme.color, boxShadow: `0 0 10px ${theme.color}` }} />
                         <div>
                            <div className="font-bold text-white uppercase tracking-wider text-sm">{theme.name}</div>
                            {isOwned && <div className="text-[10px] text-[var(--accent-color)] flex items-center gap-1"><Check className="w-3 h-3" /> ACQUIRED</div>}
                         </div>
                       </div>
                       
                       <Button
                          onClick={() => handleThemePurchase(theme.name)}
                          disabled={isOwned || gameState.scrap < THEME_PRICE}
                          size="sm"
                          className={cn(
                            "min-w-[100px] rounded-md uppercase font-bold text-xs",
                            isOwned ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-black border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.1)]"
                          )}
                       >
                          {isOwned ? "OWNED" : `${THEME_PRICE} SCRAP`}
                       </Button>
                     </div>
                   );
                 })}
               </div>
            </motion.div>
          </div>
          
          {/* Active Loadout Section */}
          {equippedParts.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-8"
             >
                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-400 mb-4 uppercase tracking-widest border-b border-gray-800 pb-2">
                   <ShieldCheck className="w-5 h-5" /> Active Loadout <span className="text-xs text-gray-600 ml-2">(Cannot Sell Equipped Items)</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                   {equippedParts.map((part, index) => {
                      const Icon = IconMap[part.icon] || IconMap.Box;
                      const colors = RARITY_COLORS[part.tier];
                      return (
                         <div key={`equipped-${index}`} className={cn("p-4 border rounded-lg bg-gray-900/20 opacity-70 grayscale-[0.5]", colors.border)}>
                            <div className="flex justify-between items-start mb-2">
                               <Icon className={cn("w-6 h-6", colors.text)} />
                               <span className="text-[10px] bg-gray-800 px-1 rounded text-gray-400">EQUIPPED</span>
                            </div>
                            <div className="text-xs font-bold text-gray-400 truncate">{part.name}</div>
                         </div>
                      )
                   })}
                </div>
             </motion.div>
          )}

          {/* NEW INVENTORY SECTION WITH TABS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 mb-4 gap-4">
               <div className="flex flex-col">
                   <h3 className="text-xl font-bold text-[#e0e0e0] uppercase tracking-widest flex items-center gap-3">
                     <Box className="w-5 h-5 text-[var(--accent-color)]" />
                     Storage
                   </h3>
                   <span className="text-xs text-gray-500 mt-1">{filteredParts.length} items found</span>
               </div>
               
               <div className="flex flex-wrap gap-2">
                   {CATEGORIES.map(cat => (
                       <button
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={cn(
                               "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border transition-all",
                               activeCategory === cat 
                                ? "bg-[var(--accent-color)] text-black border-[var(--accent-color)]" 
                                : "bg-black text-gray-500 border-gray-800 hover:border-gray-600"
                           )}
                       >
                           {cat === 'RightArm' ? 'R-Arm' : cat === 'LeftArm' ? 'L-Arm' : cat}
                       </button>
                   ))}
               </div>

               {commonItemsCount > 0 && (
                 <Button 
                    onClick={handleSellAllCommons}
                    className="bg-red-900/20 text-red-400 border border-red-900 hover:bg-red-900/40 hover:text-red-300 uppercase font-mono text-xs tracking-wider"
                 >
                    <Trash2 className="w-4 h-4 mr-2" /> Dump Commons ({commonItemsCount})
                 </Button>
               )}
            </div>
            
            {filteredParts.length === 0 ? (
              <div className="text-gray-600 text-center py-12 border-2 border-dashed border-gray-800 font-mono uppercase rounded-lg bg-black/50">
                <p>No items found in category: {activeCategory}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <AnimatePresence mode='popLayout'>
                  {filteredParts.map((part, index) => {
                    const Icon = IconMap[part.icon] || IconMap.Box;
                    const colors = RARITY_COLORS[part.tier];
                    const sellValue = getSellValue(part.tier);
                    
                    return (
                      <motion.div
                        key={`${part.id}-${index}`}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className={cn(
                          "rounded-lg p-4 border relative group bg-black transition-all hover:bg-gray-900 flex flex-col justify-between min-h-[140px]",
                          part.tier >= 3 ? colors.border : "border-gray-800 hover:border-[var(--accent-color)]",
                        )}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <Icon className={cn("w-8 h-8", colors.text)} />
                            <RarityBadge tier={part.tier} className="scale-75 origin-top-right -mr-2 -mt-1" />
                          </div>
                          <div className="text-xs font-bold text-[#e0e0e0] mb-1 truncate font-mono uppercase tracking-tight">
                            {part.name}
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">
                            [{part.slot}]
                          </div>
                        </div>

                        {/* Sell Button */}
                        <Button
                          onClick={(e) => {
                             e.stopPropagation();
                             handleSell(part.id, part.name);
                          }}
                          variant="outline"
                          className="w-full h-8 mt-auto border-gray-700 hover:bg-red-900/30 hover:text-red-400 hover:border-red-500 text-gray-500 text-[10px] uppercase font-mono tracking-wider flex justify-between px-2"
                        >
                           <span>Sell</span>
                           <span className="flex items-center text-white"><span className="text-yellow-500 mr-1 font-bold">{sellValue}</span> $</span>
                        </Button>
                        
                        {/* Hover stats overlay */}
                        <div className="absolute inset-0 bg-black/95 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center text-xs font-mono border border-[var(--accent-color)] rounded-lg pointer-events-none z-10">
                          <div className="flex justify-between mb-1 border-b border-gray-800 pb-1"><span>DMG:</span> <span className="text-red-400">{part.stats.Damage}</span></div>
                          <div className="flex justify-between mb-1 border-b border-gray-800 pb-1"><span>SPD:</span> <span className="text-yellow-400">{part.stats.Speed}</span></div>
                          <div className="flex justify-between mb-1"><span>ARM:</span> <span className="text-green-400">{part.stats.Armor}</span></div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Shop;