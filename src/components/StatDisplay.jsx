
import React from 'react';
import { Zap, Gauge, Shield, Weight } from 'lucide-react';

const StatDisplay = ({ stats, className = '' }) => {
  const statConfig = [
    { key: 'Damage', icon: Zap, color: 'text-red-400', bgColor: 'bg-red-500/10' },
    { key: 'Speed', icon: Gauge, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { key: 'Armor', icon: Shield, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    { key: 'Weight', icon: Weight, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' }
  ];
  
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {statConfig.map(({ key, icon: Icon, color, bgColor }) => (
        <div key={key} className={`${bgColor} rounded-lg p-2 flex items-center gap-2`}>
          <Icon className={`w-4 h-4 ${color}`} />
          <div className="flex-1">
            <div className="text-xs text-gray-400">{key}</div>
            <div className={`text-sm font-bold ${color}`}>{stats[key] || 0}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatDisplay;
