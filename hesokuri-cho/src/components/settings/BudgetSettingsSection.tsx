// src/components/settings/BudgetSettingsSection.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Category } from '../../types';
import { BudgetFrame } from '../budget/BudgetFrame';

interface BudgetSettingsSectionProps {
  activeCategories: Category[];
  // ▼ 編集中の状態を反映した評価データを正しく受け取る
  budgetEvaluation: {
    totalFixedBudget: number;
    averageGuideline: number;
    evaluation: any;
    hasChild: boolean;
  } | null;
  onCategoryPress: (category: Category) => void;
}

export const BudgetSettingsSection: React.FC<BudgetSettingsSectionProps> = ({ 
  activeCategories, 
  budgetEvaluation, 
  onCategoryPress 
}) => {
  // 評価データがない場合は何も表示しない（元の挙動を維持）
  if (!budgetEvaluation) return null;

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>💰 予算設定と評価</Text>
      </View>

      {/* 【根本解決】
        以前はここに BudgetEvaluationCard と CategoryBudgetList をバラで書いていたが、
        BudgetFrame に一本化することで、ダッシュボード側と計算・表示ロジックを強制同期させる。
      */}
      <BudgetFrame 
        categories={activeCategories}
        guideline={budgetEvaluation.averageGuideline}
        onCategoryPress={onCategoryPress}
      />
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    marginTop: 16, 
    marginBottom: 8, 
    paddingHorizontal: 8 
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
});