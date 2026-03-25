// src/components/settings/BudgetEvaluationCard.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BudgetEvaluationResult } from '../../functions/budgetUtils';

interface BudgetEvaluationCardProps {
  totalMonthlyBudget: number;
  averageGuideline: number;
  evaluation: BudgetEvaluationResult;
}

export const BudgetEvaluationCard: React.FC<BudgetEvaluationCardProps> = ({
  totalMonthlyBudget,
  averageGuideline,
  evaluation
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.totalBudgetRow}>
        <View>
          <Text style={styles.totalBudgetLabel}>今月の家計予算</Text>
          <Text style={styles.guidelineCompareText}>
            世間の目安: ￥{averageGuideline.toLocaleString()}
          </Text>
        </View>
        <Text style={styles.totalBudgetAmount}>
          ￥{totalMonthlyBudget.toLocaleString()}
        </Text>
      </View>
      <View style={[styles.evaluationContainer, { backgroundColor: evaluation.bgColor }]}>
        <Text style={[styles.evaluationTitle, { color: evaluation.color }]}>
          {evaluation.title}
        </Text>
        <Text style={[styles.evaluationMessage, { color: evaluation.color }]}>
          {evaluation.message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    overflow: 'hidden', 
    marginBottom: 24,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 2, 
    elevation: 1
  },
  totalBudgetRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16 
  },
  totalBudgetLabel: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#8E8E93', 
    marginBottom: 4 
  },
  guidelineCompareText: { 
    fontSize: 11, 
    color: '#8E8E93' 
  },
  totalBudgetAmount: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1C1C1E' 
  },
  evaluationContainer: { 
    padding: 12, 
    marginHorizontal: 16, 
    marginBottom: 16, 
    borderRadius: 10 
  },
  evaluationTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  evaluationMessage: { 
    fontSize: 11, 
    lineHeight: 16 
  },
});