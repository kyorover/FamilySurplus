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
import { MonthlyBudget } from '../types';

interface DashboardScreenProps {
  onNavigateToHesokuriHistory: () => void;
  onNavigateToInput: () => void; 
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToHesokuriHistory, onNavigateToInput }) => {
  const { settings, expenses, monthlyBudget, updateMonthlyBudget, deleteExpense, setExpenseInput, returnToCategoryDetail, returnToCategoryDetailDate, setReturnToCategoryDetail } = useHesokuriStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isAllCalendarVisible, setAllCalendarVisible] = useState(false);
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);

  useEffect(() => {
    if (returnToCategoryDetail === 'ALL') setAllCalendarVisible(true);
    else if (returnToCategoryDetail) setSelectedCategoryId(returnToCategoryDetail);
  }, [returnToCategoryDetail]);

  if (!settings || !monthlyBudget) return null;

  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  const activeCategories = settings.categories.filter(cat => cat.isFixed && cat.name === '養育費' ? hasChild : true);
  
  const totalMonthlyBudget = activeCategories.reduce((sum, cat) => sum + (monthlyBudget.budgets[cat.id] || 0), 0);
  const fixedMonthlyBudget = activeCategories.filter(cat => cat.isFixed).reduce((sum, cat) => sum + (monthlyBudget.budgets[cat.id] || 0), 0);
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currentHesokuri = totalMonthlyBudget - totalSpent;
  const averageGuideline = calculateAverageGuideline(settings.familyMembers);
  const evaluation = evaluateBudget(fixedMonthlyBudget, averageGuideline);

  const spentByCategory = expenses.reduce((acc, exp) => { acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.amount; return acc; }, {} as Record<string, number>);

  // 今月のルールに基づいたお小遣い支給額の計算
  const adults = settings.familyMembers.filter(m => m.role === '大人');
  const deficitRule = monthlyBudget.deficitRule || 'みんなで折半';
  
  const pocketMoneyDetails = adults.map(adult => {
    let bonus = 0;
    const ratio = monthlyBudget.bonusAllocation?.[adult.id] || 0;

    if (currentHesokuri > 0) {
      bonus = currentHesokuri * (ratio / 100);
    } else if (currentHesokuri < 0) {
      if (deficitRule === 'みんなで折半') {
        bonus = currentHesokuri / adults.length;
      } else if (deficitRule === '配分比率でカバー') {
        bonus = currentHesokuri * (ratio / 100);
      } else if (deficitRule === 'お小遣いは減らさない') {
        bonus = 0;
      }
    }
    return {
      id: adult.id,
      name: adult.name,
      base: adult.pocketMoneyAmount || 0,
      bonus: Math.round(bonus),
      total: (adult.pocketMoneyAmount || 0) + Math.round(bonus)
    };
  });

  const handleSaveMonthlyBudget = async (newBudgets: Record<string, number>, bonusAllocation: Record<string, number>, deficitRule: MonthlyBudget['deficitRule']) => {
    await updateMonthlyBudget(newBudgets, bonusAllocation, deficitRule, monthlyBudget.month_id);
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
          pocketMoneyDetails={pocketMoneyDetails}
          onPressCard={() => setAllCalendarVisible(true)} 
          onPressEditBudget={() => setBudgetModalVisible(true)} 
        />
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>カテゴリ別状況</Text>
          <TouchableOpacity onPress={() => setAllCalendarVisible(true)} style={styles.historyBtn}>
            <Text style={styles.historyBtnText}>📅 過去のカレンダー</Text>
          </TouchableOpacity>
        </View>
        
        {activeCategories.map(cat => (
          <BudgetProgressBar key={cat.id} categoryId={cat.id} categoryName={cat.name} budget={monthlyBudget.budgets[cat.id] || 0} spent={spentByCategory[cat.id] || 0} onPressDetail={setSelectedCategoryId} />
        ))}
        <TotalHesokuriDisplay currentMonthHesokuri={currentHesokuri} onPress={onNavigateToHesokuriHistory} />
      </ScrollView>

      <CategoryDetailModal visible={!!selectedCategoryId} category={selectedCategoryForDetail} expenses={selectedExpenses} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail !== 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setSelectedCategoryId(null); if (returnToCategoryDetail !== 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(categoryId, date) => { setExpenseInput({ id: undefined, date, amount: '0', categoryId, paymentMethod: '現金', storeName: '', memo: '', isLocked: true }); setReturnToCategoryDetail(categoryId, date); onNavigateToInput(); }} onEditExpense={(exp) => { setExpenseInput({ id: exp.id, date: exp.date, amount: String(exp.amount), categoryId: exp.categoryId, paymentMethod: exp.paymentMethod, storeName: exp.storeName || '', memo: exp.memo || '', isLocked: true }); setReturnToCategoryDetail(exp.categoryId, exp.date); onNavigateToInput(); }} />
      <AllCategoryCalendarModal visible={isAllCalendarVisible} categories={activeCategories} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail === 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setAllCalendarVisible(false); if (returnToCategoryDetail === 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(date) => { setExpenseInput({ id: undefined, date, amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false }); setReturnToCategoryDetail('ALL', date); onNavigateToInput(); }} onEditExpense={(exp) => { setExpenseInput({ id: exp.id, date: exp.date, amount: String(exp.amount), categoryId: exp.categoryId, paymentMethod: exp.paymentMethod, storeName: exp.storeName || '', memo: exp.memo || '', isLocked: false }); setReturnToCategoryDetail('ALL', exp.date); onNavigateToInput(); }} />
      <MonthlyBudgetEditModal visible={isBudgetModalVisible} categories={activeCategories} familyMembers={settings.familyMembers} monthlyBudget={monthlyBudget} guideline={averageGuideline} onSave={handleSaveMonthlyBudget} onClose={() => setBudgetModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8, marginHorizontal: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93' },
  historyBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#F2F2F7', borderRadius: 8 },
  historyBtnText: { fontSize: 12, fontWeight: 'bold', color: '#1C1C1E' },
});