import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext, THEMES } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Coins, Palette, Check, Trash2, Box, ShieldCheck, ShoppingCart } from 'lucide-react';
import { MYSTERY_CRATE_COST, RARITY_COLORS } from '@/constants/gameConstants';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import RarityBadge from '@/components/RarityBadge';
import { cn } from '@/lib/utils';
import ScreenBackground from '@/components/ScreenBackground';
import shopBg from '@/assets/facto_bg.jpg'; // Using Factory/Industrial BG

// Create a safe map of icons to avoid computed namespace access issues
const IconMap = { ...LucideIcons };

const THEME_PRICE = 500;
const CATEGORIES = ['ALL', 'Head', 'RightArm', 'LeftArm', 'Chassis'];

const Shop = () => {
  const navigate = useNavigate();
  const { gameState, updateScrap, addToInventory, purchaseMysteryBox, unlockTheme, getSellValue, sellItem, sellAllCommonItems } = useGameContext();
  const { playSound } = useSoundContext();
  const [activeCategory, setActiveCategory] = useState('ALL');

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
      playSound('EQUIP'); // Reusing a mechanical sound for selling
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
      playSound('EQUIP');
      toast({
        title: "Bulk Sale Complete",
        description: `Recycled ${soldCount} common items for ${totalValue} Scrap`,
        className: "bg-green-900/50 border-green-500 text-green-200"
      });
    }
  };
  
  const inventoryParts = gameState.inventory.map(id => getPartById(id)).filter(Boolean);
  const filteredParts = activeCategory === 'ALL' 
    ? inventoryParts 
    : inventoryParts.filter(p => p.slot === activeCategory);
  
  const equippedParts = Object.values(gameState.playerBot.equipment)
    .filter(id => id)
    .map(id => getPartById(id))
    .filter(Boolean);

  const commonItemsCount = inventoryParts.filter(p => p.tier === 1).length;
  
  const purchasableThemes = [
    // Standard
    { name: 'Cyber Blue', color: THEMES['Cyber Blue'].hex },
    { name: 'Crimson Red', color: THEMES['Crimson Red'].hex },
    { name: 'Midas Gold', color: THEMES['Midas Gold'].hex },
    { name: 'Amber Terminal', color: THEMES['Amber Terminal'].hex },
    // Neon
    { name: 'Neon Violet', color: THEMES['Neon Violet'].hex },
    { name: 'Toxic Acid', color: THEMES['Toxic Acid'].hex },
    { name: 'Hot Pink', color: THEMES['Hot Pink'].hex },
    { name: 'Electric Orange', color: THEMES['Electric Orange'].hex },
    // High Tech
    { name: 'Ice White', color: THEMES['Ice White'].hex },
    { name: 'Plasma Teal', color: THEMES['Plasma Teal'].hex },
    { name: 'Matrix Code', color: THEMES['Matrix Code'].hex },
    // Luxury
    { name: 'Royal Purple', color: THEMES['Royal Purple'].hex },
    { name: 'Rose Gold', color: THEMES['Rose Gold'].hex },
    { name: 'Void', color: THEMES['Void'].hex },
  ];

  return (
    <>
      <Helmet>
        <title>Shop - Robot Battle Arena</title>
      </Helmet>
      
      {/* 1. BACKGROUND LAYER */}
      <ScreenBackground image={shopBg} opacity={0.4} />

      {/* 2. MAIN CONTENT */}
      <div className="h-screen overflow-y-auto bg-transparent p-4 font-mono text-[#e0e0e0] selection:bg-[var(--accent-color)] selection:text-black scroll-smooth relative z-10">
        <div className="max-w-7xl mx-auto py-2 pb-32">
          
          {/* HEADER BAR (Matching Hub Style) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800 pb-4 gap-4 bg-black/60 backdrop-blur-md p-4 rounded-b-lg">
             {/* Left: Title & Navigation */}
             <div>
                <div className="flex items-center gap-4 mb-1">
                    <Button
                      onClick={() => navigate('/hub')}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-[var(--accent-color)] hover:bg-transparent p-0 h-auto"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--accent-color)] [text-shadow:0_0_15px_rgba(var(--accent-rgb),0.5)]">
                        SUPPLY DEPOT
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 pl-9">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    Acquisitions & Liquidations
                </div>
             </div>

             {/* Right: Stats/Currency */}
             <div className="flex items-center gap-4">
                <div className="bg-black/80 border border-yellow-900/30 px-4 py-2 flex items-center gap-3 min-w-[140px] rounded-sm">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider leading-none mb-0.5">Scrap</div>
                        <div className="text-lg font-bold text-yellow-500 leading-none font-mono">{gameState.scrap}</div>
                    </div>
                </div>
             </div>
          </div>
          
          {/* SECTION 1: PURCHASING (Tightened Layout) */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            
            {/* Mystery Crate - Reduced Padding */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/60 backdrop-blur-md rounded-none p-6 border border-[var(--accent-color)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 border border-purple-500 bg-purple-500/10 rounded-sm">
                      <Package className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#e0e0e0] uppercase tracking-wider">Mystery Crate</h3>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">Random Tier 1-4 part</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-500">{MYSTERY_CRATE_COST}</div>
                  <div className="text-[9px] text-gray-500 uppercase">Scrap</div>
                </div>
              </div>
              
              {/* Compact Probability Chart */}
              <div className="grid grid-cols-4 gap-1 mb-4 text-center text-[9px] uppercase tracking-wider font-mono">
                <div className="bg-gray-900 border border-gray-600 p-1 rounded-sm">
                  <div className="text-gray-400">Common</div>
                  <div className="text-white font-bold">50%</div>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-600 p-1 rounded-sm">
                  <div className="text-emerald-400">Uncommon</div>
                  <div className="text-white font-bold">30%</div>
                </div>
                <div className="bg-blue-900/20 border border-blue-600 p-1 rounded-sm">
                  <div className="text-blue-400">Rare</div>
                  <div className="text-white font-bold">15%</div>
                </div>
                 <div className="bg-amber-900/20 border border-amber-600 p-1 rounded-sm shadow-[0_0_5px_rgba(245,158,11,0.2)]">
                  <div className="text-amber-400">Leg.</div>
                  <div className="text-white font-bold">5%</div>
                </div>
              </div>
              
              <Button
                onClick={handlePurchase}
                disabled={gameState.scrap < MYSTERY_CRATE_COST}
                className="w-full h-12 bg-purple-900/20 border border-purple-500 text-purple-400 hover:bg-purple-900/40 hover:text-purple-300 text-sm rounded-sm uppercase tracking-[0.2em] font-bold shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
              >
                Purchase Crate
              </Button>
            </motion.div>

            {/* Cosmetics Section - Reduced Padding & Height */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/60 backdrop-blur-md rounded-none p-6 border border-[var(--accent-color)] flex flex-col"
            >
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 border border-[var(--accent-color)] bg-[rgba(var(--accent-rgb),0.1)] rounded-sm">
                       <Palette className="w-6 h-6 text-[var(--accent-color)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#e0e0e0] uppercase tracking-wider">Cosmetics</h3>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest">Interfaces</p>
                    </div>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 max-h-[140px] space-y-2">
                 {purchasableThemes.map((theme) => {
                   const isOwned = gameState.unlockedThemes.includes(theme.name);
                   return (
                     <div key={theme.name} className="flex items-center justify-between p-2 border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-colors rounded-sm">
                       <div className="flex items-center gap-3">
                         <div className="w-6 h-6 border border-white/20 rounded-sm" style={{ backgroundColor: theme.color, boxShadow: `0 0 5px ${theme.color}` }} />
                         <div className="font-bold text-white uppercase tracking-wider text-[10px]">{theme.name}</div>
                       </div>
                       
                       <Button
                          onClick={() => handleThemePurchase(theme.name)}
                          disabled={isOwned || gameState.scrap < THEME_PRICE}
                          size="sm"
                          className={cn(
                            "h-6 min-w-[80px] rounded-sm uppercase font-bold text-[9px]",
                            isOwned ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-black border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.1)]"
                          )}
                       >
                          {isOwned ? "OWNED" : `${THEME_PRICE} $`}
                       </Button>
                     </div>
                   );
                 })}
               </div>
            </motion.div>
          </div>
          
          {/* Active Loadout Section (Read Only) */}
          {equippedParts.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-8"
             >
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest border-b border-gray-800 pb-2">
                   <ShieldCheck className="w-4 h-4" /> Active Loadout <span className="text-[10px] text-gray-600 ml-2">(Cannot Sell Equipped Items)</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                   {equippedParts.map((part, index) => {
                      const Icon = IconMap[part.icon] || IconMap.Box;
                      const colors = RARITY_COLORS[part.tier];
                      return (
                         <div key={`equipped-${index}`} className={cn("p-3 border rounded-sm bg-gray-900/40 opacity-70 grayscale-[0.5]", colors.border)}>
                            <div className="flex justify-between items-start mb-2">
                               <Icon className={cn("w-5 h-5", colors.text)} />
                               <span className="text-[9px] bg-gray-800 px-1 rounded text-gray-400">EQUIPPED</span>
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 truncate">{part.name}</div>
                         </div>
                      )
                   })}
                </div>
             </motion.div>
          )}

          {/* INVENTORY / STORAGE SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/60 backdrop-blur-md rounded-none p-6 border border-gray-800"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 mb-4 gap-4">
               <div className="flex flex-col">
                   <h3 className="text-lg font-bold text-[#e0e0e0] uppercase tracking-widest flex items-center gap-2">
                     <Box className="w-4 h-4 text-[var(--accent-color)]" />
                     Storage
                   </h3>
                   <span className="text-[10px] text-gray-500 mt-1">{filteredParts.length} items found</span>
               </div>
               
               <div className="flex flex-wrap gap-2">
                   {CATEGORIES.map(cat => (
                       <button
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={cn(
                               "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border transition-all",
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
                   size="sm"
                   className="bg-red-900/20 text-red-400 border border-red-900 hover:bg-red-900/40 hover:text-red-300 uppercase font-mono text-[10px] tracking-wider h-7"
                 >
                    <Trash2 className="w-3 h-3 mr-2" /> Dump Commons ({commonItemsCount})
                 </Button>
               )}
            </div>
            
            {filteredParts.length === 0 ? (
              <div className="text-gray-600 text-center py-12 border-2 border-dashed border-gray-800 font-mono uppercase rounded-lg bg-black/20 text-xs">
                <p>No items found in category: {activeCategory}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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
                          "rounded-sm p-3 border relative group bg-black transition-all hover:bg-gray-900 flex flex-col justify-between min-h-[130px]",
                          part.tier >= 3 ? colors.border : "border-gray-800 hover:border-[var(--accent-color)]",
                        )}
                      >
                        {/* Content Container */}
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <Icon className={cn("w-6 h-6", colors.text)} />
                            <RarityBadge tier={part.tier} className="scale-[0.6] origin-top-right -mr-3 -mt-2" />
                          </div>
                          <div className="text-[10px] font-bold text-[#e0e0e0] mb-1 truncate font-mono uppercase tracking-tight">
                            {part.name}
                          </div>
                          <div className="text-[8px] text-gray-500 uppercase tracking-widest mb-2">
                            [{part.slot}]
                          </div>
                        </div>

                        {/* HOVER STATS (Behind the sell button now) */}
                        <div className="absolute inset-0 top-0 h-[60%] bg-black/95 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center text-[9px] font-mono border-b border-gray-800 pointer-events-none z-20">
                          <div className="flex justify-between mb-1"><span>DMG:</span> <span className="text-red-400">{part.stats.Damage}</span></div>
                          <div className="flex justify-between mb-1"><span>SPD:</span> <span className="text-yellow-400">{part.stats.Speed}</span></div>
                          <div className="flex justify-between"><span>ARM:</span> <span className="text-green-400">{part.stats.Armor}</span></div>
                        </div>

                        {/* SELL BUTTON (Always Visible / Accessible) */}
                        <Button
                          onClick={(e) => {
                             e.stopPropagation();
                             handleSell(part.id, part.name);
                          }}
                          variant="outline"
                          className="w-full h-7 mt-auto border-gray-700 bg-gray-900/50 hover:bg-red-900/30 hover:text-red-400 hover:border-red-500 text-gray-500 text-[9px] uppercase font-mono tracking-wider flex justify-between px-2 relative z-30"
                        >
                           <span>Sell</span>
                           <span className="flex items-center text-white"><span className="text-yellow-500 mr-1 font-bold">{sellValue}</span></span>
                        </Button>
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