import { getPartById } from '@/data/parts';

// ==========================================
// LAYER 1: THE CLASSIC POOL (Your "Old Flavor")
// ==========================================
const GENERIC_POOL = {
  INTRO: [
    "System initialized.",
    "Target locked.",
    "You look like scrap.",
    "Protocols engaged.",
    "Combat subroutines loaded.",
    "Prepare for disassembly.",
    "Scanning for weaknesses...",
    "Mercy.exe not found.",
    "Analyzing threat level: Minimal.",
    "Weapons hot. Logic cold.",
    "Deletion imminent.",
    "Initiating violence.bat...",
    "Your warranty expires now.",
    "Uploading pain...",
    "Target identification: Obsolete.",
    "Recycling process started.",
    "Do not resist.",
    "Combat log opened.",
    "The Syndicate sends regards.",
    "No witnesses.",
    "Just business, nothing personal.",
    "Cleaning up the sector."
  ],
  VICTORY: [
    "Threat eliminated.",
    "Garbage day.",
    "Optimized.",
    "GG EZ.",
    "Scrap acquired.",
    "Performance exceeds parameters.",
    "Another one for the pile.",
    "Superiority confirmed.",
    "Combat efficiency: 100%.",
    "Adding to collection.",
    "Update complete. You have been archived.",
    "Waste processing finished.",
    "Glory to the machine.",
    "Predictable outcome.",
    "Looting subroutines engaged.",
    "You have been reformatted.",
    "Clean kill.",
    "Next target required."
  ],
  DEFEAT: [
    "Critical failure...",
    "System shutting down...",
    "Reboot required...",
    "Darkness...",
    "Error 404: Skill not found.",
    "My circuits...",
    "Temporary setback.",
    "Malfunction detected.",
    "Blue screen of death...",
    "Core temperature critical...",
    "Leaking coolant...",
    "I saw... the code...",
    "Fatal exception occurred.",
    "Disconnecting...",
    "Hardware compromised.",
    "Requesting backup... signal lost.",
    "Power... fading...",
    "Shutdown sequence initiated."
  ],
  HIT: [
    "Ouch!", "Armor breached!", "Calculated.", "Tis but a scratch.",
    "Warning: Integrity dropping.", "Taking fire!", "Components rattling!",
    "Direct hit detected.", "Sparks detected!", "My sensors!",
    "Rerouting power!", "External plating damaged.", "Stabilizers failing!",
    "Impact verified.", "You will pay for that.", "Oil pressure dropping."
  ]
};

// ==========================================
// LAYER 2: ARCHETYPES (Stat Based)
// ==========================================
const ARCHETYPES = {
  JUGGERNAUT: { // High Armor
    INTRO: ["I am the wall.", "Shoot me. I dare you.", "My plating is thicker than your logic."],
    VICTORY: ["Barely scratched the paint.", "You broke yourself trying to break me.", "Heavy weight champion."],
    DEFEAT: ["Structural integrity... failing...", "Too... heavy...", "Armor breached... impossible..."]
  },
  SPEEDSTER: { // High Speed
    INTRO: ["Catch me if you can.", "Speed limit disabled.", "I'll be done before you boot up."],
    VICTORY: ["Too slow.", "Did you even see me?", "Lap time: Record breaking."],
    DEFEAT: ["Stopped... dead...", "Momentum... lost...", "Crashed..."]
  },
  DESTROYER: { // High Damage
    INTRO: ["Charging main cannons...", "Maximum output engaged.", "Violence is the answer."],
    VICTORY: ["Total annihilation.", "Scorched earth.", "Overkill is underrated."],
    DEFEAT: ["Overheating...", "Reactor... critical...", "I flew too close to the sun..."]
  }
};

// ==========================================
// LAYER 3: SMART TEMPLATES (Item Based)
// ==========================================
const ITEM_TEMPLATES = {
  FLEX: [
    "My {myPart} costs more than your life.",
    "Do you see this {myPart}? It's the last thing you'll view.",
    "Imported {myPart}. Illegal in 5 sectors.",
    "Performance check: My {myPart} is running at 110%."
  ],
  ROAST: [
    "Is that a {enemyPart}? Did you find it in a dumpster?",
    "Your {enemyPart} is rusting.",
    "Target analysis: {enemyPart} detected. Laughable.",
    "I'll rip that {enemyPart} right off your chassis."
  ]
};

// ==========================================
// THE LOGIC BRAIN
// ==========================================
const getArchetype = (stats) => {
  if (!stats) return null;
  const { Damage = 0, Armor = 0, Speed = 0 } = stats;
  if (Armor > (Damage + Speed) / 1.5) return 'JUGGERNAUT';
  if (Speed > (Armor + Damage) / 1.5) return 'SPEEDSTER';
  if (Damage > (Armor + Speed) / 1.5) return 'DESTROYER';
  return null;
};

const getBestItem = (bot) => {
  if (!bot || !bot.equipment) return null;
  const parts = Object.values(bot.equipment).filter(id => id).map(id => getPartById(id)).filter(p => p);
  return parts.sort((a, b) => b.tier - a.tier)[0]; // Highest Tier
};

const getWorstItem = (bot) => {
  if (!bot || !bot.equipment) return null;
  const parts = Object.values(bot.equipment).filter(id => id).map(id => getPartById(id)).filter(p => p);
  return parts.sort((a, b) => a.tier - b.tier)[0]; // Lowest Tier
};

export const getSmartFlavor = (myBot, enemyBot, type = 'INTRO') => {
  // 1. FAST EXIT FOR HIT/CRIT (Keep these snappy and generic)
  if (type === 'HIT') {
    const pool = GENERIC_POOL.HIT;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const roll = Math.random();

  // 2. TRY SMART ITEM LINES (30% Chance)
  // Only works for INTRO currently to set the mood
  if (type === 'INTRO' && roll > 0.7) {
    // Try to roast enemy
    const enemyTrash = getWorstItem(enemyBot);
    if (enemyTrash && enemyTrash.tier === 1 && Math.random() > 0.5) {
      const template = ITEM_TEMPLATES.ROAST[Math.floor(Math.random() * ITEM_TEMPLATES.ROAST.length)];
      return template.replace('{enemyPart}', enemyTrash.name);
    }
    // Try to flex own gear
    const myGold = getBestItem(myBot);
    if (myGold && myGold.tier >= 3) {
      const template = ITEM_TEMPLATES.FLEX[Math.floor(Math.random() * ITEM_TEMPLATES.FLEX.length)];
      return template.replace('{myPart}', myGold.name);
    }
  }

  // 3. TRY ARCHETYPE LINES (30% Chance)
  if (roll > 0.4) {
    const archetype = getArchetype(myBot?.stats);
    if (archetype && ARCHETYPES[archetype][type]) {
      const pool = ARCHETYPES[archetype][type];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  // 4. FALLBACK TO GENERIC (40% Chance or if logic failed)
  const pool = GENERIC_POOL[type] || GENERIC_POOL.INTRO;
  return pool[Math.floor(Math.random() * pool.length)];
};