
import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettingsContext = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('gameSettings');
    return saved ? JSON.parse(saved) : {
      volume: 100,
      uiScale: 100,
      gamma: 1.0
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSetting, 
      isSettingsOpen, 
      setIsSettingsOpen 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
