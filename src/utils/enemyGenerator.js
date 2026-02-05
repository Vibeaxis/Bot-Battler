import { parts, PART_SLOTS } from '@/data/parts';
import { BASE_HEALTH } from '@/constants/gameConstants';

// --- MODULAR NAME GENERATOR ---

// --- EXPANDED MODULAR NAME POOL ---

const NAME_PREFIXES = [
  // Elemental & Physical
  'Cyber', 'Iron', 'Neon', 'Void', 'Steel', 'Mech', 'Nano', 'Flux', 'Grim', 'Doom',
  'Solar', 'Lunar', 'Toxic', 'Pyro', 'Cryo', 'Dark', 'Holo', 'Warp', 'Null', 'Zero',
  'Rust', 'Dust', 'Scrap', 'Junk', 'Trash', 'Waste', 'Debris', 'Slag', 'Soot', 'Ash',
  'Magma', 'Volt', 'Static', 'Acid', 'Sonic', 'Laser', 'Plasma', 'Rad', 'Nuke', 'Bio',
  'Chrome', 'Cobalt', 'Onyx', 'Obsidian', 'Ivory', 'Crimson', 'Azure', 'Jade', 'Amber', 'Silver',
  
  // Abstract & Status
  'Rogue', 'Apex', 'Titan', 'Omega', 'Alpha', 'Prime', 'Ultra', 'Hyper', 'Super', 'Mega',
  'Chaos', 'Law', 'Storm', 'Thunder', 'Ghost', 'Shadow', 'Phantom', 'Spirit', 'Soul', 'Mind',
  'Fatal', 'Lethal', 'Vile', 'Pure', 'True', 'Lost', 'Fallen', 'Broken', 'Risen', 'Wicked',
  'Silent', 'Loud', 'Swift', 'Heavy', 'Light', 'Blind', 'Deaf', 'Numb', 'Dead', 'Live',
  'Grand', 'Arch', 'High', 'Low', 'Deep', 'Far', 'Near', 'Cold', 'Hot', 'Warm',

  // Tech & Military
  'Tech', 'Data', 'Code', 'Net', 'Web', 'Grid', 'Link', 'Node', 'Core', 'Chip',
  'Logic', 'System', 'Auto', 'Servo', 'Hydro', 'Aero', 'Geo', 'Exo', 'Endo', 'Meso',
  'Proto', 'Meta', 'Beta', 'Giga', 'Tera', 'Peta', 'Exa', 'Zetta', 'Yotta', 'Kilo',
  'Strike', 'Blast', 'Force', 'Power', 'Shock', 'Awe', 'Dread', 'Fear', 'Hate', 'Rage',
  'War', 'Battle', 'Combat', 'Fight', 'Brawl', 'Duel', 'Kill', 'Hunt', 'Chase', 'Run'
];

const NAME_NOUNS = [
  // Frame Types
  'Bot', 'Droid', 'Unit', 'Mech', 'Frame', 'Rig', 'Suit', 'Gear', 'Core', 'Mind',
  'Walker', 'Runner', 'Flyer', 'Glider', 'Hover', 'Tank', 'Jeep', 'Bike', 'Car', 'Van',
  'Strider', 'Crawler', 'Roller', 'Floater', 'Lifter', 'Loader', 'Hauler', 'Carrier', 'Drone', 'Probe',
  'Shell', 'Husk', 'Form', 'Body', 'Vessel', 'Avatar', 'Proxy', 'Agent', 'Asset', 'Pawn',
  
  // Combat Roles
  'Slayer', 'Killer', 'Hunter', 'Seeker', 'Finder', 'Keeper', 'Warden', 'Guard', 'Scout', 'Spy',
  'Reaper', 'Demon', 'Devil', 'Angel', 'God', 'Lord', 'King', 'Queen', 'Prince', 'Duke',
  'Sniper', 'Gunner', 'Bomber', 'Sapper', 'Medic', 'Tech', 'Engie', 'Pilot', 'Driver', 'Rider',
  'Brawler', 'Fighter', 'Soldier', 'Grunt', 'Chief', 'Boss', 'Leader', 'Master', 'Slave', 'Servant',
  'Breaker', 'Crusher', 'Smasher', 'Basher', 'Ripper', 'Tearer', 'Shredder', 'Grinder', 'Mincer', 'Slicer',
  'Burner', 'Freezer', 'Shocker', 'Blaster', 'Shooter', 'Lancer', 'Archer', 'Knight', 'Rook', 'Bishop',

  // Creatures & Mythos
  'Viper', 'Cobra', 'Snake', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Shark', 'Whale', 'Hawk',
  'Eagle', 'Falcon', 'Raven', 'Crow', 'Owl', 'Bat', 'Rat', 'Mouse', 'Cat', 'Dog',
  'Dragon', 'Wyvern', 'Drake', 'Hydra', 'Golem', 'Giant', 'Troll', 'Orc', 'Elf', 'Dwarf',
  'Spider', 'Scorpion', 'Wasp', 'Hornet', 'Ant', 'Beetle', 'Mantis', 'Locust', 'Roach', 'Worm',
  'Wraith', 'Specter', 'Ghoul', 'Zombie', 'Lich', 'Vampire', 'Werewolf', 'Mutant', 'Cyborg', 'Android'
];

const NAME_TAGS = [
  // Military & Sci-Fi Codes
  'X-1', 'X-9', 'V.2', 'mk.I', 'mk.IV', 'G-0', '734', '404', '808', '909',
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Zero', 'One', 'Red', 'Blue', 'Onyx', 'Gold',
  'Z-7', 'R-Type', 'Type-0', 'Spec-Ops', 'Gen-1', 'Gen-X', 'V-8', 'V-12', 'X-Wing', 'Y-Wing',
  '001', '007', '101', '117', '666', '777', '999', '1337', '2077', '2049',
  
  // Descriptive Suffixes
  'Prime', 'Max', 'Pro', 'Lite', 'Mini', 'Micro', 'Nano', 'Pico', 'Femto', 'Atto',
  'Plus', 'Ultra', 'Extreme', 'Final', 'Last', 'First', 'Only', 'Lone', 'Solo', 'Duo',
  'Heavy', 'Light', 'Fast', 'Slow', 'Hard', 'Soft', 'Wet', 'Dry', 'Cold', 'Hot',
  'Elite', 'Ace', 'Vet', 'Noob', 'Bot', 'AI', 'NPC', 'Mob', 'Boss', 'God',
  'Mk.II', 'Mk.III', 'Mk.V', 'Mk.X', 'Rev.A', 'Rev.B', 'Ver.1', 'Ver.2', 'Patch.1', 'Build.9'
];

const generateModularName = () => {
    const p = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
    const n = NAME_NOUNS[Math.floor(Math.random() * NAME_NOUNS.length)];
    
    // 30% chance to have a tag suffix for extra flavor
    const hasTag = Math.random() < 0.3;
    const t = hasTag ? ` ${NAME_TAGS[Math.floor(Math.random() * NAME_TAGS.length)]}` : '';

    return `${p} ${n}${t}`;
};

// --- ENEMY RARITY CONFIG ---
const ENEMY_RARITIES = [
  { id: 'common', chance: 0.60, prefix: '', tierOffset: 0, rarityName: 'Common' },
  { id: 'uncommon', chance: 0.25, prefix: 'Heavy', tierOffset: 0, rarityName: 'Uncommon' },
  { id: 'rare', chance: 0.10, prefix: 'Elite', tierOffset: 1, rarityName: 'Rare' }, 
  { id: 'epic', chance: 0.04, prefix: 'Prime', tierOffset: 1, rarityName: 'Epic' },
  { id: 'legendary', chance: 0.01, prefix: 'APEX', tierOffset: 2, rarityName: 'Legendary' }
];

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

// Roll for rarity based on the chance distribution
const getEnemyRarity = () => {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const rarity of ENEMY_RARITIES) {
    cumulative += rarity.chance;
    if (rand < cumulative) return rarity;
  }
  return ENEMY_RARITIES[0]; // Fallback to Common
};

const getWeightedTier = (playerAverageTier, streak, tierOffset = 0) => {
  let base = playerAverageTier;
  const pressure = Math.floor(streak / 5);
  const variance = Math.floor(Math.random() * 3) - 1; 

  let target = base + pressure + variance + tierOffset;

  return Math.max(1, Math.min(5, target));
};

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
  
  // 1. Determine Enemy Rarity
  const isBossWave = currentWinStreak > 0 && currentWinStreak % 10 === 0;
  let rarityConfig = getEnemyRarity();
  
  if (isBossWave && (rarityConfig.id === 'common' || rarityConfig.id === 'uncommon' || rarityConfig.id === 'rare')) {
      rarityConfig = ENEMY_RARITIES.find(r => r.id === 'epic'); 
  }

  const loadout = {
    [PART_SLOTS.HEAD]: null,
    [PART_SLOTS.RIGHT_ARM]: null,
    [PART_SLOTS.LEFT_ARM]: null,
    [PART_SLOTS.CHASSIS]: null
  };

  Object.values(PART_SLOTS).forEach(slot => {
    const targetTier = getWeightedTier(playerAvgTier, currentWinStreak, rarityConfig.tierOffset);

    let possibleParts = parts.filter(p => p.slot === slot);
    let tierParts = possibleParts.filter(p => p.tier === targetTier);

    if (tierParts.length === 0) tierParts = possibleParts.filter(p => p.tier === targetTier - 1);
    if (tierParts.length === 0) tierParts = possibleParts.filter(p => p.tier === targetTier + 1);
    if (tierParts.length === 0) tierParts = possibleParts;

    let selected;
    if (archetype.statPriority) {
        tierParts.sort((a, b) => b.stats[archetype.statPriority] - a.stats[archetype.statPriority]);
        const topCount = Math.min(3, tierParts.length);
        selected = tierParts[Math.floor(Math.random() * topCount)];
    } else {
        selected = tierParts[Math.floor(Math.random() * tierParts.length)];
    }

    loadout[slot] = selected.id;
  });

  // --- NAME GENERATION ---
  const baseName = generateModularName();
  let finalName = baseName;

  // Apply Rarity Prefix (e.g. "Elite [Iron Sentinel X-9]")
  if (rarityConfig.prefix) {
      finalName = `${rarityConfig.prefix} ${baseName}`;
  }

  // Boss Override
  if (isBossWave) {
      finalName = `[BOSS] ${baseName}`; 
      rarityConfig = ENEMY_RARITIES.find(r => r.id === 'legendary');
  }

  return {
    id: `enemy_${Date.now()}`,
    name: finalName,
    equipment: loadout,
    health: BASE_HEALTH, 
    isEnemy: true,
    difficulty: currentWinStreak,
    archetype: archetype.statPriority || 'Balanced',
    rarity: rarityConfig.rarityName, 
    rarityId: rarityConfig.id
  };
};

export const generateEnemy = (winStreak) => {
  const mockBot = { equipment: {} }; 
  return generateBalancedEnemy(mockBot, winStreak);
};