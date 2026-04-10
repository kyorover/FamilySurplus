// src/components/settings/BudgetSettingsSection.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CategoryBudgetList } from './CategoryBudgetList';
import { BudgetEvaluationCard } from './BudgetEvaluationCard';
import { Category } from '../../types';

interface BudgetSettingsSectionProps {
  activeCategories: Category[];
  budgetEvaluation: any; // useSettingsManagerから渡される評価オブジェクト
  onCategoryPress: (category: Category) => void;
}

export const BudgetSettingsSection: React.FC<BudgetSettingsSectionProps> = ({ 
  activeCategories, 
  budgetEvaluation, 
  onCategoryPress 
}) => {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>💰 予算設定と評価</Text>
      </View>
      {budgetEvaluation && (
        <BudgetEvaluationCard 
          fixedMonthlyBudget={budgetEvaluation.totalFixedBudget}
          averageGuideline={budgetEvaluation.averageGuideline}
          evaluation={budgetEvaluation.evaluation}
          hasChild={budgetEvaluation.hasChild}
        />
      )}
      <CategoryBudgetList 
        categories={activeCategories}
        onCategoryPress={onCategoryPress}
      />
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, marginBottom: 8, paddingHorizontal: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
});