
import React from 'react';
import { Route, Routes, HashRouter as Router, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { SoundProvider } from './context/SoundContext';
import { SettingsProvider, useSettingsContext } from './context/SettingsContext';
import { Toaster } from './components/ui/toaster';
import ScrollToTop from './components/ScrollToTop';
import Hub from './pages/Hub';
import Workshop from './pages/Workshop';
import Shop from './pages/Shop';
import Battle from './pages/Battle';
import ForgeScreen from './pages/ForgeScreen';
import SettingsButton from './components/SettingsButton';
import SettingsPanel from './components/SettingsPanel';

// Wrapper component to apply settings styles
const AppContent = () => {
  const { settings } = useSettingsContext();
  
  // Calculate transform scale string
  const scale = settings.uiScale / 100;

  return (
    <>
      <SettingsButton />
      <SettingsPanel />
      
      {/* Main App Container with Settings applied */}
      <div 
        style={{ 
          filter: `brightness(${settings.gamma})`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: '100%',
          minHeight: '100vh',
          // Fix for scale creating scrolling issues or empty space
          height: scale < 1 ? `${100 / scale}vh` : 'auto'
        }}
        className="app-container transition-all duration-300"
      >
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Navigate to="/hub" replace />} />
            <Route path="/hub" element={<Hub />} />
            <Route path="/workshop" element={<Workshop />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/forge" element={<ForgeScreen />} />
          </Routes>
          <Toaster />
        </Router>
      </div>
    </>
  );
};

function App() {
  return (
    <SettingsProvider>
      <SoundProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </SoundProvider>
    </SettingsProvider>
  );
}

export default App;
