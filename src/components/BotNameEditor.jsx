
import React, { useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Cpu, Skull, Zap, Shield, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS = ['Cpu', 'Skull', 'Zap', 'Shield', 'Bot'];
const ICON_COMPONENTS = {
  Cpu,
  Skull,
  Zap,
  Shield,
  Bot
};

const BotNameEditor = () => {
  const { gameState, updateBotName, updateBotIcon } = useGameContext();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(gameState.playerBot.name);

  const currentIconName = gameState.playerBot.icon || 'Cpu';
  const CurrentIcon = ICON_COMPONENTS[currentIconName] || ICON_COMPONENTS.Cpu;

  const handleIconCycle = () => {
    const currentIndex = ICONS.indexOf(currentIconName);
    const nextIndex = (currentIndex + 1) % ICONS.length;
    updateBotIcon(ICONS[nextIndex]);
  };

  const handleNameChange = (e) => {
    setTempName(e.target.value);
  };

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      updateBotName(tempName.trim());
    } else {
      setTempName(gameState.playerBot.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm max-w-lg mx-auto">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleIconCycle}
        className="relative group p-3 rounded-full bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/30 transition-colors"
        title="Click to change icon"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIconName}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CurrentIcon className="w-8 h-8 text-blue-400" />
          </motion.div>
        </AnimatePresence>
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Change Icon
        </span>
      </motion.button>

      <div className="flex-1 flex items-center gap-2">
        {isEditing ? (
          <div className="flex w-full gap-2">
            <Input
              value={tempName}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              onBlur={handleNameSubmit}
              autoFocus
              className="bg-gray-800 border-gray-600 text-white font-bold text-xl h-12 text-center"
              maxLength={20}
            />
            <Button onClick={handleNameSubmit} size="icon" className="h-12 w-12 shrink-0 bg-green-600 hover:bg-green-700">
               <span className="sr-only">Save</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
            <h2 className="text-3xl font-bold text-white tracking-tight truncate max-w-[200px] md:max-w-xs text-center border-b-2 border-transparent group-hover:border-gray-500 transition-colors">
              {gameState.playerBot.name}
            </h2>
            <Edit2 className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  );
};

export default BotNameEditor;
