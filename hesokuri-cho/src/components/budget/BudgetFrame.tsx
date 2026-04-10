// src/components/budget/BudgetFrame.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Category } from '../../types';
import { BudgetEvaluationCard } from '../settings/BudgetEvaluationCard';
import { CategoryBudgetList } from '../settings/CategoryBudgetList';
import { evaluateBudget } from '../../functions/budgetUtils';
import { DEFAULT_CATEGORY_NAMES } from '../../constants';

interface BudgetFrameProps {
  categories: Category[];           // 表示・集計対象のカテゴリ（最新の予算額を含むもの）
  guideline: number;                // 外部（年齢・CPI考慮済み）から渡される世間目安
  onCategoryPress: (category: Category) => void;
}

export const BudgetFrame: React.FC<BudgetFrameProps> = ({ categories, guideline, onCategoryPress }) => {
  /**
   * 【集計ロジックの一本化】
   * 設定画面でもダッシュボードでも、このロジック以外での集計を禁止する。
   * isCalculationTarget が明示的に false でない限り、すべて評価対象に含める。
   */
  const totalTargetBudget = categories
    .filter(cat => cat.isCalculationTarget !== false)
    .reduce((sum, cat) => sum + (cat.budget || 0), 0);

  // 評価ロジックをここで実行。表示されるバッジは常にこのフレームの計算結果に基づく。
  const evaluation = evaluateBudget(totalTargetBudget, guideline);
  const hasChild = categories.some(cat => cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE);

  return (
    <View style={styles.container}>
      {/* 共通の評価カード表示 */}
      <BudgetEvaluationCard 
        fixedMonthlyBudget={totalTargetBudget} 
        averageGuideline={guideline} 
        evaluation={evaluation} 
        hasChild={hasChild} 
      />
      
      <Text style={styles.sectionTitle}>📋 カテゴリ別予算（タップで編集）</Text>
      
      {/* 共通のリスト表示 */}
      <CategoryBudgetList 
        categories={categories}
        onCategoryPress={onCategoryPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93', marginLeft: 8, marginBottom: 8 },
});