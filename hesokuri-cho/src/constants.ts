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
  // 庭画面のタイトル
  GARDEN_TITLE: 'ガーデニング',
} as const;