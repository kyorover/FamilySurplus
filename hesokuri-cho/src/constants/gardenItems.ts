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
  { id: 'PL-01', name: '知恵の木', type: 'plant', cost: 0, isShoppable: false },
  { id: 'PL-02', name: 'ツリーハウス', type: 'plant', cost: 0, isShoppable: false },
  { id: 'PL-03', name: 'グランピング', type: 'plant', cost: 0, isShoppable: false },

  // ショップ販売アイテム
  { id: 'EF-01', name: '水やり', type: 'ornament', cost: 300, isShoppable: false },
  { id: 'IT-01', name: 'レトロな街灯', type: 'ornament', cost: 100, isShoppable: true },
  { id: 'IT-02', name: '木のベンチ', type: 'ornament', cost: 150, isShoppable: true },
  { id: 'IT-03', name: '多肉植物', type: 'ornament', cost: 150, isShoppable: true },
  { id: 'IT-04', name: '秘密の宝箱', type: 'ornament', cost: 300, isShoppable: true },
  { id: 'IT-05', name: '花(黄色)', type: 'ornament', cost: 30, isShoppable: true },
  { id: 'IT-06', name: '花(紫色)', type: 'ornament', cost: 30, isShoppable: true },
  { id: 'IT-07', name: '花(赤色)', type: 'ornament', cost: 30, isShoppable: true },
  { id: 'IT-08', name: '花(青色)', type: 'ornament', cost: 30, isShoppable: true },
  { id: 'IT-09', name: '花(緑色)', type: 'ornament', cost: 30, isShoppable: true },
  { id: 'IT-10', name: '観葉植物', type: 'ornament', cost: 50, isShoppable: true },
  { id: 'CR-01', name: 'マンチカン', type: 'ornament', cost: 150, isShoppable: true },
  { id: 'CR-02', name: 'ダックスフンド', type: 'ornament', cost: 150, isShoppable: true },
  { id: 'CR-03', name: '子供', type: 'ornament', cost: 100, isShoppable: true },
  { id: 'CR-04', name: '大人(女)', type: 'ornament', cost: 100, isShoppable: true },
  { id: 'CR-05', name: '大人(男)', type: 'ornament', cost: 100, isShoppable: true },
  
  // ▼ 追加: 壁紙アイテム
  { id: 'WP-01', name: '壁紙(森)', type: 'ornament', cost: 100, isShoppable: true },
  { id: 'WP-02', name: '壁紙(空)', type: 'ornament', cost: 100, isShoppable: true },
  { id: 'WP-03', name: '壁紙(夕暮れ)', type: 'ornament', cost: 100, isShoppable: true },
  { id: 'WP-04', name: '壁紙(夜)', type: 'ornament', cost: 100, isShoppable: true },
];

/**
 * 既存コンポーネントとの後方互換性を保つための定数
 * ショップに表示可能なアイテムのみをマスターデータから抽出して公開します。
 */
export const GARDEN_ITEMS: GardenItem[] = ALL_GARDEN_ITEMS.filter(
  (item) => item.isShoppable
);