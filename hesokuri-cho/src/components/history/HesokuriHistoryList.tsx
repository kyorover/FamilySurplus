// src/components/history/HesokuriHistoryList.tsx
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface HesokuriHistoryListProps {
  isLoading: boolean;
  months: number[];
  historyData: Record<number, number | null>;
}

export const HesokuriHistoryList: React.FC<HesokuriHistoryListProps> = ({ isLoading, months, historyData }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>データを取得中...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
      {months.map(month => {
        const amount = historyData[month];
        if (amount === undefined || amount === null) return null;

        return (
          <View key={month} style={styles.recordCard}>
            <Text style={styles.monthText}>{month}月</Text>
            <Text style={[styles.amountText, amount < 0 && styles.negativeAmount]}>
              {amount >= 0 ? '+' : ''}￥{amount.toLocaleString()}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textSecondary, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  recordCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  monthText: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary },
  amountText: { fontSize: 22, fontWeight: 'bold', color: isDark ? '#32D74B' : '#34C759' }, // ▼ 緑色はダークモードに合わせる
  negativeAmount: { color: colors.error },
});