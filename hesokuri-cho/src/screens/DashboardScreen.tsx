// src/screens/DashboardScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, UIManager } from 'react-native';
import { DashboardStatusCard } from '../components/dashboard/DashboardStatusCard';
import { CategoryListSection } from '../components/dashboard/CategoryListSection';
import { BudgetEvaluationCard } from '../components/settings/BudgetEvaluationCard';
import { useDashboardScreen } from '../hooks/useDashboardScreen';
import { DashboardSettingsMenu } from '../components/dashboard/DashboardSettingsMenu';
import { DashboardAdBanner } from '../components/dashboard/DashboardAdBanner';
import { HesokuriPocketMoneyArea } from '../components/dashboard/HesokuriPocketMoneyArea';
import { DashboardModals } from '../components/dashboard/DashboardModals';
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

      {/* FAB位置を動的に調整（広告表示時は上にずらす） */}
      {!isEditMode && (
        <TouchableOpacity 
          onPress={onNavigateToInput} 
          style={[styles.fab, isFreePlan && { bottom: 80 }]}
        >
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

      {/* モーダル群（肥大化防止のためコンポーネント化） */}
      <DashboardModals settings={settings} monthlyBudget={monthlyBudget} activeCategories={activeCategories} safeExpenses={safeExpenses} selectedCategoryId={selectedCategoryId} setSelectedCategoryId={setSelectedCategoryId} isAllCalendarVisible={isAllCalendarVisible} setAllCalendarVisible={setAllCalendarVisible} isBudgetModalVisible={isBudgetModalVisible} setBudgetModalVisible={setBudgetModalVisible} isPocketMoneyModalVisible={isPocketMoneyModalVisible} setPocketMoneyModalVisible={setPocketMoneyModalVisible} returnToCategoryDetail={returnToCategoryDetail} returnToCategoryDetailDate={returnToCategoryDetailDate} setReturnToCategoryDetail={setReturnToCategoryDetail} deleteExpense={deleteExpense} setExpenseInput={setExpenseInput} onNavigateToInput={onNavigateToInput} guideline={guideline} updateMonthlyBudget={updateMonthlyBudget} checkoutMonthId={checkoutMonthId} isCheckoutVisible={isCheckoutVisible} budgetAmount={budgetAmount} checkoutExpenses={checkoutExpenses} handleConfirmCheckout={handleConfirmCheckout} handleCancelCheckout={handleCancelCheckout} />
    </View>
  );
};