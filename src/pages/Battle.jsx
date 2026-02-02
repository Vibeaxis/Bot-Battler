
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

const REROLL_COST = 10;

const Battle = () => {
  const navigate = useNavigate();
  const { gameState, updateScrap, recordBattle } = useGameContext();
  const { playSound } = useSoundContext();
  
  // State
  const [enemy, setEnemy] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
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
  
  // Animation controls
  const controls = useAnimation();
  
  // Refs
  const timersRef = useRef([]);
  const battleSpeedRef = useRef(1);

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

  const generateNewEnemy = () => {
    const newEnemy = generateBalancedEnemy(gameState.playerBot, gameState.winStreak);
    // Ensure enemy has default slot levels to prevent errors in calculator
    newEnemy.slotLevels = { head: 0, rightArm: 0, leftArm: 0, chassis: 0 };
    // Ensure enemy has an icon (defaulting for generated enemies)
    newEnemy.icon = newEnemy.icon || 'Skull';
    setEnemy(newEnemy);
    setBattleLog([]);
    setBattleResult(null);
    setPlayerHealth(BASE_HEALTH);
    setEnemyHealth(BASE_HEALTH);
    setCurrentRound(0);
    setShowScavengeModal(false);
    
    // Reset Protocol
    setPlayerProtocol(null);
    setEnemyProtocol(null);
    
    // Clear toasts
    setLeftToastState(null);
    setRightToastState(null);
  };
  
  // Cleanup timers
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Initial Setup & Intro
  useEffect(() => {
    if (!enemy) {
      generateNewEnemy();
    }
  }, []);

  // Trigger Intro Toasts when enemy is set (Battle Start/Init)
  useEffect(() => {
    if (enemy && !isBattling && !battleResult) {
      // Small delay for UI to settle
      const t1 = setTimeout(() => setLeftToast(getRandomFlavor('INTRO')), 500);
      const t2 = setTimeout(() => setRightToast(getRandomFlavor('INTRO')), 1200);
      timersRef.current.push(t1, t2);
    }
  }, [enemy]);

  const handleReroll = () => {
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
  
  const startBattle = async () => {
    if (isBattling || !enemy || !playerProtocol) return;
    
    setIsBattling(true);
    setBattleLog([]);
    setPlayerHealth(BASE_HEALTH);
    setEnemyHealth(BASE_HEALTH);
    setCurrentRound(0);
    
    // Clear any existing intro toasts
    setLeftToastState(null);
    setRightToastState(null);
    
    // 1. Assign Enemy Protocol
    const selectedEnemyProtocol = getRandomProtocol();
    setEnemyProtocol(selectedEnemyProtocol);

    // 2. Protocol Matchup Toast
    const playerCounters = playerProtocol.counterProtocol === selectedEnemyProtocol.id;
    const enemyCounters = selectedEnemyProtocol.counterProtocol === playerProtocol.id;
    
    let title = "Protocol Matchup";
    let desc = "Neutral! No advantage detected.";
    let className = "bg-blue-600 text-white border-blue-400";

    if (playerCounters) {
      desc = "PLAYER ADVANTAGE! Your protocol counters the enemy!";
      className = "bg-green-600 text-white border-green-400";
    } else if (enemyCounters) {
      desc = "ENEMY ADVANTAGE! Enemy protocol counters you!";
      className = "bg-red-600 text-white border-red-400";
    }

    toast({
      title: `${title}: ${playerProtocol.name} vs ${selectedEnemyProtocol.name}`,
      description: desc,
      className: className,
      duration: 3000
    });

    // Merge slotLevels into playerBot for correct stat calculation during battle
    const playerBotWithStats = {
      ...gameState.playerBot,
      slotLevels: gameState.slotLevels
    };

    // 3. Simulate with Protocols
    const result = simulateBattle(playerBotWithStats, enemy, playerProtocol, selectedEnemyProtocol);
    
    // Simulation Loop
    for (let i = 0; i < result.battleLog.length; i++) {
      const logEntry = result.battleLog[i];
      
      if (logEntry.includes('Round')) {
        const roundMatch = logEntry.match(/Round (\d+)/);
        if (roundMatch) setCurrentRound(parseInt(roundMatch[1]));
      }
      
    // Sound effects and Animations based on log content
      const isPlayerAction = logEntry.includes(gameState.playerBot.name);
      const isEnemyAction = logEntry.includes(enemy.name);
      const isHit = logEntry.includes('damage') || logEntry.includes('CRITICAL');

      if (logEntry.includes('CRITICAL')) {
        playSound('CRIT');
        
        if (isPlayerAction) {
           setRightToast(getRandomFlavor('HIT'));
           setPlayerAttacking(true);
           setTimeout(() => setPlayerAttacking(false), 400 / battleSpeedRef.current);
        } else if (isEnemyAction) {
           setLeftToast(getRandomFlavor('HIT'));
           setEnemyAttacking(true);
           setTimeout(() => setEnemyAttacking(false), 400 / battleSpeedRef.current);
        }

      } else if (logEntry.includes('damage')) {
        playSound('HIT');

        if (isPlayerAction) {
          setPlayerAttacking(true);
          setTimeout(() => setPlayerAttacking(false), 400 / battleSpeedRef.current);
        } else if (isEnemyAction) {
          setEnemyAttacking(true);
          setTimeout(() => setEnemyAttacking(false), 400 / battleSpeedRef.current);
        }
      }

      // Updated delay logic with battle speed multiplier
      await new Promise(resolve => setTimeout(resolve, 800 / battleSpeedRef.current));
      
      setBattleLog(prev => [...prev, logEntry]);
      
      if (result.criticalHits.includes(Math.floor(i / 4) + 1)) {
        controls.start({
          x: [0, -5, 5, -5, 5, 0],
          transition: { duration: 0.2 }
        });
      }
      
      if (i > 2 && i < result.battleLog.length - 2) {
        const progress = i / (result.battleLog.length - 4);
        setPlayerHealth(BASE_HEALTH - (BASE_HEALTH - result.finalHealthA) * progress);
        setEnemyHealth(BASE_HEALTH - (BASE_HEALTH - result.finalHealthB) * progress);
      }
    }
    
    setPlayerHealth(result.finalHealthA);
    setEnemyHealth(result.finalHealthB);
    
    const playerWon = result.winner.name === gameState.playerBot.name;
    const reward = playerWon ? WIN_REWARD : LOSS_REWARD;
    
    // Victory/Defeat Flavor Text
    if (playerWon) {
      setLeftToast(getRandomFlavor('VICTORY'));
      setRightToast(getRandomFlavor('DEFEAT'));
    } else {
      setLeftToast(getRandomFlavor('DEFEAT'));
      setRightToast(getRandomFlavor('VICTORY'));
    }

    updateScrap(reward);
    recordBattle({
      playerWon,
      enemyName: enemy.name,
      scrapEarned: reward,
      timestamp: Date.now()
    });
    
    setBattleResult({
      playerWon,
      reward
    });
    
    setIsBattling(false);
    
    if (playerWon) {
      setPendingRewards({ scrap: reward });
      // Apply speed multiplier to post-battle modal delay as well
      setTimeout(() => {
        setShowScavengeModal(true);
      }, 2000 / battleSpeedRef.current); 
    } else {
      toast({
        title: "💀 Defeat",
        description: `You earned ${reward} scrap as consolation`,
        className: "bg-red-600 text-white"
      });
    }
  };

  const handleNextBattle = () => {
    generateNewEnemy();
  };

  const handleReturnToWorkshop = () => {
    setShowScavengeModal(false);
    navigate('/workshop');
  };
  
  if (!enemy) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <RefreshCw className="w-8 h-8 animate-spin mr-2" /> Initializing Arena...
    </div>;
  }
  
return (
        <>
            <Helmet>
                <title>Battle Arena - Robot Battle Arena</title>
                <meta name="description" content="Enter the battle arena and fight against enemy bots to earn scrap." />
            </Helmet>

            <div
                className="h-screen max-h-screen bg-cover bg-center relative flex flex-col overflow-hidden"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1579803815615-1203fb5a2e9d)',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="absolute inset-0 bg-gray-900/90" />

                <BattleHeader
                    playerHealth={playerHealth}
                    enemyHealth={enemyHealth}
                    maxHealth={BASE_HEALTH}
                    round={currentRound}
                />

                <motion.div
                    animate={controls}
                    className="relative w-full max-w-[1600px] mx-auto px-6 pb-4 flex-1 flex flex-col min-h-0"
                >
                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-2 shrink-0">
                        <Button
                            onClick={() => navigate('/hub')}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.1)] h-8"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Exit Arena
                        </Button>
                        <BattleSpeedToggle speed={battleSpeed} setSpeed={setBattleSpeed} />
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full min-h-0 items-start">

                        {/* Player Column */}
                        <div className="xl:col-span-3 order-2 xl:order-1 h-full relative flex flex-col justify-start pt-2">
                            <SpeechToast message={leftToast} position="left" />
                            <BotCard
                                bot={gameState.playerBot}
                                side="player" 
  isAttacking={combatState === 'PLAYER_STRIKE'}
                                slotLevels={gameState.slotLevels}
                                className="shadow-[0_0_30px_-5px_rgba(var(--accent-rgb),0.3)] border-[var(--accent-color)]"
                            />
                            {isBattling && playerProtocol && (
                                <div className="mt-2 text-center text-xs font-bold px-2 py-1 rounded border border-[var(--accent-color)] text-[var(--accent-color)] bg-[rgba(var(--accent-rgb),0.1)]">
                                    PROTOCOL: {playerProtocol.name}
                                </div>
                            )}
                        </div>

                        {/* Combat Log Column - Center Stage */}
                        <div className="xl:col-span-6 order-1 xl:order-2 flex flex-col gap-2 h-full min-h-0">
                            {/* The Log takes all available space */}
                            <div className="flex-1 min-h-0 relative">
                                <CombatLog logs={battleLog} playerName={gameState.playerBot.name} />
                            </div>

                            {/* Controls Area */}
                            <div className="flex flex-col gap-2 justify-center mt-auto pt-2 shrink-0">
                                
                                {/* MOVED: Defeated Banner is now IN FLOW here, not absolute */}
                                {battleResult && !battleResult.playerWon && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full p-6 rounded-xl border-4 backdrop-blur-xl text-center shadow-2xl bg-red-900/90 border-red-500 text-red-100 mb-2"
                                    >
                                        <h2 className="text-5xl font-black mb-1 uppercase tracking-tighter">
                                            DEFEATED
                                        </h2>
                                        <p className="text-xl">
                                            Consolation: <span className="text-yellow-400 font-mono font-bold">{battleResult.reward}</span> Scrap
                                        </p>
                                    </motion.div>
                                )}

                                {!battleResult ? (
                                    <>
                                        <ProtocolSelector
                                            selectedProtocol={playerProtocol}
                                            onSelectProtocol={setPlayerProtocol}
                                            disabled={isBattling}
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                onClick={handleReroll}
                                                disabled={isBattling || gameState.scrap < REROLL_COST}
                                                className="bg-yellow-900/20 border border-yellow-600/50 text-yellow-500 hover:bg-yellow-600/20 hover:text-yellow-400 py-3 font-mono uppercase tracking-widest"
                                            >
                                                <span className="flex items-center gap-2 font-bold text-xs">
                                                    <Scan className="w-3 h-3" /> Scout ({REROLL_COST})
                                                </span>
                                            </Button>

                                            <Button
                                                onClick={startBattle}
                                                disabled={isBattling || !playerProtocol}
                                                // CHANGED: Dynamic Theme Gradient
                                                style={!isBattling && playerProtocol ? {
                                                    background: `linear-gradient(135deg, rgba(var(--accent-rgb), 1) 0%, rgba(var(--accent-rgb), 0.6) 100%)`,
                                                    boxShadow: `0 0 20px rgba(var(--accent-rgb), 0.4)`
                                                } : {}}
                                                className={`text-black text-lg py-3 font-bold tracking-widest uppercase shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${!playerProtocol
                                                    ? 'bg-gray-700 text-gray-500'
                                                    : ''
                                                    }`}
                                            >
                                                {isBattling ? (
                                                    <span className="text-[var(--accent-color)] flex items-center gap-2">
                                                         <RefreshCw className="w-5 h-5 animate-spin" /> BATTLE IN PROGRESS
                                                    </span>
                                                ) : !playerProtocol ? (
                                                    <span className="text-gray-400 text-sm">Select Protocol</span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-sm">
                                                        <Play className="w-4 h-4 fill-current" /> ENGAGE
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex gap-2 w-full">
                                        <Button
                                            onClick={() => navigate('/hub')}
                                            className="flex-1 bg-gray-700 hover:bg-gray-600 py-4 text-lg"
                                        >
                                            Hub
                                        </Button>
                                        {!battleResult.playerWon && (
                                            <Button
                                                onClick={generateNewEnemy}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 py-4 text-lg font-bold"
                                            >
                                                Retry
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enemy Column */}
                        <div className="xl:col-span-3 order-3 xl:order-3 h-full relative flex flex-col justify-start pt-2">
                            <SpeechToast message={rightToast} position="right" />
                            <BotCard bot={enemy} side="enemy" 
  isAttacking={combatState === 'ENEMY_STRIKE'} className="shadow-red-900/20 shadow-xl border-red-900/30" />
                            {isBattling && enemyProtocol && (
                                <div className="mt-2 text-center text-xs font-bold px-2 py-1 rounded border border-red-500 text-red-500 bg-red-900/20">
                                    PROTOCOL: {enemyProtocol.name}
                                </div>
                            )}
                        </div>

                    </div>
                </motion.div>

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
};

export default Battle;
