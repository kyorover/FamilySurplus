// src/store.ts
import { create } from 'zustand';
import { HouseholdSettings, ExpenseRecord } from './types';

const API_BASE_URL = 'https://ocidhutos0.execute-api.ap-northeast-1.amazonaws.com/prod';
const HOUSEHOLD_ID = 'default-household-001';

interface HesokuriState {
  settings: HouseholdSettings | null;
  expenses: ExpenseRecord[];
  isLoading: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: HouseholdSettings) => Promise<void>;
  fetchExpenses: (month: string) => Promise<void>;
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'date_id'>) => Promise<void>;
  updateExpense: (expense: ExpenseRecord) => Promise<void>;
  deleteExpense: (date_id: string) => Promise<void>;
}

export const useHesokuriStore = create<HesokuriState>((set, get) => ({
  settings: null,
  expenses: [],
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`);
      if (!response.ok) throw new Error(`設定データの取得に失敗しました`);
      const data = await response.json();
      if (data.message === 'Settings not found') {
        set({ settings: null, isLoading: false });
      } else {
        set({ settings: data, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateSettings: async (newSettings) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error(`設定データの保存に失敗しました`);
      const data = await response.json();
      set({ settings: data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchExpenses: async (month) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?month=${month}`);
      if (!response.ok) throw new Error(`支出データの取得に失敗しました`);
      const data = await response.json();
      set({ expenses: data.expenses, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenseData, householdId: HOUSEHOLD_ID }),
      });
      if (!response.ok) throw new Error(`支出の記録に失敗しました`);
      const data = await response.json();
      set((state) => ({ expenses: [...state.expenses, data.data], isLoading: false }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // --- 追加：支出の更新 ---
  updateExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      if (!response.ok) throw new Error(`支出の更新に失敗しました`);
      const data = await response.json();
      set((state) => ({
        expenses: state.expenses.map(e => e.id === expenseData.id ? data.data : e),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // --- 追加：支出の削除 ---
  deleteExpense: async (date_id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?date_id=${encodeURIComponent(date_id)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`支出の削除に失敗しました`);
      set((state) => ({
        expenses: state.expenses.filter(e => e.date_id !== date_id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));