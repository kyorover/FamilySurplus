// src/screens/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useHesokuriStore } from '../store';
import { HesokuriSummaryCard } from '../components/dashboard/HesokuriSummaryCard';
import { BudgetProgressBar } from '../components/dashboard/BudgetProgressBar';
import { CategoryDetailModal } from '../components/dashboard/CategoryDetailModal';
import { AllCategoryCalendarModal } from '../components/dashboard/AllCategoryCalendarModal';
import { TotalHesokuriDisplay } from '../components/dashboard/TotalHesokuriDisplay';
import { MonthlyBudgetEditModal } from '../components/dashboard/MonthlyBudgetEditModal';
import { calculateAverageGuideline, evaluateBudget } from '../functions/budgetUtils';

interface DashboardScreenProps {
  onNavigateToHistory: () => void;
  onNavigateToHesokuriHistory: () => void;
  onNavigateToInput: () => void; 
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToHistory, onNavigateToHesokuriHistory, onNavigateToInput }) => {
  const { settings, expenses, monthlyBudget, updateMonthlyBudget, deleteExpense, setExpenseInput, returnToCategoryDetail, returnToCategoryDetailDate, setReturnToCategoryDetail } = useHesokuriStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isAllCalendarVisible, setAllCalendarVisible] = useState(false);
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);

  useEffect(() => {
    if (returnToCategoryDetail === 'ALL') {
      setAllCalendarVisible(true);
    } else if (returnToCategoryDetail) {
      setSelectedCategoryId(returnToCategoryDetail);
    }
  }, [returnToCategoryDetail]);

  if (!settings || !monthlyBudget) return null;

  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  const activeCategories = settings.categories.filter(cat => cat.isFixed && cat.name === '養育費' ? hasChild : true);
  
  // へそくり計算用の「総予算」
  const totalMonthlyBudget = activeCategories.reduce((sum, cat) => sum + (monthlyBudget.budgets[cat.id] || 0), 0);
  
  // 評価バッジ計算用の「固定費予算のみ」
  const fixedMonthlyBudget = activeCategories.filter(cat => cat.isFixed).reduce((sum, cat) => sum + (monthlyBudget.budgets[cat.id] || 0), 0);
  
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currentHesokuri = totalMonthlyBudget - totalSpent;
  const averageGuideline = calculateAverageGuideline(settings.familyMembers);
  
  // 修正：総予算ではなく、固定費予算のみを評価に渡す
  const evaluation = evaluateBudget(fixedMonthlyBudget, averageGuideline);

  const spentByCategory = expenses.reduce((acc, exp) => { acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.amount; return acc; }, {} as Record<string, number>);

  const handleSaveMonthlyBudget = async (newBudgets: Record<string, number>) => {
    await updateMonthlyBudget(newBudgets, monthlyBudget.month_id);
    setBudgetModalVisible(false);
  };

  const selectedCategoryForDetail = settings.categories.find(c => c.id === selectedCategoryId) || null;
  const selectedExpenses = expenses.filter(e => e.categoryId === selectedCategoryId).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <HesokuriSummaryCard 
          currentHesokuri={currentHesokuri} totalMonthlyBudget={totalMonthlyBudget} totalSpent={totalSpent} 
          averageGuideline={averageGuideline} evaluation={evaluation} hasChild={hasChild}
          onPressCard={() => setAllCalendarVisible(true)} 
          onPressEditBudget={() => setBudgetModalVisible(true)} 
        />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>カテゴリ別状況</Text>
          <TouchableOpacity onPress={onNavigateToHistory} style={styles.historyBtn}><Text style={styles.historyBtnText}>履歴を見る ＞</Text></TouchableOpacity>
        </View>
        {activeCategories.map(cat => (
          <BudgetProgressBar key={cat.id} categoryId={cat.id} categoryName={cat.name} budget={monthlyBudget.budgets[cat.id] || 0} spent={spentByCategory[cat.id] || 0} onPressDetail={setSelectedCategoryId} />
        ))}
        <TotalHesokuriDisplay currentMonthHesokuri={currentHesokuri} onPress={onNavigateToHesokuriHistory} />
      </ScrollView>

      <CategoryDetailModal 
        visible={!!selectedCategoryId} category={selectedCategoryForDetail} expenses={selectedExpenses} currentMonth={monthlyBudget.month_id}
        initialDate={returnToCategoryDetail !== 'ALL' ? returnToCategoryDetailDate : null}
        onClose={() => { setSelectedCategoryId(null); if (returnToCategoryDetail !== 'ALL') setReturnToCategoryDetail(null, null); }} 
        onDelete={deleteExpense}
        onAddExpense={(categoryId, date) => {
          setExpenseInput({ id: undefined, date, amount: '0', categoryId, paymentMethod: '現金', storeName: '', memo: '', isLocked: true });
          setReturnToCategoryDetail(categoryId, date);
          onNavigateToInput();
        }}
        onEditExpense={(exp) => {
          setExpenseInput({ id: exp.id, date: exp.date, amount: String(exp.amount), categoryId: exp.categoryId, paymentMethod: exp.paymentMethod, storeName: exp.storeName || '', memo: exp.memo || '', isLocked: true });
          setReturnToCategoryDetail(exp.categoryId, exp.date);
          onNavigateToInput();
        }}
      />

      <AllCategoryCalendarModal 
        visible={isAllCalendarVisible} categories={activeCategories} expenses={expenses} currentMonth={monthlyBudget.month_id}
        initialDate={returnToCategoryDetail === 'ALL' ? returnToCategoryDetailDate : null}
        onClose={() => { setAllCalendarVisible(false); if (returnToCategoryDetail === 'ALL') setReturnToCategoryDetail(null, null); }}
        onDelete={deleteExpense}
        onAddExpense={(date) => {
          setExpenseInput({ id: undefined, date, amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false });
          setReturnToCategoryDetail('ALL', date);
          onNavigateToInput();
        }}
        onEditExpense={(exp) => {
          setExpenseInput({ id: exp.id, date: exp.date, amount: String(exp.amount), categoryId: exp.categoryId, paymentMethod: exp.paymentMethod, storeName: exp.storeName || '', memo: exp.memo || '', isLocked: false });
          setReturnToCategoryDetail('ALL', exp.date);
          onNavigateToInput();
        }}
      />

      <MonthlyBudgetEditModal visible={isBudgetModalVisible} categories={activeCategories} monthlyBudget={monthlyBudget} guideline={averageGuideline} onSave={handleSaveMonthlyBudget} onClose={() => setBudgetModalVisible(false)} />
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