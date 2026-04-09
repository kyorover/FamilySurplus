// src/stores/slices/expenseSlice.ts
import { StateCreator } from 'zustand';
import { HesokuriState } from '../../store';
import { apiService } from '../../services/apiService';
import { ExpenseRecord } from '../../types';
import { calculateConfirmedHesokuri } from '../../functions/budgetUtils';

// ▼ 新規追加: 過去月のサイレント上書き更新処理
const recalculatePastMonthSummary = async (date: string) => {
  const monthId = date.slice(0, 7);
  try {
    const pastBudget = await apiService.fetchMonthlyBudget(monthId, null);
    const pastTotalBudget = Object.values(pastBudget.budgets || {}).reduce((a, b) => a + b, 0);
    const pastExpenses = await apiService.fetchExpenses(monthId);
    
    // 支出がある場合のみ履歴を更新（0件なら履歴を作らない仕様に準拠）
    if (pastExpenses.length > 0) {
      const hesokuri = Math.max(0, calculateConfirmedHesokuri(pastTotalBudget, pastExpenses));
      await apiService.saveMonthlySummary(monthId, hesokuri);
    }
  } catch (error) {
    console.error('Failed to recalculate past month summary:', error);
  }
};

export const createExpenseSlice: StateCreator<HesokuriState, [], [], any> = (set, get) => ({
  expenses: [],
  monthlyBudget: null,
  expenseInput: { amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false },
  returnToCategoryDetail: null,
  returnToCategoryDetailDate: null,

  setExpenseInput: (input) => set((state) => ({ expenseInput: { ...state.expenseInput, ...input } })),
  resetExpenseInput: () => set({ expenseInput: { id: undefined, date: undefined, amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false } }),
  setReturnToCategoryDetail: (id, date = null) => set({ returnToCategoryDetail: id, returnToCategoryDetailDate: date }),

  saveExpenseInput: async () => {
    const state = get(); 
    const input = state.expenseInput; 
    const amountNum = parseInt(input.amount, 10);
    if (amountNum <= 0 || !input.categoryId) throw new Error('金額またはカテゴリが不正です');
    const expenseDate = input.date || new Date().toISOString().slice(0, 10);
    
    const targetId = input.id || `loc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const dataObj = { 
      id: targetId, 
      date_id: `${expenseDate}#${targetId}`, 
      date: expenseDate, 
      categoryId: input.categoryId, 
      amount: amountNum, 
      paymentMethod: input.paymentMethod, 
      storeName: input.storeName.trim(), 
      memo: input.memo.trim() 
    } as ExpenseRecord;

    if (input.id) {
      await state.updateExpense(dataObj);
    } else {
      await state.addExpense(dataObj);
      const currentSettings = get().settings;
      if (currentSettings) get().updateSettings({ ...currentSettings, gardenPoints: (currentSettings.gardenPoints || 0) + 2 });
    }
    state.resetExpenseInput();
  },

  fetchMonthlyBudget: async (month) => {
    set({ isLoading: true, error: null });
    try { 
      const monthlyBudget = await apiService.fetchMonthlyBudget(month, get().settings); 
      set({ monthlyBudget, isLoading: false }); 
    } 
    catch (e: any) { set({ error: e.message, isLoading: false }); }
  },

  updateMonthlyBudget: async (budgets, bonusAllocation, deficitRule, month) => {
    set({ isLoading: true, error: null });
    try { 
      await apiService.updateMonthlyBudget(month, budgets, bonusAllocation, deficitRule);
      set({ monthlyBudget: { householdId: 'default-household-001', month_id: month, budgets, bonusAllocation, deficitRule, updatedAt: new Date().toISOString() }, isLoading: false }); 
    } 
    catch (e: any) { set({ error: e.message, isLoading: false }); }
  },

  fetchExpenses: async (month) => {
    set({ isLoading: true, error: null });
    try { 
      const expenses = await apiService.fetchExpenses(month); 
      set({ expenses, isLoading: false }); 
    } 
    catch (e: any) { set({ error: e.message, isLoading: false }); }
  },

  addExpense: async (expenseData) => {
    set((state) => ({ expenses: [...state.expenses, expenseData], isLoading: true, error: null }));
    try { 
      const newExp = await apiService.addExpense(expenseData); 
      if (newExp && newExp.id) {
        set((state) => ({ expenses: state.expenses.map(e => e.id === expenseData.id ? newExp : e), isLoading: false })); 
      } else {
        set({ isLoading: false });
      }
      // ▼ 追加: 過去の月なら裏側でサマリーを更新
      if (get().monthlyBudget?.month_id !== expenseData.date.slice(0, 7)) recalculatePastMonthSummary(expenseData.date);
    } 
    catch (e: any) { 
      set((state) => ({ expenses: state.expenses.filter(e => e.id !== expenseData.id), error: e.message, isLoading: false })); 
    }
  },

  updateExpense: async (expenseData) => {
    set((state) => ({ expenses: state.expenses.map(e => e.id === expenseData.id ? expenseData : e), isLoading: true, error: null }));
    try { 
      const updated = await apiService.updateExpense(expenseData); 
      if (updated && updated.id) {
        set((state) => ({ expenses: state.expenses.map(e => e.id === expenseData.id ? updated : e), isLoading: false })); 
      } else {
        set({ isLoading: false });
      }
      // ▼ 追加: 過去の月なら裏側でサマリーを更新
      if (get().monthlyBudget?.month_id !== expenseData.date.slice(0, 7)) recalculatePastMonthSummary(expenseData.date);
    } 
    catch (e: any) { 
      const month = expenseData.date.slice(0, 7);
      await get().fetchExpenses(month);
      set({ error: e.message, isLoading: false }); 
    }
  },

  deleteExpense: async (date_id) => {
    set({ isLoading: true, error: null });
    try { 
      await apiService.deleteExpense(date_id); 
      set((state) => ({ expenses: state.expenses.filter(e => e.date_id !== date_id), isLoading: false })); 
      // ▼ 追加: 過去の月なら裏側でサマリーを更新 (date_idの形式は "2026-04-10#loc-..." を前提とする)
      if (get().monthlyBudget?.month_id !== date_id.slice(0, 7)) recalculatePastMonthSummary(date_id);
    } 
    catch (e: any) { set({ error: e.message, isLoading: false }); }
  },

  // ▼ 新規追加: 過去のへそくり額を確定してAPI経由で保存
  saveMonthlySummary: async (monthId, confirmedAmount) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.saveMonthlySummary(monthId, confirmedAmount);
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },
});