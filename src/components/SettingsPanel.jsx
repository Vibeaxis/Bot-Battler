
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Monitor, Sun, Settings } from 'lucide-react';
import { useSettingsContext } from '@/context/SettingsContext';
import { useSoundContext } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const SettingsPanel = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, updateSetting } = useSettingsContext();
  const { setMasterVolume } = useSoundContext();

  // Sync volume with SoundContext whenever settings.volume changes
  useEffect(() => {
    setMasterVolume(settings.volume / 100);
  }, [settings.volume, setMasterVolume]);

  const handleVolumeChange = (value) => {
    updateSetting('volume', value[0]);
  };

  const handleGammaChange = (value) => {
    updateSetting('gamma', value[0]);
  };

  const handleScaleChange = (e) => {
    updateSetting('uiScale', parseInt(e.target.value));
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           {/* Click outside to close */}
          <div 
            className="absolute inset-0" 
            onClick={() => setIsSettingsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md bg-[#0a0a12] border border-[var(--accent-color)] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 z-[10001]"
          >
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
              <h2 className="text-2xl font-bold text-[var(--accent-color)] uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-6 h-6" /> System Config
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(false)}
                className="hover:bg-red-900/20 hover:text-red-500 rounded-none -mr-2"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-8 font-mono">
              
              {/* Volume */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <label className="flex items-center gap-2 text-gray-400 uppercase tracking-wider text-sm">
                     <Volume2 className="w-4 h-4" /> Master Volume
                   </label>
                   <span className="text-[var(--accent-color)] font-bold">{settings.volume}%</span>
                </div>
                <Slider 
                  value={[settings.volume]} 
                  max={100} 
                  step={1} 
                  onValueChange={handleVolumeChange}
                  className="[&_.relative]:bg-gray-800 [&_[role=slider]]:bg-[var(--accent-color)] [&_[role=slider]]:border-black"
                />
              </div>

              {/* Gamma */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <label className="flex items-center gap-2 text-gray-400 uppercase tracking-wider text-sm">
                     <Sun className="w-4 h-4" /> Gamma Correction
                   </label>
                   <span className="text-[var(--accent-color)] font-bold">{settings.gamma.toFixed(1)}</span>
                </div>
                <Slider 
                  value={[settings.gamma]} 
                  min={0.5}
                  max={2.0} 
                  step={0.1} 
                  onValueChange={handleGammaChange}
                  className="[&_.relative]:bg-gray-800 [&_[role=slider]]:bg-[var(--accent-color)] [&_[role=slider]]:border-black"
                />
              </div>

              {/* UI Scale */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <label className="flex items-center gap-2 text-gray-400 uppercase tracking-wider text-sm">
                     <Monitor className="w-4 h-4" /> UI Scaling
                   </label>
                   <span className="text-[var(--accent-color)] font-bold">{settings.uiScale}%</span>
                </div>
                <select 
                  value={settings.uiScale}
                  onChange={handleScaleChange}
                  className="w-full bg-black border border-gray-700 text-gray-200 p-2 rounded-none focus:border-[var(--accent-color)] focus:outline-none uppercase tracking-wide"
                >
                   <option value={80}>80% (Compact)</option>
                   <option value={90}>90% (Small)</option>
                   <option value={100}>100% (Standard)</option>
                   <option value={110}>110% (Large)</option>
                   <option value={120}>120% (Extra Large)</option>
                </select>
              </div>

            </div>

            <div className="mt-8 pt-4 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-600 uppercase tracking-widest">
                Changes saved automatically
              </p>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
