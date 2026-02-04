
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
import CombatLog from '@/components/CombatLog';
import BattleHeader from '@/components/BattleHeader';
import ScavengeModal from '@/components/ScavengeModal';
import ProtocolSelector from '@/components/ProtocolSelector';
import BattleSpeedToggle from '@/components/BattleSpeedToggle';
import { toast } from '@/components/ui/use-toast';
import SpeechToast from '@/components/SpeechToast';
import { getRandomFlavor } from '@/data/flavor';
import { PROTOCOLS, getRandomProtocol } from '@/data/tactics';
import CombatTextOverlay from '@/components/CombatTextOverlay';
import { ScreenFlash, ImpactParticles } from '@/components/CombatEffects'; // Import the new file
import { calculateBotStats } from '@/utils/statCalculator';


import electricGrid from '@/assets/electric_grid.jpg';
import rooftopRain from '@/assets/rooftop_rain.jpg';
import spaceStation from '@/assets/space_station.jpg';

// --- NEW IMPORTS ---
import downFactory from '@/assets/down_factory.jpg';
import iceShelf from '@/assets/ice_shelf.jpg';
import illumCenter from '@/assets/illum_center.jpg';
import volcObs from '@/assets/volc_obs.jpg';
import weapDepot from '@/assets/weap_depot.jpg';
import arcadeGrave from '@/assets/arcade_grave.jpg';
import rainBow from '@/assets/rain_bow.jpg';

// --- 2. DEFINE THE ARENA POOL ---
const BATTLE_ARENAS = [
  rooftopRain,
  electricGrid,
  spaceStation,
  downFactory,
  iceShelf,
  illumCenter,
  volcObs,
  weapDepot,
  arcadeGrave,
  rainBow
];


const REROLL_COST = 10;
const Battle = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook for accessing state passed via navigation
  
  const { 
    gameState, 
    updateScrap, 
    recordBattle,
    advanceGauntlet, // From Context
    exitGauntlet     // From Context
  } = useGameContext();

  const { playSound } = useSoundContext();
  
  // Visual States
  const [flashType, setFlashType] = useState(null); // 'HIT' or 'CRIT'
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

  // Helper for Toasts
  const setLeftToast = (msg) => {
    setLeftToastState(null);
    setTimeout(() => setLeftToastState(msg), 50);
  };
  const setRightToast = (msg) => {
    setRightToastState(null);
    setTimeout(() => setRightToastState(msg), 50);
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

  }, [location.state, gameState.playerBot]); // Re-run if gauntlet state passes new enemy

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
    // Only used for "Reroll" in Scavenge mode
    const newEnemy = generateBalancedEnemy(gameState.playerBot, gameState.winStreak);
    newEnemy.slotLevels = { head: 0, rightArm: 0, leftArm: 0, chassis: 0 };
    newEnemy.icon = newEnemy.icon || 'Skull';
    
    setEnemy(newEnemy);
    
    // Recalculate Enemy Health for the new guy
    const enemyStats = calculateBotStats(newEnemy);
    setEnemyHealth(enemyStats.MaxHealth || BASE_HEALTH);
    
    // Reset Player Health
    const playerStats = calculateBotStats(gameState.playerBot);
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

            if (damageAmount) {
                playSound(isCrit ? 'CRIT' : 'HIT');
                setFlashType(isCrit ? 'CRIT' : 'HIT');
                setTimeout(() => setFlashType(null), 100);

                const shakeIntensity = isCrit ? 20 : 5;
                controls.start({
                    x: [0, -shakeIntensity, shakeIntensity, -shakeIntensity, shakeIntensity, 0],
                    y: [0, -shakeIntensity/2, shakeIntensity/2, 0], 
                    transition: { duration: 0.2 }
                });
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

  const handleLeaveBattle = () => {
    if (isGauntlet && isBattling) {
        // Forfeit Gauntlet
        exitGauntlet();
        navigate('/hub');
    } else {
        navigate('/hub');
    }
  };

  // --- DYNAMIC MAX HEALTH ---
  const playerMaxHealth = calculateBotStats({ ...gameState.playerBot, slotLevels: gameState.slotLevels }).MaxHealth || BASE_HEALTH;
  const enemyMaxHealth = calculateBotStats(enemy || {}).MaxHealth || BASE_HEALTH;

  return (
    <>
      <Helmet>
        <title>Battle Arena - Combat Engaged</title>
      </Helmet>

      <ScavengeModal 
        isOpen={showScavengeModal} 
        onClose={() => {
            setShowScavengeModal(false);
            navigate('/hub');
        }}
        onReplay={() => generateNewEnemy()}
        rewards={pendingRewards}
      />

      <motion.div 
        animate={controls}
        className="min-h-screen bg-black text-[#e0e0e0] font-mono relative overflow-hidden"
        style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
              url(${currentArena.image})
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
      >
        {/* CRT Overlay Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_4px,6px_100%] opacity-20" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/20 z-10" />

        {/* --- HEADER --- */}
        <div className="relative z-20 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
            <Button 
                onClick={handleLeaveBattle}
                variant="ghost" 
                className="text-gray-400 hover:text-white hover:bg-white/10 uppercase tracking-widest text-xs"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isGauntlet ? "Surrender Run" : "Emergency Exit"}
            </Button>

            {/* Speed Controls */}
            <div className="flex gap-1 bg-black/60 border border-gray-800 p-1 rounded-sm backdrop-blur-sm">
                <div className="px-2 py-1 text-[10px] text-gray-500 font-bold flex items-center gap-1 uppercase">
                    <Zap className="w-3 h-3" /> Speed
                </div>
                {[1, 2, 4].map(speed => (
                    <button
                        key={speed}
                        onClick={() => setBattleSpeed(speed)}
                        className={cn(
                            "px-3 py-1 text-xs font-bold transition-all rounded-sm",
                            battleSpeed === speed 
                                ? "bg-[var(--accent-color)] text-black shadow-[0_0_10px_var(--accent-color)]" 
                                : "text-gray-500 hover:text-white"
                        )}
                    >
                        {speed}x
                    </button>
                ))}
            </div>
        </div>

        {/* --- BATTLE ARENA --- */}
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-12 md:gap-24 p-8">
            
            {/* Health Bars Container */}
            <div className="w-full flex justify-between items-center absolute top-20 left-0 right-0 px-8 md:px-20">
                {/* Player HP */}
                <div className="w-1/3">
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-[var(--accent-color)]">OPERATOR</span>
                        <span className="text-white">{playerHealth} / {playerMaxHealth}</span>
                    </div>
                    <div className="h-2 bg-gray-900 border border-gray-700 w-full overflow-hidden skew-x-[-15deg]">
                        <motion.div 
                            className="h-full bg-[var(--accent-color)]"
                            initial={{ width: '100%' }}
                            animate={{ width: `${(playerHealth / playerMaxHealth) * 100}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                        />
                    </div>
                </div>

                {/* VS Badge */}
                <div className="text-2xl font-black italic text-white/20">VS</div>

                {/* Enemy HP */}
                <div className="w-1/3">
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-white">{enemyHealth} / {enemyMaxHealth}</span>
                        <span className="text-red-500">TARGET</span>
                    </div>
                    <div className="h-2 bg-gray-900 border border-gray-700 w-full overflow-hidden skew-x-[15deg]">
                        <motion.div 
                            className="h-full bg-red-600"
                            initial={{ width: '100%' }}
                            animate={{ width: `${(enemyHealth / enemyMaxHealth) * 100}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                        />
                    </div>
                </div>
            </div>

            {/* Combatants */}
            <div className="flex justify-center items-center gap-12 md:gap-32 w-full mt-10">
                
                {/* Player Card */}
                <div className="relative">
                    <BotCard 
                        bot={gameState.playerBot} 
                        slotLevels={gameState.slotLevels}
                        isAttacking={playerAttacking}
                        side="player"
                        className={cn(
                            "transform transition-all duration-100", 
                            playerAttacking && "translate-x-20 z-20 scale-105",
                            !playerAttacking && !enemyAttacking && "hover:scale-105"
                        )}
                    />
                    
                    {/* Speech Bubble */}
                    <SpeechToast message={leftToast} position="left" />

                    {/* Floating Combat Text */}
                    <div className="absolute top-10 right-0 pointer-events-none z-50">
                        {playerFloatingText && (
                            <motion.div
                                key={playerFloatingText.id}
                                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                animate={{ opacity: 0, y: -100, scale: 1.5 }}
                                transition={{ duration: 0.8 }}
                                className={cn(
                                    "text-4xl font-black italic drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]",
                                    playerFloatingText.type === 'crit' ? "text-yellow-400 text-6xl" : "text-red-500",
                                    playerFloatingText.type === 'miss' && "text-gray-400 text-2xl"
                                )}
                            >
                                {playerFloatingText.content}
                            </motion.div>
                        )}
                    </div>
                    
                    {playerSparks && <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay animate-pulse" />}
                </div>

                {/* Enemy Card */}
                <div className="relative">
                    {enemy && (
                        <BotCard 
                            bot={enemy} 
                            isAttacking={enemyAttacking}
                            side="enemy"
                            className={cn(
                                "transform transition-all duration-100 border-red-500/50",
                                enemyAttacking && "-translate-x-20 z-20 scale-105"
                            )}
                        />
                    )}

                    <SpeechToast message={rightToast} position="right" />

                    <div className="absolute top-10 left-0 pointer-events-none z-50">
                        {enemyFloatingText && (
                            <motion.div
                                key={enemyFloatingText.id}
                                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                animate={{ opacity: 0, y: -100, scale: 1.5 }}
                                transition={{ duration: 0.8 }}
                                className={cn(
                                    "text-4xl font-black italic drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]",
                                    enemyFloatingText.type === 'crit' ? "text-yellow-400 text-6xl" : "text-red-500",
                                    enemyFloatingText.type === 'miss' && "text-gray-400 text-2xl"
                                )}
                            >
                                {enemyFloatingText.content}
                            </motion.div>
                        )}
                    </div>

                    {enemySparks && <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay animate-pulse" />}
                </div>
            </div>
        </div>

        {/* --- CONTROL DECK --- */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-[var(--accent-color)] p-6 backdrop-blur-xl z-30">
            <div className="max-w-5xl mx-auto">
                
                {/* Protocol Selection */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Strategy Buttons */}
                    <div className="flex-1 w-full">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Select Combat Protocol</div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'ASSAULT', label: 'Assault', icon: Swords },
                                { id: 'BULWARK', label: 'Bulwark', icon: Shield },
                                { id: 'TECH', label: 'Tech', icon: Zap }
                            ].map((proto) => {
                                const Icon = proto.icon;
                                const isSelected = playerProtocol?.id === proto.id;
                                
                                return (
                                    <button
                                        key={proto.id}
                                        onClick={() => !isBattling && setPlayerProtocol(proto)}
                                        disabled={isBattling}
                                        className={cn(
                                            "relative h-16 border flex flex-col items-center justify-center transition-all overflow-hidden group",
                                            isSelected 
                                                ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-[var(--accent-color)]" 
                                                : "bg-black/50 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300",
                                            isBattling && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <Icon className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{proto.label}</span>
                                        {isSelected && <div className="absolute inset-0 border-2 border-[var(--accent-color)] animate-pulse" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-end gap-3">
                        {!isGauntlet && (
                            <button 
                                onClick={handleReroll}
                                disabled={isBattling}
                                className="h-16 px-4 border border-gray-800 bg-black/50 text-gray-500 hover:text-white hover:border-gray-600 flex flex-col items-center justify-center transition-all disabled:opacity-50"
                            >
                                <Crosshair className="w-4 h-4 mb-1" />
                                <span className="text-[10px] font-bold">SCOUT ({REROLL_COST})</span>
                            </button>
                        )}

                        <Button 
                            onClick={startBattle}
                            disabled={!playerProtocol || isBattling}
                            className={cn(
                                "h-16 px-8 text-lg font-black italic tracking-widest uppercase transition-all rounded-none",
                                isBattling 
                                    ? "bg-gray-800 text-gray-500 border-gray-700" 
                                    : "bg-[var(--accent-color)] text-black hover:bg-[var(--accent-color)] hover:brightness-110 shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)]"
                            )}
                        >
                            {isBattling ? "ENGAGING..." : "ENGAGE ►"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        {/* Global Flash Overlay */}
        {flashType && (
            <div className={cn(
                "absolute inset-0 pointer-events-none z-[100] mix-blend-overlay transition-opacity duration-75",
                flashType === 'CRIT' ? "bg-white opacity-30" : "bg-white opacity-10",
                flashType === 'VICTORY' ? "bg-green-500 opacity-20" : "",
                flashType === 'DEFEAT' ? "bg-red-500 opacity-20" : ""
            )} />
        )}
      </motion.div>
    </>
  );
};

export default Battle;