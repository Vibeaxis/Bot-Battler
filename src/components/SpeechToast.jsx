
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Helper for the Typewriter effect
const TypewriterText = ({ text }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03, // Speed of typing
        delayChildren: 0.2,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      className="inline-block"
    >
      {text.split("").map((char, index) => (
        <motion.span key={index} variants={child}>
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const SpeechToast = ({ message, position = 'left', className }) => {
  // Determine alignment styles based on position prop
  const alignmentClasses = position === 'left' 
    ? "left-0 origin-bottom-left" 
    : "right-0 origin-bottom-right";

  const tailClasses = position === 'left'
    ? "left-6 border-l-[0px] border-r-[15px] border-t-[15px] border-r-transparent"
    : "right-6 border-r-[0px] border-l-[15px] border-t-[15px] border-l-transparent";

  return (
    <AnimatePresence mode='wait'>
      {message && (
        <motion.div
          key={message} // Key change triggers re-animation
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className={cn(
            "absolute z-30 w-full max-w-[280px]", // Increased width
            "bottom-full mb-6", // This pushes it UP away from the card header
            alignmentClasses,
            className
          )}
        >
          {/* Main Box */}
          <div className="relative bg-black/80 backdrop-blur-md border border-[var(--accent-color)] p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            
            {/* Decorative Top Bar */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--accent-color)] opacity-50" />
            
            {/* Text Content with Typewriter */}
            <div className="font-mono text-sm md:text-base font-bold text-[var(--accent-color)] leading-relaxed drop-shadow-sm">
              <span className="text-xl opacity-50 mr-1">“</span>
              <TypewriterText text={message} />
              <span className="text-xl opacity-50 ml-1">”</span>
            </div>

            {/* Speech Bubble Tail */}
            <div 
              className={cn(
                "absolute w-0 h-0 border-t-[var(--accent-color)] bottom-[-15px]",
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