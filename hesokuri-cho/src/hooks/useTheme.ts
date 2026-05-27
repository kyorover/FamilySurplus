// src/hooks/useTheme.ts
import { useHesokuriStore } from '../store';
import { lightColors, darkColors, Colors } from '../constants/colors';

export const useTheme = (): { colors: Colors; isDark: boolean } => {
  // ストアからユーザーが選択した明示的なテーマモード（'light' | 'dark'）を取得
  const themeMode = useHesokuriStore((state) => state.themeMode);
  
  // OSの判定は一切行わず、純粋にStoreのStateのみを評価する
  const isDark = themeMode === 'dark';

  // 判定結果に基づいてカラーパレットを返す
  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
};