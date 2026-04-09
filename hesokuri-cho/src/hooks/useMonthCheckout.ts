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

  // アカウント作成日（基準月）を取得するためにストアを参照
  const { accountInfo } = useHesokuriStore();

  useEffect(() => {
    let isMounted = true;

    const checkPastMonths = async () => {
      // 基準となるアカウント情報や当月予算がない場合はスキップ
      if (!accountInfo?.createdAt || !currentBudget) return;

      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const createdDate = new Date(accountInfo.createdAt);
      const startMonthStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;

      if (startMonthStr >= currentMonthStr) return; // アカウント作成が当月以降なら過去月は存在しない

      // 1. アカウント作成月から当月の前月までの「チェックすべき月」のリストを作成
      const pendingMonths: string[] = [];
      let curr = new Date(createdDate.getFullYear(), createdDate.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);

      while (curr < end) {
        pendingMonths.push(`${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`);
        curr.setMonth(curr.getMonth() + 1);
      }

      // 2. 該当する年のサマリー履歴をAPIから取得し、既に確定済みの月を除外
      const years = Array.from(new Set(pendingMonths.map(m => m.split('-')[0])));
      let allSummaries: any[] = [];
      for (const y of years) {
        const sums = await apiService.fetchMonthlySummaries(y);
        allSummaries = allSummaries.concat(sums);
      }

      const unconfirmed = pendingMonths.filter(m => !allSummaries.some(s => s.month_id === m && s.isConfirmed));
      if (unconfirmed.length === 0 || !isMounted) return;

      // 3. 未確定の月を古い順にループ処理する
      for (let i = 0; i < unconfirmed.length; i++) {
        const targetMonth = unconfirmed[i];
        const isLatestUnconfirmed = (i === unconfirmed.length - 1);

        // 過去月の実績と予算を取得（支出がない場合は空配列が返る）
        const pastExpenses = await apiService.fetchExpenses(targetMonth);
        const pastBudget = await apiService.fetchMonthlyBudget(targetMonth, null);
        const pastTotalBudget = Object.values(pastBudget.budgets || {}).reduce((a, b) => a + b, 0);

        if (isLatestUnconfirmed) {
          // 最も新しい未確定月（当月の直前）の場合は、結果発表モーダルを表示してユーザーに確定させる
          setBudgetAmount(pastTotalBudget);
          setCheckoutExpenses(pastExpenses);
          setCheckoutMonthId(targetMonth);
          setIsCheckoutVisible(true);
          return; 
        } else {
          // それより古い月（スキップされた月）は、ユーザー操作を待たずにサイレントで確定させる
          const hesokuri = Math.max(0, calculateConfirmedHesokuri(pastTotalBudget, pastExpenses));
          await onConfirmSummary(targetMonth, hesokuri);

          // 予算を次月へ自動継承（コピー）
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

    // モーダルでの確定操作：へそくりを保存
    await onConfirmSummary(checkoutMonthId, confirmedAmount);

    // 確定した月の「次の月」を算出し、予算を引き継ぐ
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