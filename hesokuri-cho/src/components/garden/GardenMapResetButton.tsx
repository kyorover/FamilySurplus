// src/components/garden/GardenMapResetButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface Props {
  onReset: () => void;
}

export const GardenMapResetButton: React.FC<Props> = ({ onReset }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  return (
    <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.7}>
      <Text style={styles.resetText}>表示位置をリセット</Text>
    </TouchableOpacity>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  resetBtn: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)', // ▼ 変更: ダークモード対応
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 8, zIndex: 1000,
  },
  resetText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }, // ※半透明の黒背景上の文字は白固定
});