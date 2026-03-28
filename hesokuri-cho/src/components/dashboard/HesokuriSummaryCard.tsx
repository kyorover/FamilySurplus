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
      {/* 1. タップ可能な実績エリア（余るお金 ＆ 支出合計） */}
      <TouchableOpacity activeOpacity={0.6} onPress={onPressCard} style={styles.topArea}>
        <Text style={styles.label}>今月の余るお金</Text>
        <Text style={[styles.amount, { color: isNegative ? '#FF3B30' : '#007AFF' }]}>
          ￥{currentHesokuri.toLocaleString()}
        </Text>
        
        <Text style={styles.spentLabel}>支出の合計</Text>
        <Text style={styles.spentAmount}>￥{totalSpent.toLocaleString()}</Text>
        
        <Text style={styles.hintText}>タップして全カテゴリーのカレンダーを見る ＞</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* 2. 予算と評価のエリア（関連する情報を近接させる） */}
      <View style={styles.budgetArea}>
        <Text style={styles.budgetLabel}>今月の総予算： ￥{totalMonthlyBudget.toLocaleString()}</Text>
        
        <View style={[styles.evaluationContainer, { backgroundColor: evaluation.bgColor }]}>
          <View style={styles.evalHeader}>
            <Text style={[styles.evaluationTitle, { color: evaluation.color }]}>{evaluation.title}</Text>
            <Text style={[styles.guidelineCompareText, { color: evaluation.color }]}>世間の目安: ￥{averageGuideline.toLocaleString()}</Text>
          </View>
          <Text style={[styles.evaluationMessage, { color: evaluation.color }]}>{evaluation.message}</Text>
          <Text style={[styles.guidelineNote, { color: evaluation.color }]}>※固定費（{fixedCategoriesText}）から算出</Text>
        </View>
      </View>

      {/* 3. 予算編成ボタン */}
      <TouchableOpacity style={styles.editBudgetBtn} onPress={onPressEditBudget}>
        <Text style={styles.editBudgetBtnText}>今月の予算を編成する</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  topArea: { alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, color: '#8E8E93', fontWeight: 'bold', marginBottom: 4 },
  amount: { fontSize: 44, fontWeight: '900', marginBottom: 16, letterSpacing: -1 },
  spentLabel: { fontSize: 14, color: '#8E8E93', fontWeight: 'bold', marginBottom: 2 },
  spentAmount: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 16 },
  hintText: { fontSize: 12, color: '#007AFF', fontWeight: 'bold', paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginBottom: 20 },
  budgetArea: { marginBottom: 16 },
  budgetLabel: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 12, textAlign: 'center' },
  evaluationContainer: { padding: 16, borderRadius: 12 },
  evalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  evaluationTitle: { fontSize: 14, fontWeight: 'bold' },
  guidelineCompareText: { fontSize: 12, opacity: 0.8, fontWeight: '600' },
  evaluationMessage: { fontSize: 12, lineHeight: 18, opacity: 0.9 },
  guidelineNote: { fontSize: 10, marginTop: 8, opacity: 0.7, fontWeight: 'bold' },
  editBudgetBtn: { backgroundColor: '#F2F2F7', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  editBudgetBtnText: { color: '#007AFF', fontWeight: 'bold', fontSize: 14 },
});