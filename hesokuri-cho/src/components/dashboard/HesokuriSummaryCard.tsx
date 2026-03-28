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
  onPressEditBudget: () => void;
}

export const HesokuriSummaryCard: React.FC<HesokuriSummaryCardProps> = ({
  currentHesokuri,
  totalMonthlyBudget,
  totalSpent,
  averageGuideline,
  evaluation,
  onPressEditBudget
}) => {
  const isNegative = currentHesokuri < 0;

  return (
    <View style={styles.card}>
      {/* 変更箇所：タイトルを「今月の余るお金」へ修正 */}
      <Text style={styles.label}>今月の余るお金</Text>
      <Text style={[styles.amount, { color: isNegative ? '#FF3B30' : '#007AFF' }]}>
        ￥{currentHesokuri.toLocaleString()}
      </Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>総予算: ￥{totalMonthlyBudget.toLocaleString()}</Text>
        <Text style={styles.summaryText}>支出済: ￥{totalSpent.toLocaleString()}</Text>
      </View>

      <View style={styles.divider} />

      <View style={[styles.evaluationContainer, { backgroundColor: evaluation.bgColor }]}>
        <View style={styles.evalHeader}>
          <Text style={[styles.evaluationTitle, { color: evaluation.color }]}>{evaluation.title}</Text>
          <Text style={[styles.guidelineCompareText, { color: evaluation.color }]}>
            世間の目安: ￥{averageGuideline.toLocaleString()}
          </Text>
        </View>
        <Text style={[styles.evaluationMessage, { color: evaluation.color }]}>{evaluation.message}</Text>
      </View>

      <TouchableOpacity style={styles.editBudgetBtn} onPress={onPressEditBudget}>
        <Text style={styles.editBudgetBtnText}>今月の予算を編成する</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  label: { fontSize: 13, color: '#8E8E93', fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  amount: { fontSize: 40, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  summaryText: { fontSize: 12, color: '#8E8E93', fontWeight: '600', marginHorizontal: 12 },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginBottom: 16 },
  evaluationContainer: { padding: 12, borderRadius: 10, marginBottom: 12 },
  evalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  evaluationTitle: { fontSize: 13, fontWeight: 'bold' },
  guidelineCompareText: { fontSize: 11, opacity: 0.8, fontWeight: '600' },
  evaluationMessage: { fontSize: 11, lineHeight: 16, opacity: 0.9 },
  editBudgetBtn: { backgroundColor: '#E5F1FF', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  editBudgetBtnText: { color: '#007AFF', fontWeight: 'bold', fontSize: 13 },
});