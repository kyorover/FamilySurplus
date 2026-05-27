// src/hooks/useDashboardScreen.ts
import { useState, useEffect } from 'react';
import { useHesokuriStore } from '../store';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useMonthCheckout } from '../hooks/useMonthCheckout';
import { evaluateBudget } from '../functions/budgetUtils';
import { DEFAULT_CATEGORY_NAMES } from '../constants';
import { Category } from '../types';
import { useTheme } from '../hooks/useTheme'; // ▼ 新規追加: テーマ用フックをインポート

export const useDashboardScreen = () => {
  const { 
    settings, 
    expenses, 
    monthlyBudget, 
    nationalStatistics, 
    updateSettings, 
    updateMonthlyBudget, 
    deleteExpense, 
    setExpenseInput, 
    returnToCategoryDetail, 
    returnToCategoryDetailDate, 
    setReturnToCategoryDetail, 
    waterGarden, 
    saveMonthlySummary 
  } = useHesokuriStore();

  const { isDark } = useTheme(); // ▼ 新規追加: 現在のダークモード状態を取得

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

  const { 
    activeCategories, 
    totalMonthlyBudget, 
    totalSpent, 
    currentHesokuri, 
    spentByCategory, 
    pocketMoneyDetails, 
    guideline 
  } = useDashboardStats(
    settings, 
    monthlyBudget, 
    expenses, 
    nationalStatistics
  );

  // ▼ 変更: 第3引数に isDark を渡し、評価結果の色をテーマに合わせる
  const evaluation = evaluateBudget(totalMonthlyBudget, guideline, isDark);
  const hasChild = (settings?.categories || []).some(cat => cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE);

  const { 
    isCheckoutVisible, 
    checkoutMonthId, 
    budgetAmount, 
    checkoutExpenses, 
    handleConfirmCheckout, 
    handleCancelCheckout 
  } = useMonthCheckout(
    monthlyBudget, activeCategories, expenses || [],
    async (monthId, confirmedAmount) => {
      await saveMonthlySummary(monthId, confirmedAmount);
    },
    async (oldBudget, newMonthId) => await updateMonthlyBudget(oldBudget.budgets, oldBudget.bonusAllocation, oldBudget.deficitRule, newMonthId)
  );

  const handleSaveOrder = async (newList: Category[]) => {
    const activeIds = new Set(newList.map(c => c.id));
    const hiddenCategories = (settings.categories || []).filter(c => !activeIds.has(c.id));
    const newCategories = [...newList, ...hiddenCategories];
    await updateSettings({ ...settings, categories: newCategories });
  };

  return {
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
  };
};