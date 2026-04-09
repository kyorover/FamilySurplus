// src/hooks/useMonthCheckout.ts
import { useState, useEffect, useMemo } from 'react';
import { MonthlyBudget, ExpenseRecord, Category } from '../types';

/**
 * 月替わり判定とへそくり確定処理を管理するカスタムフック
 */
export const useMonthCheckout = (
  currentMonthlyBudget: MonthlyBudget | null,
  categories: Category[],
  expenses: ExpenseRecord[],
  onSaveSummary: (monthId: string, confirmedAmount: number) => Promise<void>,
  onTransitionToNewMonth: (oldBudget: MonthlyBudget, newMonthId: string) => Promise<void>
) => {
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [checkoutMonthId, setCheckoutMonthId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentMonthlyBudget) return;

    const today = new Date();
    // YYYY-MM 形式の現在月を生成
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // 現在の月が、保存されている予算の月より新しい場合、月締め処理（前月分の確定）をトリガー
    if (currentYearMonth > currentMonthlyBudget.month_id) {
      setCheckoutMonthId(currentMonthlyBudget.month_id);
      setIsCheckoutVisible(true);
    }
  }, [currentMonthlyBudget]);

  // 確定対象月の予算総額を計算（計算対象カテゴリのみ）
  const targetCategoryIds = useMemo(() => {
    return new Set(categories.filter(c => c.isFixed || c.isCalculationTarget !== false).map(c => c.id));
  }, [categories]);

  const budgetAmount = useMemo(() => {
    if (!currentMonthlyBudget) return 0;
    return Object.entries(currentMonthlyBudget.budgets)
      .filter(([catId]) => targetCategoryIds.has(catId))
      .reduce((sum, [, amount]) => sum + amount, 0);
  }, [currentMonthlyBudget, targetCategoryIds]);

  // 確定対象月の支出レコードを抽出
  const checkoutExpenses = useMemo(() => {
    if (!checkoutMonthId) return [];
    return expenses.filter(e => 
      e.date.startsWith(checkoutMonthId) && targetCategoryIds.has(e.categoryId)
    );
  }, [expenses, checkoutMonthId, targetCategoryIds]);

  const handleConfirmCheckout = async (confirmedAmount: number) => {
    if (!checkoutMonthId || !currentMonthlyBudget) return;

    const today = new Date();
    const nextMonthId = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // 1. 過去月のへそくり額を確定保存
    await onSaveSummary(checkoutMonthId, confirmedAmount);
    
    // 2. 前月の予算設定を当月にコピーして新月へ移行
    await onTransitionToNewMonth(currentMonthlyBudget, nextMonthId);

    setIsCheckoutVisible(false);
    setCheckoutMonthId(null);
  };

  return {
    isCheckoutVisible,
    checkoutMonthId,
    budgetAmount,
    checkoutExpenses,
    handleConfirmCheckout
  };
};