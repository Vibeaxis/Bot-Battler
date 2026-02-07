import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext, THEMES } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Package, Coins, Palette, Check, Trash2, Box, 
  ShieldCheck, Skull, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { MYSTERY_CRATE_COST, RARITY_COLORS } from '@/constants/gameConstants';
import { getPartById, ALL_PARTS } from '@/data/parts'; // Import ALL_PARTS to generate daily stock
import * as LucideIcons from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import RarityBadge from '@/components/RarityBadge';
import { cn } from '@/lib/utils';
import ScreenBackground from '@/components/ScreenBackground';
import shopBg from '@/assets/facto_bg.jpg'; 

const IconMap = { ...LucideIcons };

// --- THE FENCE CONFIG ---
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

const Shop = () => {
  const navigate = useNavigate();
  const { gameState, updateScrap, addToInventory, purchaseMysteryBox, unlockTheme, getSellValue, sellItem, sellAllCommonItems } = useGameContext();
  const { playSound } = useSoundContext();
  
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [vendorQuote, setVendorQuote] = useState(VENDOR_QUOTES[0]);

  // --- DAILY STOCK GENERATOR (Client-Side Mock) ---
  // In a real app, this would come from the server based on the date.
  // Here we just pick 3 random items every time you mount the component (or could seed by date).
  const dailyStock = useMemo(() => {
      // Filter out Mythics/Omegas for daily shop (keep them rare)
      const validStock = ALL_PARTS.filter(p => p.tier >= 2 && p.tier <= 4); 
      const stock = [];
      for(let i=0; i<3; i++) {
          const randomPart = validStock[Math.floor(Math.random() * validStock.length)];
          // Add a random price variance (Black Market pricing)
          const markup = Math.floor(Math.random() * 20) + 10; 
          stock.push({ ...randomPart, price: getSellValue(randomPart.tier) * 4 + markup });
      }
      return stock;
  }, []); // Empty dependency array = generates once per visit

  const handlePurchaseStock = (part) => {
      if (gameState.scrap < part.price) {
          playVendorSound('DENY');
          return;
      }
      updateScrap(-part.price);
      addToInventory(part.id);
      playSound('BUY');
      setVendorQuote("Pleasure doing business.");
      toast({
          title: "Black Market Deal 🤝",
          description: `Acquired ${part.name}`,
          className: cn("text-white border", RARITY_COLORS[part.tier].bg, RARITY_COLORS[part.tier].border)
      });
  };

  const playVendorSound = (type) => {
      // Placeholder for voice lines later
      if(type === 'DENY') {
          playSound('ERROR');
          setVendorQuote("You're short on scrap, kid.");
      }
  };

  const handleCratePurchase = () => {
    if (gameState.scrap < MYSTERY_CRATE_COST) {
      playVendorSound('DENY');
      return;
    }
    
    const newPart = purchaseMysteryBox();
    updateScrap(-MYSTERY_CRATE_COST);
    addToInventory(newPart.id);
    playSound('BUY');
    setVendorQuote("Let's see what we fished out...");
    
    toast({
      title: "Smuggler's Cache Opened 📦",
      description: `Found: ${newPart.name} (${newPart.rarity})`,
      className: cn("text-white border", RARITY_COLORS[newPart.tier].bg, RARITY_COLORS[newPart.tier].border)
    });
  };

  const handleThemePurchase = (themeName) => {
    if (gameState.unlockedThemes.includes(themeName)) return;

    if (gameState.scrap < THEME_PRICE) {
      playVendorSound('DENY');
      return;
    }

    updateScrap(-THEME_PRICE);
    unlockTheme(themeName);
    playSound('BUY');
    setVendorQuote("Flashy. I like it.");
    toast({
      title: "OS Theme Cracked 🔓",
      description: `Installed ${themeName} protocol.`,
      className: "bg-[var(--accent-color)] text-black border border-white font-bold"
    });
  };

  const handleSell = (itemId, itemName) => {
    const value = sellItem(itemId);
    if (value) {
      playSound('EQUIP'); 
      setVendorQuote("I can strip this for parts.");
      toast({
        title: "Liquidated",
        description: `Sold ${itemName} for ${value} Scrap`,
        className: "bg-red-900/50 border-red-500 text-red-200"
      });
    }
  };

  const handleSellAllCommons = () => {
    const { soldCount, totalValue } = sellAllCommonItems();
    if (soldCount > 0) {
      playSound('EQUIP');
      setVendorQuote("Trash for cash. Classic.");
      toast({
        title: "Bulk Liquidation",
        description: `Recycled ${soldCount} items for ${totalValue} Scrap`,
        className: "bg-red-900/50 border-red-500 text-red-200"
      });
    }
  };
  
  // --- DATA FILTERING ---
  const inventoryParts = gameState.inventory.map(id => getPartById(id)).filter(Boolean);
  const filteredParts = activeCategory === 'ALL' 
    ? inventoryParts 
    : inventoryParts.filter(p => p.slot === activeCategory);
  
  const equippedParts = Object.values(gameState.playerBot.equipment)
    .filter(id => id)
    .map(id => getPartById(id))
    .filter(Boolean);

  const commonItemsCount = inventoryParts.filter(p => p.tier === 1).length;
  
  // --- THEME DATA (Keeping your existing logic) ---
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

      <div className="h-screen overflow-y-auto bg-transparent font-mono text-[#e0e0e0] flex flex-col relative z-10 pb-12">
        
        {/* HEADER SECTION */}
        <div className="bg-black/90 border-b border-red-900/50 backdrop-blur-md sticky top-0 z-40 shadow-2xl">
            <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                
                <div className="text-center md:text-left flex items-center gap-4">
                    <Button 
                        onClick={() => navigate('/hub')} 
                        variant="ghost" 
                        className="text-red-800 hover:text-red-500 p-0 h-auto hover:bg-transparent"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-red-600 uppercase tracking-widest [text-shadow:0_0_15px_rgba(220,38,38,0.5)] leading-none italic">
                            BLACK MARKET
                        </h1>
                        <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                            <span className="w-2 h-2 bg-red-600 animate-pulse rounded-full" />
                            <p className="text-[10px] text-red-900 uppercase tracking-[0.3em] font-bold">Unregulated Goods</p>
                        </div>
                    </div>
                </div>

                {/* VENDOR QUOTE BOX */}
                <div className="hidden md:flex flex-col items-end opacity-70">
                    <div className="bg-zinc-900 border-l-2 border-red-600 px-4 py-2 max-w-sm italic text-right text-xs text-gray-400">
                        "{vendorQuote}"
                    </div>
                    <div className="text-[9px] text-red-800 uppercase tracking-widest mt-1 font-bold">THE OPERATOR</div>
                </div>

                {/* STATS BAR */}
                <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 rounded-sm px-6 py-2 shadow-inner">
                    <div className="flex items-center gap-3">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Funds</span>
                            <span className="text-lg font-bold text-yellow-600 leading-none">{gameState.scrap}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
          
          {/* SECTION 1: THE GOODS (Daily Stock + Cache) */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* DAILY ROTATION (New!) */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="lg:col-span-2 bg-black/60 border border-zinc-800 p-5 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 bg-red-900/80 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest">
                    Daily Rotation
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {dailyStock.map((part, idx) => {
                         const Icon = IconMap[part.icon] || IconMap.Box;
                         const colors = RARITY_COLORS[part.tier];
                         return (
                             <div key={idx} className="bg-zinc-900/80 border border-zinc-700 p-3 flex flex-col justify-between group hover:border-red-500 transition-colors">
                                 <div>
                                     <div className="flex justify-between items-start mb-2">
                                         <Icon className={cn("w-6 h-6", colors.text)} />
                                         <RarityBadge tier={part.tier} className="scale-75 origin-right" />
                                     </div>
                                     <div className="text-sm font-bold text-gray-300 truncate">{part.name}</div>
                                     <div className="text-[10px] text-zinc-600 uppercase">{part.slot}</div>
                                 </div>
                                 <Button 
                                     onClick={() => handlePurchaseStock(part)}
                                     disabled={gameState.scrap < part.price}
                                     className="w-full mt-3 h-8 bg-black border border-zinc-600 hover:border-yellow-500 hover:text-yellow-500 text-xs font-mono"
                                 >
                                     {part.price} SCRAP
                                 </Button>
                             </div>
                         )
                    })}
                </div>
            </motion.div>

            {/* SMUGGLER'S CACHE (Was Mystery Crate) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-950/80 p-5 border border-purple-900/50 flex flex-col justify-between relative overflow-hidden group"
            >
               <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-600/20 rounded-full blur-2xl group-hover:bg-purple-600/30 transition-all"></div>
               
               <div>
                   <div className="flex items-center gap-3 mb-2">
                       <Package className="w-8 h-8 text-purple-500" />
                       <div>
                           <h3 className="text-xl font-black text-purple-500 italic uppercase">Smuggler's Cache</h3>
                           <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Contraband Lottery</p>
                       </div>
                   </div>
                   
                   {/* Compact Probability */}
                   <div className="flex gap-1 mt-4 text-[9px] font-mono uppercase text-center opacity-60">
                       <div className="flex-1 bg-zinc-900 py-1 border-b-2 border-gray-500">Comm 50%</div>
                       <div className="flex-1 bg-zinc-900 py-1 border-b-2 border-emerald-500">Unc 30%</div>
                       <div className="flex-1 bg-zinc-900 py-1 border-b-2 border-blue-500">Rare 15%</div>
                       <div className="flex-1 bg-zinc-900 py-1 border-b-2 border-amber-500">Leg 5%</div>
                   </div>
               </div>
              
              <div className="mt-6">
                  <div className="flex justify-between items-end mb-2">
                      <span className="text-[9px] text-zinc-500 uppercase">Buy-in</span>
                      <span className="text-xl font-bold text-yellow-600">{MYSTERY_CRATE_COST}</span>
                  </div>
                  <Button
                    onClick={handleCratePurchase}
                    disabled={gameState.scrap < MYSTERY_CRATE_COST}
                    className="w-full h-12 bg-purple-900/20 border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-black font-black uppercase tracking-widest"
                  >
                    Open Cache
                  </Button>
              </div>
            </motion.div>
          </div>

          {/* COSMETICS ROW (Condensed) */}
          <div className="bg-black/40 border-y border-zinc-800 py-4 overflow-x-auto flex gap-4 px-4 scrollbar-hide">
              <div className="flex-none flex items-center gap-2 px-4 border-r border-zinc-800">
                  <Palette className="w-5 h-5 text-zinc-600" />
                  <div className="leading-tight">
                      <div className="text-xs font-bold text-zinc-400 uppercase">OS Themes</div>
                      <div className="text-[9px] text-zinc-600">Visual Overrides</div>
                  </div>
              </div>
              {purchasableThemes.map((theme) => {
                  const isOwned = gameState.unlockedThemes.includes(theme.name);
                  return (
                      <button
                        key={theme.name}
                        onClick={() => handleThemePurchase(theme.name)}
                        disabled={isOwned || gameState.scrap < THEME_PRICE}
                        className={cn(
                            "flex-none flex items-center gap-2 px-3 py-1.5 border rounded-sm transition-all min-w-[140px]",
                            isOwned ? "border-zinc-800 bg-zinc-900 opacity-50" : "border-zinc-700 bg-black hover:border-white"
                        )}
                      >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.color }}></div>
                          <div className="text-left">
                              <div className="text-[9px] font-bold text-gray-300 uppercase">{theme.name}</div>
                              <div className="text-[8px] text-zinc-500">{isOwned ? "INSTALLED" : `${THEME_PRICE} CR`}</div>
                          </div>
                      </button>
                  )
              })}
          </div>
          
          {/* INVENTORY / STORAGE SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-md p-6 border border-zinc-800"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-4 mb-4 gap-4">
               <div className="flex items-center gap-3">
                   <div className="bg-red-900/20 p-2 rounded-sm border border-red-900/50">
                       <Trash2 className="w-5 h-5 text-red-700" />
                   </div>
                   <div>
                       <h3 className="text-lg font-bold text-zinc-300 uppercase tracking-widest">Scrapyard</h3>
                       <span className="text-[10px] text-zinc-600 uppercase">Sell unwanted parts</span>
                   </div>
               </div>
               
               <div className="flex gap-2">
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

               {commonItemsCount > 0 && (
                 <Button 
                   onClick={handleSellAllCommons}
                   size="sm"
                   className="bg-red-950/40 text-red-500 border border-red-900/50 hover:bg-red-900 hover:text-white uppercase font-mono text-[10px] h-8"
                 >
                    Dump All Commons ({commonItemsCount})
                 </Button>
               )}
            </div>
            
            {filteredParts.length === 0 ? (
              <div className="text-zinc-700 text-center py-12 border-2 border-dashed border-zinc-900 font-mono uppercase text-xs">
                No scrap found in sector: {activeCategory}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
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
                        exit={{ opacity: 0, scale: 0.5 }}
                        className={cn(
                          "rounded-sm p-2 border relative group bg-black transition-all hover:bg-zinc-900 flex flex-col justify-between h-[110px]",
                          "border-zinc-800 hover:border-red-800"
                        )}
                      >
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-1">
                            <Icon className={cn("w-5 h-5", colors.text)} />
                            <RarityBadge tier={part.tier} className="scale-[0.6] -mr-2 -mt-1" />
                          </div>
                          <div className="text-[9px] font-bold text-zinc-400 mb-0.5 truncate font-mono uppercase">
                            {part.name}
                          </div>
                        </div>

                        {/* SELL OVERLAY */}
                        <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                             onClick={(e) => {
                                 e.stopPropagation();
                                 handleSell(part.id, part.name);
                             }}
                        >
                            <span className="text-[9px] font-bold text-red-200 uppercase mb-1">LIQUIDATE</span>
                            <span className="text-lg font-bold text-white">{sellValue}</span>
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