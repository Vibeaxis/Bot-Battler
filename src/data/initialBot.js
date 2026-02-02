import { PART_SLOTS } from './parts';

export const initialBot = {
  name: 'Starter Bot',
  icon: 'Cpu',
  equipment: {
    // UPDATED IDs to match parts.js
    [PART_SLOTS.HEAD]: 'h_scanner_v1',      // Was 'head_basic_scanner'
    [PART_SLOTS.RIGHT_ARM]: 'ra_pipe',      // Was 'rarm_pipe'
    [PART_SLOTS.LEFT_ARM]: 'la_lid',        // Was 'larm_trash_lid'
    [PART_SLOTS.CHASSIS]: 'ch_box'          // Was 'chassis_rusty_box'
  }
};

export const getStarterInventory = () => {
  return [
    'h_train_helm', // Was 'head_training_helm'
    'ra_drill',     // Was 'rarm_drill_bit'
    'la_buckler'    // Was 'larm_buckler'
  ];
};