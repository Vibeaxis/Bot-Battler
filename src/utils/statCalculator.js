
import { getPartById } from '@/data/parts';

export const calculateBotStats = (bot) => {
  const stats = { Damage: 0, Speed: 0, Armor: 0, Weight: 0 };
  
  // Handle slot levels - support both structure types (direct property or passed merged object)
  const levels = bot.slotLevels || { head: 0, rightArm: 0, leftArm: 0, chassis: 0 };

  // Map equipment keys (PascalCase) to slotLevel keys (camelCase)
  const slotMap = {
    Head: 'head',
    RightArm: 'rightArm',
    LeftArm: 'leftArm',
    Chassis: 'chassis'
  };

  Object.entries(bot.equipment).forEach(([slotKey, partId]) => {
    if (partId) {
      const part = getPartById(partId);
      if (part) {
        // Determine multiplier
        // Default to 1 if no level found
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

  // Round results
  return {
    Damage: Math.round(stats.Damage),
    Speed: Math.round(stats.Speed),
    Armor: Math.round(stats.Armor),
    Weight: Math.round(stats.Weight)
  };
};
