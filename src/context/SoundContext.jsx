import React, { createContext, useContext, useCallback, useRef, useEffect, useState } from 'react';

// 1. The Sound Context
const SoundContext = createContext(null);

export const useSoundContext = () => {
  const context = useContext(SoundContext);
  if (!context) {
    return { playSound: () => { }, setMasterVolume: () => { } };
  }
  return context;
};

// 2. The Provider
export const SoundProvider = ({ children }) => {
  const audioCtxRef = useRef(null);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const masterVolumeRef = useRef(1.0);

  useEffect(() => {
    masterVolumeRef.current = masterVolume;
  }, [masterVolume]);

  // Initialize the Audio Engine once on mount
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  // --- SYNTHESIZER HELPERS ---
  const playTone = (type, startFreq, endFreq, duration, vol = 0.1) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    }

    // Apply master volume
    const effectiveVol = vol * masterVolumeRef.current;

    gain.gain.setValueAtTime(effectiveVol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playNoise = (duration, vol = 0.2) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; 
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();

    // Apply master volume
    const effectiveVol = vol * masterVolumeRef.current;

    gain.gain.setValueAtTime(effectiveVol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  };

  const playSound = useCallback((key) => {
    // If volume is 0, don't play
    if (masterVolumeRef.current <= 0.01) return;

    try {
      switch (key) {
        // --- EXISTING SOUNDS ---
        case 'CLICK':
          playTone('sine', 800, null, 0.05, 0.05);
          break;
        case 'BUY':
          playTone('square', 400, 600, 0.1, 0.05);
          setTimeout(() => playTone('square', 600, 1200, 0.1, 0.05), 100);
          break;
        case 'EQUIP':
          playTone('sawtooth', 150, 50, 0.15, 0.05);
          break;
        case 'HIT':
          playNoise(0.1, 0.1);
          break;
        case 'CRIT':
          playTone('sawtooth', 800, 100, 0.3, 0.1);
          playNoise(0.2, 0.2);
          break;
        case 'REROLL':
          playTone('sine', 1200, 400, 0.2, 0.1);
          playNoise(0.1, 0.05);
          break;
        case 'DEFEAT':
          playTone('sawtooth', 150, 30, 0.8, 0.15); 
          playNoise(0.5, 0.15); 
          break;

        // --- UPDATED SOUNDS ---

        case 'VICTORY':
          // CHANGED: Switched from 'square' to 'triangle' for a softer, bell-like chime.
          // Reduced volume (0.1 -> 0.05/0.08) so it's pleasant, not piercing.
          playTone('triangle', 440, 440, 0.1, 0.05); // A4
          setTimeout(() => playTone('triangle', 554, 554, 0.1, 0.05), 100); // C#5
          setTimeout(() => playTone('triangle', 659, 659, 0.4, 0.08), 200); // E5 (Sustain)
          break;

        case 'FUSE':
          playTone('triangle', 200, 600, 0.6, 0.15);
          setTimeout(() => playTone('sine', 600, 1200, 0.4, 0.1), 100);
          setTimeout(() => playTone('sine', 1500, 1500, 0.3, 0.05), 500);
          break;

        case 'MISS':
        case 'DODGE':
          // Air "Woosh"
          playNoise(0.2, 0.05); 
          break;

        case 'GRAZE':
          // Muffled Thud (Sawtooth + Quiet Noise)
          playTone('sawtooth', 100, 50, 0.1, 0.05);
          playNoise(0.1, 0.03);
          break;

        case 'LEVEL_UP':
             playTone('square', 440, 880, 0.3, 0.1);
             setTimeout(() => playTone('square', 880, 1760, 0.4, 0.1), 150);
             break;

        default:
          break;
      }
    } catch (error) {
      // Fail silently
    }
  }, []);

  return (
    <SoundContext.Provider value={{ playSound, setMasterVolume }}>
      {children}
    </SoundContext.Provider>
  );
};