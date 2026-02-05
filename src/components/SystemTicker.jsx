import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

const TIPS = [
  // --- MECHANICS (The Useful Stuff) ---
  "TIP: Three items of the same rarity can be fused in The Forge.",
  "TIP: Selling 'Common' items provides Scrap for better crates.",
  "TIP: Win streaks increase enemy difficulty but yield higher rewards.",
  "TIP: 'Legendary' items have unique stat distributions. Good luck.",
  "TIP: Losing a battle grants a small Scrap consolation. Failure is progress.",
  "TIP: Different chassis types affect your base Speed and Armor caps.",
  "TIP: Check the Battle Log to analyze enemy damage types.",
  "TIP: Mystery Crates have a 0.1% chance to drop Mythic gear.",
  "TIP: Your active loadout cannot be sold. Unequip items first.",
  "TIP: Speed determines who strikes first. The slow perish.",
  "TIP: Heavy items reduce your Speed. Balance is key.",
  "TIP: 'Epic' items often have one stat spiked at the cost of others.",
  "TIP: You can reroll the enemy selection for a Scrap fee.",
  "TIP: Repairing is automatic, but trauma lingers in the code.",
  "TIP: Certain enemy archetypes are weak to high-damage alpha strikes.",

  // --- LORE (World Building) ---
  "LORE: 'One man's trash is another man's lethal weapon.' - Scavenger Code",
  "LORE: The Neon District allows unauthorized combat after 02:00 AM.",
  "LORE: Rumor has it the 'Omega' units are run by a rogue AI.",
  "LORE: Don't ask where the Scrap comes from. You don't want to know.",
  "LORE: The Arena was built on the ruins of the Old World banking sector.",
  "LORE: Keep your bot clean. Oil leaks attract Scav-Rats.",
  "LORE: 'I sold my kidney for a Legendary chassis. Worth it.' - Anon",
  "LORE: Rust is the only thing that truly never sleeps.",
  "LORE: They say the 'Prime' units can feel pain. Let's hope so.",
  "LORE: A winning bot is a profitable bot. A losing bot is spare parts.",

  // --- CORPORATE PROPAGANDA (The "House" Voice) ---
  "SYSTEM: Unauthorized modification of firmware is a Class A felony.",
  "SYSTEM: Remember to hydrate. Organic components are expensive to replace.",
  "SYSTEM: The Arena Management assumes no liability for death or dismemberment.",
  "SYSTEM: Winners don't sleep. Winners optimize.",
  "SYSTEM: Report any 'Rogue' AI behavior to your nearest Peacekeeper.",
  "SYSTEM: Gambling on your own matches is strictly... encouraged.",
  "SYSTEM: Pain is just data entering the system.",
  "SYSTEM: Have you updated your living will today?",
  "SYSTEM: Consumption is mandatory. Buy more crates.",
  "SYSTEM: Your value is determined by your win rate.",

  // --- CYNICAL ADVICE (Dark Humor) ---
  "ADVICE: If you can't beat them, salvage them.",
  "ADVICE: Armor is cheap. Repairs are expensive. Don't get hit.",
  "ADVICE: Trust no one. Especially the merchant.",
  "ADVICE: A fair fight is a fight you prepared poorly for.",
  "ADVICE: Mercy is a feature we removed in patch 1.04.",
  "ADVICE: If it bleeds, we can kill it. If it leaks, we can sell it.",
  "ADVICE: Try hitting them harder. It usually works.",
  "ADVICE: Your bot doesn't love you. It loves electricity.",
  "ADVICE: Don't get attached. Everything breaks eventually.",
  "ADVICE: There is no 'respawn' in the real world, kid."
];

// Helper to style the prefix
const getPrefixStyle = (prefix) => {
  switch (prefix) {
    case 'TIP': return 'text-cyan-400';
    case 'LORE': return 'text-purple-400';
    case 'SYSTEM': return 'text-red-500';
    case 'ADVICE': return 'text-amber-400';
    default: return 'text-gray-400';
  }
};

const SystemTicker = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TIPS.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(timer);
  }, []);

  // Parse the current tip
  const fullText = TIPS[index];
  const splitIndex = fullText.indexOf(':');
  const prefix = splitIndex !== -1 ? fullText.substring(0, splitIndex) : '';
  const message = splitIndex !== -1 ? fullText.substring(splitIndex + 1) : fullText;

  return (
    <div className="w-full bg-black/60 border-t border-b border-[var(--accent-color)]/30 py-2 px-4 flex items-center gap-4 overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-2 text-[var(--accent-color)] shrink-0 opacity-70">
        <Terminal className="w-4 h-4" />
        <span className="text-xs font-bold font-mono uppercase tracking-widest hidden md:inline-block">SYS_MSG:</span>
      </div>
      
      <div className="flex-1 relative h-6">
        <AnimatePresence mode='wait'>
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center"
          >
            <span className="text-xs md:text-sm font-mono truncate">
              {prefix && (
                <span className={`font-bold mr-2 ${getPrefixStyle(prefix)}`}>
                  {prefix}:
                </span>
              )}
              <span className="text-gray-300">
                {message}
              </span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative 'Online' Indicator */}
      <div className="flex gap-1 shrink-0">
         <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-pulse" />
         <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full opacity-50" />
         <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full opacity-20" />
      </div>
    </div>
  );
};

export default SystemTicker;