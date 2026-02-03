
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
import CombatTextOverlay from '@/components/CombatTextOverlay';
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
  const [playerFloatingText, setPlayerFloatingText] = useState(null);
const [enemyFloatingText, setEnemyFloatingText] = useState(null);
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
  // --- THE FIXED BATTLE LOOP ---
    const startBattle = async () => {
        if (isBattling || !enemy || !playerProtocol) return;
        
        setIsBattling(true);
        setBattleResult(null); // Clear previous results
        
        // 1. Setup Enemy Protocol
        // (Assuming you have a helper for this, or just pick random)
        const protocols = ['ASSAULT', 'BULWARK', 'TECH']; // Simplified for example
        const selectedEnemyProto = { name: 'Assault Protocol', id: 'ASSAULT', statType: 'Damage' }; // Mock or use your generator
        setEnemyProtocol(selectedEnemyProto);

        // 2. Run Simulation
        // IMPORTANT: Ensure simulateBattle returns 'healthTimeline' array!
        const result = simulateBattle(
            { ...gameState.playerBot, slotLevels: gameState.slotLevels }, 
            enemy, 
            playerProtocol, 
            selectedEnemyProto
        );
        
        // 3. The Synchronized Loop
        for (let i = 0; i < result.battleLog.length; i++) {
            const logEntry = result.battleLog[i];
            
            // Round Tracking
            if (logEntry.includes('Round')) {
                const roundMatch = logEntry.match(/Round (\d+)/);
                if (roundMatch) setCurrentRound(parseInt(roundMatch[1]));
            }

            // Parse Action
            const isCrit = logEntry.includes('CRITICAL');
            const isMiss = logEntry.includes('misses') || logEntry.includes('dodges');
            const damageMatch = logEntry.match(/for (\d+) damage/);
            const damageAmount = damageMatch ? damageMatch[1] : null;

            // Identify Attacker
            const isPlayerAction = logEntry.includes(gameState.playerBot.name);
            const isEnemyAction = logEntry.includes(enemy.name);

            // ACTION TRIGGER
            if (damageAmount || isMiss) {
                if (isPlayerAction) {
                    // Player Attacks -> Enemy takes damage
                    setPlayerAttacking(true);
                    if (damageAmount) setEnemyFloatingText({ id: i, content: `-${damageAmount}`, isCrit });
                    else setEnemyFloatingText({ id: i, content: "MISS", type: 'miss' });
                    
                    if (isCrit) setRightToast(getRandomFlavor('HIT')); // Enemy reacts

                } else if (isEnemyAction) {
                    // Enemy Attacks -> Player takes damage
                    setEnemyAttacking(true);
                    if (damageAmount) setPlayerFloatingText({ id: i, content: `-${damageAmount}`, isCrit });
                    else setPlayerFloatingText({ id: i, content: "MISS", type: 'miss' });

                    if (isCrit) setLeftToast(getRandomFlavor('HIT')); // Player reacts
                }

                if (damageAmount) playSound(isCrit ? 'CRIT' : 'HIT');

                // IMPACT DELAY: Wait for animation to hit (Syncs visuals with health drop)
                await new Promise(r => setTimeout(r, 200 / battleSpeedRef.current));
            }

            // UPDATE HEALTH (After impact delay)
            // Fallback: If your sim doesn't return timeline yet, use the 'progress' math from before
            if (result.healthTimeline && result.healthTimeline[i]) {
                setPlayerHealth(result.healthTimeline[i].a);
                setEnemyHealth(result.healthTimeline[i].b);
            } else if (damageAmount) {
                // Fallback math if simulateBattle isn't updated yet
                // (It's better to update simulateBattle as discussed previously!)
            }

            // CRITICAL SHAKE
            if (isCrit) {
                controls.start({
                    x: [0, -5, 5, -5, 5, 0],
                    transition: { duration: 0.2 }
                });
            }

            // TURN RECOVERY
            // Wait before next line processing
            const delay = (damageAmount || isMiss) ? 600 : 100; // Fast for text, slow for hits
            await new Promise(r => setTimeout(r, delay / battleSpeedRef.current));

            // Reset States
            setPlayerAttacking(false);
            setEnemyAttacking(false);
            setPlayerFloatingText(null);
            setEnemyFloatingText(null);
        }

        // 4. End Battle
        const playerWon = result.winner.name === gameState.playerBot.name;
        const reward = playerWon ? WIN_REWARD : LOSS_REWARD;

        setPlayerHealth(result.finalHealthA);
        setEnemyHealth(result.finalHealthB);
        
        if (playerWon) {
            setLeftToast(getRandomFlavor('VICTORY'));
            setRightToast(getRandomFlavor('DEFEAT'));
        } else {
            setLeftToast(getRandomFlavor('DEFEAT'));
            setRightToast(getRandomFlavor('VICTORY'));
        }

        updateScrap(reward);
        recordBattle({ playerWon, enemyName: enemy.name, scrapEarned: reward, timestamp: Date.now() });
        setBattleResult({ playerWon, reward });
        setIsBattling(false);

        if (playerWon) {
            setPendingRewards({ scrap: reward });
            setTimeout(() => setShowScavengeModal(true), 1500 / battleSpeedRef.current);
        } else {
             toast({ title: "💀 Defeat", description: `You earned ${reward} scrap as consolation`, className: "bg-red-600 text-white" });
        }
    };

    const handleNextBattle = () => generateNewEnemy();
    const handleReturnToWorkshop = () => { setShowScavengeModal(false); navigate('/workshop'); };

    if (!enemy) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Arena...</div>;
return (
        <>
            <Helmet>
                <title>Arena - Bot Battler</title>
            </Helmet>

            <div className="h-screen max-h-screen bg-black flex flex-col overflow-hidden relative">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 opacity-20 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1579803815615-1203fb5a2e9d)' }}
                />

                <BattleHeader
                    playerHealth={playerHealth}
                    enemyHealth={enemyHealth}
                    maxHealth={BASE_HEALTH}
                    round={currentRound}
                />

                {/* MAIN ARENA - Added pb-48 to ensure bots never touch the footer */}
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
                            
                            <BotCard
                                bot={gameState.playerBot}
                                side="player"
                                isAttacking={playerAttacking}
                                isHit={enemyAttacking}
                                slotLevels={gameState.slotLevels}
                                className="scale-110 shadow-2xl"
                            />
                            
                            {playerProtocol && (
                                <div className="absolute -top-8 left-0 right-0 text-center">
                                    <span className="text-[10px] font-bold px-2 py-0.5 border border-[var(--accent-color)] text-[var(--accent-color)] bg-black/80 tracking-widest uppercase">
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
                            
                            <BotCard
                                bot={enemy}
                                side="enemy"
                                isAttacking={enemyAttacking}
                                isHit={playerAttacking}
                                className="scale-110 shadow-2xl border-red-500/50"
                            />

                            {enemyProtocol && (
                                <div className="absolute -top-8 left-0 right-0 text-center">
                                    <span className="text-[10px] font-bold px-2 py-0.5 border border-red-500 text-red-500 bg-black/80 tracking-widest uppercase">
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
                        
                        {/* DEFEATED MESSAGE (Overlays controls if active) */}
                        {battleResult && !battleResult.playerWon && (
                            <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center gap-6">
                                <div className="text-center">
                                    <h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter">System Failure</h2>
                                    <p className="text-gray-500 text-sm">Earned {battleResult.reward} Scrap</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={generateNewEnemy} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6">
                                        Reboot (Retry)
                                    </Button>
                                    <Button onClick={() => navigate('/hub')} variant="outline" className="border-gray-700 text-gray-400">
                                        Abort
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* LEFT: PROTOCOLS (Compact) */}
                        <div className={`flex-1 w-full md:w-auto transition-opacity duration-300 ${isBattling ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                            <div className="text-[10px] text-gray-500 font-mono mb-1 tracking-widest uppercase">Select Strategy</div>
                            {/* We wrap the selector in a scaled div to shrink it slightly */}
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
                            {/* Scout Button */}
                            <div className="flex flex-col">
                                <Button 
                                    onClick={handleReroll} 
                                    disabled={isBattling || gameState.scrap < REROLL_COST}
                                    size="lg"
                                    className="h-14 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <Scan className="w-4 h-4" />
                                        <span className="text-[10px] font-mono">SCOUT ({REROLL_COST})</span>
                                    </div>
                                </Button>
                            </div>

                            {/* ENGAGE (Big Button) */}
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
};

export default Battle;