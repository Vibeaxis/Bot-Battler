
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
      
      // Sound effects based on log content
      if (logEntry.includes('CRITICAL')) {
        playSound('CRIT');
        
        const isPlayerCrit = logEntry.includes(gameState.playerBot.name) && logEntry.includes('CRITICAL');
        const isEnemyCrit = logEntry.includes(enemy.name) && logEntry.includes('CRITICAL');

        if (isPlayerCrit) {
           setRightToast(getRandomFlavor('HIT'));
        } else if (isEnemyCrit) {
           setLeftToast(getRandomFlavor('HIT'));
        }

      } else if (logEntry.includes('damage')) {
        playSound('HIT');
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
                className="min-h-screen bg-cover bg-center relative flex flex-col"
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
                    className="relative w-full max-w-[1600px] mx-auto px-6 pb-8 flex-1 flex flex-col"
                >
                    <div className="flex justify-between items-center mb-4">
                        <Button
                            onClick={() => navigate('/hub')}
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Exit Arena
                        </Button>
                        <BattleSpeedToggle speed={battleSpeed} setSpeed={setBattleSpeed} />
                    </div>

                    {/* 12-column grid layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full min-h-[600px]">

                        {/* Player Column (Takes 3/12 = 25%) */}
                        <div className="xl:col-span-3 order-2 xl:order-1 h-full relative">
                            <SpeechToast message={leftToast} position="left" />
                            <BotCard
                                bot={gameState.playerBot}
                                slotLevels={gameState.slotLevels}
                                className="shadow-blue-900/20 shadow-xl"
                            />
                            {/* Player Protocol Status */}
                            {isBattling && playerProtocol && (
                                <div className={`mt-2 text-center text-xs font-bold px-2 py-1 rounded border ${playerProtocol.twColor} ${playerProtocol.twBorder} bg-black/50`}>
                                    PROTOCOL: {playerProtocol.name}
                                </div>
                            )}
                        </div>

                        {/* Combat Log Column (Takes 6/12 = 50%) */}
                        <div className="xl:col-span-6 order-1 xl:order-2 flex flex-col gap-4 h-full">
                            <CombatLog logs={battleLog} playerName={gameState.playerBot.name} />

                            <div className="flex flex-col gap-3 justify-center mt-auto py-4">
                                {!battleResult ? (
                                    <>
                                        <ProtocolSelector
                                            selectedProtocol={playerProtocol}
                                            onSelectProtocol={setPlayerProtocol}
                                            disabled={isBattling}
                                        />

                                        <Button
                                            onClick={handleReroll}
                                            disabled={isBattling || gameState.scrap < REROLL_COST}
                                            className="w-full bg-yellow-900/20 border border-yellow-600/50 text-yellow-500 hover:bg-yellow-600/20 hover:text-yellow-400 py-4 font-mono uppercase tracking-widest mb-2"
                                        >
                                            <span className="flex items-center gap-2 font-bold text-xs">
                                                <Scan className="w-3 h-3" /> Scout New Target ({REROLL_COST} Scrap)
                                            </span>
                                        </Button>

                                        <Button
                                            onClick={startBattle}
                                            disabled={isBattling || !playerProtocol}
                                            className={`w-full text-white text-lg py-8 font-bold tracking-widest uppercase shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${!playerProtocol
                                                    ? 'bg-gray-700'
                                                    : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                                                }`}
                                        >
                                            {isBattling ? (
                                                <span className="flex items-center gap-2">
                                                    <RefreshCw className="w-5 h-5 animate-spin" /> Battle in Progress
                                                </span>
                                            ) : !playerProtocol ? (
                                                <span className="flex items-center gap-2 text-gray-400">
                                                    Select Protocol First
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Play className="w-6 h-6 fill-current" /> ENGAGE
                                                </span>
                                            )}
                                        </Button>
                                    </>
                                ) : (
                                    <div className="flex gap-4 w-full">
                                        <Button
                                            onClick={() => navigate('/hub')}
                                            className="flex-1 bg-gray-700 hover:bg-gray-600 py-6 text-lg"
                                        >
                                            Return to Hub
                                        </Button>
                                        {!battleResult.playerWon && (
                                            <Button
                                                onClick={generateNewEnemy}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 py-6 text-lg font-bold"
                                            >
                                                Try Again
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enemy Column (Takes 3/12 = 25%) */}
                        <div className="xl:col-span-3 order-3 xl:order-3 h-full relative">
                            <SpeechToast message={rightToast} position="right" />
                            <BotCard bot={enemy} className="shadow-red-900/20 shadow-xl border-red-900/30" />
                            {/* Enemy Protocol Status */}
                            {isBattling && enemyProtocol && (
                                <div className={`mt-2 text-center text-xs font-bold px-2 py-1 rounded border ${enemyProtocol.twColor} ${enemyProtocol.twBorder} bg-black/50`}>
                                    PROTOCOL: {enemyProtocol.name}
                                </div>
                            )}
                        </div>

                    </div>

                    {battleResult && !battleResult.playerWon && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 rounded-2xl border-4 backdrop-blur-xl z-50 text-center shadow-2xl bg-red-900/80 border-red-500 text-red-100"
                        >
                            <h2 className="text-6xl font-black mb-2 uppercase tracking-tighter">
                                DEFEATED
                            </h2>
                            <p className="text-2xl">
                                Consolation: <span className="text-yellow-400 font-mono font-bold">{battleResult.reward}</span> Scrap
                            </p>
                        </motion.div>
                    )}

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
