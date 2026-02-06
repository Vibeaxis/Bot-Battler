import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, useAnimation } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, RefreshCw, Scan } from 'lucide-react';
import { generateBalancedEnemy } from '@/utils/enemyGenerator';
import { simulateBattle } from '@/utils/combatEngine';
import { WIN_REWARD, LOSS_REWARD, BASE_HEALTH } from '@/constants/gameConstants';
import BotCard from '@/components/BotCard';
import BattleHeader from '@/components/BattleHeader';
import ScavengeModal from '@/components/ScavengeModal';
import ProtocolSelector from '@/components/ProtocolSelector';
import BattleSpeedToggle from '@/components/BattleSpeedToggle';
import { toast } from '@/components/ui/use-toast';
import SpeechToast from '@/components/SpeechToast';
import { getRandomFlavor } from '@/data/flavor';
import CombatTextOverlay from '@/components/CombatTextOverlay';
import { ScreenFlash, ImpactParticles } from '@/components/CombatEffects';
import { calculateBotStats } from '@/utils/statCalculator';

// --- ASSETS ---
import electricGrid from '@/assets/electric_grid.jpg';
import rooftopRain from '@/assets/rooftop_rain.jpg';
import spaceStation from '@/assets/space_station.jpg';
import downFactory from '@/assets/down_factory.jpg';

import illumCenter from '@/assets/illum_center.jpg';

import weapDepot from '@/assets/weap_depot.jpg';
import rainBow from '@/assets/rain_bow.jpg';
import jungleBg from '@/assets/jungles_bg.jpg';
import airportBg from '@/assets/airport_bg.jpg';
import carnivalBg from '@/assets/carnival_bg.jpg';
import crystalBg from '@/assets/crysa_bg.jpg';

import factoryBg from '@/assets/facto_bg.jpg';
import icyBg from '@/assets/icy_bg.jpg';
import serverBg from '@/assets/server_bg.jpg';
import stationBg from '@/assets/station_bg.jpg';
import terminalBg from '@/assets/term_bg.jpg';
import teslaBg from '@/assets/tesla_bg.jpg';
import neonBg from '@/assets/neon_bg.jpg';
import junkBg from '@/assets/junk_bg.jpg';
import foliBg from '@/assets/foli_bg.jpg';
import forgeBg from '@/assets/forge_bg.jpg';
import gauntletBg from '@/assets/gauntlet_bg.jpg';
// --- CONSTANTS ---
// --- UPDATED EXPORT ---
export const BATTLE_ARENAS = [
  // Original Set
  rooftopRain, 
  electricGrid, 
  spaceStation, 
  downFactory, 
 
  illumCenter, 
 
  weapDepot, 
  rainBow,
  
  // New Set 1
  jungleBg,
  airportBg,
  carnivalBg,
  crystalBg,
 
  factoryBg,
  icyBg,
  serverBg,
  stationBg,
  terminalBg,

  // New Set 2 (High Fidelity)
  teslaBg,    // The Quantum Core
  neonBg,     // The Neon Slums
  junkBg,     // The Scrapyard
  foliBg,     // The Bio-Foundry
  forgeBg,    // The Forge
  gauntletBg  // The Gauntlet
];

const REROLL_COST = 10;

const Battle = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook must be at top level
  
  const { 
    gameState, 
    updateScrap, 
    recordBattle,
    advanceGauntlet, 
    exitGauntlet 
  } = useGameContext();

  const { playSound } = useSoundContext();
  
  // Visual States
  const [flashType, setFlashType] = useState(null); 
  const [playerSparks, setPlayerSparks] = useState(false); 
  const [enemySparks, setEnemySparks] = useState(false);   

  // Game State
  const [enemy, setEnemy] = useState(null);
  const [isBattling, setIsBattling] = useState(false);
  const [battleResult, setBattleResult] = useState(null);
  const [playerHealth, setPlayerHealth] = useState(BASE_HEALTH);
  const [enemyHealth, setEnemyHealth] = useState(BASE_HEALTH);
  const [currentRound, setCurrentRound] = useState(0);
  const [showScavengeModal, setShowScavengeModal] = useState(false);
  const [pendingRewards, setPendingRewards] = useState({ scrap: 0 });
  const [battleSpeed, setBattleSpeed] = useState(1);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  
  // Protocol State
  const [playerProtocol, setPlayerProtocol] = useState(null);
  const [enemyProtocol, setEnemyProtocol] = useState(null);

  // Toast State
  const [leftToast, setLeftToastState] = useState(null);
  const [rightToast, setRightToastState] = useState(null);
  const [playerFloatingText, setPlayerFloatingText] = useState(null);
  const [enemyFloatingText, setEnemyFloatingText] = useState(null);
  
  // Animation controls
  const controls = useAnimation();
  
  // Arena State
  const [currentArena, setCurrentArena] = useState(() => {
    return BATTLE_ARENAS[Math.floor(Math.random() * BATTLE_ARENAS.length)];
  });
  
  // Refs
  const timersRef = useRef([]);
  const battleSpeedRef = useRef(1);
  
  // --- CHECK MODE ---
  const isGauntlet = location.state?.mode === 'gauntlet';

  // Sync ref with state
  useEffect(() => {
    battleSpeedRef.current = battleSpeed;
  }, [battleSpeed]);

  // Helper to set toast with auto-clear
  const setLeftToast = (msg) => {
    setLeftToastState(msg);
    const id = setTimeout(() => setLeftToastState(null), 3000);
    timersRef.current.push(id);
  };

  const setRightToast = (msg) => {
    setRightToastState(msg);
    const id = setTimeout(() => setRightToastState(null), 3000);
    timersRef.current.push(id);
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Determine Enemy (Gauntlet or Random)
    let targetEnemy;

    if (location.state?.enemy) {
        // GAUNTLET MODE: Load the specific enemy passed from the ladder
        targetEnemy = location.state.enemy;
        // Ensure icon exists
        if (!targetEnemy.icon) targetEnemy.icon = 'Skull';
    } else {
        // SCAVENGE MODE: Generate a fresh random enemy
        // Only generate if we don't already have one (to prevent refresh loops)
        // But since we want to init correctly, we can generate here if null
        targetEnemy = generateBalancedEnemy(gameState.playerBot, gameState.winStreak);
        targetEnemy.slotLevels = { head: 0, rightArm: 0, leftArm: 0, chassis: 0 };
        targetEnemy.icon = targetEnemy.icon || 'Skull';
    }

    setEnemy(targetEnemy);

    // 2. Calculate Stats Immediately (Fixes Health Bar Glitch)
    // We calculate the MaxHealth NOW using the new Weight logic
    const playerStats = calculateBotStats({
        ...gameState.playerBot,
        slotLevels: gameState.slotLevels
    });
    const pMax = playerStats.MaxHealth || BASE_HEALTH;
    setPlayerHealth(pMax);

    const enemyStats = calculateBotStats(targetEnemy);
    const eMax = enemyStats.MaxHealth || BASE_HEALTH;
    setEnemyHealth(eMax);

    // 3. Reset Battle State
    setBattleResult(null);
    setCurrentRound(0);
    setShowScavengeModal(false);
    setIsBattling(false);
    
    // 4. Set Arena (Randomize if not already set or rotate)
    let nextArena;
    do {
        nextArena = BATTLE_ARENAS[Math.floor(Math.random() * BATTLE_ARENAS.length)];
    } while (nextArena === currentArena && BATTLE_ARENAS.length > 1);
    setCurrentArena(nextArena);

    // 5. Reset Protocols & UI
    setPlayerProtocol(null);
    setEnemyProtocol(null);
    setLeftToastState(null);
    setRightToastState(null);

  }, [location.state, gameState.playerBot, gameState.slotLevels]);

  // Trigger Intro Toasts when enemy is set
  useEffect(() => {
    if (enemy && !isBattling && !battleResult) {
      const t1 = setTimeout(() => setLeftToast(getRandomFlavor('INTRO')), 500);
      const t2 = setTimeout(() => setRightToast(getRandomFlavor('INTRO')), 1200);
      timersRef.current.push(t1, t2);
    }
  }, [enemy]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // --- HANDLERS ---

  const generateNewEnemy = () => {
    // Only used for "Reroll" in Scavenge mode or Replay
    const newEnemy = generateBalancedEnemy(gameState.playerBot, gameState.winStreak);
    newEnemy.slotLevels = { head: 0, rightArm: 0, leftArm: 0, chassis: 0 };
    newEnemy.icon = newEnemy.icon || 'Skull';
    
    setEnemy(newEnemy);
    
    // Recalculate Enemy Health for the new guy
    const enemyStats = calculateBotStats(newEnemy);
    setEnemyHealth(enemyStats.MaxHealth || BASE_HEALTH);
    
   // Recalculate Player Health too just in case
    const playerStats = calculateBotStats({
        ...gameState.playerBot,
        slotLevels: gameState.slotLevels
    });
    setPlayerHealth(playerStats.MaxHealth || BASE_HEALTH);
    setBattleResult(null);
    setCurrentRound(0);
    setShowScavengeModal(false);
    
    let nextArena;
    do {
        nextArena = BATTLE_ARENAS[Math.floor(Math.random() * BATTLE_ARENAS.length)];
    } while (nextArena === currentArena && BATTLE_ARENAS.length > 1);
    setCurrentArena(nextArena);

    setPlayerProtocol(null);
    setEnemyProtocol(null);
    setLeftToastState(null);
    setRightToastState(null);
  };

  const handleReroll = () => {
    if (isGauntlet) {
        toast({ title: "Action Denied", description: "Cannot reroll in Gauntlet mode.", variant: "destructive" });
        return;
    }

    if (gameState.scrap < REROLL_COST) {
       toast({
         title: "Insufficient Scrap",
         description: `You need ${REROLL_COST} scrap to scout a new target.`,
         variant: "destructive"
       });
       return;
    }

    updateScrap(-REROLL_COST);
    playSound('REROLL');
    generateNewEnemy();
    
    toast({
      title: "New Target Scouted",
      description: "Enemy signals refreshed. -10 Scrap.",
      className: "bg-yellow-600/90 border-yellow-500 text-white font-mono"
    });
  };

  // --- THE BATTLE LOOP ---
  const startBattle = async () => {
    if (isBattling || !enemy || !playerProtocol) return;
    
    setIsBattling(true);
    setBattleResult(null); 
    
    let dynamicBattleLog = []; 
    const addToLog = (msg) => {
        const timestamp = (Date.now() % 10000).toString().padStart(4, '0');
        dynamicBattleLog.push(`[T-${timestamp}] ${msg}`);
    };
    
    addToLog(`ENGAGEMENT STARTED: ${gameState.playerBot.name} VS ${enemy.name}`);

    // SETUP ENEMY PROTOCOL
    const ENEMY_PROTOCOLS = [
        { name: 'Assault Protocol', id: 'ASSAULT', statType: 'Damage' },
        { name: 'Bulwark Protocol', id: 'BULWARK', statType: 'Armor' },
        { name: 'Tech Protocol', id: 'TECH', statType: 'Speed' }
    ];

    let selectedEnemyProto = ENEMY_PROTOCOLS[0]; 
    if (enemy) {
        if (Math.random() < 0.2) {
            selectedEnemyProto = ENEMY_PROTOCOLS[Math.floor(Math.random() * ENEMY_PROTOCOLS.length)];
        } else {
            const stats = calculateBotStats(enemy); 
            // Simple logic: pick highest stat
            const highestStat = Object.keys(stats).reduce((a, b) => stats[a] > stats[b] ? a : b);
            selectedEnemyProto = ENEMY_PROTOCOLS.find(p => p.statType === highestStat) || ENEMY_PROTOCOLS[0];
        }
    }
    setEnemyProtocol(selectedEnemyProto);

    // RUN SIMULATION
    const result = simulateBattle(
        { ...gameState.playerBot, slotLevels: gameState.slotLevels }, 
        enemy, 
        playerProtocol, 
        selectedEnemyProto
    );
    
    // VISUAL LOOP
    for (let i = 0; i < result.battleLog.length; i++) {
        const logEntry = result.battleLog[i];
        
        if (logEntry.includes('Round')) {
            const roundMatch = logEntry.match(/Round (\d+)/);
            if (roundMatch) setCurrentRound(parseInt(roundMatch[1]));
        }

        const isCrit = logEntry.includes('CRITICAL');
        const isGlancing = logEntry.includes('GLANCING');
        const isDampened = logEntry.includes('DAMPENED');
        const isDodge = logEntry.includes('DODGED');
        
        let hitType = 'normal';
        if (isCrit) hitType = 'crit';
        else if (isGlancing) hitType = 'glancing';
        else if (isDampened) hitType = 'dampened';

        const isMiss = logEntry.includes('misses') || isDodge;
        const damageMatch = logEntry.match(/for (\d+) damage/);
        const damageAmount = damageMatch ? damageMatch[1] : null;

        const isPlayerAction = logEntry.includes(gameState.playerBot.name);
        const isEnemyAction = logEntry.includes(enemy.name);

      if (damageAmount || isMiss) {
            if (isPlayerAction) {
                setPlayerAttacking(true);
                if (damageAmount) {
                    setEnemyFloatingText({ id: i, content: `-${damageAmount}`, type: hitType });
                    addToLog(`${gameState.playerBot.name} hits for ${damageAmount} DMG${isCrit ? ' (CRIT)' : ''}`);
                    setEnemySparks(true);
                    setTimeout(() => setEnemySparks(false), 200); 
                } else {
                    const missText = isDodge ? "DODGED" : "MISS";
                    setEnemyFloatingText({ id: i, content: missText, type: isDodge ? 'dodge' : 'miss' });
                    addToLog(`${gameState.playerBot.name} misses.`);
                }
                if (isCrit) setRightToast(getRandomFlavor('HIT'));

            } else if (isEnemyAction) {
                setEnemyAttacking(true);
                if (damageAmount) {
                    setPlayerFloatingText({ id: i, content: `-${damageAmount}`, type: hitType });
                    addToLog(`${enemy.name} hits for ${damageAmount} DMG${isCrit ? ' (CRIT)' : ''}`);
                    setPlayerSparks(true);
                    setTimeout(() => setPlayerSparks(false), 200);
                } else {
                    const missText = isDodge ? "DODGED" : "MISS";
                    setPlayerFloatingText({ id: i, content: missText, type: isDodge ? 'dodge' : 'miss' });
                    addToLog(`${enemy.name} misses.`);
                }
                if (isCrit) setLeftToast(getRandomFlavor('HIT'));
            }

   // --- UPDATED SOUND LOGIC ---
            if (damageAmount) {
                // Determine which sound to play
                let soundKey = 'HIT'; // Default heavy hit
                const dmgValue = parseInt(damageAmount, 10);
                
                if (isCrit) {
                    soundKey = 'CRIT';
                } 
                else if (isGlancing) {
                    // Glancing blows always sound like a deflection ("Tink")
                    soundKey = 'GRAZE'; 
                } 
                else if (isDampened) {
                    // INTELLIGENT AUDIO:
                    // If damage is dampened but still high (>= 10), it should sound like a HIT.
                    // If damage is dampened to a scratch (< 10), it sounds like a GRAZE.
                    if (dmgValue < 10) {
                        soundKey = 'GRAZE';
                    } else {
                        soundKey = 'HIT';
                    }
                }

                playSound(soundKey);
                
                // Visual Flash logic
                setFlashType(soundKey); 
                setTimeout(() => setFlashType(null), 100);

                const shakeIntensity = isCrit ? 20 : 5;
                controls.start({
                    x: [0, -shakeIntensity, shakeIntensity, -shakeIntensity, shakeIntensity, 0],
                    y: [0, -shakeIntensity/2, shakeIntensity/2, 0], 
                    transition: { duration: 0.2 }
                });
            } else {
                // Play Miss or Dodge sound
                playSound(isDodge ? 'DODGE' : 'MISS');
            }

            await new Promise(r => setTimeout(r, 200 / battleSpeedRef.current));
        }

        if (result.healthTimeline && result.healthTimeline[i]) {
            setPlayerHealth(result.healthTimeline[i].a);
            setEnemyHealth(result.healthTimeline[i].b);
        }

        const delay = (damageAmount || isMiss) ? 600 : 50; 
        await new Promise(r => setTimeout(r, delay / battleSpeedRef.current));

        setPlayerAttacking(false);
        setEnemyAttacking(false);
        setPlayerFloatingText(null);
        setEnemyFloatingText(null);
    }

    // END BATTLE LOGIC
    const playerWon = result.winner.name === gameState.playerBot.name;
    addToLog(`ENGAGEMENT ENDED. WINNER: ${result.winner.name}`);
    
    const reward = playerWon ? WIN_REWARD : LOSS_REWARD;

    setPlayerHealth(result.finalHealthA);
    setEnemyHealth(result.finalHealthB);
    
    if (playerWon) {
        playSound('VICTORY');
        setFlashType('VICTORY');
        setTimeout(() => setFlashType(null), 800); 
        setLeftToast(getRandomFlavor('VICTORY'));
        setRightToast(getRandomFlavor('DEFEAT'));
        
        // --- GAUNTLET VICTORY LOGIC ---
        if (isGauntlet) {
            advanceGauntlet();
            setTimeout(() => navigate('/gauntlet'), 2500);
        } else {
            setPendingRewards({ scrap: reward });
            setTimeout(() => setShowScavengeModal(true), 2000 / battleSpeedRef.current);
        }

    } else {
        playSound('DEFEAT');
        setFlashType('DEFEAT');
        setTimeout(() => setFlashType(null), 800); 
        setLeftToast(getRandomFlavor('DEFEAT'));
        setRightToast(getRandomFlavor('VICTORY'));
        
        toast({ 
            title: "💀 SYSTEM FAILURE", 
            description: `Critical damage sustained. Salvaged ${reward} scrap as consolation.`, 
            className: "bg-red-950 border border-red-600 text-red-100" 
        });

        // --- GAUNTLET DEFEAT LOGIC ---
        if (isGauntlet) {
            exitGauntlet();
            setTimeout(() => navigate('/hub'), 3000);
        }
    }

    updateScrap(reward);
    recordBattle({ 
        playerWon, 
        enemyName: enemy.name, 
        scrapEarned: reward, 
        battleLog: dynamicBattleLog, 
        timestamp: Date.now() 
    });
    setBattleResult({ playerWon, reward });
    setIsBattling(false);
  };

  const handleNextBattle = () => generateNewEnemy();
  const handleReturnToWorkshop = () => { setShowScavengeModal(false); navigate('/workshop'); };

  // --- DYNAMIC MAX HEALTH ---
  const playerMaxHealth = calculateBotStats({ ...gameState.playerBot, slotLevels: gameState.slotLevels }).MaxHealth || BASE_HEALTH;
  const enemyMaxHealth = calculateBotStats(enemy || {}).MaxHealth || BASE_HEALTH;

  if (!enemy) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Arena...</div>;

  return (
    <>
      <Helmet>
        <title>Arena - Bot Battler</title>
      </Helmet>

      <div className="h-screen max-h-screen bg-black flex flex-col overflow-hidden relative">
        <ScreenFlash type={flashType} />
        
        {/* --- BATTLE STAGE BACKGROUND --- */}
        <div className="absolute inset-0 bg-black z-0">
            <motion.div 
                key={currentArena} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }} 
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-cover bg-center animate-ken-burns"
                style={{ backgroundImage: `url(${currentArena})` }}
            />

            <div 
                className="absolute inset-0 opacity-20" 
                style={{ 
                    backgroundImage: `radial-gradient(circle at 2px 2px, var(--accent-color) 1px, transparent 0)`,
                    backgroundSize: '40px 40px' 
                }} 
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] opacity-20" />
        </div>

        <BattleHeader
            playerHealth={playerHealth}
            enemyHealth={enemyHealth}
            // Use the calculated max health for the bar display
            playerMax={playerMaxHealth}
            enemyMax={enemyMaxHealth}
            round={currentRound}
        />

        {/* MAIN ARENA */}
        <motion.div 
            animate={controls}
            className="relative z-10 flex-1 flex flex-col w-full pb-48"
        >
            {/* Top Bar */}
            <div className="flex justify-between items-center py-4 px-6">
                <Button onClick={() => navigate('/hub')} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Exit
                </Button>
                <BattleSpeedToggle speed={battleSpeed} setSpeed={setBattleSpeed} />
            </div>

            {/* BATTLE STAGE */}
            <div className="flex-1 flex items-center justify-center gap-8 md:gap-24 min-h-[50vh]">
                
                {/* PLAYER SIDE */}
                <div className="relative group">
                    <SpeechToast message={leftToast} position="left" />
                    <CombatTextOverlay activeText={playerFloatingText} />
                    <ImpactParticles active={playerSparks} color="#3b82f6" count={20} />
                    
                    <BotCard
                        bot={gameState.playerBot}
                        side="player"
                        currentHealth={playerHealth} 
        maxHealth={playerMaxHealth}
                        isAttacking={playerAttacking}
                        isHit={enemyAttacking}
                        slotLevels={gameState.slotLevels}
                        className="scale-110 shadow-2xl"
                    />
                    
                    {playerProtocol && (
                        <div className="absolute -bottom-8 left-0 right-0 text-center z-20">
                            <span className="text-[10px] font-bold px-3 py-1 rounded-b-md border-x border-b border-[var(--accent-color)] text-[var(--accent-color)] bg-black/90 shadow-[0_4px_10px_rgba(0,0,0,0.5)] tracking-widest uppercase">
                                Active: {playerProtocol.name}
                            </span>
                        </div>
                    )}
                </div>

                {/* VS DIVIDER */}
                <div className="hidden md:flex flex-col items-center justify-center opacity-30">
                    <div className="h-32 w-px bg-gradient-to-b from-transparent via-white to-transparent"></div>
                </div>

                {/* ENEMY SIDE */}
                <div className="relative group">
                    <SpeechToast message={rightToast} position="right" />
                    <CombatTextOverlay activeText={enemyFloatingText} />
                    <ImpactParticles active={enemySparks} color="#ef4444" count={20} />
                    
                    <BotCard
                        bot={enemy}
                        side="enemy"
        currentHealth={enemyHealth} 
        maxHealth={enemyMaxHealth}
      
                        isAttacking={enemyAttacking}
                        isHit={playerAttacking}
                        slotLevels={gameState.slotLevels}
                        className="scale-110 shadow-2xl border-red-500/50"
                    />
                    
                    {enemyProtocol && (
                        <div className="absolute -bottom-8 left-0 right-0 text-center z-20">
                            <span className="text-[10px] font-bold px-3 py-1 rounded-b-md border-x border-b border-red-500 text-red-500 bg-black/90 shadow-[0_4px_10px_rgba(0,0,0,0.5)] tracking-widest uppercase">
                                Detected: {enemyProtocol.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>

        {/* --- FIXED COMMAND FOOTER --- */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-gray-800 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* DEFEATED MESSAGE */}
                {battleResult && !battleResult.playerWon && (
                    <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center gap-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter">System Failure</h2>
                            <p className="text-gray-500 text-sm">Earned {battleResult.reward} Scrap</p>
                        </div>
                        <div className="flex gap-2">
                            {/* In Gauntlet, Retry isn't an option normally, but keeping it for Scavenge */}
                            {!isGauntlet && (
                                <Button onClick={generateNewEnemy} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6">
                                    Reboot (Retry)
                                </Button>
                            )}
                            <Button onClick={() => navigate('/hub')} variant="outline" className="border-gray-700 text-gray-400">
                                Abort
                            </Button>
                        </div>
                    </div>
                )}

                {/* LEFT: PROTOCOLS */}
                <div className={`flex-1 w-full md:w-auto transition-opacity duration-300 ${isBattling ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <div className="text-[10px] text-gray-500 font-mono mb-1 tracking-widest uppercase">Select Strategy</div>
                    <div className="origin-top-left scale-90 w-[110%]">
                        <ProtocolSelector
                            selectedProtocol={playerProtocol}
                            onSelectProtocol={setPlayerProtocol}
                            disabled={isBattling}
                        />
                    </div>
                </div>

                {/* RIGHT: ACTION BUTTONS */}
                <div className="flex items-end gap-3 shrink-0">
                    <div className="flex flex-col">
                        <Button 
                            onClick={handleReroll} 
                            disabled={isBattling || isGauntlet || gameState.scrap < REROLL_COST} // Disable reroll in Gauntlet
                            size="lg"
                            className="h-14 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30"
                        >
                            <div className="flex flex-col items-center gap-1">
                                <Scan className="w-4 h-4" />
                                <span className="text-[10px] font-mono">SCOUT ({REROLL_COST})</span>
                            </div>
                        </Button>
                    </div>

                    <Button 
                        onClick={startBattle} 
                        disabled={isBattling || !playerProtocol}
                        size="lg"
                        className="h-14 min-w-[200px] bg-[var(--accent-color)] text-black font-black text-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)]"
                    >
                        {isBattling ? (
                            <span className="flex items-center gap-2 text-base">
                                <RefreshCw className="animate-spin" /> SIMULATING...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                ENGAGE <Play className="w-5 h-5 fill-current" />
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>

        {/* Modals */}
        <ScavengeModal
            isOpen={showScavengeModal}
            onNextBattle={handleNextBattle}
            onReturn={handleReturnToWorkshop}
            enemy={enemy}
            rewards={pendingRewards}
        />
      </div>
    </>
  );
}; // Added closing brace here

export default Battle;