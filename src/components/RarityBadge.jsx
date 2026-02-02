import React from 'react';
import { RARITY_COLORS, RARITY_NAMES } from '@/constants/gameConstants';
import { cn } from '@/lib/utils';

const RarityBadge = ({ tier, className }) => {
  const colors = RARITY_COLORS[tier] || RARITY_COLORS[1];
  const name = RARITY_NAMES[tier] || RARITY_NAMES[1];
  const isSpecial = tier >= 3;

  return (
    <span 
      className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
        colors.bgTint,
        colors.text,
        colors.border,
        isSpecial ? colors.glow : '',
        className
      )}
    >
      {name}
    </span>
  );
};

export default RarityBadge;