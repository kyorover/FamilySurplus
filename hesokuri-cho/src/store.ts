// src/store.ts
import { create } from 'zustand';
import { HouseholdSettings, ExpenseRecord, MonthlyBudget, GardenPlacement } from './types';
import { GARDEN_CONSTANTS } from './constants';

const API_BASE_URL = 'https://ocidhutos0.execute-api.ap-northeast-1.amazonaws.com/prod';
const HOUSEHOLD_ID = 'default-household-001';

interface ExpenseInputState {
  id?: string; date?: string; amount: string; categoryId: string; paymentMethod: string; storeName: string; memo: string; isLocked: boolean;
}

interface HesokuriState {
  settings: HouseholdSettings | null; pendingSettings: HouseholdSettings | null; expenses: ExpenseRecord[]; monthlyBudget: MonthlyBudget | null; isLoading: boolean; error: string | null;
  expenseInput: ExpenseInputState; returnToCategoryDetail: string | null; returnToCategoryDetailDate: string | null;

  setExpenseInput: (input: Partial<ExpenseInputState>) => void; resetExpenseInput: () => void; saveExpenseInput: () => Promise<void>; setReturnToCategoryDetail: (categoryId: string | null, date?: string | null) => void;
  setPendingSettings: (settings: HouseholdSettings | null) => void; fetchSettings: () => Promise<void>; updateSettings: (newSettings: HouseholdSettings) => Promise<void>; fetchExpenses: (month: string) => Promise<void>; fetchMonthlyBudget: (month: string) => Promise<void>; updateMonthlyBudget: (budgets: Record<string, number>, bonusAllocation: Record<string, number>, deficitRule: MonthlyBudget['deficitRule'], month: string) => Promise<void>; addExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'date_id'>) => Promise<void>; updateExpense: (expense: ExpenseRecord) => Promise<void>; deleteExpense: (date_id: string) => Promise<void>; fetchHistoryData: (month: string) => Promise<{ expenses: ExpenseRecord[], budgets: Record<string, number> }>;
  
  // --- ガーデン機能追加 ---
  waterGarden: () => Promise<void>;
  updateGardenPlacements: (placements: GardenPlacement[]) => Promise<void>;
  levelUpTree: () => Promise<void>;
}

export const useHesokuriStore = create<HesokuriState>((set, get) => ({
  settings: null, pendingSettings: null, expenses: [], monthlyBudget: null, isLoading: false, error: null, returnToCategoryDetail: null, returnToCategoryDetailDate: null,
  expenseInput: { amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false },
  setExpenseInput: (input) => set((state) => ({ expenseInput: { ...state.expenseInput, ...input } })),
  resetExpenseInput: () => set((state) => ({ expenseInput: { id: undefined, date: undefined, amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false } })),
  setReturnToCategoryDetail: (id, date = null) => set({ returnToCategoryDetail: id, returnToCategoryDetailDate: date }),

  saveExpenseInput: async () => {
    const state = get(); const input = state.expenseInput; const amountNum = parseInt(input.amount, 10);
    if (amountNum <= 0 || !input.categoryId) throw new Error('金額またはカテゴリが不正です');
    const expenseDate = input.date || new Date().toISOString().slice(0, 10);
    const dataObj = { householdId: HOUSEHOLD_ID, date: expenseDate, categoryId: input.categoryId, amount: amountNum, paymentMethod: input.paymentMethod, storeName: input.storeName.trim(), memo: input.memo.trim() };
    
    if (input.id) {
      await state.updateExpense({ ...dataObj, id: input.id, date_id: `${expenseDate}#${input.id}` });
    } else {
      await state.addExpense(dataObj);
      const currentSettings = get().settings;
      if (currentSettings) {
        const updatedPoints = (currentSettings.gardenPoints || 0) + 2;
        get().updateSettings({ ...currentSettings, gardenPoints: updatedPoints });
      }
    }
    state.resetExpenseInput();
  },

  setPendingSettings: (settings) => set({ pendingSettings: settings }),

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`);
      const data = await response.json();
      set({ settings: data.message === 'Settings not found' ? null : data, isLoading: false });
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  updateSettings: async (newSettings) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSettings) });
      const data = await response.json();
      set({ settings: data.data, pendingSettings: null, isLoading: false });
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  fetchMonthlyBudget: async (month) => {
    // 略: 変更なし
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}?month=${month}`);
      const data = await response.json();
      let currentBudgets = data.budgets || {};
      let currentAllocation = data.bonusAllocation || {};
      let currentRule = data.deficitRule || 'みんなで折半';
      const currentSettings = get().settings;
      
      if (Object.keys(currentBudgets).length === 0 && currentSettings) {
        currentSettings.categories.forEach(cat => { currentBudgets[cat.id] = cat.budget; });
        const adults = currentSettings.familyMembers.filter(m => m.role === '大人');
        adults.forEach(adult => { currentAllocation[adult.id] = Math.floor(100 / adults.length); });
        await fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month_id: month, budgets: currentBudgets, bonusAllocation: currentAllocation, deficitRule: currentRule }) });
      }
      set({ monthlyBudget: { householdId: HOUSEHOLD_ID, month_id: month, budgets: currentBudgets, bonusAllocation: currentAllocation, deficitRule: currentRule, updatedAt: new Date().toISOString() }, isLoading: false });
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  updateMonthlyBudget: async (budgets, bonusAllocation, deficitRule, month) => {
    // 略: 変更なし
    set({ isLoading: true, error: null });
    try {
      await fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month_id: month, budgets, bonusAllocation, deficitRule }) });
      set({ monthlyBudget: { householdId: HOUSEHOLD_ID, month_id: month, budgets, bonusAllocation, deficitRule, updatedAt: new Date().toISOString() }, isLoading: false });
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  fetchExpenses: async (month) => {
    // 略: 変更なし
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?month=${month}`);
      const data = await response.json();
      set({ expenses: data.expenses, isLoading: false });
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  addExpense: async (expenseData) => {
    // 略: 変更なし
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...expenseData, householdId: HOUSEHOLD_ID }) });
      const data = await response.json();
      set((state) => ({ expenses: [...state.expenses, data.data], isLoading: false }));
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  updateExpense: async (expenseData) => {
    // 略: 変更なし
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expenseData) });
      const data = await response.json();
      set((state) => ({ expenses: state.expenses.map(e => e.id === expenseData.id ? data.data : e), isLoading: false }));
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  deleteExpense: async (date_id) => {
    // 略: 変更なし
    set({ isLoading: true, error: null });
    try {
      await fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?date_id=${encodeURIComponent(date_id)}`, { method: 'DELETE' });
      set((state) => ({ expenses: state.expenses.filter(e => e.date_id !== date_id), isLoading: false }));
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },

  fetchHistoryData: async (month: string) => {
    try {
      const [expRes, budRes] = await Promise.all([ fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?month=${month}`), fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}?month=${month}`) ]);
      const expData = await expRes.json(); const budData = await budRes.json();
      return { expenses: expData.expenses || [], budgets: budData.budgets || {} };
    } catch (e) { return { expenses: [], budgets: {} }; }
  },

  waterGarden: async () => {
    const state = get();
    const settings = state.settings;
    if (!settings) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    if (settings.lastWateringDate === todayStr) return;
    await state.updateSettings({
      ...settings,
      gardenPoints: (settings.gardenPoints || 0) + 20,
      lastWateringDate: todayStr,
    });
  },

  updateGardenPlacements: async (placements) => {
    const state = get();
    if (!state.settings) return;
    // オプティミスティック更新
    set({ settings: { ...state.settings, gardenPlacements: placements } });
    await state.updateSettings({ ...state.settings, gardenPlacements: placements });
  },

  levelUpTree: async () => {
    const state = get();
    if (!state.settings) return;
    const currentLevel = state.settings.plantLevel || 1;
    if (currentLevel >= GARDEN_CONSTANTS.MAX_PLANT_LEVEL) return;

    const cost = GARDEN_CONSTANTS.LEVEL_UP_COSTS[currentLevel];
    if ((state.settings.gardenPoints || 0) < cost) return;

    const newPoints = (state.settings.gardenPoints || 0) - cost;
    const newSettings = {
      ...state.settings,
      plantLevel: currentLevel + 1,
      gardenPoints: newPoints
    };
    
    // オプティミスティック更新
    set({ settings: newSettings });
    await state.updateSettings(newSettings);
  }
}));