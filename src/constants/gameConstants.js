export const STARTING_SCRAP = 100;
export const WIN_REWARD = 50;
export const LOSS_REWARD = 10;
export const MYSTERY_CRATE_COST = 30;

export const BASE_HEALTH = 100;
export const BASE_HIT_CHANCE = 0.85;
export const CRIT_CHANCE = 0.15;
export const CRIT_MULTIPLIER = 1.5;
export const DAMAGE_VARIANCE = 0.1;

// Rebalanced Drop Weights for 7 Tiers
// (Mythic/Omega are extremely rare or boss-only drops)
export const TIER_WEIGHTS = {
  1: 0.45,   // 45% Common
  2: 0.30,   // 30% Uncommon
  3: 0.15,   // 15% Rare
  4: 0.08,   // 8% Epic
  5: 0.019,  // 1.9% Legendary
  6: 0.001,  // 0.1% Omega
  7: 0.0     // 0% Mythic (Only via Fusion or Special Events)
};

export const ENEMY_DIFFICULTY_SCALING = 0.05;

export const RARITY_NAMES = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Epic',       // NEW
  5: 'Legendary',  // MOVED UP
  6: 'Omega',      // NEW
  7: 'Mythic'      // NEW
};

export const RARITY_COLORS = {
  // TIER 1: COMMON (Gray)
  1: {
    text: 'text-gray-400',
    border: 'border-gray-600',
    bg: 'bg-gray-600',
    bgTint: 'bg-gray-600/10',
    shadow: 'shadow-none',
    glow: ''
  },
  // TIER 2: UNCOMMON (Emerald)
  2: {
    text: 'text-emerald-400',
    border: 'border-emerald-600',
    bg: 'bg-emerald-600',
    bgTint: 'bg-emerald-600/10',
    shadow: 'shadow-emerald-900/20',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]'
  },
  // TIER 3: RARE (Blue)
  3: {
    text: 'text-blue-400',
    border: 'border-blue-600',
    bg: 'bg-blue-600',
    bgTint: 'bg-blue-600/10',
    shadow: 'shadow-blue-900/20',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]'
  },
  // TIER 4: EPIC (Purple) - NEW
  4: {
    text: 'text-purple-400',
    border: 'border-purple-500',
    bg: 'bg-purple-500',
    bgTint: 'bg-purple-500/10',
    shadow: 'shadow-purple-900/20',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]'
  },
  // TIER 5: LEGENDARY (Amber/Gold) - MOVED UP
  5: {
    text: 'text-amber-400',
    border: 'border-amber-500',
    bg: 'bg-amber-500',
    bgTint: 'bg-amber-500/10',
    shadow: 'shadow-amber-900/20',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse'
  },
  // TIER 6: OMEGA (Red/Crimson) - NEW
  6: {
    text: 'text-rose-500',
    border: 'border-rose-600',
    bg: 'bg-rose-600',
    bgTint: 'bg-rose-600/10',
    shadow: 'shadow-rose-900/40',
    glow: 'shadow-[0_0_35px_rgba(244,63,94,0.8)] animate-pulse'
  },
  // TIER 7: MYTHIC (Cyan/Glitch) - NEW
  7: {
    text: 'text-cyan-400',
    border: 'border-cyan-400',
    bg: 'bg-cyan-500',
    bgTint: 'bg-cyan-500/20',
    shadow: 'shadow-cyan-900/50',
    glow: 'shadow-[0_0_50px_rgba(34,211,238,0.9)] animate-pulse'
  }
};