
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const SpeechToast = ({ message, position = 'left', className }) => {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        className={cn(
          "absolute z-20 max-w-[200px] w-full",
          position === 'left' ? "left-4 md:left-8 top-[-80px] md:top-[-60px]" : "right-4 md:right-8 top-[-80px] md:top-[-60px]",
          className
        )}
      >
        <div className="relative bg-black border-2 border-[var(--accent-color)] text-[var(--accent-color)] p-3 font-mono text-xs md:text-sm font-bold shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]">
          {message}
          
          {/* Speech Bubble Tail */}
          <div 
            className={cn(
              "absolute w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-[var(--accent-color)] bottom-[-10px]",
              position === 'left' ? "left-4" : "right-4"
            )}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SpeechToast;
