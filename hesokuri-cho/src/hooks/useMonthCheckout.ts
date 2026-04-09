// src/hooks/useMonthCheckout.ts
import { useState, useEffect, useCallback } from 'react';
import { ExpenseRecord, MonthlyBudget, Category } from '../types';
import { apiService } from '../services/apiService';
import { useHesokuriStore } from '../store';
import { calculateConfirmedHesokuri } from '../functions/budgetUtils';

export const useMonthCheckout = (
  currentBudget: MonthlyBudget | null,
  categories: Category[],
  currentExpenses: ExpenseRecord[],
  onConfirmSummary: (monthId: string, amount: number) => Promise<void>,
  onUpdateBudget: (oldBudget: MonthlyBudget, newMonthId: string) => Promise<void>
) => {
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [checkoutMonthId, setCheckoutMonthId] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [checkoutExpenses, setCheckoutExpenses] = useState<ExpenseRecord[]>([]);

  const { accountInfo } = useHesokuriStore();

  useEffect(() => {
    let isMounted = true;

    const checkPastMonths = async () => {
      if (!accountInfo?.createdAt || !currentBudget) return;

      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // ▼ 修正: アカウント作成日と、現在の予算対象月のうち、より「古い方」をループの起点にする
      const createdDate = new Date(accountInfo.createdAt);
      const [bYear, bMonth] = currentBudget.month_id.split('-');
      const budgetDate = new Date(parseInt(bYear, 10), parseInt(bMonth, 10) - 1, 1);
      
      const startDate = budgetDate < createdDate ? budgetDate : createdDate;
      const startMonthStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

      // 起点月が当月以降なら過去の締め処理は不要
      if (startMonthStr >= currentMonthStr) return;

      const pendingMonths: string[] = [];
      let curr = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);

      while (curr < end) {
        pendingMonths.push(`${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`);
        curr.setMonth(curr.getMonth() + 1);
      }

      const years = Array.from(new Set(pendingMonths.map(m => m.split('-')[0])));
      let allSummaries: any[] = [];
      for (const y of years) {
        const sums = await apiService.fetchMonthlySummaries(y);
        allSummaries = allSummaries.concat(sums);
      }

      const unconfirmed = pendingMonths.filter(m => !allSummaries.some(s => s.month_id === m && s.isConfirmed));
      if (unconfirmed.length === 0 || !isMounted) return;

      for (let i = 0; i < unconfirmed.length; i++) {
        const targetMonth = unconfirmed[i];
        const isLatestUnconfirmed = (i === unconfirmed.length - 1);

        const pastExpenses = await apiService.fetchExpenses(targetMonth);
        const pastBudget = await apiService.fetchMonthlyBudget(targetMonth, null);
        const pastTotalBudget = Object.values(pastBudget.budgets || {}).reduce((a, b) => a + b, 0);

        if (isLatestUnconfirmed) {
          setBudgetAmount(pastTotalBudget);
          setCheckoutExpenses(pastExpenses);
          setCheckoutMonthId(targetMonth);
          setIsCheckoutVisible(true);
          return; 
        } else {
          const hesokuri = Math.max(0, calculateConfirmedHesokuri(pastTotalBudget, pastExpenses));
          await onConfirmSummary(targetMonth, hesokuri);

          const [y, m] = targetMonth.split('-');
          const nextMonthDate = new Date(parseInt(y), parseInt(m), 1);
          const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
          await onUpdateBudget(pastBudget, nextMonthStr);
        }
      }
    };

    checkPastMonths();
    return () => { isMounted = false; };
  }, [accountInfo, currentBudget]);

  const handleConfirmCheckout = useCallback(async (confirmedAmount: number) => {
    if (!checkoutMonthId || !currentBudget) return;
    setIsCheckoutVisible(false);

    await onConfirmSummary(checkoutMonthId, confirmedAmount);

    const [y, m] = checkoutMonthId.split('-');
    const nextMonthDate = new Date(parseInt(y), parseInt(m), 1);
    const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

    await onUpdateBudget(currentBudget, nextMonthStr);
    setCheckoutMonthId(null);
  }, [checkoutMonthId, currentBudget, onConfirmSummary, onUpdateBudget]);

  return {
    isCheckoutVisible,
    checkoutMonthId,
    budgetAmount,
    checkoutExpenses,
    handleConfirmCheckout
  };
};