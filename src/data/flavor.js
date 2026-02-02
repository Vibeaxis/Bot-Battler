
const FLAVOR_TEXTS = {
  INTRO: [
    'System initialized.', 
    'Target locked.', 
    'You look like scrap.', 
    'Protocols engaged.',
    'Combat subroutines loaded.',
    'Prepare for disassembly.',
    'Scanning for weaknesses...',
    'Mercy.exe not found.'
  ],
  VICTORY: [
    'Threat eliminated.', 
    'Garbage day.', 
    'Optimized.', 
    'GG EZ.',
    'Scrap acquired.',
    'Performance exceeds parameters.',
    'Another one for the pile.',
    'Superiority confirmed.'
  ],
  DEFEAT: [
    'Critical failure...', 
    'System shutting down...', 
    'Reboot required...', 
    'Darkness...',
    'Error 404: Skill not found.',
    'My circuits...',
    'Temporary setback.',
    'Malfunction detected.'
  ],
  HIT: [
    'Ouch!', 
    'Armor breached!', 
    'Calculated.', 
    'Tis but a scratch.',
    'Warning: Integrity dropping.',
    'Taking fire!',
    'Components rattling!',
    'Direct hit detected.'
  ]
};

export const getFlavorText = (type) => {
  return FLAVOR_TEXTS[type] || ['...'];
};

export const getRandomFlavor = (type) => {
  const texts = getFlavorText(type);
  return texts[Math.floor(Math.random() * texts.length)];
};
