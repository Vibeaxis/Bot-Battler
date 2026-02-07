import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext, THEMES } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Package, Coins, Palette, Trash2, Box, 
  ShieldCheck, X, Zap, Activity, RefreshCw, BarChart3, ArrowRight
} from 'lucide-react';
import { MYSTERY_CRATE_COST, RARITY_COLORS } from '@/constants/gameConstants';
import { getPartById, ALL_PARTS } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import RarityBadge from '@/components/RarityBadge';
import { cn } from '@/lib/utils';
import ScreenBackground from '@/components/ScreenBackground';
import shopBg from '@/assets/facto_bg.jpg'; 

const IconMap = { ...LucideIcons };

// --- CONFIG ---
const THEME_PRICE = 500;
const CATEGORIES = ['ALL', 'Head', 'RightArm', 'LeftArm', 'Chassis'];
const VENDOR_QUOTES = [
    "Don't ask where I got this.",
    "Cleaned the blood off myself.",
    "No refunds. No witnesses.",
    "This fell off a transport ship.",
    "You got the scrap? I got the goods.",
    "Quickly. I don't have all day.",
    "Top shelf. Illegal in 12 sectors."
];

// --- STAT BAR COMPONENT ---
const StatBar = ({ label, value, max = 100, compareValue = null }) => {
  const diff = compareValue !== null ? value - compareValue : 0;
  const diffColor = diff > 0 ? "text-emerald-400" : diff < 0 ? "text-red-400" : "text-gray-500";
  const diffText = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "-";

  return (
    <div className="flex items-center gap-2 text-[9px] font-mono w-full">
      <span className="w-6 text-zinc-500 uppercase">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-900 rounded-sm overflow-hidden relative">
        <div 
          className="h-full bg-zinc-400" 
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
        {compareValue !== null && (
           <div 
             className="absolute top-0 h-full w-0.5 bg-white opacity-50 z-10"
             style={{ left: `${Math.min((compareValue / max) * 100, 100)}%` }}
           />
        )}
      </div>
      <span className="w-5 text-right font-bold text-zinc-200">{value}</span>
      {compareValue !== null && (
        <span className={cn("w-6 text-right font-bold", diffColor)}>{diffText}</span>
      )}
    </div>
  );
};

const Shop = () => {
  const navigate = useNavigate();
  const { gameState, updateScrap, addToInventory, purchaseMysteryBox, unlockTheme, getSellValue, sellItem, sellAllCommonItems } = useGameContext();
  const { playSound } = useSoundContext();
  
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // TRACK SELECTED ITEM FOR COMPARISON
  
  const vendorQuote = useMemo(() => VENDOR_QUOTES[Math.floor(Math.random() * VENDOR_QUOTES.length)], []);

  // --- DAILY STOCK GENERATOR ---
  const dailyStock = useMemo(() => {
      const validStock = ALL_PARTS.filter(p => p.tier >= 2 && p.tier <= 4); 
      const stock = [];
      for(let i=0; i<3; i++) {
          if (validStock.length > 0) {
              const randomPart = validStock[Math.floor(Math.random() * validStock.length)];
              const markup = Math.floor(Math.random() * 20) + 10; 
              stock.push({ ...randomPart, price: getSellValue(randomPart.tier) * 4 + markup });
          }
      }
      return stock;
  }, []); 

  const handlePurchaseStock = (part) => {
      if (gameState.scrap < part.price) {
          playSound('ERROR');
          return;
      }
      updateScrap(-part.price);
      addToInventory(part.id);
      playSound('BUY');
      toast({
          title: "Acquired",
          description: part.name,
          className: cn("text-white border", RARITY_COLORS[part.tier].bg, RARITY_COLORS[part.tier].border)
      });
  };

  const handleCratePurchase = () => {
    if (gameState.scrap < MYSTERY_CRATE_COST) {
      playSound('ERROR');
      return;
    }
    
    const newPart = purchaseMysteryBox();
    updateScrap(-MYSTERY_CRATE_COST);
    addToInventory(newPart.id);
    playSound('BUY');
    
    toast({
      title: "Cache Opened",
      description: `${newPart.name} (${newPart.rarity})`,
      className: cn("text-white border", RARITY_COLORS[newPart.tier].bg, RARITY_COLORS[newPart.tier].border)
    });
  };

  const handleThemePurchase = (themeName) => {
    if (gameState.unlockedThemes.includes(themeName)) return;

    if (gameState.scrap < THEME_PRICE) {
      playSound('ERROR');
      return;
    }

    updateScrap(-THEME_PRICE);
    unlockTheme(themeName);
    playSound('BUY');
    toast({
      title: "Theme Installed",
      description: `${themeName} protocol active.`,
      className: "bg-[var(--accent-color)] text-black border border-white font-bold"
    });
  };

  const handleSell = (itemId, itemName) => {
    const value = sellItem(itemId);
    if (value) {
      playSound('EQUIP'); 
      if (selectedItem?.id === itemId) setSelectedItem(null); // Deselect if sold
      toast({
        title: "Liquidated",
        description: `+${value} Scrap`,
        className: "bg-red-900/50 border-red-500 text-red-200"
      });
    }
  };

  // --- SAFE SELL ALL WRAPPER ---
  const handleSellAllCommons = () => {
    try {
      const result = sellAllCommonItems();
      if (result && result.soldCount > 0) {
         playSound('EQUIP');
         setSelectedItem(null);
         toast({
            title: "Bulk Liquidation",
            description: `Recycled ${result.soldCount} items for ${result.totalValue} Scrap`,
            className: "bg-red-900/50 border-red-500 text-red-200"
         });
      } else {
         toast({ title: "No common items to sell", variant: "outline" });
      }
    } catch (e) {
      console.error("Sell All Error:", e);
      // Fallback if context is weird
      toast({ title: "System Malfunction", description: "Unable to process bulk sale.", variant: "destructive" });
    }
  };
  
  // --- HELPERS ---
  const getEquippedPartForSlot = (slot) => {
     const partId = gameState.playerBot.equipment[slot];
     return partId ? getPartById(partId) : null;
  };

  // --- FILTERING ---
  const inventoryParts = gameState.inventory.map(id => getPartById(id)).filter(Boolean);
  const filteredParts = activeCategory === 'ALL' 
    ? inventoryParts 
    : inventoryParts.filter(p => p.slot === activeCategory);
  
  const commonItemsCount = inventoryParts.filter(p => p.tier === 1).length;

  const purchasableThemes = [
    { name: 'Cyber Blue', color: THEMES['Cyber Blue'].hex },
    { name: 'Crimson Red', color: THEMES['Crimson Red'].hex },
    { name: 'Midas Gold', color: THEMES['Midas Gold'].hex },
    { name: 'Hot Pink', color: THEMES['Hot Pink'].hex },
    { name: 'Electric Orange', color: THEMES['Electric Orange'].hex },
    { name: 'Neon Violet', color: THEMES['Neon Violet'].hex },
    { name: 'Toxic Acid', color: THEMES['Toxic Acid'].hex },
    { name: 'Plasma Teal', color: THEMES['Plasma Teal'].hex },
    { name: 'Solar Flare', color: THEMES['Solar Flare'].hex },
    { name: 'Amber Terminal', color: THEMES['Amber Terminal'].hex },
    { name: 'Stealth Grey', color: THEMES['Stealth Grey'].hex },
    { name: 'Night Ops', color: THEMES['Night Ops'].hex },
    { name: 'Blood Moon', color: THEMES['Blood Moon'].hex },
    { name: 'Matrix Code', color: THEMES['Matrix Code'].hex },
    { name: 'Ice White', color: THEMES['Ice White'].hex },
    { name: 'Royal Purple', color: THEMES['Royal Purple'].hex },
    { name: 'Rose Gold', color: THEMES['Rose Gold'].hex },
    { name: 'Obsidian', color: THEMES['Obsidian'].hex },
    { name: 'Void', color: THEMES['Void'].hex },
  ];

  return (
    <>
      <Helmet>
        <title>Black Market - Scrap Syndicate</title>
      </Helmet>
      
      <ScreenBackground image={shopBg} opacity={0.3} />

      {/* --- THEME CATALOG MODAL --- */}
      <AnimatePresence>
        {showThemeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowThemeModal(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 bg-zinc-950 border border-zinc-700 w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/50">
                <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-zinc-400" />
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Visual Interface Protocols</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowThemeModal(false)}>
                    <X className="w-6 h-6 text-zinc-500 hover:text-white" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {purchasableThemes.map((theme) => {
                  const isOwned = gameState.unlockedThemes.includes(theme.name);
                  return (
                      <button
                        key={theme.name}
                        onClick={() => handleThemePurchase(theme.name)}
                        disabled={isOwned || gameState.scrap < THEME_PRICE}
                        className={cn(
                            "flex flex-col items-center gap-3 p-4 border rounded-sm transition-all group relative overflow-hidden",
                            isOwned ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-700 bg-black hover:border-white"
                        )}
                      >
                          <div className="w-12 h-12 rounded-full shadow-lg" style={{ backgroundColor: theme.color, boxShadow: `0 0 15px ${theme.color}` }}></div>
                          <div className="text-center z-10">
                              <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">{theme.name}</div>
                              <div className={cn("text-[10px] mt-1 font-mono", isOwned ? "text-emerald-500" : "text-zinc-500")}>
                                {isOwned ? "INSTALLED" : `${THEME_PRICE} SCRAP`}
                              </div>
                          </div>
                      </button>
                  )
              })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="h-screen overflow-y-auto bg-transparent font-mono text-[#e0e0e0] flex flex-col relative z-10 pb-12">
        
        {/* HEADER SECTION (Restored Size) */}
        <div className="bg-black/90 border-b border-red-900/30 backdrop-blur-md sticky top-0 z-40 shadow-2xl">
            <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                
                <div className="text-center md:text-left flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <Button 
                        onClick={() => navigate('/hub')} 
                        variant="ghost" 
                        className="text-red-800 hover:text-red-500 p-0 h-auto hover:bg-transparent"
                    >
                        <ArrowLeft className="w-8 h-8" />
                    </Button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-red-600 uppercase tracking-widest [text-shadow:0_0_15px_rgba(220,38,38,0.5)] leading-none italic">
                            BLACK MARKET
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                // VENDOR_COMM_LINK: <span className="text-red-400 italic">"{vendorQuote}"</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button 
                        onClick={() => setShowThemeModal(true)}
                        size="sm"
                        variant="outline"
                        className="h-10 border-zinc-700 text-zinc-400 hover:text-white hover:border-white text-[10px] uppercase tracking-wider"
                    >
                        <Palette className="w-4 h-4 mr-2" /> Catalog
                    </Button>

                    <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-sm px-6 py-2 shadow-inner">
                        <Coins className="w-5 h-5 text-yellow-600" />
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Funds</span>
                            <span className="text-xl font-bold text-yellow-600 leading-none">{gameState.scrap}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
          
          {/* ROW 1: GOODS (Daily + Cache) */}
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="lg:col-span-2 bg-black/60 border border-zinc-800 p-4 relative"
            >
                <div className="absolute top-0 left-0 bg-red-900/80 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest flex items-center gap-2">
                    <RefreshCw className="w-3 h-3" /> Daily Rotation
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {dailyStock.map((part, idx) => {
                         const Icon = IconMap[part.icon] || IconMap.Box;
                         const colors = RARITY_COLORS[part.tier];
                         return (
                             <div key={idx} className="bg-zinc-900/40 border border-zinc-800 p-3 flex flex-col justify-between group hover:border-red-500/50 transition-colors">
                                 <div className="flex gap-3 mb-2">
                                     <div className={cn("p-2 border bg-black h-12 w-12 flex items-center justify-center", colors.border)}>
                                         <Icon className={cn("w-6 h-6", colors.text)} />
                                     </div>
                                     <div className="min-w-0">
                                         <div className="text-sm font-bold text-gray-200 truncate">{part.name}</div>
                                         <RarityBadge tier={part.tier} className="scale-75 origin-left mt-1" />
                                     </div>
                                 </div>
                                 
                                 <div className="space-y-1 mb-3 bg-black/50 p-2 border border-zinc-800/50">
                                    <StatBar label="DMG" value={part.stats.Damage} max={50} />
                                    <StatBar label="SPD" value={part.stats.Speed} max={50} />
                                    <StatBar label="ARM" value={part.stats.Armor} max={50} />
                                 </div>

                                 <Button 
                                     onClick={() => handlePurchaseStock(part)}
                                     disabled={gameState.scrap < part.price}
                                     className="w-full h-8 bg-zinc-950 border border-zinc-700 hover:border-yellow-500 hover:text-yellow-500 text-[10px] font-mono"
                                 >
                                     {part.price} SCRAP
                                 </Button>
                             </div>
                         )
                    })}
                </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-zinc-900 to-black p-4 border border-purple-900/30 flex flex-col justify-between relative overflow-hidden"
            >
               {/* Same Crate Logic as before but cleaner layout */}
               <div className="flex items-center gap-4 relative z-10">
                   <div className="p-3 bg-purple-900/20 border border-purple-500/50 rounded-sm">
                       <Package className="w-8 h-8 text-purple-400" />
                   </div>
                   <div>
                       <h3 className="text-lg font-black text-purple-400 italic uppercase">Smuggler's Cache</h3>
                       <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Contraband Lottery</p>
                   </div>
               </div>
               <div className="flex items-end justify-between my-4 relative z-10 bg-black/40 p-3 border border-zinc-800">
                    <div>
                        <div className="text-[9px] text-zinc-500 uppercase">Buy-in Price</div>
                        <div className="text-2xl font-bold text-yellow-500">{MYSTERY_CRATE_COST}</div>
                    </div>
                    <div className="text-right">
                         <div className="text-[9px] text-zinc-500 uppercase">Potential</div>
                         <div className="text-sm font-bold text-purple-400">Tier 1 - 4</div>
                    </div>
               </div>
               <Button
                onClick={handleCratePurchase}
                disabled={gameState.scrap < MYSTERY_CRATE_COST}
                className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs relative z-10"
              >
                Unlock Cache
              </Button>
            </motion.div>
          </div>
          
          {/* ROW 2: SCRAPYARD (Split View: Inventory Left | Inspection Right) */}
          <div className="grid lg:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN: INVENTORY GRID */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 bg-black/60 backdrop-blur-md p-4 border border-zinc-800"
              >
                 <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-zinc-400" />
                        <h3 className="text-xl font-bold text-zinc-300 uppercase tracking-widest">Scrapyard</h3>
                    </div>
                    <div className="flex gap-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-3 py-1 text-[9px] font-bold uppercase tracking-wider border transition-all",
                                    activeCategory === cat 
                                        ? "bg-zinc-200 text-black border-white" 
                                        : "bg-black text-zinc-600 border-zinc-800 hover:border-zinc-600"
                                )}
                            >
                                {cat === 'RightArm' ? 'R-Arm' : cat === 'LeftArm' ? 'L-Arm' : cat}
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* INVENTORY LIST */}
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredParts.map((part, index) => {
                        const Icon = IconMap[part.icon] || IconMap.Box;
                        const colors = RARITY_COLORS[part.tier];
                        const isSelected = selectedItem?.id === part.id;
                        
                        return (
                            <div 
                                key={`${part.id}-${index}`}
                                onClick={() => setSelectedItem(part)}
                                className={cn(
                                    "cursor-pointer border p-2 h-[100px] flex flex-col justify-between transition-all relative overflow-hidden",
                                    isSelected 
                                        ? "bg-zinc-800 border-red-500 ring-1 ring-red-500" 
                                        : "bg-black border-zinc-800 hover:bg-zinc-900 hover:border-zinc-600"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <Icon className={cn("w-5 h-5", colors.text)} />
                                    {isSelected && <div className="absolute top-0 right-0 p-1 bg-red-600 text-[8px] text-black font-bold">VIEW</div>}
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-gray-300 truncate">{part.name}</div>
                                    <div className="text-[9px] text-zinc-500">{part.slot}</div>
                                </div>
                            </div>
                        )
                    })}
                    {filteredParts.length === 0 && <div className="col-span-full py-10 text-center text-zinc-600 border-2 border-dashed border-zinc-800">Empty</div>}
                 </div>
                 
                 {/* FOOTER ACTIONS */}
                 <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
                    {commonItemsCount > 0 && (
                        <Button 
                            onClick={handleSellAllCommons}
                            variant="outline"
                            className="text-red-500 border-red-900/50 hover:bg-red-950 text-xs"
                        >
                            Dump All Commons ({commonItemsCount})
                        </Button>
                    )}
                 </div>
              </motion.div>

              {/* RIGHT COLUMN: INSPECTOR PANEL */}
              <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-zinc-950 border border-zinc-800 flex flex-col h-full min-h-[400px]"
              >
                  <div className="p-3 bg-black border-b border-zinc-800 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Inspection Station</span>
                  </div>

                  {selectedItem ? (
                      <div className="p-4 flex flex-col h-full">
                          {/* SELECTED ITEM HEADER */}
                          <div className="flex items-center gap-4 mb-6">
                             {(() => {
                                 const Icon = IconMap[selectedItem.icon] || IconMap.Box;
                                 const colors = RARITY_COLORS[selectedItem.tier];
                                 return (
                                     <>
                                        <div className={cn("w-16 h-16 border-2 flex items-center justify-center bg-black", colors.border)}>
                                            <Icon className={cn("w-8 h-8", colors.text)} />
                                        </div>
                                        <div>
                                            <RarityBadge tier={selectedItem.tier} />
                                            <div className="text-lg font-bold text-white leading-tight mt-1">{selectedItem.name}</div>
                                            <div className="text-xs text-zinc-500 uppercase">{selectedItem.slot} Unit</div>
                                        </div>
                                     </>
                                 )
                             })()}
                          </div>

                          {/* COMPARISON CHART */}
                          <div className="flex-1 space-y-4">
                              {(() => {
                                  const equipped = getEquippedPartForSlot(selectedItem.slot);
                                  return (
                                      <div className="space-y-4">
                                          <div className="bg-zinc-900/50 p-3 border border-zinc-800">
                                              <div className="flex justify-between text-[9px] uppercase text-zinc-500 mb-2">
                                                  <span>Stat Analysis</span>
                                                  <span>Vs Equipped</span>
                                              </div>
                                              <div className="space-y-2">
                                                 <StatBar label="DMG" value={selectedItem.stats.Damage} max={50} compareValue={equipped?.stats.Damage} />
                                                 <StatBar label="SPD" value={selectedItem.stats.Speed} max={50} compareValue={equipped?.stats.Speed} />
                                                 <StatBar label="ARM" value={selectedItem.stats.Armor} max={50} compareValue={equipped?.stats.Armor} />
                                              </div>
                                          </div>
                                          
                                          {equipped && (
                                              <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-black p-2 border border-zinc-800">
                                                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                  <span>Currently Equipped: <span className="text-zinc-300">{equipped.name}</span></span>
                                              </div>
                                          )}
                                      </div>
                                  )
                              })()}
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="mt-auto pt-6">
                              <div className="text-center mb-2">
                                  <span className="text-[10px] uppercase text-zinc-500">Liquidation Value</span>
                                  <div className="text-2xl font-bold text-white">{getSellValue(selectedItem.tier)} <span className="text-sm text-yellow-500">SCRAP</span></div>
                              </div>
                              <Button 
                                  onClick={() => handleSell(selectedItem.id, selectedItem.name)}
                                  className="w-full h-12 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest"
                              >
                                  SELL ITEM
                              </Button>
                          </div>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 p-8 text-center opacity-50">
                          <Box className="w-12 h-12 mb-4" />
                          <p className="text-xs font-mono uppercase">Select an item from the Scrapyard to inspect stats and market value.</p>
                      </div>
                  )}
              </motion.div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Shop;