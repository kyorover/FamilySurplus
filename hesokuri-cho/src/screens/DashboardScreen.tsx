// src/screens/DashboardScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useHesokuriStore } from '../store';
import { HesokuriSummaryCard } from '../components/dashboard/HesokuriSummaryCard';
import { BudgetProgressBar } from '../components/dashboard/BudgetProgressBar';
import { CategoryDetailModal } from '../components/dashboard/CategoryDetailModal';
import { TotalHesokuriDisplay } from '../components/dashboard/TotalHesokuriDisplay';
import { BudgetEditModal } from '../components/settings/BudgetEditModal';

interface DashboardScreenProps {
  onNavigateToHistory: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToHistory }) => {
  const { settings, expenses, monthlyBudget, updateMonthlyBudget, updateExpense, deleteExpense } = useHesokuriStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  if (!settings || !monthlyBudget) return null;

  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  const activeCategories = settings.categories.filter(cat => 
    cat.isFixed && cat.name === '養育費' ? hasChild : true
  );

  // マスタ(settings)ではなく、今月のトランザクション(monthlyBudget)から予算額を取得して計算
  const totalMonthlyBudget = activeCategories.reduce((sum, cat) => sum + (monthlyBudget.budgets[cat.id] || 0), 0);
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currentHesokuri = totalMonthlyBudget - totalSpent;

  const spentByCategory = expenses.reduce((acc, exp) => {
    acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleSaveBudget = async (categoryId: string, newBudget: number) => {
    const newBudgets = { ...monthlyBudget.budgets, [categoryId]: newBudget };
    await updateMonthlyBudget(newBudgets, monthlyBudget.month_id);
    setEditingBudgetId(null);
  };

  const selectedCategoryForDetail = settings.categories.find(c => c.id === selectedCategoryId) || null;
  const selectedExpenses = expenses.filter(e => e.categoryId === selectedCategoryId).sort((a, b) => b.date.localeCompare(a.date));
  
  const editCategoryObj = settings.categories.find(c => c.id === editingBudgetId);
  const pseudoCategoryForBudgetEdit = editCategoryObj ? { ...editCategoryObj, budget: monthlyBudget.budgets[editCategoryObj.id] || 0 } : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <HesokuriSummaryCard currentHesokuri={currentHesokuri} totalMonthlyBudget={totalMonthlyBudget} totalSpent={totalSpent} />
        
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
            onPressEditBudget={setEditingBudgetId}
          />
        ))}

        <TotalHesokuriDisplay currentMonthHesokuri={currentHesokuri} />
      </ScrollView>

      <CategoryDetailModal 
        visible={!!selectedCategoryId} category={selectedCategoryForDetail} expenses={selectedExpenses}
        onClose={() => setSelectedCategoryId(null)} onUpdate={updateExpense} onDelete={deleteExpense}
      />
      
      <BudgetEditModal 
        visible={!!editingBudgetId} category={pseudoCategoryForBudgetEdit}
        onSave={handleSaveBudget} onClose={() => setEditingBudgetId(null)}
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