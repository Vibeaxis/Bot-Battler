
import { Sword, Shield, Wifi } from 'lucide-react';

export const PROTOCOLS = {
  ASSAULT: {
    id: 'ASSAULT',
    name: 'Assault Protocol',
    icon: 'Sword',
    color: 'red', // Logical color
    twColor: 'text-red-500',
    twBorder: 'border-red-500',
    twBg: 'bg-red-500/10',
    twShadow: 'shadow-red-500/20',
    baseBonus: 0.20,
    doubleBonus: 0.40,
    statType: 'Damage',
    counterProtocol: 'TECH',
    description: '+20% Damage. Critically counters Tech.'
  },
  BULWARK: {
    id: 'BULWARK',
    name: 'Bulwark Protocol',
    icon: 'Shield',
    color: 'green',
    twColor: 'text-emerald-500',
    twBorder: 'border-emerald-500',
    twBg: 'bg-emerald-500/10',
    twShadow: 'shadow-emerald-500/20',
    baseBonus: 0.20,
    doubleBonus: 0.40,
    statType: 'Armor',
    counterProtocol: 'ASSAULT',
    description: '+20% Armor. Withstands Assault.'
  },
  TECH: {
    id: 'TECH',
    name: 'Tech Protocol',
    icon: 'Wifi',
    color: 'blue',
    twColor: 'text-blue-500',
    twBorder: 'border-blue-500',
    twBg: 'bg-blue-500/10',
    twShadow: 'shadow-blue-500/20',
    baseBonus: 0.20,
    doubleBonus: 0.40,
    statType: 'Speed',
    counterProtocol: 'BULWARK',
    description: '+20% Speed. Outmaneuvers Bulwark.'
  }
};

export const getProtocolByName = (name) => {
  return Object.values(PROTOCOLS).find(p => p.name === name) || PROTOCOLS.ASSAULT;
};

export const getProtocolById = (id) => {
  return PROTOCOLS[id];
};

export const getRandomProtocol = () => {
  const keys = Object.keys(PROTOCOLS);
  return PROTOCOLS[keys[Math.floor(Math.random() * keys.length)]];
};

// Change 'enemyProtocolName' to 'enemyProtocolId'
export const calculateProtocolBonus = (protocol, enemyProtocolId) => {
  if (!protocol) return 0;
  
  // Now it compares 'TECH' === 'TECH' correctly
  if (protocol.counterProtocol === enemyProtocolId) {
    return protocol.doubleBonus; // 40%
  }
  
  // Otherwise you just get the standard 20%
  return protocol.baseBonus; 
};
