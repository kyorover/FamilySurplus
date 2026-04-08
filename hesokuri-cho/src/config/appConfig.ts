// src/config/appConfig.ts

export const GLOBAL_BUDGET_SETTINGS = {
  // 固定カテゴリのデフォルト（暫定）予算額
  // ※ スキーマ変更（設定済みフラグの追加）を避けるため、0を「未設定（暫定）」として扱い、
  // UI上で赤字警告を出してユーザーに入力を促す設計としています。
  DEFAULT_FOOD: 0,
  DEFAULT_DAILY_NECESSITIES: 0,
  DEFAULT_EATING_OUT: 0,
  DEFAULT_CHILD_CARE: 0,
};