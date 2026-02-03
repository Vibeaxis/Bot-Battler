import { parts, PART_SLOTS, RARITY } from '@/data/parts';
import { BASE_HEALTH } from '@/constants/gameConstants';
import { calculateBotStats } from '@/utils/statCalculator'; // Assuming you have this from previous files

const enemyNames = [
  'Destructor X-9', 'Omega Prime', 'Steel Sentinel', 'Plasma Fury', 'Iron Colossus',
  'Cyber Reaper', 'Titanium Terror', 'Quantum Killer', 'Voltage Viper', 'Chrome Crusher',
  'Binary Brawler', 'Neon Nightmare', 'Circuit Slayer', 'Photon Phantom', 'Fusion Fighter'
];

// 1. Archetypes give enemies "personality" so they aren't just random stats.
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

// 2. Determine target tier based on Player Strength + Streak Pressure
const getWeightedTier = (playerAverageTier, streak) => {
  // Base the enemy on the player's current gear level
  let base = playerAverageTier;

  // Streak Pressure: Every 5 wins, the enemy tries to be 1 tier higher
  const pressure = Math.floor(streak / 5);
  
  // Random variance (-1 to +1)
  // This ensures sometimes you get an easier fight (catch your breath)
  // and sometimes a harder fight (challenge).
  const variance = Math.floor(Math.random() * 3) - 1; 

  let target = base + pressure + variance;

  // Clamp values between 1 (Common) and 5 (Legendary)
  return Math.max(1, Math.min(5, target));
};

// Helper to calculate the player's average tier (Item Level)
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
  
  const loadout = {
    [PART_SLOTS.HEAD]: null,
    [PART_SLOTS.RIGHT_ARM]: null,
    [PART_SLOTS.LEFT_ARM]: null,
    [PART_SLOTS.CHASSIS]: null
  };

  Object.values(PART_SLOTS).forEach(slot => {
    // Determine the tier for this specific slot using the weighted logic
    const targetTier = getWeightedTier(playerAvgTier, currentWinStreak);

    // Get all parts for this slot
    let possibleParts = parts.filter(p => p.slot === slot);

    // Filter by the target tier first
    let tierParts = possibleParts.filter(p => p.tier === targetTier);

    // FALLBACK: If no parts of exact tier exist, try tier - 1, then tier + 1
    if (tierParts.length === 0) tierParts = possibleParts.filter(p => p.tier === targetTier - 1);
    if (tierParts.length === 0) tierParts = possibleParts.filter(p => p.tier === targetTier + 1);
    // Ultimate fallback: just use whatever matches the slot
    if (tierParts.length === 0) tierParts = possibleParts;

    // --- SMART SELECTION ---
    // Instead of completely random, try to pick parts that match the Archetype
    let selected;
    
    if (archetype.statPriority) {
        // Sort parts by the priority stat (descending)
        tierParts.sort((a, b) => b.stats[archetype.statPriority] - a.stats[archetype.statPriority]);
        
        // Pick one of the top 3 best parts for this stat (adds slight randomness)
        const topCount = Math.min(3, tierParts.length);
        selected = tierParts[Math.floor(Math.random() * topCount)];
    } else {
        // Balanced: Pure random from the tier pool
        selected = tierParts[Math.floor(Math.random() * tierParts.length)];
    }

    loadout[slot] = selected.id;
  });

  const name = enemyNames[Math.floor(Math.random() * enemyNames.length)];
  
  // Optional: Boss Check (Every 10 rounds)
  // Bosses always get a name prefix and max out their calculated gear
  const isBoss = currentWinStreak > 0 && currentWinStreak % 10 === 0;
  const finalName = isBoss ? `BOSS: ${name}` : name;

  return {
    id: `enemy_${Date.now()}`,
    name: finalName,
    equipment: loadout,
    health: BASE_HEALTH, // You could scale health by streak here if you wanted (e.g. BASE_HEALTH + streak * 5)
    isEnemy: true,
    difficulty: currentWinStreak,
    archetype: archetype.statPriority || 'Balanced' // Useful for UI (e.g. "Enemy Type: Aggro")
  };
};

// Legacy compatibility
export const generateEnemy = (winStreak) => {
  // Pass a dummy player bot with "Tier 1" average if no player data exists
  const mockBot = { equipment: {} }; 
  return generateBalancedEnemy(mockBot, winStreak);
};