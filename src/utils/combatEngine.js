import { calculateBotStats } from '@/utils/statCalculator';
import { calculateProtocolBonus } from '@/data/tactics';
import { 
  BASE_HEALTH, 
  BASE_HIT_CHANCE, 
  CRIT_CHANCE, 
  CRIT_MULTIPLIER, 
  DAMAGE_VARIANCE 
} from '@/constants/gameConstants';


// SAFEGUARD 1: Fallback values prevent NaN if imports fail
const STARTING_HP = BASE_HEALTH || 100; 

// --- NEW: DAMAGE SOFT CAP LOGIC ---
// Prevents one-shots by dampening damage that exceeds 35% of max HP
const applySoftCap = (damage, maxHealth) => {
  const cap = maxHealth * 0.35; 
  if (damage <= cap) return damage;
  
  const excess = damage - cap;
  return Math.floor(cap + (excess * 0.5)); // Only 50% of the overkill gets through
};

const calculateDamage = (attackerDamage, defenderArmor) => {
  // SAFEGUARD 2: Default to 0 if stats are missing
  const dmg = attackerDamage || 0;
  const arm = defenderArmor || 0;
  
  const baseDamage = dmg - (arm * 0.5);
  // Ensure we don't multiply by undefined
  const variance = 1 + (Math.random() * 2 - 1) * (DAMAGE_VARIANCE || 0.2);
  
  return Math.max(1, Math.floor(baseDamage * variance));
};

const calculateHitChance = (attackerSpeed, defenderSpeed) => {
  const spd1 = attackerSpeed || 0;
  const spd2 = defenderSpeed || 0;
  return Math.max(0.1, (BASE_HIT_CHANCE || 0.8) - (spd2 / 200));
};

const calculateDodgeChance = (defenderSpeed) => {
  const spd = defenderSpeed || 0;
  return Math.min(0.4, spd / 200);
};

export const simulateBattle = (botA, botB, protocolA, protocolB) => {
  // 1. Initial Setup
  // We capture Max Health for the Soft Cap calculation
  const MAX_HP_A = STARTING_HP;
  const MAX_HP_B = STARTING_HP;

  let healthA = STARTING_HP;
  let healthB = STARTING_HP;

  // SAFEGUARD 3: Ensure calculateBotStats returns an object
  let statsA = calculateBotStats(botA) || { Damage: 10, Speed: 10, Armor: 0 };
  let statsB = calculateBotStats(botB) || { Damage: 10, Speed: 10, Armor: 0 };
  
  const battleLog = [];
  const healthTimeline = []; 
  const criticalHits = [];
  
  // 2. The Recorder Helper
  const record = (message) => {
    battleLog.push(message);
    healthTimeline.push({ 
      // SAFEGUARD 4: Force health to be a number, never NaN
      a: isNaN(healthA) ? 0 : Math.max(0, healthA), 
      b: isNaN(healthB) ? 0 : Math.max(0, healthB) 
    });
  };

  record(`⚔️ Battle Start: ${botA.name} vs ${botB.name}`);

  // 3. Apply Protocol Bonuses
  if (protocolA && protocolB) {
    const bonusA = calculateProtocolBonus(protocolA, protocolB.id) || 0;
    const bonusB = calculateProtocolBonus(protocolB, protocolA.id) || 0;

    // Apply A's bonus
    if (statsA[protocolA.statType]) {
       statsA = { ...statsA, [protocolA.statType]: Math.floor(statsA[protocolA.statType] * (1 + bonusA)) };
    }
    
    // Apply B's bonus
    if (statsB[protocolB.statType]) {
       statsB = { ...statsB, [protocolB.statType]: Math.floor(statsB[protocolB.statType] * (1 + bonusB)) };
    }
    
    record(`📡 PROTOCOLS ACTIVE:`);
    record(`${botA.name}: [${protocolA.name}] -> +${Math.round(bonusA * 100)}% ${protocolA.statType}`);
    record(`${botB.name}: [${protocolB.name}] -> +${Math.round(bonusB * 100)}% ${protocolB.statType}`);
    record('---');
  }

  // Log post-buff stats
  record(`${botA.name} (Buffed) - DMG: ${statsA.Damage} | SPD: ${statsA.Speed} | ARM: ${statsA.Armor}`);
  record(`${botB.name} (Buffed) - DMG: ${statsB.Damage} | SPD: ${statsB.Speed} | ARM: ${statsB.Armor}`);
  record('---');
  
  let missStreakA = 0;
  let missStreakB = 0;
  let round = 0;
  
  // 4. Combat Loop
  while (healthA > 0 && healthB > 0 && round < 50) {
    round++;
    
    const speedA = statsA.Speed || 0;
    const speedB = statsB.Speed || 0;

    const turns = speedA >= speedB
      ? [
          { attacker: botA, defender: botB, attStats: statsA, defStats: statsB, attRef: 'A', defRef: 'B', targetMaxHp: MAX_HP_B },
          { attacker: botB, defender: botA, attStats: statsB, defStats: statsA, attRef: 'B', defRef: 'A', targetMaxHp: MAX_HP_A }
        ]
      : [
          { attacker: botB, defender: botA, attStats: statsB, defStats: statsA, attRef: 'B', defRef: 'A', targetMaxHp: MAX_HP_A },
          { attacker: botA, defender: botB, attStats: statsA, defStats: statsB, attRef: 'A', defRef: 'B', targetMaxHp: MAX_HP_B }
        ];
    
    for (const turn of turns) {
      if (healthA <= 0 || healthB <= 0) break;

      const { attacker, defender, attStats, defStats, attRef, defRef, targetMaxHp } = turn;

      const currentMissStreak = attRef === 'A' ? missStreakA : missStreakB;
      const baseHitChance = calculateHitChance(attStats.Speed, defStats.Speed);
      const bonusHitChance = currentMissStreak * 0.15; 
      const effectiveHitChance = Math.min(1.0, baseHitChance + bonusHitChance);
      
      const dodgeChance = calculateDodgeChance(defStats.Speed);

      if (Math.random() > dodgeChance) {
        if (Math.random() < effectiveHitChance) {
          if (attRef === 'A') missStreakA = 0; else missStreakB = 0;

          const isCrit = Math.random() < (CRIT_CHANCE || 0.1);
          let damage = calculateDamage(attStats.Damage, defStats.Armor);
          
          if (isCrit) {
            damage = Math.floor(damage * (CRIT_MULTIPLIER || 1.5));
            // Apply Soft Cap to Crit
            damage = applySoftCap(damage, targetMaxHp);
            
            criticalHits.push(round);
            
            if (defRef === 'A') healthA -= damage; else healthB -= damage;
            record(`💥 Round ${round}: ${attacker.name} lands a CRITICAL HIT for ${damage} damage!`);
          } else {
            // Apply Soft Cap to Normal Hit
            damage = applySoftCap(damage, targetMaxHp);

            if (defRef === 'A') healthA -= damage; else healthB -= damage;
            record(`⚡ Round ${round}: ${attacker.name} attacks for ${damage} damage`);
          }
          
        } else {
          // --- GRAZE MECHANIC ---
          if (attRef === 'A') missStreakA++; else missStreakB++;

          if (Math.random() < 0.5) {
            let damage = calculateDamage(attStats.Damage, defStats.Armor);
            // Glancing blow is already heavily reduced (30%), so we usually don't need to Soft Cap it, 
            // but the math is safe if you wanted to.
            damage = Math.max(1, Math.floor(damage * 0.3)); 

            if (defRef === 'A') healthA -= damage; else healthB -= damage;
            record(`⚠️ Round ${round}: ${attacker.name} lands a glancing blow for ${damage} damage.`);
            
          } else {
            record(`❌ Round ${round}: ${attacker.name}'s attack misses!`);
          }
        }
      } else {
        if (attRef === 'A') missStreakA++; else missStreakB++;
        record(`🌀 Round ${round}: ${defender.name} dodges ${attacker.name}'s attack!`);
      }
    }
  }
  
  // SAFEGUARD 5: Explicitly handle NaN in winner check
  // If healthA is NaN (shouldn't happen now), treat it as 0
  const cleanHealthA = isNaN(healthA) ? 0 : healthA;
  const cleanHealthB = isNaN(healthB) ? 0 : healthB;

  const winner = cleanHealthA > 0 ? botA : botB;
  const loser = cleanHealthA > 0 ? botB : botA;
  
  record('---');
  record(`🏆 ${winner.name} wins with ${cleanHealthA > 0 ? cleanHealthA : cleanHealthB} HP remaining!`);
  
  return {
    winner,
    loser,
    rounds: round,
    battleLog,
    healthTimeline, 
    criticalHits,
    finalHealthA: Math.max(0, cleanHealthA),
    finalHealthB: Math.max(0, cleanHealthB)
  };
};