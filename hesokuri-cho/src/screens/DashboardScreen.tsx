// src/screens/DashboardScreen.tsx
import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { useHesokuriStore } from '../store';
import { HesokuriSummaryCard } from '../components/dashboard/HesokuriSummaryCard';
import { BudgetProgressBar } from '../components/dashboard/BudgetProgressBar';

export const DashboardScreen: React.FC = () => {
  const { settings, expenses } = useHesokuriStore();

  if (!settings) return null;

  // 子供の有無によるカテゴリフィルタリング
  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  const activeCategories = settings.categories.filter(cat => 
    cat.isFixed && cat.name === '養育費' ? hasChild : true
  );

  // 集計ロジック
  const totalMonthlyBudget = activeCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currentHesokuri = totalMonthlyBudget - totalSpent;

  const spentByCategory = expenses.reduce((acc, exp) => {
    acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <HesokuriSummaryCard 
        currentHesokuri={currentHesokuri}
        totalMonthlyBudget={totalMonthlyBudget}
        totalSpent={totalSpent}
      />
      
      <Text style={styles.sectionTitle}>カテゴリ別状況</Text>
      {activeCategories.map(cat => (
        <BudgetProgressBar 
          key={cat.id}
          categoryName={cat.name}
          budget={cat.budget}
          spent={spentByCategory[cat.id] || 0}
        />
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#8E8E93', 
    marginLeft: 8, 
    marginBottom: 8 
  },
});