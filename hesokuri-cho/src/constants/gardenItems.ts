// src/constants/gardenItems.ts
import { GardenItem } from '../types';

export const GARDEN_ITEMS: GardenItem[] = [
  { id: 'item_flower_01', name: 'ひまわりの種', type: 'flower', cost: 100, imageUrl: '🌻' },
  { id: 'item_flower_02', name: 'チューリップの種', type: 'flower', cost: 150, imageUrl: '🌷' },
  { id: 'item_flower_03', name: 'バラの種', type: 'flower', cost: 200, imageUrl: '🌹' },
  { id: 'item_pot_01', name: 'テラコッタの鉢', type: 'pot', cost: 120, imageUrl: '🏺' },
  { id: 'item_ornament_01', name: '木のベンチ', type: 'ornament', cost: 300, imageUrl: '🪑' },
  { id: 'item_ornament_02', name: 'ガーデンノーム', type: 'ornament', cost: 250, imageUrl: '🧙' },
  { id: 'item_ornament_03', name: '石のランタン', type: 'ornament', cost: 400, imageUrl: '🏮' },
  { id: 'item_ornament_04', name: '小さな噴水', type: 'ornament', cost: 500, imageUrl: '⛲' },
];