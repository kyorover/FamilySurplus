// src/store.ts
import { create } from 'zustand';
import { HouseholdSettings, ExpenseRecord, MonthlyBudget } from './types';

const API_BASE_URL = 'https://ocidhutos0.execute-api.ap-northeast-1.amazonaws.com/prod';
const HOUSEHOLD_ID = 'default-household-001';

interface ExpenseInputState {
  amount: string;
  categoryId: string;
  paymentMethod: string;
  storeName: string;
  memo: string;
  isLocked: boolean; // カテゴリを固定するかどうか
}

interface HesokuriState {
  settings: HouseholdSettings | null;
  pendingSettings: HouseholdSettings | null;
  expenses: ExpenseRecord[];
  monthlyBudget: MonthlyBudget | null;
  isLoading: boolean;
  error: string | null;

  expenseInput: ExpenseInputState;
  setExpenseInput: (input: Partial<ExpenseInputState>) => void;
  resetExpenseInput: () => void;

  setPendingSettings: (settings: HouseholdSettings | null) => void;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: HouseholdSettings) => Promise<void>;
  fetchExpenses: (month: string) => Promise<void>;
  fetchMonthlyBudget: (month: string) => Promise<void>;
  updateMonthlyBudget: (budgets: Record<string, number>, month: string) => Promise<void>;
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'date_id'>) => Promise<void>;
  updateExpense: (expense: ExpenseRecord) => Promise<void>;
  deleteExpense: (date_id: string) => Promise<void>;
}

export const useHesokuriStore = create<HesokuriState>((set, get) => ({
  settings: null, pendingSettings: null, expenses: [], monthlyBudget: null, isLoading: false, error: null,

  expenseInput: { amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false },
  setExpenseInput: (input) => set((state) => ({ expenseInput: { ...state.expenseInput, ...input } })),
  resetExpenseInput: () => set((state) => ({ expenseInput: { ...state.expenseInput, amount: '0', paymentMethod: '現金', storeName: '', memo: '', isLocked: false } })),
  
  setPendingSettings: (settings) => set({ pendingSettings: settings }),

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`);
      if (!response.ok) throw new Error(`設定の取得失敗`);
      const data = await response.json();
      set({ settings: data.message === 'Settings not found' ? null : data, isLoading: false });
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  updateSettings: async (newSettings) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error(`設定の保存失敗`);
      const data = await response.json();
      set({ settings: data.data, pendingSettings: null, isLoading: false });
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  fetchMonthlyBudget: async (month) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}?month=${month}`);
      if (!response.ok) throw new Error(`予算の取得失敗`);
      const data = await response.json();
      let currentBudgets = data.budgets || {};
      const currentSettings = get().settings;
      if (Object.keys(currentBudgets).length === 0 && currentSettings) {
        currentSettings.categories.forEach(cat => { currentBudgets[cat.id] = cat.budget; });
        await fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month_id: month, budgets: currentBudgets }),
        });
      }
      set({ monthlyBudget: { householdId: HOUSEHOLD_ID, month_id: month, budgets: currentBudgets, updatedAt: new Date().toISOString() }, isLoading: false });
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  updateMonthlyBudget: async (budgets, month) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month_id: month, budgets }),
      });
      if (!response.ok) throw new Error(`予算の更新失敗`);
      set({ monthlyBudget: { householdId: HOUSEHOLD_ID, month_id: month, budgets, updatedAt: new Date().toISOString() }, isLoading: false });
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  fetchExpenses: async (month) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?month=${month}`);
      if (!response.ok) throw new Error(`支出の取得失敗`);
      const data = await response.json();
      set({ expenses: data.expenses, isLoading: false });
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  addExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...expenseData, householdId: HOUSEHOLD_ID }),
      });
      if (!response.ok) throw new Error(`支出の記録失敗`);
      const data = await response.json();
      set((state) => ({ expenses: [...state.expenses, data.data], isLoading: false }));
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  updateExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expenseData),
      });
      if (!response.ok) throw new Error(`支出の更新失敗`);
      const data = await response.json();
      set((state) => ({ expenses: state.expenses.map(e => e.id === expenseData.id ? data.data : e), isLoading: false }));
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  deleteExpense: async (date_id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?date_id=${encodeURIComponent(date_id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`支出の削除失敗`);
      set((state) => ({ expenses: state.expenses.filter(e => e.date_id !== date_id), isLoading: false }));
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },
}));