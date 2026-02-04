import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const TypewriterText = ({ text }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.1 },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.span variants={container} initial="hidden" animate="visible">
      {text.split("").map((char, index) => (
        <motion.span key={index} variants={child}>
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const SpeechToast = ({ message, position = 'left', className }) => {
  // Alignment: Left card speaks to the right, Right card speaks to the left
  // But strictly visual: Left card aligns its box left, Right aligns right
  const alignmentClasses = position === 'left' 
    ? "left-0 origin-bottom-left" 
    : "right-0 origin-bottom-right";

  const tailClasses = position === 'left'
    ? "left-8 border-l-[0px] border-r-[20px] border-t-[20px] border-r-transparent"
    : "right-8 border-r-[0px] border-l-[20px] border-t-[20px] border-l-transparent";

  return (
    <AnimatePresence mode='wait'>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
          className={cn(
            "absolute z-30 bottom-[110%] mb-2", // Push up higher
            // WIDTH FIX: Allow it to be wider (up to 400px), but fit content otherwise
            "w-max max-w-[300px] md:max-w-[450px]", 
            alignmentClasses,
            className
          )}
        >
          <div className="relative bg-black/90 backdrop-blur-xl border border-[var(--accent-color)] p-5 shadow-[0_5px_30px_rgba(0,0,0,0.8)]">
            
            {/* Top Decoration Line */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-[var(--accent-color)] opacity-70" />

            {/* Content */}
            <div className="flex gap-3">
               {/* Giant Quotation Mark */}
               <span className="text-4xl leading-none text-[var(--accent-color)] opacity-30 font-serif select-none">
                  “
               </span>
               
               <div className="font-mono text-sm md:text-base font-bold text-[var(--accent-color)] leading-snug pt-1">
                  <TypewriterText text={message} />
               </div>

               {/* Closing Quote (Optional, creates balance) */}
               <span className="text-4xl leading-none text-[var(--accent-color)] opacity-30 font-serif select-none self-end rotate-180">
                  “
               </span>
            </div>

            {/* Tail */}
            <div 
              className={cn(
                "absolute w-0 h-0 border-t-[var(--accent-color)] bottom-[-20px] drop-shadow-md",
                tailClasses
              )}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpeechToast;