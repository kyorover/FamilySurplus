// src/screens/DashboardScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, UIManager } from 'react-native';
import { DashboardStatusCard } from '../components/dashboard/DashboardStatusCard';
import { CategoryListSection } from '../components/dashboard/CategoryListSection';
import { CategoryDetailModal } from '../components/dashboard/CategoryDetailModal';
import { AllCategoryCalendarModal } from '../components/dashboard/AllCategoryCalendarModal';
import { MonthlyBudgetEditModal } from '../components/dashboard/MonthlyBudgetEditModal';
import { PocketMoneyRuleModal } from '../components/dashboard/PocketMoneyRuleModal';
import { HesokuriPocketMoneyArea } from '../components/dashboard/HesokuriPocketMoneyArea';
import { MonthCheckoutModal } from '../components/dashboard/MonthCheckoutModal';
import { BudgetEvaluationCard } from '../components/settings/BudgetEvaluationCard';
import { useDashboardScreen } from '../hooks/useDashboardScreen';
import { DashboardSettingsMenu } from '../components/dashboard/DashboardSettingsMenu';
import { DashboardAdBanner } from '../components/dashboard/DashboardAdBanner';
import { styles } from '../styles/DashboardStyles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DashboardScreenProps { 
  onNavigateToHesokuriHistory: () => void; 
  onNavigateToInput: () => void; 
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToHesokuriHistory, onNavigateToInput }) => {
  const {
    settings,
    expenses,
    monthlyBudget,
    selectedCategoryId, setSelectedCategoryId,
    isAllCalendarVisible, setAllCalendarVisible,
    isBudgetModalVisible, setBudgetModalVisible,
    isPocketMoneyModalVisible, setPocketMoneyModalVisible,
    isSettingsMenuVisible, setSettingsMenuVisible,
    isEditMode, setIsEditMode,
    isScrollEnabled, setIsScrollEnabled,
    activeCategories,
    totalMonthlyBudget,
    totalSpent,
    currentHesokuri,
    spentByCategory,
    pocketMoneyDetails,
    guideline,
    evaluation,
    hasChild,
    isCheckoutVisible,
    checkoutMonthId,
    budgetAmount,
    checkoutExpenses,
    handleConfirmCheckout,
    handleCancelCheckout,
    deleteExpense,
    setExpenseInput,
    returnToCategoryDetail,
    returnToCategoryDetailDate,
    setReturnToCategoryDetail,
    waterGarden,
    updateMonthlyBudget,
    handleSaveOrder
  } = useDashboardScreen();

  if (!settings || !monthlyBudget) return null;

  const safeExpenses = expenses || [];
  const [year, month] = monthlyBudget.month_id.split('-');

  // 課金プラン判定
  const isFreePlan = !settings.accountInfo?.subscriptionPlan || settings.accountInfo.subscriptionPlan === 'free';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{`${year}年${parseInt(month, 10)}月の予算`}</Text>
        <TouchableOpacity onPress={() => setSettingsMenuVisible(true)} style={styles.menuBtn}>
          <Text style={styles.menuBtnText}>≡ メニュー</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} scrollEnabled={isScrollEnabled} showsVerticalScrollIndicator={false}>
        <DashboardStatusCard 
          gardenPoints={settings.gardenPoints || 0} 
          lastWateringDate={settings.lastWateringDate} 
          currentHesokuri={currentHesokuri} 
          totalSpent={totalSpent} 
          totalMonthlyBudget={totalMonthlyBudget} 
          progressRatio={totalMonthlyBudget > 0 ? Math.min(1, totalSpent / totalMonthlyBudget) : 0} 
          progressColor={currentHesokuri >= 0 ? '#34C759' : '#FF3B30'} 
          onWaterGarden={waterGarden} 
          onPressCard={() => setAllCalendarVisible(true)} 
        />
        
        {/* 予算評価カード：このバッジの結果を見て下の操作へ誘導する */}
        <View style={styles.evaluationWrapper}>
          <BudgetEvaluationCard 
            fixedMonthlyBudget={totalMonthlyBudget}
            averageGuideline={guideline}
            evaluation={evaluation}
            hasChild={hasChild}
          />
        </View>

        {/* 【根本解決】
          カテゴリリストのフレーム（CategoryListSection）に「予算編成」ボタンを統合。
          ダッシュボード側の見出しやボタンの散らばりを排除し、操作を一本化。
        */}
        <CategoryListSection 
          categories={activeCategories} 
          monthlyBudget={monthlyBudget} 
          spentByCategory={spentByCategory} 
          isEditMode={isEditMode} 
          setIsEditMode={setIsEditMode} 
          onSaveOrder={handleSaveOrder} 
          onDragStateChange={setIsScrollEnabled} 
          onSelectCategory={setSelectedCategoryId} 
          onPressBudgetEdit={() => setBudgetModalVisible(true)}
        />

        <HesokuriPocketMoneyArea 
          currentHesokuri={currentHesokuri} 
          pocketMoneyDetails={pocketMoneyDetails} 
          onPressPocketMoney={() => setPocketMoneyModalVisible(true)} 
        />
      </ScrollView>

      {!isEditMode && (
        <TouchableOpacity onPress={onNavigateToInput} style={styles.fab}>
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      )}

      {/* 広告エリア（無課金ユーザーのみ表示） */}
      <DashboardAdBanner isFreePlan={isFreePlan} />

      {/* メニュー：日常の操作はリスト内ボタンに移動したため、低頻度アクションのみを残す */}
      <DashboardSettingsMenu 
        visible={isSettingsMenuVisible}
        onClose={() => setSettingsMenuVisible(false)}
        onOpenPocketMoneyRule={() => setPocketMoneyModalVisible(true)}
        onNavigateToHistory={onNavigateToHesokuriHistory}
      />

      {/* モーダル群 */}
      <CategoryDetailModal visible={!!selectedCategoryId} category={(settings.categories || []).find(c => c.id === selectedCategoryId) || null} expenses={safeExpenses.filter(e => e.categoryId === selectedCategoryId)} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail !== 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setSelectedCategoryId(null); if (returnToCategoryDetail !== 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(c, d) => { setExpenseInput({ id: undefined, date: d, amount: '0', categoryId: c, paymentMethod: '現金', storeName: '', memo: '', isLocked: true }); setReturnToCategoryDetail(c, d); onNavigateToInput(); }} onEditExpense={(e) => { setExpenseInput({ id: e.id, date: e.date, amount: String(e.amount), categoryId: e.categoryId, paymentMethod: e.paymentMethod, storeName: e.storeName || '', memo: e.memo || '', isLocked: true }); setReturnToCategoryDetail(e.categoryId, e.date); onNavigateToInput(); }} />
      <AllCategoryCalendarModal visible={isAllCalendarVisible} categories={activeCategories} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail === 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setAllCalendarVisible(false); if (returnToCategoryDetail === 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(d) => { setExpenseInput({ id: undefined, date: d, amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false }); setReturnToCategoryDetail('ALL', d); onNavigateToInput(); }} onEditExpense={(e) => { setExpenseInput({ id: e.id, date: e.date, amount: String(e.amount), categoryId: e.categoryId, paymentMethod: e.paymentMethod, storeName: e.storeName || '', memo: e.memo || '', isLocked: false }); setReturnToCategoryDetail('ALL', e.date); onNavigateToInput(); }} />
      <MonthlyBudgetEditModal visible={isBudgetModalVisible} categories={activeCategories} monthlyBudget={monthlyBudget} guideline={guideline} onSave={async (b) => { await updateMonthlyBudget(b, monthlyBudget.bonusAllocation, monthlyBudget.deficitRule, monthlyBudget.month_id); setBudgetModalVisible(false); }} onClose={() => setBudgetModalVisible(false)} />
      <PocketMoneyRuleModal visible={isPocketMoneyModalVisible} familyMembers={settings.familyMembers || []} monthlyBudget={monthlyBudget} onSave={async (a, r) => { await updateMonthlyBudget(monthlyBudget.budgets, a, r, monthlyBudget.month_id); setPocketMoneyModalVisible(false); }} onClose={() => setPocketMoneyModalVisible(false)} />
      {checkoutMonthId && <MonthCheckoutModal visible={isCheckoutVisible} monthId={checkoutMonthId} budgetAmount={budgetAmount} expenses={checkoutExpenses} onConfirm={handleConfirmCheckout} onCancel={handleCancelCheckout} />}
    </View>
  );
};