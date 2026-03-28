// src/components/dashboard/HesokuriSummaryCard.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { BudgetEvaluationResult } from '../../functions/budgetUtils';

interface HesokuriSummaryCardProps {
  currentHesokuri: number;
  totalMonthlyBudget: number;
  totalSpent: number;
  averageGuideline: number;
  evaluation: BudgetEvaluationResult;
  hasChild: boolean;
  onPressCard: () => void;
  onPressEditBudget: () => void;
}

export const HesokuriSummaryCard: React.FC<HesokuriSummaryCardProps> = ({
  currentHesokuri, totalMonthlyBudget, totalSpent, averageGuideline, evaluation, hasChild, onPressCard, onPressEditBudget
}) => {
  const isNegative = currentHesokuri < 0;
  const fixedCategoriesText = hasChild ? '食費、外食、日用品、養育費' : '食費、外食、日用品';

  return (
    <View style={styles.card}>
      {/* 変更：予算編成ボタンを最上部へ配置 */}
      <TouchableOpacity style={styles.editBudgetBtnTop} onPress={onPressEditBudget}>
        <Text style={styles.editBudgetBtnText}>今月の予算を編成する</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.6} onPress={onPressCard} style={styles.topArea}>
        <Text style={styles.label}>今月の余るお金</Text>
        <Text style={[styles.amount, { color: isNegative ? '#FF3B30' : '#007AFF' }]}>
          ￥{currentHesokuri.toLocaleString()}
        </Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>総予算: ￥{totalMonthlyBudget.toLocaleString()}</Text>
          <Text style={styles.summaryText}>支出済: ￥{totalSpent.toLocaleString()}</Text>
        </View>
        <Text style={styles.hintText}>タップして全カテゴリーのカレンダーを見る ＞</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={[styles.evaluationContainer, { backgroundColor: evaluation.bgColor }]}>
        <View style={styles.evalHeader}>
          <Text style={[styles.evaluationTitle, { color: evaluation.color }]}>{evaluation.title}</Text>
          <Text style={[styles.guidelineCompareText, { color: evaluation.color }]}>世間の目安: ￥{averageGuideline.toLocaleString()}</Text>
        </View>
        <Text style={[styles.evaluationMessage, { color: evaluation.color }]}>{evaluation.message}</Text>
        <Text style={[styles.guidelineNote, { color: evaluation.color }]}>※固定費（{fixedCategoriesText}）から算出</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  editBudgetBtnTop: { backgroundColor: '#E5F1FF', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  editBudgetBtnText: { color: '#007AFF', fontWeight: 'bold', fontSize: 13 },
  topArea: { alignItems: 'center', marginBottom: 4 },
  label: { fontSize: 13, color: '#8E8E93', fontWeight: 'bold', marginBottom: 4 },
  amount: { fontSize: 40, fontWeight: '900', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  summaryText: { fontSize: 12, color: '#8E8E93', fontWeight: '600', marginHorizontal: 12 },
  hintText: { fontSize: 11, color: '#007AFF', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginBottom: 16, marginTop: 12 },
  evaluationContainer: { padding: 12, borderRadius: 10 },
  evalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  evaluationTitle: { fontSize: 13, fontWeight: 'bold' },
  guidelineCompareText: { fontSize: 11, opacity: 0.8, fontWeight: '600' },
  evaluationMessage: { fontSize: 11, lineHeight: 16, opacity: 0.9 },
  guidelineNote: { fontSize: 10, marginTop: 6, opacity: 0.7, fontWeight: 'bold' },
});