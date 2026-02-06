
import { TIER_WEIGHTS } from '@/constants/gameConstants';
import { expansionParts } from './parts_expansion';

export const PART_SLOTS = {
  HEAD: 'Head',
  RIGHT_ARM: 'RightArm',
  LEFT_ARM: 'LeftArm',
  CHASSIS: 'Chassis'
};

export const PART_TIERS = {
  TIER_1: 1, // Common
  TIER_2: 2, // Uncommon
  TIER_3: 3, // Rare
  TIER_4: 4, // Epic (Purple)
  TIER_5: 5, // Legendary (Orange)
  TIER_6: 6, // Omega (Teal/Pearl - Bridge to Mythic)
  TIER_7: 7  // Mythic (White/Glitch - God Tier)
};

export const RARITY = {
  COMMON: 'Common',
  UNCOMMON: 'Uncommon',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
  OMEGA: 'Omega',
  MYTHIC: 'Mythic'
};

// --- HEAD PARTS ---
const HEAD_PARTS = [
  // --- TIER 1: COMMON (Gray) ---
  // BUFFERED: Higher base speed and armor so you don't get speed-blitzed immediately
  { id: 'h_scanner_v1', name: 'Basic Scanner', tier: 1, stats: { Damage: 4, Speed: 10, Armor: 5, Weight: 5 }, icon: 'Scan', rarity: RARITY.COMMON },
  { id: 'h_rust_visor', name: 'Rusted Visor', tier: 1, stats: { Damage: 5, Speed: 5, Armor: 8, Weight: 8 }, icon: 'View', rarity: RARITY.COMMON },
  { id: 'h_train_helm', name: 'Training Helm', tier: 1, stats: { Damage: 2, Speed: 8, Armor: 10, Weight: 6 }, icon: 'HardHat', rarity: RARITY.COMMON },
  { id: 'h_optics_basic', name: 'Optics V1', tier: 1, stats: { Damage: 6, Speed: 12, Armor: 2, Weight: 4 }, icon: 'Glasses', rarity: RARITY.COMMON },
  { id: 'h_scrap_cowl', name: 'Scrapper Cowl', tier: 1, stats: { Damage: 4, Speed: 6, Armor: 12, Weight: 9 }, icon: 'Skull', rarity: RARITY.COMMON },
  { id: 'h_bucket', name: 'Steel Bucket', tier: 1, stats: { Damage: 0, Speed: 0, Armor: 15, Weight: 10 }, icon: 'Container', rarity: RARITY.COMMON },
  { id: 'h_miner_lamp', name: 'Miner Lamp', tier: 1, stats: { Damage: 5, Speed: 8, Armor: 5, Weight: 6 }, icon: 'Lightbulb', rarity: RARITY.COMMON },
  

  // --- TIER 2: UNCOMMON (Green) ---
  { id: 'h_tac_hud', name: 'Tactical HUD', tier: 2, stats: { Damage: 8, Speed: 10, Armor: 5, Weight: 8 }, icon: 'Target', rarity: RARITY.UNCOMMON },
  { id: 'h_target_mat', name: 'Targeting Matrix', tier: 2, stats: { Damage: 12, Speed: 8, Armor: 4, Weight: 7 }, icon: 'Crosshair', rarity: RARITY.UNCOMMON },
  { id: 'h_reinf_helm', name: 'Reinforced Helm', tier: 2, stats: { Damage: 5, Speed: 4, Armor: 15, Weight: 14 }, icon: 'Shield', rarity: RARITY.UNCOMMON },
  { id: 'h_sens_array', name: 'Sensor Array', tier: 2, stats: { Damage: 6, Speed: 15, Armor: 3, Weight: 9 }, icon: 'Radio', rarity: RARITY.UNCOMMON },
  { id: 'h_night_vis', name: 'Night Vision', tier: 2, stats: { Damage: 7, Speed: 12, Armor: 4, Weight: 6 }, icon: 'EyeOff', rarity: RARITY.UNCOMMON },
  { id: 'h_comm_link', name: 'Comm Link', tier: 2, stats: { Damage: 4, Speed: 18, Armor: 2, Weight: 5 }, icon: 'Wifi', rarity: RARITY.UNCOMMON },
  { id: 'h_webcam', name: 'Optic Eye', tier: 2, stats: { Damage: 5, Speed: 15, Armor: 2, Weight: 5 }, icon: 'Webcam', rarity: RARITY.UNCOMMON },
  { id: 'h_router', name: 'Wi-Fi Hub', tier: 2, stats: { Damage: 8, Speed: 12, Armor: 0, Weight: 6 }, icon: 'Router', rarity: RARITY.UNCOMMON },
  { id: 'h_monitor', name: 'CRT Monitor', tier: 2, stats: { Damage: 2, Speed: 5, Armor: 15, Weight: 20 }, icon: 'Monitor', rarity: RARITY.UNCOMMON },
  { id: 'h_brain_cog', name: 'Logic Gear', tier: 2, stats: { Damage: 12, Speed: 10, Armor: 5, Weight: 10 }, icon: 'BrainCog', rarity: RARITY.UNCOMMON },
  { id: 'h_radar_v2', name: 'Pulse Radar', tier: 2, stats: { Damage: 5, Speed: 18, Armor: 3, Weight: 8 }, icon: 'Radar', rarity: RARITY.UNCOMMON },
  { id: 'h_chef', name: 'Combat Chef', tier: 2, stats: { Damage: 10, Speed: 5, Armor: 8, Weight: 5 }, icon: 'ChefHat', rarity: RARITY.UNCOMMON },
  { id: 'h_mask', name: 'Stealth Mask', tier: 2, stats: { Damage: 8, Speed: 15, Armor: 5, Weight: 4 }, icon: 'VenetianMask', rarity: RARITY.UNCOMMON },
  { id: 'h_bot_chat', name: 'Chat Bot', tier: 2, stats: { Damage: 15, Speed: 5, Armor: 2, Weight: 5 }, icon: 'BotMessageSquare', rarity: RARITY.UNCOMMON },

  // --- TIER 3: RARE (Blue) ---
  { id: 'h_quant_cpu', name: 'Quantum CPU', tier: 3, stats: { Damage: 18, Speed: 22, Armor: 8, Weight: 10 }, icon: 'Cpu', rarity: RARITY.RARE },
  { id: 'h_omni_vis', name: 'Omni-Visor', tier: 3, stats: { Damage: 15, Speed: 18, Armor: 12, Weight: 12 }, icon: 'HatGlasses', rarity: RARITY.RARE },
  { id: 'h_ai_assistant', name: 'AI Assistant', tier: 3, stats: { Damage: 12, Speed: 30, Armor: 5, Weight: 8 }, icon: 'Bot', rarity: RARITY.RARE },
  { id: 'h_carbon_mask', name: 'Carbon Mask', tier: 3, stats: { Damage: 20, Speed: 15, Armor: 15, Weight: 9 }, icon: 'Ghost', rarity: RARITY.RARE },
  { id: 'h_third_eye', name: 'Third Eye', tier: 3, stats: { Damage: 25, Speed: 25, Armor: 2, Weight: 5 }, icon: 'Triangle', rarity: RARITY.RARE },
  { id: 'h_telescope', name: 'Sniper Scope', tier: 3, stats: { Damage: 30, Speed: 5, Armor: 0, Weight: 12 }, icon: 'Telescope', rarity: RARITY.RARE },
  { id: 'h_micro', name: 'Bio Scanner', tier: 3, stats: { Damage: 15, Speed: 25, Armor: 5, Weight: 8 }, icon: 'Microscope', rarity: RARITY.RARE },
  { id: 'h_queen', name: 'Tactician Core', tier: 3, stats: { Damage: 25, Speed: 25, Armor: 10, Weight: 10 }, icon: 'ChessQueen', rarity: RARITY.RARE },
  { id: 'h_haze', name: 'Fog Unit', tier: 3, stats: { Damage: 5, Speed: 20, Armor: 20, Weight: 15 }, icon: 'Haze', rarity: RARITY.RARE },

  // --- TIER 4: EPIC (Purple) ---
  { id: 'h_void_gaze', name: 'Void Gaze', tier: 4, stats: { Damage: 35, Speed: 28, Armor: 10, Weight: 12 }, icon: 'Eye', rarity: RARITY.EPIC },
  { id: 'h_neural_net', name: 'Neural Network V9', tier: 4, stats: { Damage: 25, Speed: 45, Armor: 15, Weight: 8 }, icon: 'Network', rarity: RARITY.EPIC },
  { id: 'h_cyber_demon', name: 'Cyber Demon Mask', tier: 4, stats: { Damage: 45, Speed: 20, Armor: 25, Weight: 18 }, icon: 'RectangleGoggles', rarity: RARITY.EPIC },
  { id: 'h_precalc_core', name: 'Pre-Calc Core', tier: 4, stats: { Damage: 30, Speed: 50, Armor: 5, Weight: 10 }, icon: 'Binary', rarity: RARITY.EPIC },
  { id: 'h_titan_helm', name: 'Titan Helm', tier: 4, stats: { Damage: 10, Speed: 5, Armor: 60, Weight: 40 }, icon: 'ShieldCheck', rarity: RARITY.EPIC },

  // --- TIER 5: LEGENDARY (Orange) ---
  { id: 'h_oracle_ai', name: 'Oracle AI Core', tier: 5, stats: { Damage: 55, Speed: 60, Armor: 30, Weight: 15 }, icon: 'Brain', rarity: RARITY.LEGENDARY },
  { id: 'h_crown_kings', name: 'Crown of Kings', tier: 5, stats: { Damage: 70, Speed: 30, Armor: 50, Weight: 25 }, icon: 'Crown', rarity: RARITY.LEGENDARY },
  { id: 'h_death_stare', name: 'Death Stare', tier: 5, stats: { Damage: 90, Speed: 40, Armor: 10, Weight: 12 }, icon: 'HeadPhones', rarity: RARITY.LEGENDARY },
  { id: 'h_medusa', name: 'Medusa Gaze', tier: 5, stats: { Damage: 60, Speed: 10, Armor: 30, Weight: 15 }, icon: 'ScanFace', rarity: 'Legendary' }, // Stuns? (High Dmg representation)
  { id: 'h_hive_mind', name: 'Hive Mind Node', tier: 5, stats: { Damage: 40, Speed: 50, Armor: 10, Weight: 5 }, icon: 'BrainCircuit', rarity: 'Legendary' },
  { id: 'h_cyclops', name: 'Cyclops Visor', tier: 5, stats: { Damage: 80, Speed: 5, Armor: 20, Weight: 20 }, icon: 'Eye', rarity: 'Legendary' }, // Simple Eye icon is scary
  { id: 'h_king_crown', name: 'Command Crown', tier: 5, stats: { Damage: 50, Speed: 30, Armor: 40, Weight: 10 }, icon: 'Crown', rarity: 'Legendary' },

  // --- TIER 6: OMEGA (Teal) ---
  { id: 'h_nebula_mind', name: 'Nebula Mind', tier: 6, stats: { Damage: 80, Speed: 90, Armor: 40, Weight: 10 }, icon: 'CloudFog', rarity: RARITY.OMEGA },
  { id: 'h_time_keeper', name: 'Time Keeper', tier: 6, stats: { Damage: 60, Speed: 120, Armor: 20, Weight: 5 }, icon: 'Clock', rarity: RARITY.OMEGA },

  // --- TIER 7: MYTHIC (White/Glitch) ---
  { id: 'h_singularity', name: 'THE SINGULARITY', tier: 7, stats: { Damage: 150, Speed: 150, Armor: 100, Weight: 0 }, icon: 'Sparkles', rarity: RARITY.MYTHIC },
  { id: 'h_admin_access', name: 'ROOT ACCESS', tier: 7, stats: { Damage: 200, Speed: 200, Armor: 0, Weight: 0 }, icon: 'Terminal', rarity: RARITY.MYTHIC }
];

// --- RIGHT ARM PARTS (Weapons) ---
const RIGHT_ARM_PARTS = [
   // --- TIER 1: COMMON ---
  // BUFFERED: Damage bumped up to 18-25 range (was 10-15) so you can actually kill enemies
  { id: 'ra_pipe', name: 'Steel Pipe', tier: 1, stats: { Damage: 20, Speed: 8, Armor: 2, Weight: 8 }, icon: 'Hammer', rarity: RARITY.COMMON },
  { id: 'ra_drill', name: 'Old Drill', tier: 1, stats: { Damage: 22, Speed: 5, Armor: 4, Weight: 10 }, icon: 'Drill', rarity: RARITY.COMMON },
  { id: 'ra_rivet', name: 'Rivet Gun', tier: 1, stats: { Damage: 18, Speed: 12, Armor: 0, Weight: 6 }, icon: 'Disc', rarity: RARITY.COMMON },
  { id: 'ra_claw', name: 'Rusty Claw', tier: 1, stats: { Damage: 19, Speed: 10, Armor: 3, Weight: 7 }, icon: 'Grab', rarity: RARITY.COMMON },
  { id: 'ra_torch', name: 'Spark Torch', tier: 1, stats: { Damage: 25, Speed: 4, Armor: 0, Weight: 9 }, icon: 'Flame', rarity: RARITY.COMMON },
  { id: 'ra_shiv', name: 'Prison Shiv', tier: 1, stats: { Damage: 15, Speed: 20, Armor: 0, Weight: 3 }, icon: 'Sword', rarity: RARITY.COMMON },

  // --- TIER 2: UNCOMMON ---
  { id: 'ra_plasma', name: 'Plasma Cutter', tier: 2, stats: { Damage: 22, Speed: 8, Armor: 3, Weight: 12 }, icon: 'Scissors', rarity: RARITY.UNCOMMON },
  { id: 'ra_cannon', name: 'Autocannon', tier: 2, stats: { Damage: 20, Speed: 12, Armor: 4, Weight: 15 }, icon: 'Anvil', rarity: RARITY.UNCOMMON },
  { id: 'ra_shock', name: 'Shock Fist', tier: 2, stats: { Damage: 25, Speed: 6, Armor: 6, Weight: 14 }, icon: 'CloudOff', rarity: RARITY.UNCOMMON },
  { id: 'ra_laser', name: 'Laser Lance', tier: 2, stats: { Damage: 24, Speed: 10, Armor: 2, Weight: 10 }, icon: 'UtilityPole', rarity: RARITY.UNCOMMON },
  { id: 'ra_saw', name: 'Buzzsaw', tier: 2, stats: { Damage: 28, Speed: 5, Armor: 0, Weight: 16 }, icon: 'Slice', rarity: RARITY.UNCOMMON },
  { id: 'la_brick', name: 'Brick Wall', tier: 2, stats: { Damage: 2, Speed: 2, Armor: 35, Weight: 25 }, icon: 'BrickWall', rarity: RARITY.UNCOMMON },
  { id: 'la_stop', name: 'Blockade', tier: 2, stats: { Damage: 5, Speed: 5, Armor: 25, Weight: 15 }, icon: 'CirclePower', rarity: RARITY.UNCOMMON },
  { id: 'la_extinguish', name: 'Coolant Spray', tier: 2, stats: { Damage: 0, Speed: 10, Armor: 20, Weight: 10 }, icon: 'FireExtinguisher', rarity: RARITY.UNCOMMON },
  { id: 'la_solar', name: 'Solar Panel', tier: 2, stats: { Damage: 5, Speed: 15, Armor: 10, Weight: 8 }, icon: 'SolarPanel', rarity: RARITY.UNCOMMON },
  { id: 'la_tool', name: 'Repair Kit', tier: 2, stats: { Damage: 0, Speed: 10, Armor: 15, Weight: 12 }, icon: 'ToolCase', rarity: RARITY.UNCOMMON },
  { id: 'la_magnet', name: 'Magnet Field', tier: 2, stats: { Damage: 5, Speed: 8, Armor: 22, Weight: 18 }, icon: 'Minimize', rarity: RARITY.UNCOMMON },
  { id: 'la_sign', name: 'Warning Sign', tier: 2, stats: { Damage: 8, Speed: 8, Armor: 18, Weight: 10 }, icon: 'TriangleAlert', rarity: RARITY.UNCOMMON },

  // --- TIER 3: RARE ---
  { id: 'ra_fusion', name: 'Fusion Blaster', tier: 3, stats: { Damage: 38, Speed: 10, Armor: 5, Weight: 18 }, icon: 'Rocket', rarity: RARITY.RARE },
  { id: 'ra_nano', name: 'Nano Blade', tier: 3, stats: { Damage: 35, Speed: 18, Armor: 4, Weight: 12 }, icon: 'Bolt', rarity: RARITY.RARE },
  { id: 'ra_tesla', name: 'Tesla Coil', tier: 3, stats: { Damage: 30, Speed: 15, Armor: 0, Weight: 14 }, icon: 'CloudLightning', rarity: RARITY.RARE },
  { id: 'ra_railgun', name: 'Mini Railgun', tier: 3, stats: { Damage: 45, Speed: 4, Armor: 0, Weight: 25 }, icon: 'ArrowRight', rarity: RARITY.RARE },
  { id: 'la_diamond', name: 'Hardlight Shield', tier: 3, stats: { Damage: 10, Speed: 15, Armor: 40, Weight: 10 }, icon: 'Diamond', rarity: RARITY.RARE },
  { id: 'la_puzzle', name: 'Encryptor', tier: 3, stats: { Damage: 15, Speed: 20, Armor: 25, Weight: 10 }, icon: 'Puzzle', rarity: RARITY.RARE },
  { id: 'la_watch', name: 'Time Dial', tier: 3, stats: { Damage: 5, Speed: 40, Armor: 10, Weight: 5 }, icon: 'Watch', rarity: RARITY.RARE },
  { id: 'la_vault', name: 'Bank Vault', tier: 3, stats: { Damage: 0, Speed: 0, Armor: 60, Weight: 50 }, icon: 'Vault', rarity: RARITY.RARE },
  { id: 'ra_wand_spark', name: 'Magic Wand', tier: 3, stats: { Damage: 40, Speed: 15, Armor: 0, Weight: 5 }, icon: 'WandSparkles', rarity: RARITY.RARE },
  { id: 'ra_cross', name: 'Holy Smite', tier: 3, stats: { Damage: 50, Speed: 5, Armor: 10, Weight: 15 }, icon: 'Cross', rarity: RARITY.RARE },

  // --- TIER 4: EPIC ---
  { id: 'ra_void_blade', name: 'Void Blade', tier: 4, stats: { Damage: 60, Speed: 25, Armor: 5, Weight: 10 }, icon: 'Unplug', rarity: RARITY.EPIC },
  { id: 'ra_thermal', name: 'Thermal Lance', tier: 4, stats: { Damage: 55, Speed: 15, Armor: 10, Weight: 20 }, icon: 'Pickaxe', rarity: RARITY.EPIC },
  { id: 'ra_gauss', name: 'Gauss Rifle', tier: 4, stats: { Damage: 75, Speed: 8, Armor: 0, Weight: 30 }, icon: 'Crosshair', rarity: RARITY.EPIC },
  { id: 'ra_acid_spray', name: 'Corrosion Sprayer', tier: 4, stats: { Damage: 40, Speed: 30, Armor: 0, Weight: 15 }, icon: 'Droplets', rarity: RARITY.EPIC },
  { id: 'ra_monowire', name: 'Monowire Whip', tier: 4, stats: { Damage: 50, Speed: 40, Armor: 0, Weight: 5 }, icon: 'Rss', rarity: RARITY.EPIC },

  // --- TIER 5: LEGENDARY ---
  { id: 'ra_doomsday', name: 'Doomsday Cannon', tier: 5, stats: { Damage: 120, Speed: 5, Armor: 15, Weight: 50 }, icon: 'Bomb', rarity: RARITY.LEGENDARY },
  { id: 'ra_mjolnir', name: 'Hammer of Thor', tier: 5, stats: { Damage: 100, Speed: 20, Armor: 30, Weight: 60 }, icon: 'Gavel', rarity: RARITY.LEGENDARY },
  { id: 'ra_excalibur', name: 'Photon Saber', tier: 5, stats: { Damage: 90, Speed: 50, Armor: 10, Weight: 10 }, icon: 'Usb', rarity: RARITY.LEGENDARY },
  { id: 'ra_reaper', name: 'Grim Scythe', tier: 5, stats: { Damage: 95, Speed: 25, Armor: 0, Weight: 15 }, icon: 'Crop', rarity: 'Legendary' }, // 'Crop' looks like a scythe/tool
  { id: 'ra_mjolnir_mk2', name: 'Thunder Hammer', tier: 5, stats: { Damage: 110, Speed: 10, Armor: 20, Weight: 40 }, icon: 'Hammer', rarity: 'Legendary' },
  { id: 'ra_inferno', name: 'Inferno Projector', tier: 5, stats: { Damage: 85, Speed: 30, Armor: 5, Weight: 20 }, icon: 'Flame', rarity: 'Legendary' },
  { id: 'ra_cryo_beam', name: 'Absolute Zero', tier: 5, stats: { Damage: 70, Speed: 15, Armor: 30, Weight: 25 }, icon: 'Snowflake', rarity: 'Legendary' }, // Snowflake is standard
  { id: 'ra_sonic', name: 'Bass Cannon', tier: 5, stats: { Damage: 80, Speed: 40, Armor: 0, Weight: 30 }, icon: 'Speaker', rarity: 'Legendary' },
  { id: 'ra_drill_giga', name: 'Giga Drill', tier: 5, stats: { Damage: 100, Speed: 5, Armor: 30, Weight: 50 }, icon: 'Ratchet', rarity: 'Legendary' }, // Ratchet looks mechanical

  // --- TIER 6: OMEGA ---
  { id: 'ra_supernova', name: 'Supernova Gauntlet', tier: 6, stats: { Damage: 150, Speed: 30, Armor: 50, Weight: 40 }, icon: 'Sun', rarity: RARITY.OMEGA },
  { id: 'ra_black_hole', name: 'Event Horizon', tier: 6, stats: { Damage: 200, Speed: 10, Armor: 0, Weight: 100 }, icon: 'CircleDot', rarity: RARITY.OMEGA },

  // --- TIER 7: MYTHIC ---
  { id: 'ra_god_slayer', name: 'GOD SLAYER', tier: 7, stats: { Damage: 500, Speed: 50, Armor: 0, Weight: 0 }, icon: 'BicepsFlexed', rarity: RARITY.MYTHIC },
  { id: 'ra_delete_key', name: 'FORMAT C://', tier: 7, stats: { Damage: 999, Speed: 1, Armor: 0, Weight: 999 }, icon: 'HandsFist', rarity: RARITY.MYTHIC }
];

// --- LEFT ARM PARTS (Defense/Utility) ---
const LEFT_ARM_PARTS = [
  // --- TIER 1: COMMON ---

  // BUFFERED: Armor values doubled (10 -> 20+) to survive early bursts
  { id: 'la_lid', name: 'Trash Lid', tier: 1, stats: { Damage: 4, Speed: 4, Armor: 20, Weight: 5 }, icon: 'Circle', rarity: RARITY.COMMON },
  { id: 'la_buckler', name: 'Scrap Buckler', tier: 1, stats: { Damage: 5, Speed: 6, Armor: 25, Weight: 8 }, icon: 'ShieldEllipsis', rarity: RARITY.COMMON },
  { id: 'la_grapple', name: 'Grapple Hook', tier: 1, stats: { Damage: 8, Speed: 12, Armor: 10, Weight: 6 }, icon: 'Anchor', rarity: RARITY.COMMON },
  { id: 'la_welder', name: 'Spot Welder', tier: 1, stats: { Damage: 12, Speed: 8, Armor: 12, Weight: 9 }, icon: 'PenTool', rarity: RARITY.COMMON },
  { id: 'la_clamp', name: 'Hydraulic Clamp', tier: 1, stats: { Damage: 10, Speed: 5, Armor: 18, Weight: 10 }, icon: 'Grip', rarity: RARITY.COMMON },

  // --- TIER 2: UNCOMMON ---
  { id: 'la_riot', name: 'Riot Shield', tier: 2, stats: { Damage: 5, Speed: 5, Armor: 22, Weight: 15 }, icon: 'ShieldCheck', rarity: RARITY.UNCOMMON },
  { id: 'la_saw', name: 'Power Saw', tier: 2, stats: { Damage: 18, Speed: 8, Armor: 8, Weight: 14 }, icon: 'Disc', rarity: RARITY.UNCOMMON },
  { id: 'la_emp', name: 'EMP Emitter', tier: 2, stats: { Damage: 10, Speed: 15, Armor: 10, Weight: 11 }, icon: 'NotepadTextDashed', rarity: RARITY.UNCOMMON },
  { id: 'la_repulsor', name: 'Repulsor Field', tier: 2, stats: { Damage: 8, Speed: 12, Armor: 18, Weight: 12 }, icon: 'Move', rarity: RARITY.UNCOMMON },
  { id: 'la_brick', name: 'Brick Wall', tier: 2, stats: { Damage: 2, Speed: 2, Armor: 35, Weight: 25 }, icon: 'BrickWall', rarity: RARITY.UNCOMMON },
  { id: 'la_stop', name: 'Blockade', tier: 2, stats: { Damage: 5, Speed: 5, Armor: 25, Weight: 15 }, icon: 'CirclePower', rarity: RARITY.UNCOMMON },
  { id: 'la_extinguish', name: 'Coolant Spray', tier: 2, stats: { Damage: 0, Speed: 10, Armor: 20, Weight: 10 }, icon: 'FireExtinguisher', rarity: RARITY.UNCOMMON },
  { id: 'la_solar', name: 'Solar Panel', tier: 2, stats: { Damage: 5, Speed: 15, Armor: 10, Weight: 8 }, icon: 'SolarPanel', rarity: RARITY.UNCOMMON },
  { id: 'la_tool', name: 'Repair Kit', tier: 2, stats: { Damage: 0, Speed: 10, Armor: 15, Weight: 12 }, icon: 'ToolCase', rarity: RARITY.UNCOMMON },
  { id: 'la_magnet', name: 'Magnet Field', tier: 2, stats: { Damage: 5, Speed: 8, Armor: 22, Weight: 18 }, icon: 'Minimize', rarity: RARITY.UNCOMMON },
  { id: 'la_sign', name: 'Warning Sign', tier: 2, stats: { Damage: 8, Speed: 8, Armor: 18, Weight: 10 }, icon: 'TriangleAlert', rarity: RARITY.UNCOMMON },

  // --- TIER 3: RARE ---
  { id: 'la_aegis', name: 'Aegis Barrier', tier: 3, stats: { Damage: 10, Speed: 8, Armor: 35, Weight: 20 }, icon: 'ShieldAlert', rarity: RARITY.RARE },
  { id: 'la_whip', name: 'Plasma Whip', tier: 3, stats: { Damage: 28, Speed: 20, Armor: 12, Weight: 14 }, icon: 'Waves', rarity: RARITY.RARE },
  { id: 'la_repair', name: 'Repair Drone', tier: 3, stats: { Damage: 5, Speed: 10, Armor: 15, Weight: 10 }, icon: 'Wrench', rarity: RARITY.RARE },
  { id: 'la_diamond', name: 'Hardlight Shield', tier: 3, stats: { Damage: 10, Speed: 15, Armor: 40, Weight: 10 }, icon: 'Diamond', rarity: RARITY.RARE },
  { id: 'la_puzzle', name: 'Encryptor', tier: 3, stats: { Damage: 15, Speed: 20, Armor: 25, Weight: 10 }, icon: 'Puzzle', rarity: RARITY.RARE },
  { id: 'la_watch', name: 'Time Dial', tier: 3, stats: { Damage: 5, Speed: 40, Armor: 10, Weight: 5 }, icon: 'Watch', rarity: RARITY.RARE },
  { id: 'la_vault', name: 'Bank Vault', tier: 3, stats: { Damage: 0, Speed: 0, Armor: 60, Weight: 50 }, icon: 'Vault', rarity: RARITY.RARE },
  { id: 'la_percent', name: 'Odds Maker', tier: 3, stats: { Damage: 15, Speed: 15, Armor: 20, Weight: 10 }, icon: 'BadgePercent', rarity: RARITY.RARE },
  { id: 'la_shield_off', name: 'Ghost Shield', tier: 3, stats: { Damage: 0, Speed: 40, Armor: 10, Weight: 2 }, icon: 'ShieldOff', rarity: RARITY.RARE },

  // --- TIER 4: EPIC ---
  { id: 'la_void_shield', name: 'Void Shield', tier: 4, stats: { Damage: 15, Speed: 10, Armor: 55, Weight: 25 }, icon: 'ShieldUser', rarity: RARITY.EPIC },
  { id: 'la_grav_well', name: 'Gravity Well', tier: 4, stats: { Damage: 30, Speed: 5, Armor: 20, Weight: 40 }, icon: 'Orbit', rarity: RARITY.EPIC },
  { id: 'la_phase_shift', name: 'Phase Shifter', tier: 4, stats: { Damage: 10, Speed: 50, Armor: 10, Weight: 5 }, icon: 'PhaseCircuit', rarity: RARITY.EPIC },
  { id: 'la_missile', name: 'Swarm Missiles', tier: 4, stats: { Damage: 45, Speed: 20, Armor: 5, Weight: 15 }, icon: 'LayoutGrid', rarity: RARITY.EPIC },

  // --- TIER 5: LEGENDARY ---
  { id: 'la_absolute', name: 'Absolute Defense', tier: 5, stats: { Damage: 20, Speed: 15, Armor: 85, Weight: 35 }, icon: 'Lock', rarity: RARITY.LEGENDARY },
  { id: 'la_reflector', name: 'Mirror Force', tier: 5, stats: { Damage: 50, Speed: 40, Armor: 40, Weight: 20 }, icon: 'Scaling', rarity: RARITY.LEGENDARY },
  { id: 'la_aegis_prime', name: 'Aegis Prime', tier: 5, stats: { Damage: 20, Speed: 10, Armor: 90, Weight: 40 }, icon: 'ShieldCheck', rarity: 'Legendary' },
  { id: 'la_mirror', name: 'Mirror Force', tier: 5, stats: { Damage: 50, Speed: 30, Armor: 40, Weight: 15 }, icon: 'Minimize', rarity: 'Legendary' }, // Reflective vibe
  { id: 'la_black_box', name: 'Black Box', tier: 5, stats: { Damage: 0, Speed: 0, Armor: 120, Weight: 60 }, icon: 'BoxSelect', rarity: 'Legendary' },
  { id: 'la_phase', name: 'Ghost Generator', tier: 5, stats: { Damage: 10, Speed: 80, Armor: 10, Weight: 5 }, icon: 'Ghost', rarity: 'Legendary' },
  { id: 'la_bio_shield', name: 'Living Metal', tier: 5, stats: { Damage: 10, Speed: 20, Armor: 60, Weight: 20 }, icon: 'Dna', rarity: 'Legendary' },

  // --- TIER 6: OMEGA ---
  { id: 'la_star_shield', name: 'Star Shield', tier: 6, stats: { Damage: 30, Speed: 20, Armor: 150, Weight: 50 }, icon: 'UserStar', rarity: RARITY.OMEGA },
  { id: 'la_entropy', name: 'Entropy Field', tier: 6, stats: { Damage: 80, Speed: 60, Armor: 20, Weight: 10 }, icon: 'Wind', rarity: RARITY.OMEGA },

  // --- TIER 7: MYTHIC ---
  { id: 'la_invincible', name: 'ERROR: NULL DAMAGE', tier: 7, stats: { Damage: 0, Speed: 0, Armor: 999, Weight: 0 }, icon: 'Ban', rarity: RARITY.MYTHIC },
  { id: 'la_infinity', name: 'Infinity Gauntlet', tier: 7, stats: { Damage: 250, Speed: 250, Armor: 250, Weight: 50 }, icon: 'Hand', rarity: RARITY.MYTHIC }
];

// --- CHASSIS PARTS (Health/Base Stats) ---
const CHASSIS_PARTS = [
  // --- TIER 1: COMMON ---
  { id: 'ch_box', name: 'Rusty Box', tier: 1, stats: { Damage: 0, Speed: 5, Armor: 30, Weight: 15 }, icon: 'Box', rarity: RARITY.COMMON },
  { id: 'ch_scaffold', name: 'Scaffold Frame', tier: 1, stats: { Damage: 5, Speed: 12, Armor: 20, Weight: 10 }, icon: 'Grid', rarity: RARITY.COMMON },
  { id: 'ch_drum', name: 'Oil Drum', tier: 1, stats: { Damage: 0, Speed: 6, Armor: 40, Weight: 20 }, icon: 'Cylinder', rarity: RARITY.COMMON },
  { id: 'ch_wheels', name: 'Wheeled Base', tier: 1, stats: { Damage: 5, Speed: 18, Armor: 15, Weight: 12 }, icon: 'CircleDot', rarity: RARITY.COMMON },
  { id: 'ch_mesh', name: 'Mesh Frame', tier: 1, stats: { Damage: 0, Speed: 15, Armor: 18, Weight: 8 }, icon: 'LayoutGrid', rarity: RARITY.COMMON },

  // --- TIER 2: UNCOMMON ---
  { id: 'ch_alloy', name: 'Alloy Plating', tier: 2, stats: { Damage: 5, Speed: 8, Armor: 25, Weight: 22 }, icon: 'Square', rarity: RARITY.UNCOMMON },
  { id: 'ch_hover', name: 'Hover Drive', tier: 2, stats: { Damage: 5, Speed: 20, Armor: 10, Weight: 15 }, icon: 'LifeBuoy', rarity: RARITY.UNCOMMON },
  { id: 'ch_treads', name: 'Tank Treads', tier: 2, stats: { Damage: 8, Speed: 4, Armor: 30, Weight: 35 }, icon: 'WrapText', rarity: RARITY.UNCOMMON },
  { id: 'ch_stealth', name: 'Stealth Hull', tier: 2, stats: { Damage: 12, Speed: 15, Armor: 12, Weight: 14 }, icon: 'HatGlasses', rarity: RARITY.UNCOMMON },
  { id: 'ch_pyramid', name: 'Monolith Base', tier: 2, stats: { Damage: 10, Speed: 5, Armor: 30, Weight: 30 }, icon: 'Pyramid', rarity: RARITY.UNCOMMON },
  { id: 'ch_cube', name: 'Weighted Cube', tier: 2, stats: { Damage: 5, Speed: 5, Armor: 40, Weight: 35 }, icon: 'Cuboid', rarity: RARITY.UNCOMMON },
  { id: 'ch_worm', name: 'Flex Treads', tier: 2, stats: { Damage: 8, Speed: 18, Armor: 15, Weight: 15 }, icon: 'Worm', rarity: RARITY.UNCOMMON },
  { id: 'ch_bug', name: 'Crawler Frame', tier: 2, stats: { Damage: 12, Speed: 20, Armor: 12, Weight: 12 }, icon: 'BugPlay', rarity: RARITY.UNCOMMON },
  { id: 'ch_dam', name: 'Heavy Wall', tier: 2, stats: { Damage: 0, Speed: 2, Armor: 50, Weight: 50 }, icon: 'Dam', rarity: RARITY.UNCOMMON },
  { id: 'ch_torus', name: 'Donut Drive', tier: 2, stats: { Damage: 5, Speed: 25, Armor: 10, Weight: 10 }, icon: 'Torus', rarity: RARITY.UNCOMMON },

  // --- TIER 3: RARE ---
  { id: 'ch_nano', name: 'Nanocarbon Hull', tier: 3, stats: { Damage: 10, Speed: 25, Armor: 25, Weight: 18 }, icon: 'Hexagon', rarity: RARITY.RARE },
  { id: 'ch_reactor', name: 'Reactor Core', tier: 3, stats: { Damage: 25, Speed: 12, Armor: 20, Weight: 25 }, icon: 'Atom', rarity: RARITY.RARE },
  { id: 'ch_spider', name: 'Spider Legs', tier: 3, stats: { Damage: 15, Speed: 30, Armor: 15, Weight: 15 }, icon: 'Bug', rarity: RARITY.RARE },
  { id: 'ch_cloud', name: 'Hover Cloud', tier: 3, stats: { Damage: 5, Speed: 40, Armor: 15, Weight: 5 }, icon: 'CloudSun', rarity: RARITY.RARE },
  { id: 'ch_fuel', name: 'Nitro Tank', tier: 3, stats: { Damage: 20, Speed: 50, Armor: 5, Weight: 20 }, icon: 'Fuel', rarity: RARITY.RARE },
  { id: 'ch_keyboard', name: 'WASD Drive', tier: 3, stats: { Damage: 10, Speed: 40, Armor: 5, Weight: 5 }, icon: 'Keyboard', rarity: RARITY.RARE },
  { id: 'ch_waves', name: 'Frequency Hover', tier: 3, stats: { Damage: 10, Speed: 30, Armor: 10, Weight: 10 }, icon: 'WavesLadder', rarity: RARITY.RARE },

  // --- TIER 4: EPIC ---
  { id: 'ch_void_core', name: 'Void Core Chassis', tier: 4, stats: { Damage: 30, Speed: 20, Armor: 50, Weight: 30 }, icon: 'Circle', rarity: RARITY.EPIC },
  { id: 'ch_maglev', name: 'Maglev Base', tier: 4, stats: { Damage: 15, Speed: 60, Armor: 20, Weight: 10 }, icon: 'Cctv', rarity: RARITY.EPIC },
  { id: 'ch_fortress', name: 'Flying Fortress', tier: 4, stats: { Damage: 40, Speed: 5, Armor: 80, Weight: 80 }, icon: 'Castle', rarity: RARITY.EPIC },
  { id: 'ch_biomass', name: 'Biomass Frame', tier: 4, stats: { Damage: 25, Speed: 25, Armor: 60, Weight: 40 }, icon: 'Activity', rarity: RARITY.EPIC },

  // --- TIER 5: LEGENDARY ---
  { id: 'ch_dark_matter', name: 'Dark Matter Engine', tier: 5, stats: { Damage: 50, Speed: 50, Armor: 50, Weight: 30 }, icon: 'Video', rarity: RARITY.LEGENDARY },
  { id: 'ch_juggernaut', name: 'Juggernaut Prime', tier: 5, stats: { Damage: 60, Speed: 10, Armor: 120, Weight: 100 }, icon: 'ShieldX', rarity: RARITY.LEGENDARY },
  { id: 'ch_flash', name: 'Flash Drive', tier: 5, stats: { Damage: 40, Speed: 100, Armor: 20, Weight: 5 }, icon: 'SquarePower', rarity: RARITY.LEGENDARY },
  { id: 'ch_train', name: 'Pain Train', tier: 5, stats: { Damage: 60, Speed: 20, Armor: 80, Weight: 100 }, icon: 'TrainFront', rarity: 'Legendary' },
  { id: 'ch_castle', name: 'Moving Castle', tier: 5, stats: { Damage: 40, Speed: 5, Armor: 120, Weight: 150 }, icon: 'Castle', rarity: 'Legendary' },
  { id: 'ch_spider_queen', name: 'Brood Mother', tier: 5, stats: { Damage: 50, Speed: 60, Armor: 40, Weight: 30 }, icon: 'Bug', rarity: 'Legendary' },
  { id: 'ch_ufo', name: 'Saucer Hull', tier: 5, stats: { Damage: 30, Speed: 90, Armor: 30, Weight: 10 }, icon: 'Disc', rarity: 'Legendary' },

  // --- TIER 6: OMEGA ---
  { id: 'ch_neutron', name: 'Neutron Star', tier: 6, stats: { Damage: 100, Speed: 10, Armor: 200, Weight: 200 }, icon: 'SatelliteDish', rarity: RARITY.OMEGA },
  { id: 'ch_quantum', name: 'Quantum Foam', tier: 6, stats: { Damage: 80, Speed: 120, Armor: 60, Weight: 0 }, icon: 'Satellite', rarity: RARITY.OMEGA },

  // --- TIER 7: MYTHIC ---
  { id: 'ch_creator', name: 'THE ARCHITECT', tier: 7, stats: { Damage: 200, Speed: 200, Armor: 200, Weight: 50 }, icon: 'Cable', rarity: RARITY.MYTHIC },
  { id: 'ch_glitch', name: 'MISSING_NO', tier: 7, stats: { Damage: 999, Speed: 999, Armor: 0, Weight: 0 }, icon: 'Bluetooth', rarity: RARITY.MYTHIC }
];

const originalParts = [
  ...HEAD_PARTS.map(p => ({ ...p, slot: PART_SLOTS.HEAD })),
  ...RIGHT_ARM_PARTS.map(p => ({ ...p, slot: PART_SLOTS.RIGHT_ARM })),
  ...LEFT_ARM_PARTS.map(p => ({ ...p, slot: PART_SLOTS.LEFT_ARM })),
  ...CHASSIS_PARTS.map(p => ({ ...p, slot: PART_SLOTS.CHASSIS }))
];

// Combine with expansion parts (Ensure parts_expansion.js exists, or remove this import if not)
export const parts = [...originalParts, ...expansionParts];

export const getPartById = (id) => parts.find(part => part.id === id);

export const getPartsBySlot = (slot) => parts.filter(part => part.slot === slot);

export const getPartsByTier = (tier) => parts.filter(part => part.tier === tier);

// --- REFACTORED: Now uses TIER_WEIGHTS properly ---
export const getRandomPart = (forcedTier = null) => {
  let tier = forcedTier;

  // If no tier forced, calculate based on Global Drop Weights
  if (!tier) {
    const roll = Math.random(); // 0.0 to 1.0
    let cumulativeWeight = 0;
    
    // Default to Tier 1 if math fails
    tier = 1; 

    // Loop through our imported weights
    // Example: Tier 1 (0.45) -> 0 to 0.45
    //          Tier 2 (0.30) -> 0.45 to 0.75
    for (const [t, weight] of Object.entries(TIER_WEIGHTS)) {
      cumulativeWeight += weight;
      if (roll < cumulativeWeight) {
        tier = parseInt(t); // Convert string key "1" to number 1
        break;
      }
    }
  }

  // Get parts for that tier
  const availableParts = getPartsByTier(tier);
  
  // Safety Fallback: If we rolled a tier that has no parts (e.g., Mythic/Tier 7),
  // drop down one tier recursively until we find something.
  if (availableParts.length === 0) {
    if (tier > 1) return getRandomPart(tier - 1);
    return parts[0]; // Ultimate fallback (Rusty Box/Head)
  }

  return availableParts[Math.floor(Math.random() * availableParts.length)];
};