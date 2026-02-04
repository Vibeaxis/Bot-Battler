import { calculateBotStats } from '@/utils/statCalculator';
import { calculateProtocolBonus } from '@/data/tactics';
import { 
  BASE_HEALTH, 
  BASE_HIT_CHANCE, 
  CRIT_CHANCE, 
  CRIT_MULTIPLIER, 
  DAMAGE_VARIANCE 
} from '@/constants/gameConstants';

const STARTING_HP = BASE_HEALTH || 100; 

// --- IMPROVED SOFT CAP ---
// Now uses 20% pass-through instead of 50%.
// Raw 300 Dmg vs 100 HP -> 35 + (265 * 0.2) = 88 Dmg. (SURVIVAL)
const applySoftCap = (damage, maxHealth) => {
  const cap = maxHealth * 0.35; // 35 damage threshold
  
  if (damage <= cap) return damage;
  
  const excess = damage - cap;
  // CHANGED: 0.5 -> 0.2 (Heavy Damping)
  return Math.floor(cap + (excess * 0.2)); 
};

const calculateDamage = (attackerDamage, defenderArmor) => {
  const dmg = attackerDamage || 0;
  const arm = defenderArmor || 0;
  
  const baseDamage = dmg - (arm * 0.5);
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
// 1. Calculate Stats FIRST so we get the custom MaxHealth
  let statsA = calculateBotStats(botA);
  let statsB = calculateBotStats(botB);

  // Fallback safeguards
  if (!statsA) statsA = { Damage: 10, Speed: 10, Armor: 0, Weight: 0, MaxHealth: 100 };
  if (!statsB) statsB = { Damage: 10, Speed: 10, Armor: 0, Weight: 0, MaxHealth: 100 };

  // 2. Use the CALCULATED MaxHealth (Base + Weight Bonus)
  const MAX_HP_A = statsA.MaxHealth;
  const MAX_HP_B = statsB.MaxHealth;

  let healthA = MAX_HP_A;
  let healthB = MAX_HP_B;
  
  const battleLog = [];
  const healthTimeline = []; 
  const criticalHits = [];
  
  const record = (message) => {
    battleLog.push(message);
    healthTimeline.push({ 
      a: isNaN(healthA) ? 0 : Math.max(0, healthA), 
      b: isNaN(healthB) ? 0 : Math.max(0, healthB) 
    });
  };

  record(`⚔️ Battle Start: ${botA.name} vs ${botB.name}`);

  if (protocolA && protocolB) {
    const bonusA = calculateProtocolBonus(protocolA, protocolB.id) || 0;
    const bonusB = calculateProtocolBonus(protocolB, protocolA.id) || 0;

    if (statsA[protocolA.statType]) {
       statsA = { ...statsA, [protocolA.statType]: Math.floor(statsA[protocolA.statType] * (1 + bonusA)) };
    }
    
    if (statsB[protocolB.statType]) {
       statsB = { ...statsB, [protocolB.statType]: Math.floor(statsB[protocolB.statType] * (1 + bonusB)) };
    }
    
    record(`📡 PROTOCOLS ACTIVE:`);
    record(`${botA.name}: [${protocolA.name}] -> +${Math.round(bonusA * 100)}% ${protocolA.statType}`);
    record(`${botB.name}: [${protocolB.name}] -> +${Math.round(bonusB * 100)}% ${protocolB.statType}`);
    record('---');
  }

  record(`${botA.name} (Buffed) - DMG: ${statsA.Damage} | SPD: ${statsA.Speed} | ARM: ${statsA.Armor}`);
  record(`${botB.name} (Buffed) - DMG: ${statsB.Damage} | SPD: ${statsB.Speed} | ARM: ${statsB.Armor}`);
  record('---');
  
  let missStreakA = 0;
  let missStreakB = 0;
  let round = 0;
  
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
          // --- HIT ---
          if (attRef === 'A') missStreakA = 0; else missStreakB = 0;

          const isCrit = Math.random() < (CRIT_CHANCE || 0.1);
          let rawDamage = calculateDamage(attStats.Damage, defStats.Armor);
          
          if (isCrit) {
            rawDamage = Math.floor(rawDamage * (CRIT_MULTIPLIER || 1.5));
          }

          // APPLY SOFT CAP & DETECT DAMPENING
          const finalDamage = applySoftCap(rawDamage, targetMaxHp);
          const isDampened = finalDamage < rawDamage;

          if (isCrit) {
            criticalHits.push(round);
            if (defRef === 'A') healthA -= finalDamage; else healthB -= finalDamage;
            record(`💥 Round ${round}: ${attacker.name} lands a CRITICAL HIT for ${finalDamage} damage!${isDampened ? ' (DAMPENED)' : ''}`);
          } else {
            if (defRef === 'A') healthA -= finalDamage; else healthB -= finalDamage;
            record(`⚡ Round ${round}: ${attacker.name} attacks for ${finalDamage} damage${isDampened ? ' (DAMPENED)' : ''}`);
          }
          
        } else {
          // --- MISS / GRAZE ---
          if (attRef === 'A') missStreakA++; else missStreakB++;

          if (Math.random() < 0.5) {
            let damage = calculateDamage(attStats.Damage, defStats.Armor);
            damage = Math.max(1, Math.floor(damage * 0.3)); 

            if (defRef === 'A') healthA -= damage; else healthB -= damage;
            record(`⚠️ Round ${round}: ${attacker.name} lands a GLANCING blow for ${damage} damage.`);
            
          } else {
            record(`❌ Round ${round}: ${attacker.name} misses target!`);
          }
        }
      } else {
        // --- DODGE FIX ---
        if (attRef === 'A') missStreakA++; else missStreakB++;
        record(`🌀 Round ${round}: ${attacker.name} misses (DODGED)!`);
      }
    }
  }
  
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