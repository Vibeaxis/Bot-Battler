import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Swords, Trophy, Globe, Shield, RefreshCw, Crown, TrendingUp } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import BotCard from '@/components/BotCard';
import ScreenBackground from '@/components/ScreenBackground';
import arenaBg from '@/assets/neon_bg.jpg'; // Reusing neon bg or add a new one

// --- FAKE GAMERTAG GENERATOR ---
const GAMERTAGS = [
  "Shadow_Viper", "Null_Pointer", "Cyber_Chad", "Glitch_Witch", "Iron_Lotus", 
  "System_Shock", "Rust_Bucket_99", "Neon_Ninja", "Error_404", "Data_Mage",
  "Pixel_Crusher", "Void_Walker", "Mecha_Godzilla", "Scrap_King", "Binary_Beast"
];

const generateOpponent = (playerLevel) => {
  // 1. Create a base enemy (using your existing logic)
  // We vary the level slightly (-1 to +2 of player) to create "Matchmaking" feel
  const levelOffset = Math.floor(Math.random() * 4) - 1; 
  const targetLevel = Math.max(1, playerLevel + levelOffset);
  
  // Use a random rarity spread based on rank (simulated)
  const rarities = ['common', 'uncommon', 'rare', 'epic'];
  const rarity = rarities[Math.floor(Math.random() * Math.min(rarities.length, Math.ceil(targetLevel / 2)))];

  const baseBot = generateGauntletEnemy(rarity, targetLevel, { level: playerLevel });

  // 2. "Humanize" the bot
  const fakeName = GAMERTAGS[Math.floor(Math.random() * GAMERTAGS.length)];
  const fakeTag = Math.floor(Math.random() * 9999);
  
  return {
    ...baseBot,
    name: `${fakeName}#${fakeTag}`, // Looks like a Discord/Battlenet tag
    isPlayer: true, // trick the card into thinking it's a player (for styling)
    winRate: (45 + Math.random() * 30).toFixed(1), // Fake winrate 45-75%
    rankPoints: 1000 + (targetLevel * 50) + Math.floor(Math.random() * 100)
  };
};

const ArenaScreen = () => {
  const navigate = useNavigate();
  const { gameState, startArenaBattle } = useGameContext(); // You'll need to add startArenaBattle
  const { playSound } = useSoundContext();
  const [opponents, setOpponents] = useState([]);
  const [refreshTimer, setRefreshTimer] = useState(0);

  // --- MOCK RANKING DATA ---
  // In a real app, this comes from DB. Here we derive it from player stats.
  const playerRankScore = 1200 + (gameState.playerBot.level * 100) + (gameState.totalWins * 10);
  const playerLeague = getLeague(playerRankScore);

  // Load Opponents on Mount
  useEffect(() => {
    refreshOpponents();
  }, []);

  const refreshOpponents = () => {
    const newOps = [
      generateOpponent(gameState.playerBot.level),
      generateOpponent(gameState.playerBot.level),
      generateOpponent(gameState.playerBot.level)
    ];
    setOpponents(newOps);
    setRefreshTimer(300); // 5 minutes (mock)
  };

  const handleBattle = (opponent) => {
    playSound('FUSE');
    // We pass 'arena' mode so the BattleScreen knows to save Async Rank points on win
    navigate('/battle', { state: { enemy: opponent, mode: 'arena' } });
  };

  return (
    <>
      <Helmet>
        <title>Arena League - PVP</title>
      </Helmet>

      <ScreenBackground image={arenaBg} opacity={0.3} />

      <div className="min-h-screen relative z-10 flex flex-col font-mono text-white overflow-hidden">
        
        {/* --- HEADER --- */}
        <div className="p-6 flex justify-between items-center bg-black/60 border-b border-cyan-900/50 backdrop-blur-md">
            <Button variant="ghost" onClick={() => navigate('/hub')} className="text-cyan-500 hover:text-cyan-400">
                &lt; BACK TO HUB
            </Button>
            <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-cyan-500 animate-pulse" />
                <span className="text-cyan-500 font-bold tracking-[0.2em] uppercase">Global Network Online</span>
            </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
            
            {/* --- LEFT: PLAYER RANK CARD --- */}
            <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full md:w-1/4 bg-[#0a0a12] border border-cyan-500/30 p-6 flex flex-col gap-6 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-2 opacity-20"><Trophy className="w-32 h-32" /></div>
                
                <div>
                    <h3 className="text-gray-500 text-xs uppercase tracking-widest mb-1">Current Standing</h3>
                    <h1 className="text-4xl font-black italic text-cyan-400 uppercase">{playerLeague}</h1>
                    <div className="text-2xl font-bold text-white mt-1">{playerRankScore} <span className="text-xs text-gray-500 font-normal">RP</span></div>
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-800">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Global Rank</span>
                        <span className="font-bold">#{(10000 - playerRankScore / 10).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Season Wins</span>
                        <span className="font-bold text-green-400">{gameState.totalWins}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Win Rate</span>
                        <span className="font-bold text-yellow-400">
                           {((gameState.totalWins / (gameState.totalBattles || 1)) * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded text-center">
                        <span className="text-xs text-cyan-400 uppercase tracking-widest block mb-1">Season Ends In</span>
                        <span className="font-mono font-bold text-lg">12D : 04H : 33M</span>
                    </div>
                </div>
            </motion.div>

            {/* --- RIGHT: OPPONENT SELECTION --- */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-3">
                        <Swords className="w-6 h-6 text-red-500" /> AVAILABLE MATCHES
                    </h2>
                    <Button variant="outline" size="sm" onClick={refreshOpponents} className="border-cyan-900 text-cyan-500 hover:bg-cyan-900/20">
                        <RefreshCw className="w-4 h-4 mr-2" /> REFRESH LIST
                    </Button>
                </div>

                {/* THE MATCHUP GRID */}
                <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 pr-2 custom-scrollbar">
                    {opponents.map((bot, i) => (
                        <motion.div
                            key={bot.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative group bg-black/40 border border-gray-800 hover:border-cyan-500/50 transition-all flex flex-col"
                        >
                            {/* HEADER */}
                            <div className="p-4 bg-black/60 border-b border-gray-800 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Opponent</span>
                                    <span className="text-sm font-bold text-white">{bot.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs text-gray-500">Rank</span>
                                    <span className="text-sm font-mono text-cyan-400">{bot.rankPoints}</span>
                                </div>
                            </div>

                            {/* BOT PREVIEW (Scaled down slightly to fit) */}
                            <div className="flex-1 relative overflow-hidden p-4 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/20 to-transparent">
                                <div className="scale-75 origin-center">
                                    <BotCard 
                                        bot={bot} 
                                        currentHealth={bot.health} 
                                        maxHealth={bot.health} 
                                        hideLoadout // Optional: hide parts list to keep it clean?
                                        side="enemy"
                                        className="shadow-none border-none bg-transparent"
                                    />
                                </div>
                            </div>

                            {/* FOOTER / STATS */}
                            <div className="p-4 border-t border-gray-800 bg-black/40 space-y-3">
                                <div className="flex justify-between text-xs font-mono text-gray-400">
                                    <span>WIN RATE</span>
                                    <span className="text-white">{bot.winRate}%</span>
                                </div>
                                <div className="flex justify-between text-xs font-mono text-gray-400">
                                    <span>POWER RATING</span>
                                    <span className="text-red-400">{calculatePower(bot)}</span>
                                </div>
                                
                                <Button 
                                    className="w-full mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest"
                                    onClick={() => handleBattle(bot)}
                                >
                                    CHALLENGE
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

// Helper for League Names
const getLeague = (score) => {
    if (score < 1500) return "BRONZE DIVISION";
    if (score < 2000) return "SILVER DIVISION";
    if (score < 2500) return "GOLD DIVISION";
    if (score < 3000) return "PLATINUM DIVISION";
    return "DIAMOND DIVISION";
};

// Helper for simple power rating
const calculatePower = (bot) => {
    const stats = bot.baseStats || {};
    return (stats.Damage || 0) + (stats.Speed || 0) + (stats.Armor || 0) * 2; 
};

export default ArenaScreen;