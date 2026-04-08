// src/store.ts
import { create } from 'zustand';
import { HouseholdSettings, ExpenseRecord, MonthlyBudget, GardenPlacement, AccountInfo } from './types'; 
import { GARDEN_CONSTANTS } from './constants';
import { GLOBAL_GARDEN_SETTINGS, SPRITE_CONFIG } from './config/spriteConfig';
import { apiService } from './services/apiService';
import { syncFixedCategories } from './functions/categoryUtils';

interface ExpenseInputState { id?: string; date?: string; amount: string; categoryId: string; paymentMethod: string; storeName: string; memo: string; isLocked: boolean; }
interface HesokuriState {
  settings: HouseholdSettings | null; pendingSettings: HouseholdSettings | null; expenses: ExpenseRecord[]; monthlyBudget: MonthlyBudget | null; isLoading: boolean; error: string | null;
  accountInfo: AccountInfo | null; 
  expenseInput: ExpenseInputState; returnToCategoryDetail: string | null; returnToCategoryDetailDate: string | null; selectedTreeId: string | null;
  setSelectedTreeId: (id: string | null) => void; setExpenseInput: (input: Partial<ExpenseInputState>) => void; resetExpenseInput: () => void; saveExpenseInput: () => Promise<void>; setReturnToCategoryDetail: (categoryId: string | null, date?: string | null) => void;
  setPendingSettings: (settings: HouseholdSettings | null) => void; fetchSettings: () => Promise<void>; updateSettings: (newSettings: HouseholdSettings) => Promise<void>; fetchExpenses: (month: string) => Promise<void>; fetchMonthlyBudget: (month: string) => Promise<void>; updateMonthlyBudget: (budgets: Record<string, number>, bonusAllocation: Record<string, number>, deficitRule: MonthlyBudget['deficitRule'], month: string) => Promise<void>; addExpense: (expense: ExpenseRecord) => Promise<void>; updateExpense: (expense: ExpenseRecord) => Promise<void>; deleteExpense: (date_id: string) => Promise<void>;
  waterGarden: () => Promise<void>; updateGardenPlacements: (placements: GardenPlacement[]) => Promise<void>; levelUpTree: (targetItemId?: string, effectId?: string) => Promise<void>; setDebugPlantLevel: (level: number) => Promise<void>;
  fetchAccountInfo: () => Promise<void>; 
}

export const useHesokuriStore = create<HesokuriState>((set, get) => ({
  settings: null, pendingSettings: null, expenses: [], monthlyBudget: null, isLoading: false, error: null, returnToCategoryDetail: null, returnToCategoryDetailDate: null, selectedTreeId: null,
  accountInfo: null, 
  setSelectedTreeId: (id) => set({ selectedTreeId: id }),
  expenseInput: { amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false },
  setExpenseInput: (input) => set((state) => ({ expenseInput: { ...state.expenseInput, ...input } })),
  resetExpenseInput: () => set({ expenseInput: { id: undefined, date: undefined, amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false } }),
  setReturnToCategoryDetail: (id, date = null) => set({ returnToCategoryDetail: id, returnToCategoryDetailDate: date }),
  setPendingSettings: (settings) => set({ pendingSettings: settings }),

  fetchAccountInfo: async () => {
    try {
      const accountInfo = await apiService.fetchAccountInfo();
      if (accountInfo) set({ accountInfo });
    } catch (e) { console.error(e); }
  },

  saveExpenseInput: async () => {
    const state = get(); const input = state.expenseInput; const amountNum = parseInt(input.amount, 10);
    if (amountNum <= 0 || !input.categoryId) throw new Error('金額またはカテゴリが不正です');
    const expenseDate = input.date || new Date().toISOString().slice(0, 10);
    
    // 【修正】フロント側で一意なIDを生成し、バックエンドが要求する完全なレコードとして組み立てる
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

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try { 
      get().fetchAccountInfo(); 
      let settings = await apiService.fetchSettings();
      if (settings) {
        const syncedCategories = syncFixedCategories(settings);
        if (JSON.stringify(settings.categories) !== JSON.stringify(syncedCategories)) {
          settings.categories = syncedCategories;
          await apiService.updateSettings(settings); 
        }
      }
      set({ settings, isLoading: false }); 
    } 
    catch (e: any) { set({ error: e.message, isLoading: false }); }
  },

  updateSettings: async (newSettings) => {
    const syncedSettings = { ...newSettings, categories: syncFixedCategories(newSettings) };
    set({ settings: syncedSettings, pendingSettings: null, isLoading: true, error: null });
    try { 
      await apiService.updateSettings(syncedSettings); 
      set({ isLoading: false }); 
    } 
    catch (e: any) { set({ error: e.message, isLoading: false }); }
  },

  fetchMonthlyBudget: async (month) => {
    set({ isLoading: true, error: null });
    try { const monthlyBudget = await apiService.fetchMonthlyBudget(month, get().settings); set({ monthlyBudget, isLoading: false }); } 
    catch (e: any) { set({ error: e.message, isLoading: false }); }
  },

  updateMonthlyBudget: async (budgets, bonusAllocation, deficitRule, month) => {
    set({ isLoading: true, error: null });
    try { await apiService.updateMonthlyBudget(month, budgets, bonusAllocation, deficitRule);
      set({ monthlyBudget: { householdId: 'default-household-001', month_id: month, budgets, bonusAllocation, deficitRule, updatedAt: new Date().toISOString() }, isLoading: false }); } 
    catch (e: any) { set({ error: e.message, isLoading: false }); }
  },

  fetchExpenses: async (month) => {
    set({ isLoading: true, error: null });
    try { const expenses = await apiService.fetchExpenses(month); set({ expenses, isLoading: false }); } 
    catch (e: any) { set({ error: e.message, isLoading: false }); }
  },

  addExpense: async (expenseData) => {
    // 【修正】完全な楽観的更新: APIを待たず、生成したデータを即座にUIへ反映させる
    set((state) => ({ expenses: [...state.expenses, expenseData], isLoading: true, error: null }));
    try { 
      const newExp = await apiService.addExpense(expenseData); 
      if (newExp && newExp.id) {
        set((state) => ({ expenses: state.expenses.map(e => e.id === expenseData.id ? newExp : e), isLoading: false })); 
      } else {
        set({ isLoading: false }); // バックエンドが空応答でもローカル表示は維持
      }
    } 
    catch (e: any) { 
      // 本当の通信エラー等で失敗した場合は、追加したデータを取り消す（ロールバック）
      set((state) => ({ expenses: state.expenses.filter(e => e.id !== expenseData.id), error: e.message, isLoading: false })); 
    }
  },

  updateExpense: async (expenseData) => {
    // 【修正】楽観的更新
    set((state) => ({ expenses: state.expenses.map(e => e.id === expenseData.id ? expenseData : e), isLoading: true, error: null }));
    try { 
      const updated = await apiService.updateExpense(expenseData); 
      if (updated && updated.id) {
        set((state) => ({ expenses: state.expenses.map(e => e.id === expenseData.id ? updated : e), isLoading: false })); 
      } else {
        set({ isLoading: false });
      }
    } 
    catch (e: any) { 
      const month = expenseData.date.slice(0, 7);
      await get().fetchExpenses(month);
      set({ error: e.message, isLoading: false }); 
    }
  },

  deleteExpense: async (date_id) => {
    set({ isLoading: true, error: null });
    try { await apiService.deleteExpense(date_id); set((state) => ({ expenses: state.expenses.filter(e => e.date_id !== date_id), isLoading: false })); } 
    catch (e: any) { set({ error: e.message, isLoading: false }); }
  },

  waterGarden: async () => {
    const state = get(); if (!state.settings) return; const todayStr = new Date().toISOString().slice(0, 10);
    if (state.settings.lastWateringDate === todayStr) return;
    await state.updateSettings({ ...state.settings, gardenPoints: (state.settings.gardenPoints || 0) + 20, lastWateringDate: todayStr });
  },

  updateGardenPlacements: async (placements) => {
    const state = get(); if (!state.settings) return;
    const counts: Record<string, number> = {};
    const valid = placements.filter(p => {
      counts[p.itemId] = (counts[p.itemId] || 0) + 1;
      return counts[p.itemId] <= (SPRITE_CONFIG[p.itemId]?.maxQuantity ?? 99);
    });
    const newSettings = { ...state.settings, gardenPlacements: valid };
    set({ settings: newSettings }); await state.updateSettings(newSettings);
  },

  levelUpTree: async (targetItemId?: string, effectId?: string) => {
    const state = get(); if (!state.settings) return;
    const itemId = targetItemId || state.selectedTreeId || 'PL-01';
    const currentLevel = state.settings.itemLevels?.[itemId] || 1;
    const currentExp = state.settings.itemExps?.[itemId] || 0;
    if (currentLevel >= GLOBAL_GARDEN_SETTINGS.MAX_PLANT_LEVEL) return;
    
    const cost = GARDEN_CONSTANTS.LEVEL_UP_COSTS[currentLevel];
    const points = state.settings.gardenPoints || 0;
    const consumePoints = Math.min(GLOBAL_GARDEN_SETTINGS.LEVEL_UP_UNIT_COST, points, cost - currentExp);
    if (consumePoints <= 0) return;

    let newLevel = currentLevel; let newExp = currentExp + consumePoints;
    if (newExp >= cost) { newLevel = currentLevel + 1; newExp = 0; }

    const newSettings = { 
      ...state.settings, 
      itemLevels: { ...(state.settings.itemLevels || {}), [itemId]: newLevel }, 
      itemExps: { ...(state.settings.itemExps || {}), [itemId]: newExp },
      gardenPoints: points - consumePoints, lastWateringDate: new Date().toISOString()
    };
    if (itemId === 'PL-01') { newSettings.plantLevel = newLevel; newSettings.plantExp = newExp; }
    
    set({ settings: newSettings }); await state.updateSettings(newSettings);
  },

  setDebugPlantLevel: async (level) => {
    const state = get(); if (!state.settings) return;
    const newSettings = { ...state.settings, plantLevel: level, plantExp: 0, itemLevels: { 'PL-01': level }, itemExps: { 'PL-01': 0 } };
    set({ settings: newSettings }); await state.updateSettings(newSettings);
  }
}));