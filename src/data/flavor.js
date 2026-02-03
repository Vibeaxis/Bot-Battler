const FLAVOR_TEXTS = {
  INTRO: [
    'System initialized.', 
    'Target locked.', 
    'You look like scrap.', 
    'Protocols engaged.',
    'Combat subroutines loaded.',
    'Prepare for disassembly.',
    'Scanning for weaknesses...',
    'Mercy.exe not found.',
    'Analyzing threat level: Minimal.',
    'Weapons hot. Logic cold.',
    'Deletion imminent.',
    'Initiating violence.bat...',
    'Your warranty expires now.',
    'Uploading pain...',
    'Target identification: Obsolete.',
    'Recycling process started.',
    'Do not resist.',
    'Combat log opened.'
  ],
  VICTORY: [
    'Threat eliminated.', 
    'Garbage day.', 
    'Optimized.', 
    'GG EZ.',
    'Scrap acquired.',
    'Performance exceeds parameters.',
    'Another one for the pile.',
    'Superiority confirmed.',
    'Combat efficiency: 100%.',
    'Adding to collection.',
    'Update complete. You have been archived.',
    'Waste processing finished.',
    'Glory to the machine.',
    'Predictable outcome.',
    'Looting subroutines engaged.',
    'You have been reformatted.',
    'Clean kill.',
    'Next target required.'
  ],
  DEFEAT: [
    'Critical failure...', 
    'System shutting down...', 
    'Reboot required...', 
    'Darkness...',
    'Error 404: Skill not found.',
    'My circuits...',
    'Temporary setback.',
    'Malfunction detected.',
    'Blue screen of death...',
    'Core temperature critical...',
    'Leaking coolant...',
    'I saw... the code...',
    'Fatal exception occurred.',
    'Disconnecting...',
    'Hardware compromised.',
    'Requesting backup... signal lost.',
    'Power... fading...',
    'Shutdown sequence initiated.'
  ],
  HIT: [
    'Ouch!', 
    'Armor breached!', 
    'Calculated.', 
    'Tis but a scratch.',
    'Warning: Integrity dropping.',
    'Taking fire!',
    'Components rattling!',
    'Direct hit detected.',
    'Sparks detected!',
    'My sensors!',
    'Rerouting power!',
    'Damage report pending...',
    'External plating damaged.',
    'Stabilizers failing!',
    'Impact verified.',
    'You will pay for that.',
    'Oil pressure dropping.',
    'Structural stress critical.'
  ]
};

export const getFlavorText = (type) => {
  return FLAVOR_TEXTS[type] || ['...'];
};

export const getRandomFlavor = (type) => {
  const texts = getFlavorText(type);
  return texts[Math.floor(Math.random() * texts.length)];
};