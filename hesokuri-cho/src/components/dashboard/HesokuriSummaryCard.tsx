// src/components/dashboard/HesokuriSummaryCard.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { BudgetEvaluationResult } from '../../functions/budgetUtils';
import { DEFAULT_CATEGORY_NAMES } from '../../constants';
import { HesokuriPocketMoneyArea } from './HesokuriPocketMoneyArea';
import { HesokuriBudgetEvaluation } from './HesokuriBudgetEvaluation';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface HesokuriSummaryCardProps {
  currentHesokuri: number;
  totalMonthlyBudget: number;
  totalSpent: number;
  averageGuideline: number;
  evaluation: BudgetEvaluationResult;
  hasChild: boolean;
  pocketMoneyDetails: { id: string, name: string, base: number, bonus: number, total: number }[];
  gardenPoints: number;      // 新規追加
  isWateredToday: boolean;   // 新規追加
  onPressCard: () => void;
  onPressEditBudget: () => void;
  onPressPocketMoney: () => void; 
  onPressWatering: () => void; // 新規追加
}

export const HesokuriSummaryCard: React.FC<HesokuriSummaryCardProps> = ({
  currentHesokuri, totalMonthlyBudget, totalSpent, averageGuideline, evaluation, hasChild, pocketMoneyDetails, 
  gardenPoints, isWateredToday, // 新規追加
  onPressCard, onPressEditBudget, onPressPocketMoney, onPressWatering // 新規追加
}) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  const isNegative = currentHesokuri < 0;
  
  // 定数から動的にカテゴリ名の文字列を組み立てる
  const baseCategories = [DEFAULT_CATEGORY_NAMES.FOOD, DEFAULT_CATEGORY_NAMES.EATING_OUT, DEFAULT_CATEGORY_NAMES.DAILY_NECESSITIES].join('、');
  const fixedCategoriesText = hasChild ? `${baseCategories}、${DEFAULT_CATEGORY_NAMES.CHILD_CARE}` : baseCategories;

  return (
    <View style={styles.card}>
      
      {/* 予算編成ボタンとガーデンステータスを横並びに配置 */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.editBudgetBtn} onPress={onPressEditBudget}>
          <Text style={styles.editBudgetBtnText}>今月の予算を編成する</Text>
        </TouchableOpacity>
        
        <View style={styles.gardenStatusWrap}>
          <Text style={styles.gardenPointsText}>🌱 {gardenPoints} pt</Text>
        </View>
      </View>

      <View style={styles.topArea}>
        <Text style={styles.label}>今月の余るお金</Text>
        <Text style={[styles.amount, { color: isNegative ? colors.error : colors.primary }]}>
          ￥{currentHesokuri.toLocaleString()}
        </Text>
        
        <Text style={styles.spentLabel}>支出の合計</Text>
        <Text style={styles.spentAmount}>￥{totalSpent.toLocaleString()}</Text>
      </View>

      {/* カレンダー確認ボタン（UI/UX改善） */}
      <View style={styles.calendarArea}>
        <TouchableOpacity style={styles.calendarBtn} onPress={onPressCard} activeOpacity={0.7}>
          <Text style={styles.calendarBtnText}>📅 過去の履歴をカレンダーで確認</Text>
        </TouchableOpacity>
      </View>

      {/* チェックイン（ポイント獲得）ボタンエリア */}
      <View style={styles.wateringArea}>
        <TouchableOpacity 
          style={[styles.wateringBtn, isWateredToday && styles.wateringBtnDone]} 
          onPress={onPressWatering}
          disabled={isWateredToday}
          activeOpacity={0.7}
        >
          <Text style={[styles.wateringBtnText, isWateredToday && styles.wateringBtnTextDone]}>
            {isWateredToday ? '✨ 本日のチェックイン完了！' : '💰 今月の余剰金をチェックしてポイントGET'}
          </Text>
        </TouchableOpacity>
        {!isWateredToday && (
          <Text style={styles.wateringHint}>タップで残高を確認して庭ポイントを獲得</Text>
        )}
      </View>

      <View style={styles.divider} />

      <HesokuriPocketMoneyArea 
        pocketMoneyDetails={pocketMoneyDetails} 
        onPressPocketMoney={onPressPocketMoney} 
      />

      <HesokuriBudgetEvaluation 
        totalMonthlyBudget={totalMonthlyBudget} 
        evaluation={evaluation} 
        averageGuideline={averageGuideline} 
        fixedCategoriesText={fixedCategoriesText} 
      />
    </View>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  card: { backgroundColor: colors.surface, padding: 24, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  editBudgetBtn: { backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#E5F1FF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  editBudgetBtnText: { color: colors.primary, fontWeight: 'bold', fontSize: 13 },
  gardenStatusWrap: { backgroundColor: colors.background, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 },
  gardenPointsText: { fontSize: 13, fontWeight: 'bold', color: isDark ? '#32D74B' : '#34C759' }, // ▼ 緑色はダークモードに合わせる
  topArea: { alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, color: colors.textSecondary, fontWeight: 'bold', marginBottom: 4 },
  amount: { fontSize: 44, fontWeight: '900', marginBottom: 16, letterSpacing: -1 },
  spentLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: 'bold', marginBottom: 2 },
  spentAmount: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 },
  calendarArea: { alignItems: 'center', marginBottom: 16 },
  calendarBtn: { backgroundColor: colors.background, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  calendarBtnText: { color: colors.textPrimary, fontWeight: 'bold', fontSize: 13 },
  wateringArea: { alignItems: 'center', marginBottom: 20, marginTop: 4 },
  wateringBtn: { backgroundColor: isDark ? '#32D74B' : '#34C759', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 24, width: '100%', alignItems: 'center', shadowColor: isDark ? '#32D74B' : '#34C759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  wateringBtnDone: { backgroundColor: colors.border, shadowOpacity: 0, elevation: 0 },
  wateringBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }, // ※バッジ背景上の文字は白固定
  wateringBtnTextDone: { color: colors.textSecondary },
  wateringHint: { fontSize: 11, color: colors.textSecondary, marginTop: 8, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 20 },
});