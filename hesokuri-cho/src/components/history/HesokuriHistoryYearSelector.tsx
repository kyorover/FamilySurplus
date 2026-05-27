// src/components/history/HesokuriHistoryYearSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface HesokuriHistoryYearSelectorProps {
  selectedYear: number;
  isCurrentYear: boolean;
  onPrevYear: () => void;
  onNextYear: () => void;
}

export const HesokuriHistoryYearSelector: React.FC<HesokuriHistoryYearSelectorProps> = ({
  selectedYear, isCurrentYear, onPrevYear, onNextYear
}) => {
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

  return (
    <View style={styles.yearSelector}>
      <TouchableOpacity onPress={onPrevYear} style={styles.yearBtn} activeOpacity={0.7}>
        <Text style={styles.yearBtnText}>◀ 前年</Text>
      </TouchableOpacity>
      <Text style={styles.currentYearText}>{selectedYear}年</Text>
      <TouchableOpacity 
        onPress={onNextYear} 
        style={styles.yearBtn} 
        disabled={isCurrentYear}
        activeOpacity={0.7}
      >
        <Text style={[styles.yearBtnText, isCurrentYear && styles.disabledText]}>次年 ▶</Text>
      </TouchableOpacity>
    </View>
  );
};

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  yearSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 16, marginBottom: 12 },
  yearBtn: { padding: 8 },
  yearBtnText: { fontSize: 14, color: colors.primary, fontWeight: 'bold' },
  disabledText: { color: colors.textSecondary },
  currentYearText: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
});