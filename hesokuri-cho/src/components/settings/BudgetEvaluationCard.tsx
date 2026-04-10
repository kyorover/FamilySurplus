// src/components/settings/BudgetEvaluationCard.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BudgetEvaluationResult } from '../../functions/budgetUtils';

interface BudgetEvaluationCardProps {
  fixedMonthlyBudget: number; // 評価対象の予算合計額
  averageGuideline: number;   // 年齢・CPIを考慮した世間目安
  evaluation: BudgetEvaluationResult;
  hasChild: boolean; 
}

export const BudgetEvaluationCard: React.FC<BudgetEvaluationCardProps> = ({ 
  fixedMonthlyBudget, 
  averageGuideline, 
  evaluation 
}) => {
  return (
    <View style={[styles.evaluationContainer, { backgroundColor: evaluation.bgColor }]}>
      <View style={styles.evalHeader}>
        <Text style={[styles.evaluationTitle, { color: evaluation.color }]}>{evaluation.title}</Text>
      </View>
      <Text style={[styles.evaluationMessage, { color: evaluation.color }]}>{evaluation.message}</Text>
      
      <View style={styles.detailsBox}>
        <Text style={[styles.detailText, { color: evaluation.color }]}>
          評価対象の合計: ￥{fixedMonthlyBudget.toLocaleString()}
        </Text>
        <Text style={[styles.detailText, { color: evaluation.color }]}>
          世間の目安: ￥{averageGuideline.toLocaleString()}
        </Text>
      </View>
      <Text style={[styles.guidelineNote, { color: evaluation.color }]}>
        ※「計算対象」として設定されたカテゴリの合計値で評価しています。
      </Text>
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