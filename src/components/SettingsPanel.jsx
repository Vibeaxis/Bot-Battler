import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Monitor, Sun, Settings, HardDrive, Trash2, Palette, Eye, Layout } from 'lucide-react';
import { useSettingsContext } from '@/context/SettingsContext';
import { useSoundContext } from '@/context/SoundContext';
import { useGameContext } from '@/context/GameContext'; // Need this for Theme & Reset
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { THEMES } from '@/context/GameContext'; // Import your themes
import { cn } from '@/lib/utils';

// --- SUB-COMPONENTS ---
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-6 py-4 w-full text-left transition-all border-l-4",
      active 
        ? "bg-white/5 border-[var(--accent-color)] text-white" 
        : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-[var(--accent-color)]" : "text-gray-600")} />
    <span className="font-mono uppercase tracking-widest text-sm font-bold">{label}</span>
  </button>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-800">
    <Icon className="w-5 h-5 text-[var(--accent-color)]" />
    <h3 className="text-lg font-bold text-white uppercase tracking-widest">{title}</h3>
  </div>
);

const SettingsPanel = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, updateSetting } = useSettingsContext();
  const { setMasterVolume, playSound } = useSoundContext();
  const { gameState, setTheme, resetSave } = useGameContext(); // You need to expose resetSave in GameContext
  const [activeTab, setActiveTab] = useState('audio');

  // Sync volume with SoundContext
  useEffect(() => {
    setMasterVolume(settings.volume / 100);
  }, [settings.volume, setMasterVolume]);

  const handleReset = () => {
      if (window.confirm("CRITICAL WARNING: This will wipe all progress, unlocked items, and bots. This cannot be undone. Confirm factory reset?")) {
          resetSave(); 
          window.location.reload(); // Force reload to clear state cleanly
      }
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setIsSettingsOpen(false)} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl h-[600px] flex bg-[#0a0a12] border border-gray-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[10001] overflow-hidden rounded-lg"
          >
            {/* --- LEFT SIDEBAR: TABS --- */}
            <div className="w-64 bg-black/50 border-r border-gray-800 flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-black italic tracking-tighter text-white flex items-center gap-2">
                        <Settings className="w-6 h-6 text-[var(--accent-color)] animate-spin-slow" />
                        CONFIG
                    </h2>
                </div>
                
                <div className="flex-1 py-4 space-y-1">
                    <TabButton 
                        active={activeTab === 'audio'} 
                        onClick={() => setActiveTab('audio')} 
                        icon={Volume2} 
                        label="Audio" 
                    />
                    <TabButton 
                        active={activeTab === 'video'} 
                        onClick={() => setActiveTab('video')} 
                        icon={Monitor} 
                        label="Display" 
                    />
                    <TabButton 
                        active={activeTab === 'theme'} 
                        onClick={() => setActiveTab('theme')} 
                        icon={Palette} 
                        label="Interface" 
                    />
                    <TabButton 
                        active={activeTab === 'data'} 
                        onClick={() => setActiveTab('data')} 
                        icon={HardDrive} 
                        label="System Data" 
                    />
                </div>

                <div className="p-4 border-t border-gray-800">
                    <Button 
                        onClick={() => setIsSettingsOpen(false)} 
                        className="w-full bg-[var(--accent-color)] text-black font-bold uppercase tracking-widest hover:bg-white"
                    >
                        Close Panel
                    </Button>
                </div>
            </div>

            {/* --- RIGHT CONTENT AREA --- */}
            <div className="flex-1 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900/40 via-[#0a0a12] to-[#0a0a12] p-8 overflow-y-auto custom-scrollbar">
                
                {/* AUDIO TAB */}
                {activeTab === 'audio' && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <SectionHeader icon={Volume2} title="Audio Configuration" />
                        
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-gray-400 font-mono text-sm uppercase">Master Volume</label>
                                    <span className="text-[var(--accent-color)] font-mono font-bold">{settings.volume}%</span>
                                </div>
                                <Slider 
                                    value={[settings.volume]} max={100} step={1} 
                                    onValueChange={(v) => updateSetting('volume', v[0])}
                                    className="py-4"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* VIDEO TAB */}
                {activeTab === 'video' && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <SectionHeader icon={Monitor} title="Display Settings" />
                        
                        {/* UI Scale */}
                        <div className="space-y-2">
                             <label className="flex items-center gap-2 text-gray-400 font-mono text-sm uppercase">
                                <Layout className="w-4 h-4" /> UI Scaling
                             </label>
                             <div className="grid grid-cols-3 gap-2">
                                {[80, 90, 100, 110, 120].map((scale) => (
                                    <button
                                        key={scale}
                                        onClick={() => updateSetting('uiScale', scale)}
                                        className={cn(
                                            "p-3 border text-sm font-mono font-bold transition-all",
                                            settings.uiScale === scale 
                                                ? "bg-[var(--accent-color)] text-black border-[var(--accent-color)]" 
                                                : "bg-black border-gray-800 text-gray-500 hover:border-gray-600"
                                        )}
                                    >
                                        {scale}%
                                    </button>
                                ))}
                             </div>
                        </div>

                        {/* Gamma */}
                        <div className="space-y-4 pt-4 border-t border-gray-800/50">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 text-gray-400 font-mono text-sm uppercase">
                                    <Sun className="w-4 h-4" /> Gamma Correction
                                </label>
                                <span className="text-[var(--accent-color)] font-mono font-bold">{settings.gamma.toFixed(1)}</span>
                            </div>
                            <Slider 
                                value={[settings.gamma]} min={0.5} max={2.0} step={0.1}
                                onValueChange={(v) => updateSetting('gamma', v[0])}
                                className="py-2"
                            />
                             <p className="text-xs text-gray-600 font-mono">Adjusts brightness of in-game elements.</p>
                        </div>
                    </motion.div>
                )}

                {/* THEME TAB (Moved from Hub) */}
                {activeTab === 'theme' && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <SectionHeader icon={Palette} title="Interface Theme" />
                        
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(THEMES).map(([name, theme]) => {
                                const isUnlocked = gameState.unlockedThemes.includes(name);
                                const isActive = gameState.currentTheme === name;
                                
                                return (
                                    <button
                                        key={name}
                                        disabled={!isUnlocked}
                                        onClick={() => {
                                            playSound('CLICK');
                                            setTheme(name);
                                        }}
                                        className={cn(
                                            "relative p-4 border flex items-center justify-between overflow-hidden group transition-all",
                                            isActive ? "border-white bg-white/5" : "border-gray-800 bg-black",
                                            !isUnlocked && "opacity-50 grayscale cursor-not-allowed"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div 
                                                className="w-4 h-4 rounded-full shadow-[0_0_10px_currentColor]"
                                                style={{ backgroundColor: theme.hex, color: theme.hex }}
                                            />
                                            <span className={cn(
                                                "font-mono text-xs font-bold uppercase",
                                                isActive ? "text-white" : "text-gray-500"
                                            )}>
                                                {name}
                                            </span>
                                        </div>
                                        {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* DATA TAB */}
                {activeTab === 'data' && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <SectionHeader icon={HardDrive} title="Data Management" />
                        
                        <div className="p-6 border border-red-900/30 bg-red-900/5 rounded-sm">
                            <h4 className="text-red-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
                                <Trash2 className="w-4 h-4" /> Danger Zone
                            </h4>
                            <p className="text-gray-400 text-sm mb-6 font-mono">
                                Resetting your profile will permanently delete your rank, bots, inventory, and leaderboard status. This action cannot be undone.
                            </p>
                            <Button 
                                onClick={handleReset}
                                variant="destructive"
                                className="w-full bg-red-900/50 hover:bg-red-600 border border-red-500/50 text-red-200 font-mono uppercase tracking-widest"
                            >
                                Factory Reset Profile
                            </Button>
                        </div>

                        <div className="text-xs text-gray-600 font-mono text-center pt-8">
                            BUILD VERSION: 0.9.2 (BETA) <br/>
                            SESSION ID: {gameState.playerBot.id.substring(0, 8)}
                        </div>
                    </motion.div>
                )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;