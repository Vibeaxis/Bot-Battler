
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Package, Sword, ArrowLeft } from 'lucide-react';
import BotCard from './BotCard';
import { RARITY_COLORS } from '@/constants/gameConstants';
import RarityBadge from './RarityBadge';
import { getPartById } from '@/data/parts';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

const IconMap = { ...LucideIcons };

const LootCard = ({ icon: DefaultIcon, name, quantity, tier = 1, delay, partId }) => {
  const colors = RARITY_COLORS[tier];
  // If it's a part, get its real icon
  const part = partId ? getPartById(partId) : null;
  const Icon = part ? (IconMap[part.icon] || DefaultIcon) : DefaultIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "p-4 rounded-xl flex flex-col items-center text-center gap-2 backdrop-blur-sm transition-all border",
        colors.bgTint,
        colors.border,
        tier >= 3 ? colors.glow : ''
      )}
    >
      <div className={cn("p-3 rounded-full border", colors.bg, "bg-opacity-20", colors.border)}>
        <Icon className={cn("w-8 h-8", colors.text)} />
      </div>
      <div>
        <h4 className={cn("font-bold text-sm", colors.text)}>{name}</h4>
        {partId ? (
           <RarityBadge tier={tier} className="mt-1" />
        ) : (
           <p className="text-xs text-gray-400 font-mono mt-1">x{quantity}</p>
        )}
      </div>
    </motion.div>
  );
};

const ScavengeModal = ({ isOpen, onNextBattle, onReturn, enemy, rewards }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative z-10 bg-gray-950 border border-gray-800 rounded-2xl max-w-4xl w-full p-8 shadow-2xl overflow-hidden"
        >
           {/* Victory Burst Background */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            
            {/* Left: Defeated Enemy */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: [-5, 5, -3, 3, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-sm opacity-70 grayscale relative"
              >
                <div className="absolute inset-0 flex items-center justify-center z-20">
                   <motion.div 
                     initial={{ scale: 0, rotate: -45 }}
                     animate={{ scale: 1, rotate: -12 }}
                     transition={{ delay: 0.5, type: "spring" }}
                     className="bg-red-600 text-white font-black text-3xl px-6 py-2 rounded border-4 border-white shadow-lg uppercase tracking-widest transform -rotate-12"
                   >
                     Destroyed
                   </motion.div>
                </div>
                <BotCard bot={enemy} className="pointer-events-none" />
              </motion.div>
            </div>

            {/* Right: Loot */}
            <div className="flex flex-col gap-6">
              <div className="text-center md:text-left">
                <motion.h2 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-black text-white italic uppercase mb-2"
                >
                  Victory!
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-400"
                >
                  Enemy neutralized. Scavenging salvageable parts...
                </motion.p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <LootCard 
                  icon={Package} 
                  name="Scrap Metal" 
                  quantity={rewards.scrap} 
                  tier={1}
                  delay={0.2} 
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3 mt-4"
              >
                <Button 
                  onClick={onNextBattle}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-6 text-lg tracking-wider uppercase shadow-lg shadow-orange-900/20 transform transition-transform hover:scale-[1.02]"
                >
                  <Sword className="w-6 h-6 mr-2" />
                  Next Battle
                </Button>
                
                <Button 
                  onClick={onReturn}
                  variant="outline"
                  className="w-full border-gray-700 hover:bg-gray-800 text-gray-300 font-bold py-6 text-base tracking-wider uppercase"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Workshop
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScavengeModal;
