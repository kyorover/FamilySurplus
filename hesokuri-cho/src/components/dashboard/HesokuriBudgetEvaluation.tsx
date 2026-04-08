// src/components/dashboard/HesokuriBudgetEvaluation.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BudgetEvaluationResult } from '../../functions/budgetUtils';

interface HesokuriBudgetEvaluationProps {
  totalMonthlyBudget: number;
  evaluation: BudgetEvaluationResult;
  averageGuideline: number;
  fixedCategoriesText: string;
}

export const HesokuriBudgetEvaluation: React.FC<HesokuriBudgetEvaluationProps> = ({ 
  totalMonthlyBudget, evaluation, averageGuideline, fixedCategoriesText 
}) => {
  return (
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
  );
};

const styles = StyleSheet.create({
  budgetArea: { marginBottom: 16 },
  budgetLabel: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 12, textAlign: 'center' },
  evaluationContainer: { padding: 16, borderRadius: 12 },
  evalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  evaluationTitle: { fontSize: 14, fontWeight: 'bold' },
  guidelineCompareText: { fontSize: 12, opacity: 0.8, fontWeight: '600' },
  evaluationMessage: { fontSize: 12, lineHeight: 18, opacity: 0.9 },
  guidelineNote: { fontSize: 10, marginTop: 8, opacity: 0.7, fontWeight: 'bold' },
});