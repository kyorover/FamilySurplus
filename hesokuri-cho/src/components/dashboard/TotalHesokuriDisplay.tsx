// src/components/dashboard/TotalHesokuriDisplay.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface TotalHesokuriDisplayProps {
  currentMonthHesokuri: number;
  onPress: () => void;
}

export const TotalHesokuriDisplay: React.FC<TotalHesokuriDisplayProps> = ({ currentMonthHesokuri, onPress }) => {
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

  // 実際は全期間のデータをストアから計算しますが、現状はモック計算としています
  const totalAmount = currentMonthHesokuri > 0 ? currentMonthHesokuri * 5 : 120000;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.title}>節約の実績</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.currency}>￥</Text>
        <Text style={styles.amount}>{totalAmount.toLocaleString()}</Text>
      </View>
      <Text style={styles.subtitle}>タップして履歴を見る ＞</Text>
    </TouchableOpacity>
  );
};

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  card: { backgroundColor: colors.primary, borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, marginTop: 8 },
  title: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', opacity: 0.9, marginBottom: 8 }, // ※プライマリカラー上の文字は白固定
  amountContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  currency: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4, marginRight: 4 },
  amount: { color: '#FFFFFF', fontSize: 40, fontWeight: 'bold', letterSpacing: -1 },
  subtitle: { color: '#FFFFFF', fontSize: 12, opacity: 0.8, marginTop: 8 },
});