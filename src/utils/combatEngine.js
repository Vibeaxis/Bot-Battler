
import { calculateBotStats } from '@/utils/statCalculator';
import { calculateProtocolBonus } from '@/data/tactics';
import { 
  BASE_HEALTH, 
  BASE_HIT_CHANCE, 
  CRIT_CHANCE, 
  CRIT_MULTIPLIER, 
  DAMAGE_VARIANCE 
} from '@/constants/gameConstants';

const calculateDamage = (attackerDamage, defenderArmor) => {
  const baseDamage = attackerDamage - (defenderArmor * 0.5);
  const variance = 1 + (Math.random() * 2 - 1) * DAMAGE_VARIANCE;
  return Math.max(1, Math.floor(baseDamage * variance));
};

const calculateHitChance = (attackerSpeed, defenderSpeed) => {
  return Math.max(0.1, BASE_HIT_CHANCE - (defenderSpeed / 200));
};

const calculateDodgeChance = (defenderSpeed) => {
  return Math.min(0.4, defenderSpeed / 200);
};

export const simulateBattle = (botA, botB, protocolA, protocolB) => {
  // 1. Initial Stat Calculation
  let statsA = calculateBotStats(botA);
  let statsB = calculateBotStats(botB);
  
  const battleLog = [];
  
  const criticalHits = [];
  
  battleLog.push(`⚔️ Battle Start: ${botA.name} vs ${botB.name}`);

  // 2. Apply Protocol Bonuses
  if (protocolA && protocolB) {
    const bonusA = calculateProtocolBonus(protocolA, protocolB.id);
    const bonusB = calculateProtocolBonus(protocolB, protocolA.id);

    // Apply A's bonus
    statsA = { ...statsA, [protocolA.statType]: Math.floor(statsA[protocolA.statType] * (1 + bonusA)) };
    
    // Apply B's bonus
    statsB = { ...statsB, [protocolB.statType]: Math.floor(statsB[protocolB.statType] * (1 + bonusB)) };
    
    battleLog.push(`📡 PROTOCOLS ACTIVE:`);
    battleLog.push(`${botA.name}: [${protocolA.name}] -> +${Math.round(bonusA * 100)}% ${protocolA.statType}`);
    battleLog.push(`${botB.name}: [${protocolB.name}] -> +${Math.round(bonusB * 100)}% ${protocolB.statType}`);
    
    if (bonusA > protocolA.baseBonus) {
      battleLog.push(`⚡ TACTICAL ADVANTAGE: ${botA.name} counters ${botB.name}!`);
    } else if (bonusB > protocolB.baseBonus) {
      battleLog.push(`⚡ TACTICAL ADVANTAGE: ${botB.name} counters ${botA.name}!`);
    } else {
      battleLog.push(`⚖️ NEUTRAL MATCHUP: Standard protocols engaged.`);
    }
    battleLog.push('---');
  }

  // Log post-buff stats
  battleLog.push(`${botA.name} (Buffed) - DMG: ${statsA.Damage} | SPD: ${statsA.Speed} | ARM: ${statsA.Armor}`);
  battleLog.push(`${botB.name} (Buffed) - DMG: ${statsB.Damage} | SPD: ${statsB.Speed} | ARM: ${statsB.Armor}`);
  battleLog.push('---');
  
  let healthA = BASE_HEALTH;
  let healthB = BASE_HEALTH;
  
  let missStreakA = 0;
  let missStreakB = 0;
  let round = 0;
  
  while (healthA > 0 && healthB > 0 && round < 50) {
    round++;
    
    const turns = statsA.Speed >= statsB.Speed 
      ? [
          { attacker: botA, defender: botB, attStats: statsA, defStats: statsB, attRef: 'A', defRef: 'B' },
          { attacker: botB, defender: botA, attStats: statsB, defStats: statsA, attRef: 'B', defRef: 'A' }
        ]
      : [
          { attacker: botB, defender: botA, attStats: statsB, defStats: statsA, attRef: 'B', defRef: 'A' },
          { attacker: botA, defender: botB, attStats: statsA, defStats: statsB, attRef: 'A', defRef: 'B' }
        ];
    
    for (const turn of turns) {
      if (healthA <= 0 || healthB <= 0) break;

      const { attacker, defender, attStats, defStats, attRef, defRef } = turn;

      const currentMissStreak = attRef === 'A' ? missStreakA : missStreakB;
      const baseHitChance = calculateHitChance(attStats.Speed, defStats.Speed);
      const bonusHitChance = currentMissStreak * 0.15; 
      const effectiveHitChance = Math.min(1.0, baseHitChance + bonusHitChance);
      
      const dodgeChance = calculateDodgeChance(defStats.Speed);

      if (Math.random() > dodgeChance) {
        if (Math.random() < effectiveHitChance) {
          if (attRef === 'A') missStreakA = 0; else missStreakB = 0;

          const isCrit = Math.random() < CRIT_CHANCE;
          let damage = calculateDamage(attStats.Damage, defStats.Armor);
          
          if (isCrit) {
            damage = Math.floor(damage * CRIT_MULTIPLIER);
            criticalHits.push(round);
            battleLog.push(`💥 Round ${round}: ${attacker.name} lands a CRITICAL HIT for ${damage} damage!`);
          } else {
            battleLog.push(`⚡ Round ${round}: ${attacker.name} attacks for ${damage} damage`);
          }
          
          if (defRef === 'A') healthA -= damage; else healthB -= damage;
          
        } else {
          if (attRef === 'A') missStreakA++; else missStreakB++;

          if (Math.random() < 0.5) {
            let damage = calculateDamage(attStats.Damage, defStats.Armor);
            damage = Math.max(1, Math.floor(damage * 0.3)); 

            battleLog.push(`⚠️ Round ${round}: ${attacker.name} lands a glancing blow for ${damage} damage.`);
            
            if (defRef === 'A') healthA -= damage; else healthB -= damage;
          } else {
            battleLog.push(`❌ Round ${round}: ${attacker.name}'s attack misses!`);
          }
        }
      } else {
        if (attRef === 'A') missStreakA++; else missStreakB++;
        battleLog.push(`🌀 Round ${round}: ${defender.name} dodges ${attacker.name}'s attack!`);
      }
    }
  }
  
  const winner = healthA > 0 ? botA : botB;
  const loser = healthA > 0 ? botB : botA;
  
  battleLog.push('---');
  battleLog.push(`🏆 ${winner.name} wins with ${healthA > 0 ? healthA : healthB} HP remaining!`);
  
  return {
    winner,
    loser,
    rounds: round,
    battleLog,
    criticalHits,
    finalHealthA: Math.max(0, healthA),
    finalHealthB: Math.max(0, healthB)
  };
};
