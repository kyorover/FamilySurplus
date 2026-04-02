// src/constants/gardenItems.ts
import { GardenItem } from '../types';

/**
 * types.ts を変更せずに、ショップ表示フラグを管理するための補助型
 */
export type GardenItemMaster = GardenItem & {
  isShoppable: boolean;
};

/**
 * 全ガーデンアイテムを一元管理するマスターデータ
 * 今後、自動配置アイテムやイベント配布アイテムなどもここに集約します。
 */
export const ALL_GARDEN_ITEMS: GardenItemMaster[] = [
  // 非売品アイテム
  { id: 'PL-01', name: '賢者の樹', type: 'plant', cost: 0, isShoppable: false },

  // ショップ販売アイテム
  { id: 'IT-01', name: 'レトロな街灯', type: 'ornament', cost: 100, isShoppable: true },
  { id: 'IT-02', name: '木のベンチ', type: 'ornament', cost: 150, isShoppable: true },
  { id: 'IT-04', name: '秘密の宝箱', type: 'ornament', cost: 300, isShoppable: true },
];

/**
 * 既存コンポーネントとの後方互換性を保つための定数
 * ショップに表示可能なアイテムのみをマスターデータから抽出して公開します。
 */
export const GARDEN_ITEMS: GardenItem[] = ALL_GARDEN_ITEMS.filter(
  (item) => item.isShoppable
);