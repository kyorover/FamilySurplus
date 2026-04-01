// src/constants/gardenItems.ts
import { GardenItem } from '../types';

export const GARDEN_ITEMS: GardenItem[] = [
  { id: 'IT-01', name: 'レトロな街灯', type: 'ornament', cost: 100 },
  { id: 'IT-02', name: '木のベンチ', type: 'ornament', cost: 150 },
  { id: 'IT-04', name: '秘密の宝箱', type: 'ornament', cost: 300 },
  // ※PL-01（賢者の樹）は月間予算達成度による自動配置を想定するためショップからは除外
];