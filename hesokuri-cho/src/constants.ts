// src/constants.ts

/**
 * アプリケーション全体で使用する固定カテゴリの名称定義
 * 名称を変更する場合は、このファイルの値を変更するだけで全画面に反映されます。
 */
export const DEFAULT_CATEGORY_NAMES = {
  CHILD_CARE: '子育て費', // 旧：養育費
  FOOD: '食費',
  EATING_OUT: '外食',
  DAILY_NECESSITIES: '日用品',
} as const;