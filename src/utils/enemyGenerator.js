import { parts, PART_SLOTS } from '@/data/parts';
import { BASE_HEALTH } from '@/constants/gameConstants';

// --- EXPANDED NAME POOL ---
const enemyNames = [
  // Standard Units
  'Destructor X-9', 'Omega Prime', 'Steel Sentinel', 'Plasma Fury', 'Iron Colossus',
  'Cyber Reaper', 'Titanium Terror', 'Quantum Killer', 'Voltage Viper', 'Chrome Crusher',
  'Binary Brawler', 'Neon Nightmare', 'Circuit Slayer', 'Photon Phantom', 'Fusion Fighter',
  'Mech-01', 'Unit 734', 'Droid Alpha', 'Sector Guard', 'Rust Bucket',
  
  // Aggressive
  'Widow Maker', 'Skull Crusher', 'Bone Breaker', 'Havoc Bringer', 'Doom Forge',
  'Vortex Striker', 'Nova Blaster', 'Rage Core', 'Spike Walker', 'Blade Runner',
  
  // Tactical
  'Logic Frame', 'System Shock', 'Null Pointer', 'Fatal Exception', 'Blue Screen',
  'Glitch Walker', 'Firewall Guardian', 'Proxy Server', 'Data Ghost', 'Root User',
  
  // Heavy
  'Heavy Metal', 'Tank Treads', 'Blast Shield', 'Iron Curtain', 'War Path',
  'Siege Breaker', 'Fortress Prime', 'Bulwark Unit', 'Aegis Core', 'Titan Frame'
];

// --- ENEMY RARITY CONFIG ---
// This aligns with your item rarity colors:
// Common (Gray), Uncommon (Green), Rare (Blue), Epic (Purple), Legendary (Orange)
const ENEMY_RARITIES = [
  { id: 'common', chance: 0.60, prefix: '', tierOffset: 0, rarityName: 'Common' },
  { id: 'uncommon', chance: 0.25, prefix: 'Reinforced', tierOffset: 0, rarityName: 'Uncommon' },
  { id: 'rare', chance: 0.10, prefix: 'Elite', tierOffset: 1, rarityName: 'Rare' }, // Tries to use slightly better gear
  { id: 'epic', chance: 0.04, prefix: 'Commander', tierOffset: 1, rarityName: 'Epic' },
  { id: 'legendary', chance: 0.01, prefix: 'APEX', tierOffset: 2, rarityName: 'Legendary' }
];

const ARCHETYPES = {
  BALANCED: { chance: 0.4, statPriority: null },
  AGGRO:    { chance: 0.3, statPriority: 'Damage' },
  TANK:     { chance: 0.2, statPriority: 'Armor' },
  SPEED:    { chance: 0.1, statPriority: 'Speed' }
};

const getEnemyArchetype = () => {
  const rand = Math.random();
  if (rand < 0.4) return ARCHETYPES.BALANCED;
  if (rand < 0.7) return ARCHETYPES.AGGRO;
  if (rand < 0.9) return ARCHETYPES.TANK;
  return ARCHETYPES.SPEED;
};

// Roll for rarity based on the chance distribution
const getEnemyRarity = () => {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const rarity of ENEMY_RARITIES) {
    cumulative += rarity.chance;
    if (rand < cumulative) return rarity;
  }
  return ENEMY_RARITIES[0]; // Fallback to Common
};

const getWeightedTier = (playerAverageTier, streak, tierOffset = 0) => {
  let base = playerAverageTier;
  const pressure = Math.floor(streak / 5);
  const variance = Math.floor(Math.random() * 3) - 1; 

  // Add the rarity offset (e.g., Apex enemies try to roll higher tier gear)
  let target = base + pressure + variance + tierOffset;

  return Math.max(1, Math.min(5, target));
};

const getPlayerAverageTier = (playerBot) => {
  if (!playerBot || !playerBot.equipment) return 1;
  
  const partIds = Object.values(playerBot.equipment).filter(Boolean);
  if (partIds.length === 0) return 1;

  const totalTier = partIds.reduce((sum, id) => {
    const part = parts.find(p => p.id === id);
    return sum + (part ? part.tier : 1);
  }, 0);

  return Math.round(totalTier / partIds.length);
};

export const generateBalancedEnemy = (playerBot, currentWinStreak) => {
  const archetype = getEnemyArchetype();
  const playerAvgTier = getPlayerAverageTier(playerBot);
  
  // 1. Determine Enemy Rarity
  // Boss waves (every 10) force at least Epic rarity
  const isBossWave = currentWinStreak > 0 && currentWinStreak % 10 === 0;
  let rarityConfig = getEnemyRarity();
  
  if (isBossWave && (rarityConfig.id === 'common' || rarityConfig.id === 'uncommon' || rarityConfig.id === 'rare')) {
      rarityConfig = ENEMY_RARITIES.find(r => r.id === 'epic'); // Force Epic minimum for bosses
  }

  const loadout = {
    [PART_SLOTS.HEAD]: null,
    [PART_SLOTS.RIGHT_ARM]: null,
    [PART_SLOTS.LEFT_ARM]: null,
    [PART_SLOTS.CHASSIS]: null
  };

  Object.values(PART_SLOTS).forEach(slot => {
    // Pass the rarity tier offset to gear generation
    const targetTier = getWeightedTier(playerAvgTier, currentWinStreak, rarityConfig.tierOffset);

    let possibleParts = parts.filter(p => p.slot === slot);
    let tierParts = possibleParts.filter(p => p.tier === targetTier);

    if (tierParts.length === 0) tierParts = possibleParts.filter(p => p.tier === targetTier - 1);
    if (tierParts.length === 0) tierParts = possibleParts.filter(p => p.tier === targetTier + 1);
    if (tierParts.length === 0) tierParts = possibleParts;

    let selected;
    if (archetype.statPriority) {
        tierParts.sort((a, b) => b.stats[archetype.statPriority] - a.stats[archetype.statPriority]);
        const topCount = Math.min(3, tierParts.length);
        selected = tierParts[Math.floor(Math.random() * topCount)];
    } else {
        selected = tierParts[Math.floor(Math.random() * tierParts.length)];
    }

    loadout[slot] = selected.id;
  });

  // Name Generation
  const baseName = enemyNames[Math.floor(Math.random() * enemyNames.length)];
  let finalName = baseName;

  // Apply Rarity Prefix (e.g. "Elite Destructor")
  if (rarityConfig.prefix) {
      finalName = `${rarityConfig.prefix} ${baseName}`;
  }

  // Boss Override
  if (isBossWave) {
      finalName = `[BOSS] ${baseName} Prime`;
      rarityConfig = ENEMY_RARITIES.find(r => r.id === 'legendary'); // Visual override for boss frame
  }

  return {
    id: `enemy_${Date.now()}`,
    name: finalName,
    equipment: loadout,
    health: BASE_HEALTH, 
    isEnemy: true,
    difficulty: currentWinStreak,
    archetype: archetype.statPriority || 'Balanced',
    // NEW: Pass rarity data so the UI can color the name/border
    rarity: rarityConfig.rarityName, 
    rarityId: rarityConfig.id
  };
};

export const generateEnemy = (winStreak) => {
  const mockBot = { equipment: {} }; 
  return generateBalancedEnemy(mockBot, winStreak);
};