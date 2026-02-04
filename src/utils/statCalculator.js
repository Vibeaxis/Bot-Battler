import { getPartById } from '@/data/parts';
import { BASE_HEALTH } from '@/constants/gameConstants';

export const calculateBotStats = (bot) => {
  const stats = { Damage: 0, Speed: 0, Armor: 0, Weight: 0 };
  
  const levels = bot.slotLevels || { head: 0, rightArm: 0, leftArm: 0, chassis: 0 };

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

  // --- NEW MECHANIC: HEAVY BUILD SCALING ---
  
  // 1. Kinetic Mass (Momentum)
  // Heavier bots hit harder. Add 5% of Weight to Damage.
  // Example: 200 Weight = +10 Damage.
  stats.Damage += (stats.Weight * 0.05);

  // 2. Hull Integrity (Density)
  // Weight adds to Max HP, but we CAP it to prevent "Raid Bosses".
  // Ratio: 10 Weight = 1 HP.
  // Max Bonus: 50 HP.
  const hpBonus = Math.min(50, Math.floor(stats.Weight * 0.1));
  const maxHealth = (BASE_HEALTH || 100) + hpBonus;

  return {
    Damage: Math.round(stats.Damage),
    Speed: Math.round(stats.Speed),
    Armor: Math.round(stats.Armor),
    Weight: Math.round(stats.Weight),
    MaxHealth: Math.round(maxHealth) // Exporting the new calculated Max HP
  };
};