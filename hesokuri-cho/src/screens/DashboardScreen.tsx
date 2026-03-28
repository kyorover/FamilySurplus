// src/screens/DashboardScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useHesokuriStore } from '../store';
import { HesokuriSummaryCard } from '../components/dashboard/HesokuriSummaryCard';
import { BudgetProgressBar } from '../components/dashboard/BudgetProgressBar';
import { CategoryDetailModal } from '../components/dashboard/CategoryDetailModal';
import { TotalHesokuriDisplay } from '../components/dashboard/TotalHesokuriDisplay';
import { MonthlyBudgetEditModal } from '../components/dashboard/MonthlyBudgetEditModal';
import { calculateAverageGuideline, evaluateBudget } from '../functions/budgetUtils';

interface DashboardScreenProps {
  onNavigateToHistory: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToHistory }) => {
  const { settings, expenses, monthlyBudget, updateMonthlyBudget, updateExpense, deleteExpense } = useHesokuriStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);

  if (!settings || !monthlyBudget) return null;

  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  const activeCategories = settings.categories.filter(cat => 
    cat.isFixed && cat.name === '養育費' ? hasChild : true
  );

  const totalMonthlyBudget = activeCategories.reduce((sum, cat) => sum + (monthlyBudget.budgets[cat.id] || 0), 0);
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currentHesokuri = totalMonthlyBudget - totalSpent;
  
  const averageGuideline = calculateAverageGuideline(settings.familyMembers);
  const evaluation = evaluateBudget(totalMonthlyBudget, averageGuideline);

  const spentByCategory = expenses.reduce((acc, exp) => {
    acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleSaveMonthlyBudget = async (newBudgets: Record<string, number>) => {
    await updateMonthlyBudget(newBudgets, monthlyBudget.month_id);
    setBudgetModalVisible(false);
  };

  const selectedCategoryForDetail = settings.categories.find(c => c.id === selectedCategoryId) || null;
  const selectedExpenses = expenses.filter(e => e.categoryId === selectedCategoryId).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* 統合されたへそくりサマリー＆予算評価カード */}
        <HesokuriSummaryCard 
          currentHesokuri={currentHesokuri} 
          totalMonthlyBudget={totalMonthlyBudget} 
          totalSpent={totalSpent}
          averageGuideline={averageGuideline}
          evaluation={evaluation}
          onPressEditBudget={() => setBudgetModalVisible(true)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>カテゴリ別状況</Text>
          <TouchableOpacity onPress={onNavigateToHistory} style={styles.historyBtn}>
            <Text style={styles.historyBtnText}>履歴を見る ＞</Text>
          </TouchableOpacity>
        </View>

        {activeCategories.map(cat => (
          <BudgetProgressBar 
            key={cat.id} categoryId={cat.id} categoryName={cat.name}
            budget={monthlyBudget.budgets[cat.id] || 0}
            spent={spentByCategory[cat.id] || 0}
            onPressDetail={setSelectedCategoryId}
          />
        ))}

        <TotalHesokuriDisplay currentMonthHesokuri={currentHesokuri} />
      </ScrollView>

      {/* 明細確認・修正ポップアップ */}
      <CategoryDetailModal 
        visible={!!selectedCategoryId} category={selectedCategoryForDetail} expenses={selectedExpenses}
        onClose={() => setSelectedCategoryId(null)} onUpdate={updateExpense} onDelete={deleteExpense}
      />
      
      {/* 今月の予算一括編集モーダル */}
      <MonthlyBudgetEditModal 
        visible={isBudgetModalVisible} categories={activeCategories} monthlyBudget={monthlyBudget}
        guideline={averageGuideline} onSave={handleSaveMonthlyBudget} onClose={() => setBudgetModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8, marginHorizontal: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93' },
  historyBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  historyBtnText: { fontSize: 13, fontWeight: 'bold', color: '#007AFF' },
});