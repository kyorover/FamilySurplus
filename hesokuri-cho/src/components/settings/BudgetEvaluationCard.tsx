// src/components/settings/BudgetEvaluationCard.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BudgetEvaluationResult } from '../../functions/budgetUtils';
import { DEFAULT_CATEGORY_NAMES } from '../../constants';

interface BudgetEvaluationCardProps {
  fixedMonthlyBudget: number; 
  averageGuideline: number;
  evaluation: BudgetEvaluationResult;
  hasChild: boolean; 
}

export const BudgetEvaluationCard: React.FC<BudgetEvaluationCardProps> = ({ fixedMonthlyBudget, averageGuideline, evaluation, hasChild }) => {
  // 定数から動的にカテゴリ名の文字列を組み立てる
  const baseCategories = [DEFAULT_CATEGORY_NAMES.FOOD, DEFAULT_CATEGORY_NAMES.EATING_OUT, DEFAULT_CATEGORY_NAMES.DAILY_NECESSITIES].join('、');
  const fixedCategoriesText = hasChild ? `${baseCategories}、${DEFAULT_CATEGORY_NAMES.CHILD_CARE}` : baseCategories;

  return (
    <View style={[styles.evaluationContainer, { backgroundColor: evaluation.bgColor }]}>
      <View style={styles.evalHeader}>
        <Text style={[styles.evaluationTitle, { color: evaluation.color }]}>{evaluation.title}</Text>
      </View>
      <Text style={[styles.evaluationMessage, { color: evaluation.color }]}>{evaluation.message}</Text>
      
      <View style={styles.detailsBox}>
        <Text style={[styles.detailText, { color: evaluation.color }]}>固定費の合計: ￥{fixedMonthlyBudget.toLocaleString()}</Text>
        <Text style={[styles.detailText, { color: evaluation.color }]}>世間の目安: ￥{averageGuideline.toLocaleString()}</Text>
      </View>
      <Text style={[styles.guidelineNote, { color: evaluation.color }]}>※固定費（{fixedCategoriesText}）のみで算出しています</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  evaluationContainer: { padding: 16, borderRadius: 12, marginBottom: 24 },
  evalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  evaluationTitle: { fontSize: 16, fontWeight: 'bold' },
  evaluationMessage: { fontSize: 13, lineHeight: 18, opacity: 0.9, marginBottom: 12 },
  detailsBox: { backgroundColor: 'rgba(255,255,255,0.4)', padding: 12, borderRadius: 8, marginBottom: 8 },
  detailText: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  guidelineNote: { fontSize: 11, opacity: 0.7, fontWeight: 'bold' },
});