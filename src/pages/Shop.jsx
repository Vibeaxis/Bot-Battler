import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext, THEMES } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Package, Coins, Palette, Trash2, Box, 
  ShieldCheck, X, Zap, Activity
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

const Shop = () => {
  const navigate = useNavigate();
  const { gameState, updateScrap, addToInventory, purchaseMysteryBox, unlockTheme, getSellValue, sellItem, sellAllCommonItems } = useGameContext();
  const { playSound } = useSoundContext();
  
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  // Pick a random quote once on mount
  const vendorQuote = useMemo(() => VENDOR_QUOTES[Math.floor(Math.random() * VENDOR_QUOTES.length)], []);

  // --- DAILY STOCK GENERATOR ---
  const dailyStock = useMemo(() => {
      const validStock = ALL_PARTS.filter(p => p.tier >= 2 && p.tier <= 4); 
      const stock = [];
      // Seed based generation could go here, for now random
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
      toast({
        title: "Liquidated",
        description: `+${value} Scrap`,
        className: "bg-red-900/50 border-red-500 text-red-200"
      });
    }
  };
  
  // --- FILTERING ---
  const inventoryParts = gameState.inventory.map(id => getPartById(id)).filter(Boolean);
  const filteredParts = activeCategory === 'ALL' 
    ? inventoryParts 
    : inventoryParts.filter(p => p.slot === activeCategory);
  
  const equippedParts = Object.values(gameState.playerBot.equipment)
    .filter(id => id)
    .map(id => getPartById(id))
    .filter(Boolean);

  const commonItemsCount = inventoryParts.filter(p => p.tier === 1).length;
  
  // Theme List
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
        
        {/* HEADER SECTION */}
        <div className="bg-black/90 border-b border-red-900/30 backdrop-blur-md sticky top-0 z-40 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
                
                <div className="text-center md:text-left flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <Button 
                        onClick={() => navigate('/hub')} 
                        variant="ghost" 
                        className="text-red-800 hover:text-red-500 p-0 h-auto hover:bg-transparent"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-red-600 uppercase tracking-widest [text-shadow:0_0_15px_rgba(220,38,38,0.5)] leading-none italic">
                            BLACK MARKET
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                // VENDOR_COMM_LINK: <span className="text-red-400 italic">"{vendorQuote}"</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* STATS BAR + COSMETICS BTN */}
                <div className="flex items-center gap-4">
                    <Button 
                        onClick={() => setShowThemeModal(true)}
                        size="sm"
                        variant="outline"
                        className="h-8 border-zinc-700 text-zinc-400 hover:text-white hover:border-white text-[10px] uppercase tracking-wider"
                    >
                        <Palette className="w-3 h-3 mr-2" /> Catalog
                    </Button>

                    <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-1.5 shadow-inner">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Funds</span>
                            <span className="text-lg font-bold text-yellow-600 leading-none">{gameState.scrap}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6">
          
          {/* ROW 1: GOODS */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* DAILY ROTATION */}
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
                                     <div className={cn("p-2 border bg-black h-10 w-10 flex items-center justify-center", colors.border)}>
                                         <Icon className={cn("w-5 h-5", colors.text)} />
                                     </div>
                                     <div className="min-w-0">
                                         <div className="text-xs font-bold text-gray-200 truncate">{part.name}</div>
                                         <RarityBadge tier={part.tier} className="scale-75 origin-left mt-1" />
                                     </div>
                                 </div>
                                 <div className="grid grid-cols-3 gap-1 mb-3 text-[9px] font-mono text-zinc-500">
                                     <div className="bg-black p-1 text-center border border-zinc-800">DMG <span className="text-zinc-300 block">{part.stats.Damage}</span></div>
                                     <div className="bg-black p-1 text-center border border-zinc-800">SPD <span className="text-zinc-300 block">{part.stats.Speed}</span></div>
                                     <div className="bg-black p-1 text-center border border-zinc-800">ARM <span className="text-zinc-300 block">{part.stats.Armor}</span></div>
                                 </div>
                                 <Button 
                                     onClick={() => handlePurchaseStock(part)}
                                     disabled={gameState.scrap < part.price}
                                     className="w-full h-7 bg-zinc-950 border border-zinc-700 hover:border-yellow-500 hover:text-yellow-500 text-[10px] font-mono"
                                 >
                                     {part.price} SCRAP
                                 </Button>
                             </div>
                         )
                    })}
                </div>
            </motion.div>

            {/* SMUGGLER'S CACHE */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-zinc-900 to-black p-4 border border-purple-900/30 flex flex-col justify-between relative overflow-hidden"
            >
               <div className="flex items-center gap-4 relative z-10">
                   <div className="p-3 bg-purple-900/20 border border-purple-500/50 rounded-sm">
                       <Package className="w-6 h-6 text-purple-400" />
                   </div>
                   <div>
                       <h3 className="text-lg font-black text-purple-400 italic uppercase">Smuggler's Cache</h3>
                       <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Contraband Lottery</p>
                   </div>
               </div>
               
               <div className="grid grid-cols-2 gap-2 my-4 relative z-10">
                   <div className="bg-black/50 p-2 text-center border border-purple-900/20">
                       <div className="text-[9px] text-zinc-500 uppercase">Buy-in</div>
                       <div className="text-lg font-bold text-yellow-500">{MYSTERY_CRATE_COST}</div>
                   </div>
                   <div className="bg-black/50 p-2 text-center border border-purple-900/20">
                       <div className="text-[9px] text-zinc-500 uppercase">Yield</div>
                       <div className="text-lg font-bold text-purple-400">Tier 1-4</div>
                   </div>
               </div>
               
               <Button
                onClick={handleCratePurchase}
                disabled={gameState.scrap < MYSTERY_CRATE_COST}
                className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs relative z-10"
              >
                Unlock Cache
              </Button>
              
              {/* Background FX */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
          
          {/* ROW 2: ACTIVE LOADOUT (Visual Reference) */}
          {equippedParts.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-2 mb-2 border-b border-zinc-800 pb-1">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Loadout</h3>
                    <span className="text-[9px] text-zinc-600 ml-auto uppercase">Safe from liquidation</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                    {equippedParts.map((part, i) => {
                        const Icon = IconMap[part.icon] || IconMap.Box;
                        return (
                            <div key={i} className="bg-zinc-900/30 border border-zinc-800 p-2 flex items-center gap-3 opacity-75">
                                <Icon className="w-4 h-4 text-zinc-500" />
                                <div className="truncate text-[10px] font-bold text-zinc-400">{part.name}</div>
                            </div>
                        )
                    })}
                </div>
            </motion.div>
          )}

          {/* ROW 3: SCRAPYARD (Inventory) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-md p-4 border border-zinc-800 min-h-[400px]"
          >
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
               <div className="flex items-center gap-3 w-full md:w-auto">
                   <div className="bg-zinc-900 p-2 rounded-sm border border-zinc-700">
                       <Trash2 className="w-4 h-4 text-zinc-400" />
                   </div>
                   <div>
                       <h3 className="text-lg font-bold text-zinc-300 uppercase tracking-widest">Scrapyard</h3>
                   </div>
               </div>
               
               <div className="flex flex-wrap gap-1 justify-center">
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
                   className="bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-900 hover:text-white uppercase font-mono text-[9px] h-7 px-3"
                 >
                    Dump Commons ({commonItemsCount})
                 </Button>
               )}
            </div>
            
            {/* Grid */}
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
                        className="bg-black border border-zinc-800 p-2 flex flex-col justify-between h-[120px] group hover:border-zinc-600 transition-colors relative"
                      >
                        {/* Top Info */}
                        <div className="flex justify-between items-start">
                            <Icon className={cn("w-5 h-5", colors.text)} />
                            <RarityBadge tier={part.tier} className="scale-[0.6] -mr-2 -mt-1" />
                        </div>
                        
                        {/* Name & Stats (Always Visible) */}
                        <div className="mt-1">
                            <div className="text-[9px] font-bold text-zinc-300 truncate uppercase">{part.name}</div>
                            <div className="flex gap-1 text-[8px] font-mono text-zinc-600 mt-1">
                                <span title="Damage" className="text-red-900/80">{part.stats.Damage}</span> • 
                                <span title="Speed" className="text-yellow-900/80">{part.stats.Speed}</span> • 
                                <span title="Armor" className="text-green-900/80">{part.stats.Armor}</span>
                            </div>
                        </div>

                        {/* Sell Button (Bottom) */}
                        <Button
                            onClick={() => handleSell(part.id, part.name)}
                            className="w-full h-5 bg-zinc-900 border border-zinc-800 text-[8px] text-zinc-500 hover:bg-red-900 hover:text-white hover:border-red-600 mt-auto uppercase"
                        >
                            Sell {sellValue}
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {filteredParts.length === 0 && (
                  <div className="col-span-full py-12 text-center text-zinc-700 text-xs font-mono uppercase border-2 border-dashed border-zinc-900">
                      Sector Empty
                  </div>
                )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Shop;