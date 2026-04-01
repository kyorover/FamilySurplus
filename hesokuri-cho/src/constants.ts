// src/constants.ts

export const DEFAULT_CATEGORY_NAMES = {
  CHILD_CARE: '子育て費',
  FOOD: '食費',
  EATING_OUT: '外食',
  DAILY_NECESSITIES: '日用品',
} as const;

// 庭機能に関する定数
export const GARDEN_CONSTANTS = {
  MAX_PLANT_LEVEL: 5,
  // レベルアップに必要なポイント。インデックス0は未使用、1->2は50pt、2->3は100pt...とする
  LEVEL_UP_COSTS: [0, 50, 100, 150, 200, 0], 
  // レベルごとの木の占有タイルサイズ（インデックスがレベルに対応）
  // 変更時はここの値を調整するだけで当たり判定に反映されます
  TREE_SIZES: [0, 1, 2, 2, 3, 3],
} as const;