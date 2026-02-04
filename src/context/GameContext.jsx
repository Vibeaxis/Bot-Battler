
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialBot, getStarterInventory } from '@/data/initialBot';
import { STARTING_SCRAP } from '@/constants/gameConstants';
import { getRandomPart, PART_TIERS, getPartById } from '@/data/parts';
import { PART_SLOTS } from '@/data/parts';
import { useToast } from '@/components/ui/use-toast';

export const THEMES = {
  // --- CLASSICS ---
  'Green': { hex: '#00ff9d', rgb: '0, 255, 157' },
  'Cyber Blue': { hex: '#00f0ff', rgb: '0, 240, 255' },
  'Crimson Red': { hex: '#ff0055', rgb: '255, 0, 85' },
  'Midas Gold': { hex: '#ffd700', rgb: '255, 215, 0' },

  // --- NEON & VIBRANT ---
  'Neon Violet': { hex: '#d946ef', rgb: '217, 70, 239' },
  'Toxic Acid': { hex: '#ccff00', rgb: '204, 255, 0' },
  'Hot Pink': { hex: '#ff00cc', rgb: '255, 0, 204' },
  'Electric Orange': { hex: '#ff5e00', rgb: '255, 94, 0' },

  // --- DARK & TACTICAL ---
  'Stealth Grey': { hex: '#9ca3af', rgb: '156, 163, 175' },
  'Night Ops': { hex: '#3b82f6', rgb: '59, 130, 246' }, // Deep blue
  'Blood Moon': { hex: '#881337', rgb: '136, 19, 55' }, // Dark red

  // --- LUXURY & RARE ---
  'Ice White': { hex: '#ffffff', rgb: '255, 255, 255' },
  'Royal Purple': { hex: '#7e22ce', rgb: '126, 34, 206' },
  'Rose Gold': { hex: '#fb7185', rgb: '251, 113, 133' },
  'Obsidian': { hex: '#475569', rgb: '71, 85, 105' }, // Slate-ish

  // --- RETRO / ELEMENTAL ---
  'Amber Terminal': { hex: '#ffb000', rgb: '255, 176, 0' }, // Fallout style
  'Matrix Code': { hex: '#008f11', rgb: '0, 143, 17' },     // Darker, classic hacker green
  'Plasma Teal': { hex: '#2dd4bf', rgb: '45, 212, 191' },
  'Solar Flare': { hex: '#f59e0b', rgb: '245, 158, 11' },
  'Void': { hex: '#a855f7', rgb: '168, 85, 247' }
};

const GameContext = createContext();

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
};

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export const GameProvider = ({ children }) => {
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('robotBattleGame');
    if (saved) {
      const parsed = JSON.parse(saved);
      

      // MIGRATION: Ensure slotLevels exists
      if (!parsed.slotLevels) {
        parsed.slotLevels = { head: 0, rightArm: 0, leftArm: 0, chassis: 0 };
      }
      // MIGRATION: Ensure bot icon exists
      if (!parsed.playerBot.icon) {
        parsed.playerBot.icon = 'Cpu';
      }
      // MIGRATION: Ensure theme state exists
      if (!parsed.currentTheme) {
        parsed.currentTheme = 'Green';
      }
      if (!parsed.unlockedThemes) {
        parsed.unlockedThemes = ['Green'];
      }

      // MIGRATION: Hangar System
      if (!parsed.playerBot.id) {
        parsed.playerBot.id = generateId();
      }
      if (!parsed.hangar) {
        parsed.hangar = [parsed.playerBot];
      }

      return parsed;
    }
    
    // Initial State
    const starterBot = { ...initialBot, id: generateId() };
    
    return {
      playerBot: starterBot,
      hangar: [starterBot],
      inventory: getStarterInventory(),
      scrap: STARTING_SCRAP,
      winStreak: 0,
      lossStreak: 0,
      totalScrapEarned: 0,
      battleHistory: [],
      slotLevels: { head: 0, rightArm: 0, leftArm: 0, chassis: 0 },
      currentTheme: 'Green',
      unlockedThemes: ['Green']
    };
  });
  
  useEffect(() => {
    localStorage.setItem('robotBattleGame', JSON.stringify(gameState));
  }, [gameState]);

  // Apply Theme CSS Variables
  useEffect(() => {
    const theme = THEMES[gameState.currentTheme] || THEMES['Green'];
    document.documentElement.style.setProperty('--accent-color', theme.hex);
    document.documentElement.style.setProperty('--accent-rgb', theme.rgb);
  }, [gameState.currentTheme]);
  
  // Helper to sync playerBot changes to the hangar
  const updateHangarBot = (updatedBot, prevHangar) => {
    return prevHangar.map(bot => bot.id === updatedBot.id ? updatedBot : bot);
  };

  const getSellValue = (tier) => {
    // Base values based on estimated rarity value
    switch (tier) {
      case 1: return 25;   // Common
      case 2: return 60;   // Uncommon
      case 3: return 150;  // Rare
      case 4: return 400;  // Legendary
      default: return 10;
    }
  };

  const sellItem = (itemId) => {
    // Cannot sell equipped items directly as inventory only contains unequipped items
    const part = getPartById(itemId);
    if (!part) return;
    
    const value = getSellValue(part.tier);
    
    setGameState(prev => {
      const newInventory = [...prev.inventory];
      const index = newInventory.indexOf(itemId);
      if (index > -1) {
        newInventory.splice(index, 1);
        
        return {
          ...prev,
          inventory: newInventory,
          scrap: prev.scrap + value,
          totalScrapEarned: prev.totalScrapEarned + value
        };
      }
      return prev;
    });

    return value; // Return value for toast display in component
  };

  const sellAllCommonItems = () => {
    let totalValue = 0;
    let soldCount = 0;

    setGameState(prev => {
      const newInventory = [];
      
      prev.inventory.forEach(id => {
        const part = getPartById(id);
        if (part && part.tier === 1) { // Common is tier 1
           totalValue += getSellValue(1);
           soldCount++;
        } else {
           newInventory.push(id);
        }
      });

      if (soldCount > 0) {
        return {
          ...prev,
          inventory: newInventory,
          scrap: prev.scrap + totalValue,
          totalScrapEarned: prev.totalScrapEarned + totalValue
        };
      }
      return prev;
    });

    return { soldCount, totalValue };
  };

  const equipPart = (partId, slot) => {
    setGameState(prev => {
      const currentPart = prev.playerBot.equipment[slot];
      const newInventory = [...prev.inventory];
      
      const partIndex = newInventory.indexOf(partId);
      if (partIndex > -1) {
        newInventory.splice(partIndex, 1);
      }
      
      if (currentPart) {
        newInventory.push(currentPart);
      }
      
      const updatedBot = {
        ...prev.playerBot,
        equipment: {
          ...prev.playerBot.equipment,
          [slot]: partId
        }
      };

      return {
        ...prev,
        playerBot: updatedBot,
        hangar: updateHangarBot(updatedBot, prev.hangar),
        inventory: newInventory
      };
    });
  };
  
  const unequipPart = (slot) => {
    setGameState(prev => {
      const currentPart = prev.playerBot.equipment[slot];
      if (!currentPart) return prev;
      
      const updatedBot = {
        ...prev.playerBot,
        equipment: {
          ...prev.playerBot.equipment,
          [slot]: null
        }
      };

      return {
        ...prev,
        playerBot: updatedBot,
        hangar: updateHangarBot(updatedBot, prev.hangar),
        inventory: [...prev.inventory, currentPart]
      };
    });
  };
  
  const addToInventory = (partId) => {
    setGameState(prev => ({
      ...prev,
      inventory: [...prev.inventory, partId]
    }));
  };
  
  const removeFromInventory = (partId) => {
    setGameState(prev => {
      const newInventory = [...prev.inventory];
      const index = newInventory.indexOf(partId);
      if (index > -1) {
        newInventory.splice(index, 1);
      }
      return {
        ...prev,
        inventory: newInventory
      };
    });
  };
  
  const updateScrap = (amount) => {
    setGameState(prev => ({
      ...prev,
      scrap: Math.max(0, prev.scrap + amount),
      totalScrapEarned: amount > 0 ? prev.totalScrapEarned + amount : prev.totalScrapEarned
    }));
  };
  
  const resetStreaks = () => {
    setGameState(prev => ({
      ...prev,
      winStreak: 0,
      lossStreak: 0
    }));
  };
  
const recordBattle = (result) => {
    setGameState(prev => {
      const newHistory = [result, ...prev.battleHistory].slice(0, 10);
      const newWinStreak = result.playerWon ? prev.winStreak + 1 : 0;
      const newLossStreak = !result.playerWon ? prev.lossStreak + 1 : 0;
      
      return {
        ...prev,
        // Standard Streak Logic
        winStreak: newWinStreak,
        lossStreak: newLossStreak,
        battleHistory: newHistory,

        // --- NEW: LIFETIME CAREER STATS (These never reset) ---
        totalBattles: (prev.totalBattles || 0) + 1,
        totalWins: (prev.totalWins || 0) + (result.playerWon ? 1 : 0)
      };
    });
  };
  
  const purchaseMysteryBox = () => {
    const tierRoll = Math.random();
    let tier = PART_TIERS.TIER_1;
    
    if (tierRoll < 0.1) tier = PART_TIERS.TIER_3;
    else if (tierRoll < 0.4) tier = PART_TIERS.TIER_2;
    
    const randomPart = getRandomPart(tier);
    return randomPart;
  };

  const performFusion = (itemId) => {
    const itemInfo = getPartById(itemId);
    if (!itemInfo || itemInfo.tier >= 4) return null;

    const count = gameState.inventory.filter(id => id === itemId).length;
    if (count < 3) return null;

    const nextTier = itemInfo.tier + 1;
    const newItem = getRandomPart(nextTier);

    setGameState(prev => {
        let removedCount = 0;
        const newInventory = prev.inventory.filter(id => {
            if (id === itemId && removedCount < 3) {
                removedCount++;
                return false;
            }
            return true;
        });
        
        newInventory.push(newItem.id);

        return {
            ...prev,
            inventory: newInventory
        };
    });

    return newItem;
  };

  const upgradeSlot = (slotName) => {
    const currentLevel = gameState.slotLevels[slotName] || 0;
    const cost = 100 * (currentLevel + 1);

    if (gameState.scrap >= cost) {
      setGameState(prev => ({
        ...prev,
        scrap: prev.scrap - cost,
        slotLevels: {
          ...prev.slotLevels,
          [slotName]: currentLevel + 1
        }
      }));
      return true;
    }
    return false;
  };

  const updateBotName = (newName) => {
    setGameState(prev => {
      const updatedBot = {
        ...prev.playerBot,
        name: newName
      };
      return {
        ...prev,
        playerBot: updatedBot,
        hangar: updateHangarBot(updatedBot, prev.hangar)
      };
    });
  };

  const updateBotIcon = (newIcon) => {
    setGameState(prev => {
      const updatedBot = {
        ...prev.playerBot,
        icon: newIcon
      };
      return {
        ...prev,
        playerBot: updatedBot,
        hangar: updateHangarBot(updatedBot, prev.hangar)
      };
    });
  };

  const unlockTheme = (themeName) => {
    if (!gameState.unlockedThemes.includes(themeName)) {
      setGameState(prev => ({
        ...prev,
        unlockedThemes: [...prev.unlockedThemes, themeName]
      }));
    }
  };

  const setCurrentTheme = (themeName) => {
    if (gameState.unlockedThemes.includes(themeName)) {
      setGameState(prev => ({
        ...prev,
        currentTheme: themeName
      }));
    }
  };

  // --- Hangar System ---

  const purchaseNewBot = (name) => {
    const cost = 500 * Math.pow(2, Math.max(0, gameState.hangar.length - 1));
    
    if (gameState.scrap < cost) {
      toast({
        title: "Insufficient Scrap",
        description: `You need ${cost} scrap to buy a new bot slot.`,
        variant: "destructive"
      });
      return false;
    }

    const newBot = {
      id: generateId(),
      name: name || `Unit ${gameState.hangar.length + 1}`,
      icon: 'Cpu',
      equipment: {
        [PART_SLOTS.HEAD]: null,
        [PART_SLOTS.RIGHT_ARM]: null,
        [PART_SLOTS.LEFT_ARM]: null,
        [PART_SLOTS.CHASSIS]: null
      }
    };

    setGameState(prev => ({
      ...prev,
      scrap: prev.scrap - cost,
      hangar: [...prev.hangar, newBot]
    }));

    toast({
      title: "New Unit Online",
      description: `${newBot.name} has been added to the hangar.`,
      className: "border-green-500 text-green-500"
    });

    return true;
  };

  const setActiveBot = (botId) => {
    setGameState(prev => {
      // 1. Ensure current playerBot state is saved to hangar (although we do this on every edit, safety check)
      const currentHangar = updateHangarBot(prev.playerBot, prev.hangar);
      
      // 2. Find new bot
      const nextBot = currentHangar.find(b => b.id === botId);
      
      if (!nextBot) {
        console.error("Bot ID not found in hangar:", botId);
        return prev;
      }

      toast({
        title: "Unit Activated",
        description: `Switched control to ${nextBot.name}.`,
      });

      return {
        ...prev,
        hangar: currentHangar,
        playerBot: nextBot
      };
    });
  };

  const factoryReset = () => {
    localStorage.removeItem('robotBattleGame');
    window.location.reload();
  };
  
  const value = {
    gameState,
    setGameState,
    getSellValue,
    sellItem,
    sellAllCommonItems,
    equipPart,
    unequipPart,
    addToInventory,
    removeFromInventory,
    updateScrap,
    resetStreaks,
    recordBattle,
    purchaseMysteryBox,
    performFusion,
    upgradeSlot,
    updateBotName,
    updateBotIcon,
    unlockTheme,
    setCurrentTheme,
    purchaseNewBot,
    setActiveBot,
    factoryReset
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
