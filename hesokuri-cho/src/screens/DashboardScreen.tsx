// src/screens/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Modal, Platform, UIManager } from 'react-native';
import { useHesokuriStore } from '../store';
import { DashboardStatusCard } from '../components/dashboard/DashboardStatusCard';
import { CategoryListSection } from '../components/dashboard/CategoryListSection';
import { CategoryDetailModal } from '../components/dashboard/CategoryDetailModal';
import { AllCategoryCalendarModal } from '../components/dashboard/AllCategoryCalendarModal';
import { MonthlyBudgetEditModal } from '../components/dashboard/MonthlyBudgetEditModal';
import { PocketMoneyRuleModal } from '../components/dashboard/PocketMoneyRuleModal';
import { HesokuriPocketMoneyArea } from '../components/dashboard/HesokuriPocketMoneyArea';
import { calculateAverageGuideline } from '../functions/budgetUtils';
import { Category } from '../types';
import { useMonthCheckout } from '../hooks/useMonthCheckout';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { MonthCheckoutModal } from '../components/dashboard/MonthCheckoutModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DashboardScreenProps { onNavigateToHesokuriHistory: () => void; onNavigateToInput: () => void; }

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToHesokuriHistory, onNavigateToInput }) => {
  // ▼ saveMonthlySummary を新しく取得
  const { settings, expenses, monthlyBudget, updateSettings, updateMonthlyBudget, deleteExpense, setExpenseInput, returnToCategoryDetail, returnToCategoryDetailDate, setReturnToCategoryDetail, waterGarden, saveMonthlySummary } = useHesokuriStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isAllCalendarVisible, setAllCalendarVisible] = useState(false);
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
  const [isPocketMoneyModalVisible, setPocketMoneyModalVisible] = useState(false);
  const [isSettingsMenuVisible, setSettingsMenuVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  useEffect(() => {
    if (returnToCategoryDetail === 'ALL') setAllCalendarVisible(true);
    else if (returnToCategoryDetail) setSelectedCategoryId(returnToCategoryDetail);
  }, [returnToCategoryDetail]);

  // ビジネスロジックをカスタムフックへ移譲
  const { activeCategories, totalMonthlyBudget, totalSpent, currentHesokuri, spentByCategory, pocketMoneyDetails } = useDashboardStats(settings, monthlyBudget, expenses);

  // ▼ 月締め・予算自動継承ロジック
  const { isCheckoutVisible, checkoutMonthId, budgetAmount, checkoutExpenses, handleConfirmCheckout } = useMonthCheckout(
    monthlyBudget, activeCategories, expenses || [],
    async (monthId, confirmedAmount) => {
      // ▼ API・Storeを経由してDynamoDBへ確定へそくり額を保存
      await saveMonthlySummary(monthId, confirmedAmount);
      console.log(`[Dashboard] へそくり確定完了: ${monthId} = ¥${confirmedAmount}`);
    },
    async (oldBudget, newMonthId) => await updateMonthlyBudget(oldBudget.budgets, oldBudget.bonusAllocation, oldBudget.deficitRule, newMonthId)
  );

  if (!settings || !monthlyBudget) return null;

  const safeExpenses = expenses || [];
  const [year, month] = monthlyBudget.month_id.split('-');
  
  const handleSaveOrder = async (newList: Category[]) => {
    const activeIds = new Set(newList.map(c => c.id));
    const hiddenCategories = (settings.categories || []).filter(c => !activeIds.has(c.id));
    const newCategories = [...newList, ...hiddenCategories];
    await updateSettings({ ...settings, categories: newCategories });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{`${year}年${parseInt(month, 10)}月の予算`}</Text>
        <TouchableOpacity onPress={() => setSettingsMenuVisible(true)} style={styles.menuBtn}><Text style={styles.menuBtnText}>≡ メニュー</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} scrollEnabled={isScrollEnabled} showsVerticalScrollIndicator={false}>
        <DashboardStatusCard gardenPoints={settings.gardenPoints || 0} lastWateringDate={settings.lastWateringDate} currentHesokuri={currentHesokuri} totalSpent={totalSpent} totalMonthlyBudget={totalMonthlyBudget} progressRatio={totalMonthlyBudget > 0 ? Math.min(1, totalSpent / totalMonthlyBudget) : 0} progressColor={currentHesokuri >= 0 ? '#34C759' : '#FF3B30'} onWaterGarden={waterGarden} onPressCard={() => setAllCalendarVisible(true)} />
        <CategoryListSection categories={activeCategories} monthlyBudget={monthlyBudget} spentByCategory={spentByCategory} isEditMode={isEditMode} setIsEditMode={setIsEditMode} onSaveOrder={handleSaveOrder} onDragStateChange={setIsScrollEnabled} onSelectCategory={setSelectedCategoryId} />
        <HesokuriPocketMoneyArea currentHesokuri={currentHesokuri} pocketMoneyDetails={pocketMoneyDetails} onPressPocketMoney={() => setPocketMoneyModalVisible(true)} />
      </ScrollView>

      {!isEditMode && (<TouchableOpacity onPress={onNavigateToInput} style={styles.fab}><Text style={styles.fabText}>＋</Text></TouchableOpacity>)}

      <Modal visible={isSettingsMenuVisible} transparent animationType="slide" onRequestClose={() => setSettingsMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setSettingsMenuVisible(false)}>
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>メニュー</Text>
              <TouchableOpacity onPress={() => setSettingsMenuVisible(false)}><Text style={styles.menuCloseBtn}>✕</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setSettingsMenuVisible(false); setBudgetModalVisible(true); }}><Text style={styles.menuItemIcon}>📊</Text><Text style={styles.menuItemText}>今月の予算を編成</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setSettingsMenuVisible(false); setPocketMoneyModalVisible(true); }}><Text style={styles.menuItemIcon}>💰</Text><Text style={styles.menuItemText}>お小遣いルールを設定</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setSettingsMenuVisible(false); onNavigateToHesokuriHistory(); }}><Text style={styles.menuItemIcon}>📈</Text><Text style={styles.menuItemText}>過去のへそくり履歴</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <CategoryDetailModal visible={!!selectedCategoryId} category={(settings.categories || []).find(c => c.id === selectedCategoryId) || null} expenses={safeExpenses.filter(e => e.categoryId === selectedCategoryId)} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail !== 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setSelectedCategoryId(null); if (returnToCategoryDetail !== 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(c, d) => { setExpenseInput({ id: undefined, date: d, amount: '0', categoryId: c, paymentMethod: '現金', storeName: '', memo: '', isLocked: true }); setReturnToCategoryDetail(c, d); onNavigateToInput(); }} onEditExpense={(e) => { setExpenseInput({ id: e.id, date: e.date, amount: String(e.amount), categoryId: e.categoryId, paymentMethod: e.paymentMethod, storeName: e.storeName || '', memo: e.memo || '', isLocked: true }); setReturnToCategoryDetail(e.categoryId, e.date); onNavigateToInput(); }} />
      <AllCategoryCalendarModal visible={isAllCalendarVisible} categories={activeCategories} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail === 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setAllCalendarVisible(false); if (returnToCategoryDetail === 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(d) => { setExpenseInput({ id: undefined, date: d, amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false }); setReturnToCategoryDetail('ALL', d); onNavigateToInput(); }} onEditExpense={(e) => { setExpenseInput({ id: e.id, date: e.date, amount: String(e.amount), categoryId: e.categoryId, paymentMethod: e.paymentMethod, storeName: e.storeName || '', memo: e.memo || '', isLocked: false }); setReturnToCategoryDetail('ALL', e.date); onNavigateToInput(); }} />
      <MonthlyBudgetEditModal visible={isBudgetModalVisible} categories={activeCategories} monthlyBudget={monthlyBudget} guideline={calculateAverageGuideline(settings.familyMembers || [])} onSave={async (b) => { await updateMonthlyBudget(b, monthlyBudget.bonusAllocation, monthlyBudget.deficitRule, monthlyBudget.month_id); setBudgetModalVisible(false); }} onClose={() => setBudgetModalVisible(false)} />
      <PocketMoneyRuleModal visible={isPocketMoneyModalVisible} familyMembers={settings.familyMembers || []} monthlyBudget={monthlyBudget} onSave={async (a, r) => { await updateMonthlyBudget(monthlyBudget.budgets, a, r, monthlyBudget.month_id); setPocketMoneyModalVisible(false); }} onClose={() => setPocketMoneyModalVisible(false)} />
      
      {checkoutMonthId && <MonthCheckoutModal visible={isCheckoutVisible} monthId={checkoutMonthId} budgetAmount={budgetAmount} expenses={checkoutExpenses} onConfirm={handleConfirmCheckout} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  menuBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#F2F2F7', borderRadius: 8 },
  menuBtnText: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E' },
  fab: { position: 'absolute', right: 24, bottom: 24, backgroundColor: '#007AFF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
  fabText: { color: '#FFFFFF', fontSize: 32, fontWeight: '300', marginTop: -2 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  menuContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  menuCloseBtn: { fontSize: 20, color: '#8E8E93', padding: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  menuItemIcon: { fontSize: 20, marginRight: 16, width: 24, textAlign: 'center' },
  menuItemText: { fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
});