// src/components/dashboard/BudgetProgressBar.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface BudgetProgressBarProps {
  categoryId: string;
  categoryName: string;
  budget: number;
  spent: number;
  isCalculationTarget?: boolean;
  onPressDetail: (categoryId: string) => void;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ categoryId, categoryName, budget, spent, isCalculationTarget, onPressDetail }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

  const remain = budget - spent;
  const ratio = budget > 0 ? Math.min(spent / budget, 1) : 1;
  const isWarning = isCalculationTarget !== false && remain < (budget * 0.1);

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.6}
      onPress={() => onPressDetail(categoryId)}
    >
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.catName}>{categoryName}</Text>
          <Text style={styles.hintText}>タップして明細を見る</Text>
        </View>
        <View style={styles.amountWrap}>
          <Text style={styles.amountText}>残: </Text>
          
          {/* 金額の代わりに背景色付きのバッジを表示 */}
          {isCalculationTarget === false ? (
            <Text style={styles.excludedBadge}>対象外</Text>
          ) : (
            <Text style={{ fontWeight: 'bold', color: isWarning ? colors.error : colors.textPrimary, fontSize: 12 }}>
              ￥{remain.toLocaleString()}
            </Text>
          )}

          <Text style={styles.amountText}>
            {'  '}支出計: <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>￥{spent.toLocaleString()}</Text>
          </Text>
        </View>
      </View>
      <View style={styles.barBg}>
        <View style={[
          styles.barFill, 
          { 
            width: `${ratio * 100}%`, 
            // ▼ 変更: 色をテーマに追従。緑色はダークモード時に少し明るくする。対象外はtextSecondaryを使用
            backgroundColor: isCalculationTarget === false ? colors.textSecondary : (isWarning ? colors.error : (isDark ? '#32D74B' : '#34C759')) 
          }
        ]} />
      </View>
    </TouchableOpacity>
  );
};

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  titleWrap: { flexDirection: 'row', alignItems: 'center' },
  catName: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary, marginRight: 8 },
  hintText: { fontSize: 10, color: colors.textSecondary },
  amountWrap: { flexDirection: 'row', alignItems: 'center' },
  excludedBadge: { fontSize: 10, backgroundColor: colors.textSecondary, color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold', overflow: 'hidden' }, // ※バッジ背景色上の文字は白固定
  amountText: { fontSize: 12, color: colors.textSecondary },
  barBg: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
});