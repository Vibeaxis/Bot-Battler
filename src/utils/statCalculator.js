import { getPartById } from '@/data/parts';
import { BASE_HEALTH } from '@/constants/gameConstants';

export const calculateBotStats = (bot) => {
  // --- CRASH FIX: SAFEGUARD ---
  // If bot is undefined, null, or has no equipment (loading state), return zeroes.
  if (!bot || !bot.equipment) {
    return {
        Damage: 0,
        Speed: 0,
        Armor: 0,
        Weight: 0,
        MaxHealth: BASE_HEALTH || 100
    };
  }

  const stats = { Damage: 0, Speed: 0, Armor: 0, Weight: 0 };
  
  // Handle slot levels - support both structure types
  const levels = bot.slotLevels || { head: 0, rightArm: 0, leftArm: 0, chassis: 0 };

  const slotMap = {
    Head: 'head',
    RightArm: 'rightArm',
    LeftArm: 'leftArm',
    Chassis: 'chassis'
  };

  // 1. Calculate Stats from Equipment
  Object.entries(bot.equipment).forEach(([slotKey, partId]) => {
    if (partId) {
      const part = getPartById(partId);
      if (part) {
        const levelKey = slotMap[slotKey] || slotKey;
        const level = levels[levelKey] || 0;
        const multiplier = 1 + (level * 0.1);

        stats.Damage += part.stats.Damage * multiplier;
        stats.Speed += part.stats.Speed * multiplier;
        stats.Armor += part.stats.Armor * multiplier;
        stats.Weight += part.stats.Weight * multiplier;
      }
    }
  });

  // 2. --- APPLY BASE STATS (From Workshop Upgrades) ---
  if (bot.baseStats) {
      stats.Damage += (bot.baseStats.Damage || 0);
      stats.Speed  += (bot.baseStats.Speed  || 0);
      stats.Armor  += (bot.baseStats.Armor  || 0);
      stats.Weight += (bot.baseStats.Weight || 0);
  }

  // 3. --- WEIGHT BONUSES ---
  
  // Kinetic Mass (5% of Total Weight added to Damage)
  stats.Damage += (stats.Weight * 0.05);

  // Hull Integrity (1 HP per 10 Total Weight, Capped at +50)
  const hpBonus = Math.min(50, Math.floor(stats.Weight * 0.1));
  const maxHealth = (BASE_HEALTH || 100) + hpBonus;

  return {
    Damage: Math.round(stats.Damage),
    Speed: Math.round(stats.Speed),
    Armor: Math.round(stats.Armor),
    Weight: Math.round(stats.Weight),
    MaxHealth: Math.round(maxHealth)
  };
};