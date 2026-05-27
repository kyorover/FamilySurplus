// src/constants/colors.ts

export const lightColors = {
  background: '#F2F2F7',      // アプリ全体の背景色
  surface: '#FFFFFF',         // カードやモーダル、タブバーなどの表面色
  textPrimary: '#1C1C1E',     // メインテキスト色
  textSecondary: '#8E8E93',   // サブテキスト、非アクティブなアイコン色
  primary: '#007AFF',         // アクセントカラー（ボタン、アクティブタブなど）
  primaryLight: '#E5F1FF',    // アクティブなタブの背景色など、薄いアクセント色
  border: '#E5E5EA',          // 境界線の色
  error: '#FF3B30',           // エラーメッセージ等の色
  overlay: 'rgba(0, 0, 0, 0.5)', // モーダルの背景オーバーレイ
};

export const darkColors = {
  background: '#000000',
  surface: '#1C1C1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  primary: '#0A84FF',
  primaryLight: '#003366',    // ダークモード用の薄いアクセント色（調整）
  border: '#38383A',
  error: '#FF453A',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export type Colors = typeof lightColors;