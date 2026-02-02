import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parts } from '@/data/parts';
import { RARITY_COLORS } from '@/constants/gameConstants';

const CombatLog = ({ logs, playerName }) => {
    // CHANGED: We now ref the CONTAINER, not a dummy div at the end
    const containerRef = useRef(null);

    useEffect(() => {
        // FIX: Scroll only the container, not the window
        if (containerRef.current) {
            const { current } = containerRef;
            // Smoothly scroll the container to its own bottom
            current.scrollTo({
                top: current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [logs]); // Trigger only when new logs arrive

    // Helper to parse log text and highlight parts
    const formatLogText = (text) => {
        let formattedText = text;
        // Sort parts by name length desc to avoid partial matches
        const sortedParts = [...parts].sort((a, b) => b.name.length - a.name.length);

        let highestTierInLog = 0;

        sortedParts.forEach(part => {
            if (text.includes(part.name)) {
                if (part.tier > highestTierInLog) highestTierInLog = part.tier;
            }
        });

        return { highestTierInLog };
    };

    // Helper to highlight part names inside the string
    const HighlightedText = ({ text }) => {
        if (!text) return null;

        const partsInText = parts.filter(p => text.includes(p.name));

        if (partsInText.length === 0) return <span>{text}</span>;

        // Find the most significant part mentioned to highlight
        const relevantPart = partsInText.sort((a, b) => b.tier - a.tier)[0];
        const partsArr = text.split(relevantPart.name);

        if (partsArr.length < 2) return <span>{text}</span>;

        const colors = RARITY_COLORS[relevantPart.tier];

        return (
            <span>
                {partsArr[0]}
                <span className={`${colors.text} font-bold`}>{relevantPart.name}</span>
                {partsArr[1]}
            </span>
        );
    };

    const getMessageStyle = (log, highestTier) => {
        const baseStyle = log.includes(playerName)
            ? 'border-l-4 border-blue-500 bg-blue-900/10 text-blue-100'
            : 'border-l-4 border-red-500 bg-red-900/10 text-red-100';

        if (log.includes('Battle Start')) return 'border-l-4 border-yellow-500 bg-yellow-900/10 text-yellow-200';
        if (log.includes('wins')) return 'border-l-4 border-green-500 bg-green-900/20 text-green-400 font-bold';

        if (log.includes('CRITICAL HIT')) {
            return log.includes(playerName)
                ? 'border-l-4 border-blue-500 bg-blue-900/20 text-blue-300 font-bold'
                : 'border-l-4 border-red-500 bg-red-900/20 text-red-300 font-bold';
        }

        // Add subtle glow for legendary interactions
        if (highestTier === 4) return `${baseStyle} shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]`;

        return baseStyle;
    };

    return (
        <div className="relative h-[60vh] flex flex-col bg-black/80 rounded-lg border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)] overflow-hidden font-mono text-sm">
            {/* CRT Scanline Overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                    backgroundSize: '100% 4px, 6px 100%'
                }}
            />
            <div className="absolute inset-0 pointer-events-none z-20 bg-green-500/5 mix-blend-overlay animate-pulse" />

            {/* Terminal Header */}
            <div className="bg-gray-900/90 p-2 border-b border-gray-800 flex items-center justify-between z-10 relative flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-green-500/70 text-xs font-bold tracking-wider">TERMINAL://COMBAT_LOG.EXE</div>
                </div>
                <div className="text-[10px] text-green-500/50">V.2.1.1</div>
            </div>

            {/* Log Content - Added Ref Here */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black z-10 relative scroll-smooth"
            >
                <AnimatePresence initial={false}>
                    {logs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-green-500/50 mt-10"
                        >
                            <span className="animate-pulse">_ WAITING FOR BATTLE DATA _</span>
                            <span className="text-xs mt-2 opacity-50">System Ready...</span>
                        </motion.div>
                    ) : (
                        logs.map((log, index) => {
                            if (log === '---') return null;

                            const { highestTierInLog } = formatLogText(log);

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-2 rounded-r-md ${getMessageStyle(log, highestTierInLog)}`}
                                >
                                    <span className="opacity-50 mr-2 font-bold">{`>`}</span>
                                    <HighlightedText text={log} />
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
                {/* Removed the dummy ref div since we scroll the container now */}
            </div>
        </div>
    );
};

export default CombatLog;