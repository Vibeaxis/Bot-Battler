export const STARTING_SCRAP = 100;
export const WIN_REWARD = 50;
export const LOSS_REWARD = 10;
export const MYSTERY_CRATE_COST = 30;

export const BASE_HEALTH = 100;
export const BASE_HIT_CHANCE = 0.85;
export const CRIT_CHANCE = 0.15;
export const CRIT_MULTIPLIER = 1.5;
export const DAMAGE_VARIANCE = 0.1;

export const TIER_WEIGHTS = {
  1: 0.50,  // 50% Common
  2: 0.30,  // 30% Uncommon
  3: 0.15,  // 15% Rare
  4: 0.05   // 5% Legendary
};

export const ENEMY_DIFFICULTY_SCALING = 0.05; // 5% per win streak

export const RARITY_COLORS = {
  1: {
    text: 'text-gray-400',
    border: 'border-gray-600',
    bg: 'bg-gray-600',
    bgTint: 'bg-gray-600/10',
    shadow: 'shadow-none',
    glow: ''
  },
  2: {
    text: 'text-emerald-400',
    border: 'border-emerald-600',
    bg: 'bg-emerald-600',
    bgTint: 'bg-emerald-600/10',
    shadow: 'shadow-emerald-900/20',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]'
  },
  3: {
    text: 'text-blue-400',
    border: 'border-blue-600',
    bg: 'bg-blue-600',
    bgTint: 'bg-blue-600/10',
    shadow: 'shadow-blue-900/20',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]'
  },
  4: {
    text: 'text-amber-400',
    border: 'border-amber-500',
    bg: 'bg-amber-500',
    bgTint: 'bg-amber-500/10',
    shadow: 'shadow-amber-900/20',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse'
  }
};

export const RARITY_NAMES = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Legendary'
};