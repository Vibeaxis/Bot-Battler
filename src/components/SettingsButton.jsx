
import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsContext } from '@/context/SettingsContext';

const SettingsButton = () => {
  const { setIsSettingsOpen } = useSettingsContext();

  return (
    <Button
      onClick={() => setIsSettingsOpen(true)}
      variant="outline"
      size="icon"
      className="fixed top-4 right-4 z-[9999] bg-black/80 border-gray-600 hover:border-[var(--accent-color)] text-gray-400 hover:text-[var(--accent-color)] shadow-lg backdrop-blur-sm h-12 w-12 rounded-full"
      title="Settings"
    >
      <Settings className="w-6 h-6" />
    </Button>
  );
};

export default SettingsButton;
