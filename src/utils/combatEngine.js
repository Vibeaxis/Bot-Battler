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
  // 1. Initial Setup (Moved Health UP so we can record it immediately)
  let healthA = BASE_HEALTH;
  let healthB = BASE_HEALTH;

  let statsA = calculateBotStats(botA);
  let statsB = calculateBotStats(botB);
  
  const battleLog = [];
  const healthTimeline = []; // <--- The Fix for NaN
  const criticalHits = [];
  
  // 2. The Recorder Helper
  // Ensures battleLog and healthTimeline stay perfectly synced (1-to-1)
  const record = (message) => {
    battleLog.push(message);
    healthTimeline.push({ 
      a: Math.max(0, healthA), 
      b: Math.max(0, healthB) 
    });
  };

  record(`⚔️ Battle Start: ${botA.name} vs ${botB.name}`);

  // 3. Apply Protocol Bonuses
  if (protocolA && protocolB) {
    const bonusA = calculateProtocolBonus(protocolA, protocolB.id);
    const bonusB = calculateProtocolBonus(protocolB, protocolA.id);

    // Apply A's bonus
    statsA = { ...statsA, [protocolA.statType]: Math.floor(statsA[protocolA.statType] * (1 + bonusA)) };
    
    // Apply B's bonus
    statsB = { ...statsB, [protocolB.statType]: Math.floor(statsB[protocolB.statType] * (1 + bonusB)) };
    
    record(`📡 PROTOCOLS ACTIVE:`);
    record(`${botA.name}: [${protocolA.name}] -> +${Math.round(bonusA * 100)}% ${protocolA.statType}`);
    record(`${botB.name}: [${protocolB.name}] -> +${Math.round(bonusB * 100)}% ${protocolB.statType}`);
    
    if (bonusA > protocolA.baseBonus) {
      record(`⚡ TACTICAL ADVANTAGE: ${botA.name} counters ${botB.name}!`);
    } else if (bonusB > protocolB.baseBonus) {
      record(`⚡ TACTICAL ADVANTAGE: ${botB.name} counters ${botA.name}!`);
    } else {
      record(`⚖️ NEUTRAL MATCHUP: Standard protocols engaged.`);
    }
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
            // Apply Damage BEFORE recording so timeline matches
            if (defRef === 'A') healthA -= damage; else healthB -= damage;
            record(`💥 Round ${round}: ${attacker.name} lands a CRITICAL HIT for ${damage} damage!`);
          } else {
            // Apply Damage BEFORE recording
            if (defRef === 'A') healthA -= damage; else healthB -= damage;
            record(`⚡ Round ${round}: ${attacker.name} attacks for ${damage} damage`);
          }
          
        } else {
          if (attRef === 'A') missStreakA++; else missStreakB++;

          if (Math.random() < 0.5) {
            let damage = calculateDamage(attStats.Damage, defStats.Armor);
            damage = Math.max(1, Math.floor(damage * 0.3)); 

            // Apply Damage BEFORE recording
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
  
  const winner = healthA > 0 ? botA : botB;
  const loser = healthA > 0 ? botB : botA;
  
  record('---');
  record(`🏆 ${winner.name} wins with ${healthA > 0 ? healthA : healthB} HP remaining!`);
  
  return {
    winner,
    loser,
    rounds: round,
    battleLog,
    healthTimeline, // <--- Returns populated timeline
    criticalHits,
    finalHealthA: Math.max(0, healthA),
    finalHealthB: Math.max(0, healthB)
  };
};