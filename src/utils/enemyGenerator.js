import { parts, getPartById, PART_SLOTS, RARITY, getPartsByTier } from '@/data/parts';
import { BASE_HEALTH } from '@/constants/gameConstants';

const enemyNames = [
  'Destructor X-9', 'Omega Prime', 'Steel Sentinel', 'Plasma Fury', 'Iron Colossus',
  'Cyber Reaper', 'Titanium Terror', 'Quantum Killer', 'Voltage Viper', 'Chrome Crusher',
  'Binary Brawler', 'Neon Nightmare', 'Circuit Slayer', 'Photon Phantom', 'Fusion Fighter'
];

// Helper to determine the maximum allowed rarity based on Win Streak
const getMaxAllowedTier = (streak) => {
  if (streak < 3) return 2;  // 0-2 Wins: Max Uncommon (Green)
  if (streak < 7) return 3;  // 3-6 Wins: Max Rare (Blue)
  if (streak < 15) return 4; // 7-14 Wins: Max Epic (Purple)
  return 5;                  // 15+ Wins: Legendary allowed
};

export const generateBalancedEnemy = (playerBot, currentWinStreak) => {
  const maxTier = getMaxAllowedTier(currentWinStreak);

  const loadout = {
    [PART_SLOTS.HEAD]: null,
    [PART_SLOTS.RIGHT_ARM]: null,
    [PART_SLOTS.LEFT_ARM]: null,
    [PART_SLOTS.CHASSIS]: null
  };

  // Select parts based on Tier Cap + Random Variation
  Object.values(PART_SLOTS).forEach(slot => {
    // 60% chance to match the max tier, 40% chance to be one tier lower (for variety)
    let targetTier = Math.random() < 0.6 ? maxTier : Math.max(1, maxTier - 1);

    // Filter parts by Slot AND Tier
    let possibleParts = parts.filter(p => p.slot === slot && p.tier === targetTier);

    // Safety fallback: if no parts found for that specific tier, just grab any from that slot
    if (possibleParts.length === 0) {
      possibleParts = parts.filter(p => p.slot === slot);
    }

    // Pick random part
    const selected = possibleParts[Math.floor(Math.random() * possibleParts.length)];
    loadout[slot] = selected.id;
  });

  const name = enemyNames[Math.floor(Math.random() * enemyNames.length)];

  return {
    id: `enemy_${Date.now()}`,
    name,
    equipment: loadout,
    health: BASE_HEALTH,
    isEnemy: true,
    difficulty: currentWinStreak
  };
};

// Legacy compatibility
export const generateEnemy = (winStreak) => {
  const mockBot = { equipment: {} };
  return generateBalancedEnemy(mockBot, winStreak);
};