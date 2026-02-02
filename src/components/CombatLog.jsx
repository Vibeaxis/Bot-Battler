import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parts } from '@/data/parts';
import { RARITY_COLORS } from '@/constants/gameConstants';

// Max logs to keep in the DOM. Prevents the browser from choking.
const MAX_DISPLAY_LOGS = 30;

const CombatLog = ({ logs, playerName }) => {
    const containerRef = useRef(null);
    const endRef = useRef(null);

    // OPTIMIZATION: Only render the last N logs to keep DOM light
    const visibleLogs = useMemo(() => {
        return logs.slice(-MAX_DISPLAY_LOGS);
    }, [logs]);

    // OPTIMIZATION: Scroll handling
    useEffect(() => {
        if (containerRef.current) {
            // requestAnimationFrame ensures we scroll immediately after the DOM paints
            requestAnimationFrame(() => {
                containerRef.current.scrollTo({
                    top: containerRef.current.scrollHeight,
                    behavior: 'smooth' // Change to 'auto' if it's still too slow
                });
            });
        }
    }, [logs.length]); // Only trigger on length change, not deep content change

    // Helper to parse log text and highlight parts
    const formatLogText = (text) => {
        let highestTierInLog = 0;
        // Check tiers (Optimization: simple loop is faster than reduce/sort for this)
        for (const part of parts) {
            if (text.includes(part.name)) {
                if (part.tier > highestTierInLog) highestTierInLog = part.tier;
            }
        }
        return { highestTierInLog };
    };

    // Helper to highlight part names inside the string
    const HighlightedText = ({ text }) => {
        if (!text) return null;

        // Memoize the part finding to avoid recalc on re-renders
        const relevantPart = useMemo(() => {
             const foundParts = parts.filter(p => text.includes(p.name));
             if (foundParts.length === 0) return null;
             // Return highest tier part
             return foundParts.sort((a, b) => b.tier - a.tier)[0];
        }, [text]);

        if (!relevantPart) return <span>{text}</span>;

        const partsArr = text.split(relevantPart.name);
        if (partsArr.length < 2) return <span>{text}</span>;

        const colors = RARITY_COLORS[relevantPart.tier] || RARITY_COLORS[1];

        return (
            <span>
                {partsArr[0]}
                <span className={`${colors.text} font-bold border-b border-dashed border-gray-600`}>
                    {relevantPart.name}
                </span>
                {partsArr[1]}
            </span>
        );
    };

    const getMessageStyle = (log, highestTier) => {
        // Optimization: Check most common cases first
        if (log.includes('Battle Start')) return 'border-l-4 border-yellow-500 bg-yellow-900/10 text-yellow-200';
        if (log.includes('wins')) return 'border-l-4 border-green-500 bg-green-900/20 text-green-400 font-bold';
        
        const isPlayer = log.includes(playerName);

        if (log.includes('CRITICAL')) { // Shortened string check
            return isPlayer
                ? 'border-l-4 border-blue-500 bg-blue-900/20 text-blue-300 font-bold'
                : 'border-l-4 border-red-500 bg-red-900/20 text-red-300 font-bold';
        }

        // Add subtle glow for legendary/epic interactions
        if (highestTier >= 4) return `border-l-4 ${isPlayer ? 'border-purple-500' : 'border-red-500'} bg-purple-900/20 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]`;

        return isPlayer
            ? 'border-l-4 border-blue-500 bg-blue-900/10 text-blue-100'
            : 'border-l-4 border-red-500 bg-red-900/10 text-red-100';
    };

    return (
        <div className="relative h-[60vh] flex flex-col bg-black/90 rounded-lg border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)] overflow-hidden font-mono text-sm">
            {/* CRT Scanline Overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-20 opacity-50"
                style={{
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                    backgroundSize: '100% 4px, 6px 100%'
                }}
            />
            
            {/* Terminal Header */}
            <div className="bg-gray-900 p-2 border-b border-gray-800 flex items-center justify-between z-10 relative flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    <div className="ml-2 text-green-500/70 text-xs font-bold tracking-wider">TERMINAL://COMBAT_LOG.EXE</div>
                </div>
                <div className="text-[10px] text-green-500/30">V.2.1.1</div>
            </div>

            {/* Log Content */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black z-10 relative scroll-smooth"
            >
                {/* PERFORMANCE NOTE: Removed AnimatePresence for the list itself.
                   Framer Motion struggles to diff 50+ items in real-time. 
                   Standard rendering is much faster for a rapid-fire log.
                */}
                {visibleLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-green-500/50 mt-10">
                        <span className="animate-pulse">_ WAITING FOR BATTLE DATA _</span>
                        <span className="text-xs mt-2 opacity-50">System Ready...</span>
                    </div>
                ) : (
                    visibleLogs.map((log, index) => {
                        if (log === '---') return null;
                        
                        // Calculate this once per item render
                        const { highestTierInLog } = formatLogText(log);

                        return (
                            // Using standard div with a simple CSS animation class is faster than motion.div for lists
                            <div
                                key={logs.length - visibleLogs.length + index} // Stable key based on total index
                                className={`p-2 rounded-r-md text-xs md:text-sm animate-in fade-in slide-in-from-left-2 duration-300 ${getMessageStyle(log, highestTierInLog)}`}
                            >
                                <span className="opacity-50 mr-2 font-bold select-none">{`>`}</span>
                                <HighlightedText text={log} />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CombatLog;