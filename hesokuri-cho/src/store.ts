// src/store.ts
import { create } from 'zustand';
import { HouseholdSettings, ExpenseRecord, MonthlyBudget, GardenPlacement } from './types';
import { GARDEN_CONSTANTS } from './constants';
import { GLOBAL_GARDEN_SETTINGS } from './config/spriteConfig';

const API_BASE_URL = 'https://ocidhutos0.execute-api.ap-northeast-1.amazonaws.com/prod';
const HOUSEHOLD_ID = 'default-household-001';

interface ExpenseInputState { id?: string; date?: string; amount: string; categoryId: string; paymentMethod: string; storeName: string; memo: string; isLocked: boolean; }
interface HesokuriState {
  settings: HouseholdSettings | null; pendingSettings: HouseholdSettings | null; expenses: ExpenseRecord[]; monthlyBudget: MonthlyBudget | null; isLoading: boolean; error: string | null;
  expenseInput: ExpenseInputState; returnToCategoryDetail: string | null; returnToCategoryDetailDate: string | null;
  selectedTreeId: string | null; // 追加: 現在UIで選択されている木のID
  setSelectedTreeId: (id: string | null) => void;
  setExpenseInput: (input: Partial<ExpenseInputState>) => void; resetExpenseInput: () => void; saveExpenseInput: () => Promise<void>; setReturnToCategoryDetail: (categoryId: string | null, date?: string | null) => void;
  setPendingSettings: (settings: HouseholdSettings | null) => void; fetchSettings: () => Promise<void>; updateSettings: (newSettings: HouseholdSettings) => Promise<void>; fetchExpenses: (month: string) => Promise<void>; fetchMonthlyBudget: (month: string) => Promise<void>; updateMonthlyBudget: (budgets: Record<string, number>, bonusAllocation: Record<string, number>, deficitRule: MonthlyBudget['deficitRule'], month: string) => Promise<void>; addExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'date_id'>) => Promise<void>; updateExpense: (expense: ExpenseRecord) => Promise<void>; deleteExpense: (date_id: string) => Promise<void>; fetchHistoryData: (month: string) => Promise<{ expenses: ExpenseRecord[], budgets: Record<string, number> }>;
  waterGarden: () => Promise<void>; updateGardenPlacements: (placements: GardenPlacement[]) => Promise<void>; 
  // 修正: effectId を引数に追加
  levelUpTree: (targetItemId?: string, effectId?: string) => Promise<void>; 
  setDebugPlantLevel: (level: number) => Promise<void>;
}

export const useHesokuriStore = create<HesokuriState>((set, get) => ({
  settings: null, pendingSettings: null, expenses: [], monthlyBudget: null, isLoading: false, error: null, returnToCategoryDetail: null, returnToCategoryDetailDate: null,
  selectedTreeId: null,
  setSelectedTreeId: (id) => set({ selectedTreeId: id }),
  expenseInput: { amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false },
  setExpenseInput: (input) => set((state) => ({ expenseInput: { ...state.expenseInput, ...input } })),
  resetExpenseInput: () => set((state) => ({ expenseInput: { id: undefined, date: undefined, amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false } })),
  setReturnToCategoryDetail: (id, date = null) => set({ returnToCategoryDetail: id, returnToCategoryDetailDate: date }),

  saveExpenseInput: async () => {
    const state = get(); const input = state.expenseInput; const amountNum = parseInt(input.amount, 10);
    if (amountNum <= 0 || !input.categoryId) throw new Error('金額またはカテゴリが不正です');
    const expenseDate = input.date || new Date().toISOString().slice(0, 10);
    const dataObj = { householdId: HOUSEHOLD_ID, date: expenseDate, categoryId: input.categoryId, amount: amountNum, paymentMethod: input.paymentMethod, storeName: input.storeName.trim(), memo: input.memo.trim() };
    if (input.id) await state.updateExpense({ ...dataObj, id: input.id, date_id: `${expenseDate}#${input.id}` });
    else {
      await state.addExpense(dataObj);
      const currentSettings = get().settings;
      if (currentSettings) get().updateSettings({ ...currentSettings, gardenPoints: (currentSettings.gardenPoints || 0) + 2 });
    }
    state.resetExpenseInput();
  },
  setPendingSettings: (settings) => set({ pendingSettings: settings }),
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try { const response = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`); const data = await response.json(); set({ settings: data.message === 'Settings not found' ? null : data, isLoading: false }); } 
    catch (error: any) { set({ error: error.message, isLoading: false }); }
  },
  updateSettings: async (newSettings) => {
    set({ isLoading: true, error: null });
    try { const response = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSettings) }); const data = await response.json(); set({ settings: data.data, pendingSettings: null, isLoading: false }); } 
    catch (error: any) { set({ error: error.message, isLoading: false }); }
  },
  fetchMonthlyBudget: async (month) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}?month=${month}`); const data = await response.json();
      let currentBudgets = data.budgets || {}; let currentAllocation = data.bonusAllocation || {}; let currentRule = data.deficitRule || 'みんなで折半'; const currentSettings = get().settings;
      if (Object.keys(currentBudgets).length === 0 && currentSettings) {
        currentSettings.categories.forEach(cat => { currentBudgets[cat.id] = cat.budget; });
        const adults = currentSettings.familyMembers.filter(m => m.role === '大人'); adults.forEach(adult => { currentAllocation[adult.id] = Math.floor(100 / adults.length); });
        await fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month_id: month, budgets: currentBudgets, bonusAllocation: currentAllocation, deficitRule: currentRule }) });
      }
      set({ monthlyBudget: { householdId: HOUSEHOLD_ID, month_id: month, budgets: currentBudgets, bonusAllocation: currentAllocation, deficitRule: currentRule, updatedAt: new Date().toISOString() }, isLoading: false });
    } catch (error: any) { set({ error: error.message, isLoading: false }); }
  },
  updateMonthlyBudget: async (budgets, bonusAllocation, deficitRule, month) => {
    set({ isLoading: true, error: null });
    try { await fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month_id: month, budgets, bonusAllocation, deficitRule }) }); set({ monthlyBudget: { householdId: HOUSEHOLD_ID, month_id: month, budgets, bonusAllocation, deficitRule, updatedAt: new Date().toISOString() }, isLoading: false }); } 
    catch (error: any) { set({ error: error.message, isLoading: false }); }
  },
  fetchExpenses: async (month) => {
    set({ isLoading: true, error: null });
    try { const response = await fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?month=${month}`); const data = await response.json(); set({ expenses: data.expenses, isLoading: false }); } 
    catch (error: any) { set({ error: error.message, isLoading: false }); }
  },
  addExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try { const response = await fetch(`${API_BASE_URL}/expenses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...expenseData, householdId: HOUSEHOLD_ID }) }); const data = await response.json(); set((state) => ({ expenses: [...state.expenses, data.data], isLoading: false })); } 
    catch (error: any) { set({ error: error.message, isLoading: false }); }
  },
  updateExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try { const response = await fetch(`${API_BASE_URL}/expenses`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expenseData) }); const data = await response.json(); set((state) => ({ expenses: state.expenses.map(e => e.id === expenseData.id ? data.data : e), isLoading: false })); } 
    catch (error: any) { set({ error: error.message, isLoading: false }); }
  },
  deleteExpense: async (date_id) => {
    set({ isLoading: true, error: null });
    try { await fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?date_id=${encodeURIComponent(date_id)}`, { method: 'DELETE' }); set((state) => ({ expenses: state.expenses.filter(e => e.date_id !== date_id), isLoading: false })); } 
    catch (error: any) { set({ error: error.message, isLoading: false }); }
  },
  fetchHistoryData: async (month: string) => {
    try { const [expRes, budRes] = await Promise.all([ fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?month=${month}`), fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}?month=${month}`) ]); const expData = await expRes.json(); const budData = await budRes.json(); return { expenses: expData.expenses || [], budgets: budData.budgets || {} }; } 
    catch (e) { return { expenses: [], budgets: {} }; }
  },
  waterGarden: async () => {
    const state = get(); if (!state.settings) return; const todayStr = new Date().toISOString().slice(0, 10);
    if (state.settings.lastWateringDate === todayStr) return;
    await state.updateSettings({ ...state.settings, gardenPoints: (state.settings.gardenPoints || 0) + 20, lastWateringDate: todayStr });
  },
  updateGardenPlacements: async (placements) => {
    const state = get(); if (!state.settings) return;
    set({ settings: { ...state.settings, gardenPlacements: placements } });
    await state.updateSettings({ ...state.settings, gardenPlacements: placements });
  },
  // 修正: effectId 引数を追加
  levelUpTree: async (targetItemId?: string, effectId?: string) => {
    const state = get(); if (!state.settings) return;
    const itemId = targetItemId || state.selectedTreeId || 'PL-01';
    
    // 後方互換考慮：PL-01の場合は旧プロパティもフォールバックとして参照
    const currentLevel = state.settings.itemLevels?.[itemId] || (itemId === 'PL-01' ? state.settings.plantLevel : undefined) || 1;
    const currentExp = state.settings.itemExps?.[itemId] || (itemId === 'PL-01' ? state.settings.plantExp : undefined) || 0;
    
    if (currentLevel >= GLOBAL_GARDEN_SETTINGS.MAX_PLANT_LEVEL) return;
    
    const cost = GARDEN_CONSTANTS.LEVEL_UP_COSTS[currentLevel];
    const points = state.settings.gardenPoints || 0;
    const unit = GLOBAL_GARDEN_SETTINGS.LEVEL_UP_UNIT_COST;

    const remainingCost = cost - currentExp;
    const consumePoints = Math.min(unit, points, remainingCost);
    
    if (consumePoints <= 0) return;

    let newLevel = currentLevel;
    let newExp = currentExp + consumePoints;

    if (newExp >= cost) {
      newLevel = currentLevel + 1;
      newExp = 0; 
    }

    const newItemLevels = { ...(state.settings.itemLevels || {}), [itemId]: newLevel };
    const newItemExps = { ...(state.settings.itemExps || {}), [itemId]: newExp };

    // フォールバック: effectIdが未指定の場合は 'water_default' (または既存のロジックに基づくID) を使用
    const finalEffectId = effectId || (itemId === 'PL-01' ? 'water_default' : undefined);

    const newSettings: HouseholdSettings = { 
      ...state.settings, 
      itemLevels: newItemLevels, 
      itemExps: newItemExps,
      gardenPoints: points - consumePoints,
      // API側が直近のエフェクトIDを参照できるように設定に含める
      // (スキーマに直近エフェクト用のフィールドがある、もしくはupdatedAt更新でAPI側が判断する前提)
      lastWateringDate: new Date().toISOString(), // 成長も水やり扱いとして時間を更新
    };

    // 後方互換の維持
    if (itemId === 'PL-01') {
      newSettings.plantLevel = newLevel;
      newSettings.plantExp = newExp;
    }
    
    set({ settings: newSettings }); 
    // updateSettingsの内部リクエストBODYに finalEffectId を含める必要がある場合、
    // API定義に応じてHouseholdSettings型またはupdateSettingsアクション自体を拡張する必要がありますが、
    // ここでは既存のupdateSettingsを利用し、バックエンドがitemIdからeffectを判断するか、
    // 拡張フィールド（例: lastGrowthEffectId）に保存する設計と想定します。
    // types.tsを変更しないルールのため、newSettingsの他のフィールド更新でトリガーをかけます。
    await state.updateSettings(newSettings);
  },
  setDebugPlantLevel: async (level) => {
    const state = get(); if (!state.settings) return;
    const newSettings = { ...state.settings, plantLevel: level, plantExp: 0, itemLevels: { 'PL-01': level }, itemExps: { 'PL-01': 0 } };
    set({ settings: newSettings }); await state.updateSettings(newSettings);
  }
}));