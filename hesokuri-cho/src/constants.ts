// src/constants.ts

export const DEFAULT_CATEGORY_NAMES = {
  CHILD_CARE: '子育て費',
  FOOD: '食費',
  EATING_OUT: '外食',
  DAILY_NECESSITIES: '日用品',
} as const;

// 新規カテゴリや初期設定時に適用されるデフォルト（暫定）の予算額
export const DEFAULT_BUDGET_INITIAL_VALUE = 0;

// 庭機能に関する定数
export const GARDEN_CONSTANTS = {
  MAX_PLANT_LEVEL: 5,
  // レベルアップに必要なポイント。インデックス0は未使用、1->2は50pt、2->3は100pt...とする
  LEVEL_UP_COSTS: [0, 50, 100, 150, 200, 0], 
  // 庭画面のタイトル
  GARDEN_TITLE: 'ガーデニング',
} as const;

// 法的文書の公開URL
export const LEGAL_URLS = {
  TERMS: 'https://bitter-tadpole-6f2.notion.site/3496c0a2da83806f9326eabe3f872ef3?pvs=74',
  PRIVACY: 'https://bitter-tadpole-6f2.notion.site/3496c0a2da838001bc3dc0b457a7fea0?pvs=73',
} as const;