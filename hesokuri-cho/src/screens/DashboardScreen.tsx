// src/screens/DashboardScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import { useHesokuriStore } from '../store';
import { HesokuriSummaryCard } from '../components/dashboard/HesokuriSummaryCard';
import { BudgetProgressBar } from '../components/dashboard/BudgetProgressBar';
import { CategoryDetailModal } from '../components/dashboard/CategoryDetailModal';
import { AllCategoryCalendarModal } from '../components/dashboard/AllCategoryCalendarModal';
import { TotalHesokuriDisplay } from '../components/dashboard/TotalHesokuriDisplay';
import { MonthlyBudgetEditModal } from '../components/dashboard/MonthlyBudgetEditModal';
import { PocketMoneyRuleModal } from '../components/dashboard/PocketMoneyRuleModal';
import { calculateAverageGuideline, evaluateBudget } from '../functions/budgetUtils';
import { MonthlyBudget, Category } from '../types';

interface DashboardScreenProps {
  onNavigateToHesokuriHistory: () => void;
  onNavigateToInput: () => void; 
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToHesokuriHistory, onNavigateToInput }) => {
  const { settings, expenses, monthlyBudget, updateSettings, updateMonthlyBudget, deleteExpense, setExpenseInput, returnToCategoryDetail, returnToCategoryDetailDate, setReturnToCategoryDetail } = useHesokuriStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isAllCalendarVisible, setAllCalendarVisible] = useState(false);
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
  const [isPocketMoneyModalVisible, setPocketMoneyModalVisible] = useState(false);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  useEffect(() => {
    if (returnToCategoryDetail === 'ALL') setAllCalendarVisible(true);
    else if (returnToCategoryDetail) setSelectedCategoryId(returnToCategoryDetail);
  }, [returnToCategoryDetail]);

  const activeCategories = useMemo(() => {
    if (!settings) return [];
    const hasChild = settings.familyMembers.some(m => m.role === '子供');
    return settings.categories.filter(cat => cat.isFixed && cat.name === '養育費' ? hasChild : true);
  }, [settings]);

  if (!settings || !monthlyBudget) return null;

  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  
  const targetCategories = activeCategories.filter(cat => cat.isFixed || cat.isCalculationTarget !== false);
  const targetCategoryIds = new Set(targetCategories.map(c => c.id));

  const totalMonthlyBudget = targetCategories.reduce((sum, cat) => sum + (monthlyBudget.budgets[cat.id] || 0), 0);
  const totalSpent = expenses.filter(exp => targetCategoryIds.has(exp.categoryId)).reduce((sum, exp) => sum + exp.amount, 0);
  const currentHesokuri = totalMonthlyBudget - totalSpent;

  const fixedMonthlyBudget = activeCategories.filter(cat => cat.isFixed).reduce((sum, cat) => sum + (monthlyBudget.budgets[cat.id] || 0), 0);
  const averageGuideline = calculateAverageGuideline(settings.familyMembers);
  const evaluation = evaluateBudget(fixedMonthlyBudget, averageGuideline);

  const spentByCategory = expenses.reduce((acc, exp) => { acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.amount; return acc; }, {} as Record<string, number>);

  const adults = settings.familyMembers.filter(m => m.role === '大人');
  const deficitRule = monthlyBudget.deficitRule || 'みんなで折半';
  
  const pocketMoneyDetails = adults.map(adult => {
    let bonus = 0;
    const ratio = monthlyBudget.bonusAllocation?.[adult.id] || 0;
    if (currentHesokuri > 0) bonus = currentHesokuri * (ratio / 100);
    else if (currentHesokuri < 0) {
      if (deficitRule === 'みんなで折半') bonus = currentHesokuri / adults.length;
      else if (deficitRule === '配分比率でカバー') bonus = currentHesokuri * (ratio / 100);
      else if (deficitRule === 'お小遣いは減らさない') bonus = 0;
    }
    return { id: adult.id, name: adult.name, base: adult.pocketMoneyAmount || 0, bonus: Math.round(bonus), total: (adult.pocketMoneyAmount || 0) + Math.round(bonus) };
  });

  const handleSaveMonthlyBudget = async (newBudgets: Record<string, number>) => {
    await updateMonthlyBudget(newBudgets, monthlyBudget.bonusAllocation, monthlyBudget.deficitRule, monthlyBudget.month_id);
    setBudgetModalVisible(false);
  };

  const handleSavePocketMoneyRules = async (newAllocation: Record<string, number>, newRule: MonthlyBudget['deficitRule']) => {
    await updateMonthlyBudget(monthlyBudget.budgets, newAllocation, newRule, monthlyBudget.month_id);
    setPocketMoneyModalVisible(false);
  };

  const handleReorderCategories = async (fromIndex: number, toIndex: number) => {
    const newCategories = [...settings.categories];
    const itemToMove = activeCategories[fromIndex];
    const targetItem = activeCategories[toIndex];
    
    const fullFromIdx = newCategories.findIndex(c => c.id === itemToMove.id);
    const fullToIdx = newCategories.findIndex(c => c.id === targetItem.id);
    
    const [removed] = newCategories.splice(fullFromIdx, 1);
    newCategories.splice(fullToIdx, 0, removed);
    
    await updateSettings({ ...settings, categories: newCategories });
  };

  const renderCategoryItem = ({ item: cat, onDragStart, onDragEnd, isActive }: DragListRenderItemInfo<Category>) => (
    <View style={[styles.dragRow, isActive && styles.dragRowActive]}>
      <TouchableOpacity activeOpacity={0.6} onPressIn={onDragStart} onPressOut={onDragEnd} style={styles.dragHandle}>
        <Text style={[styles.dragIcon, isActive && { color: '#007AFF' }]}>≡</Text>
      </TouchableOpacity>
      <View style={styles.progressWrap} pointerEvents="none">
        <BudgetProgressBar 
          categoryId={cat.id} 
          categoryName={cat.name} 
          budget={monthlyBudget.budgets[cat.id] || 0} 
          spent={spentByCategory[cat.id] || 0} 
          isCalculationTarget={cat.isCalculationTarget} // 対象外フラグを渡す
          onPressDetail={() => {}} 
        />
      </View>
    </View>
  );

  const selectedCategoryForDetail = settings.categories.find(c => c.id === selectedCategoryId) || null;
  const selectedExpenses = expenses.filter(e => e.categoryId === selectedCategoryId).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} scrollEnabled={isScrollEnabled}>
        
        <View style={styles.contentPadding}>
          <HesokuriSummaryCard 
            currentHesokuri={currentHesokuri} totalMonthlyBudget={totalMonthlyBudget} totalSpent={totalSpent} 
            averageGuideline={averageGuideline} evaluation={evaluation} hasChild={hasChild}
            pocketMoneyDetails={pocketMoneyDetails}
            onPressCard={() => setAllCalendarVisible(true)} 
            onPressEditBudget={() => setBudgetModalVisible(true)} 
            onPressPocketMoney={() => setPocketMoneyModalVisible(true)}
          />
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>カテゴリ別状況</Text>
            
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)} style={[styles.actionBtn, isEditMode && styles.actionBtnActive]}>
                <Text style={[styles.actionBtnText, isEditMode && styles.actionBtnTextActive]}>{isEditMode ? '✅ 完了' : '↕️ 並び替え'}</Text>
              </TouchableOpacity>
              {!isEditMode && (
                <TouchableOpacity onPress={() => setAllCalendarVisible(true)} style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>📅 過去</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {isEditMode ? (
          <DragList
            data={activeCategories}
            keyExtractor={(item) => item.id}
            onReordered={handleReorderCategories}
            renderItem={renderCategoryItem}
            onDragBegin={() => setIsScrollEnabled(false)}
            onDragEnd={() => setIsScrollEnabled(true)}
            scrollEnabled={false}
          />
        ) : (
          <View>
            {activeCategories.map(cat => (
              <View key={cat.id} style={styles.viewRow}>
                <View style={styles.progressWrap}>
                  <BudgetProgressBar 
                    categoryId={cat.id} 
                    categoryName={cat.name} 
                    budget={monthlyBudget.budgets[cat.id] || 0} 
                    spent={spentByCategory[cat.id] || 0} 
                    isCalculationTarget={cat.isCalculationTarget} // 対象外フラグを渡す
                    onPressDetail={setSelectedCategoryId} 
                  />
                </View>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.contentPadding}>
          <TotalHesokuriDisplay currentMonthHesokuri={currentHesokuri} onPress={onNavigateToHesokuriHistory} />
        </View>

      </ScrollView>

      <CategoryDetailModal visible={!!selectedCategoryId} category={selectedCategoryForDetail} expenses={selectedExpenses} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail !== 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setSelectedCategoryId(null); if (returnToCategoryDetail !== 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(categoryId, date) => { setExpenseInput({ id: undefined, date, amount: '0', categoryId, paymentMethod: '現金', storeName: '', memo: '', isLocked: true }); setReturnToCategoryDetail(categoryId, date); onNavigateToInput(); }} onEditExpense={(exp) => { setExpenseInput({ id: exp.id, date: exp.date, amount: String(exp.amount), categoryId: exp.categoryId, paymentMethod: exp.paymentMethod, storeName: exp.storeName || '', memo: exp.memo || '', isLocked: true }); setReturnToCategoryDetail(exp.categoryId, exp.date); onNavigateToInput(); }} />
      <AllCategoryCalendarModal visible={isAllCalendarVisible} categories={activeCategories} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail === 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setAllCalendarVisible(false); if (returnToCategoryDetail === 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(date) => { setExpenseInput({ id: undefined, date, amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false }); setReturnToCategoryDetail('ALL', date); onNavigateToInput(); }} onEditExpense={(exp) => { setExpenseInput({ id: exp.id, date: exp.date, amount: String(exp.amount), categoryId: exp.categoryId, paymentMethod: exp.paymentMethod, storeName: exp.storeName || '', memo: exp.memo || '', isLocked: false }); setReturnToCategoryDetail('ALL', exp.date); onNavigateToInput(); }} />
      <MonthlyBudgetEditModal visible={isBudgetModalVisible} categories={activeCategories} monthlyBudget={monthlyBudget} guideline={averageGuideline} onSave={handleSaveMonthlyBudget} onClose={() => setBudgetModalVisible(false)} />
      <PocketMoneyRuleModal visible={isPocketMoneyModalVisible} familyMembers={settings.familyMembers} monthlyBudget={monthlyBudget} onSave={handleSavePocketMoneyRules} onClose={() => setPocketMoneyModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentPadding: { paddingHorizontal: 16, paddingTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8, marginHorizontal: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93' },
  headerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#F2F2F7', borderRadius: 8 },
  actionBtnActive: { backgroundColor: '#007AFF' },
  actionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#1C1C1E' },
  actionBtnTextActive: { color: '#FFFFFF' },
  viewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dragRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 4 },
  dragRowActive: { backgroundColor: '#F0F8FF', zIndex: 999, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  dragHandle: { paddingLeft: 16, paddingRight: 8, paddingVertical: 16, justifyContent: 'center' },
  dragIcon: { fontSize: 24, color: '#C7C7CC', fontWeight: '300' },
  progressWrap: { flex: 1, paddingHorizontal: 16 },
});