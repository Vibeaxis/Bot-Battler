import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, User, UserCog, Bot, Zap, Skull, Crown, 
  Crosshair, Shield, Sword, Ghost, Terminal, Cpu, 
  Code, Eye, VenetianMask, Hexagon, ScanFace, 
  Fingerprint, Radio, Radar, Bug, Dna, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// --- CONFIGURATION ---
const AVATAR_ICONS = [
  { id: 'User', icon: User },
  { id: 'Bot', icon: Bot },
  { id: 'Skull', icon: Skull },
  { id: 'Zap', icon: Zap },
  { id: 'Crosshair', icon: Crosshair },
  { id: 'Shield', icon: Shield },
  { id: 'Sword', icon: Sword },
  { id: 'Ghost', icon: Ghost },
  { id: 'Crown', icon: Crown },
  { id: 'Terminal', icon: Terminal },
  { id: 'Cpu', icon: Cpu },
  { id: 'Eye', icon: Eye },
  { id: 'VenetianMask', icon: VenetianMask },
  { id: 'Hexagon', icon: Hexagon },
  { id: 'ScanFace', icon: ScanFace },
  { id: 'Fingerprint', icon: Fingerprint },
  { id: 'Radio', icon: Radio },
  { id: 'Radar', icon: Radar },
  { id: 'Bug', icon: Bug },
  { id: 'Dna', icon: Dna },
];

const AvatarSelectionModal = ({ isOpen, onClose, currentName, currentIcon, onSave }) => {
  const [name, setName] = useState(currentName || '');
  const [selectedIcon, setSelectedIcon] = useState(currentIcon || 'User');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setName(currentName || 'Operator');
      setSelectedIcon(currentIcon || 'User');
    }
  }, [isOpen, currentName, currentIcon]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, selectedIcon);
      onClose();
    }
  };

  // Helper to generate the DiceBear URL
  const getDiceBearUrl = (seed) => 
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed || 'placeholder')}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative z-10 w-full max-w-md bg-[#0a0a0a] border border-gray-800 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-black/50">
              <h2 className="text-sm font-bold text-[var(--accent-color)] uppercase tracking-widest flex items-center gap-2">
                <UserCog className="w-4 h-4" /> Edit Pilot Profile
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-6">
              
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                  Callsign / ID
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Terminal className="w-4 h-4 text-gray-600 group-focus-within:text-[var(--accent-color)] transition-colors" />
                    </div>
                    <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-black border-gray-800 focus:border-[var(--accent-color)] font-mono text-white uppercase tracking-wider h-12"
                        placeholder="ENTER NAME..."
                        maxLength={12}
                    />
                </div>
              </div>

              {/* Icon Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider flex justify-between">
                  <span>Avatar Selection</span>
                  {selectedIcon === 'DiceBear' && <span className="text-[var(--accent-color)] animate-pulse">NEURAL GENERATION ACTIVE</span>}
                </label>
                <div className="grid grid-cols-5 gap-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                  
                  {/* 1. NEURAL ID (Generative Slot) */}
                  <button
                    onClick={() => setSelectedIcon('DiceBear')}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center border transition-all duration-200 group relative overflow-hidden",
                      selectedIcon === 'DiceBear'
                        ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)]" 
                        : "bg-black border-gray-800 hover:border-purple-500"
                    )}
                    title="Generate unique avatar from name"
                  >
                     <img 
                       src={getDiceBearUrl(name)} 
                       alt="Generated" 
                       className="w-8 h-8 object-contain z-10"
                     />
                     <span className="absolute bottom-1 text-[7px] font-mono uppercase font-bold text-gray-500 group-hover:text-purple-400">Neural</span>
                     {/* Shiny background effect for the generator */}
                     <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-50" />
                     
                     {selectedIcon === 'DiceBear' && (
                        <motion.div 
                            layoutId="selected-check"
                            className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full z-20 shadow-[0_0_5px_var(--accent-color)]" 
                        />
                     )}
                  </button>

                  {/* 2. STANDARD ICONS */}
                  {AVATAR_ICONS.map(({ id, icon: Icon }) => {
                    const isSelected = selectedIcon === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedIcon(id)}
                        className={cn(
                          "aspect-square flex items-center justify-center border transition-all duration-200 group relative",
                          isSelected 
                            ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-black" 
                            : "bg-black border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        
                        {isSelected && (
                            <motion.div 
                                layoutId="selected-check"
                                className="absolute top-1 right-1 w-1.5 h-1.5 bg-black rounded-full" 
                            />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-black/50 flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="text-gray-500 hover:text-white"
              >
                CANCEL
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-[var(--accent-color)] text-black hover:bg-white font-bold uppercase tracking-wider min-w-[100px]"
              >
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AvatarSelectionModal;