// src/store.ts
import { create } from 'zustand';
import { HouseholdSettings, ExpenseRecord, MonthlyBudget, GardenPlacement } from './types'; 
import { createSettingsSlice } from './stores/slices/settingsSlice';
import { createExpenseSlice } from './stores/slices/expenseSlice';
import { createGardenSlice } from './stores/slices/gardenSlice';

export interface ExpenseInputState { 
  id?: string; 
  date?: string; 
  amount: string; 
  categoryId: string; 
  paymentMethod: string; 
  storeName: string; 
  memo: string; 
  isLocked: boolean; 
}

export interface HesokuriState {
  settings: HouseholdSettings | null; 
  pendingSettings: HouseholdSettings | null; 
  expenses: ExpenseRecord[]; 
  monthlyBudget: MonthlyBudget | null; 
  isLoading: boolean; 
  error: string | null;
  expenseInput: ExpenseInputState; 
  returnToCategoryDetail: string | null; 
  returnToCategoryDetailDate: string | null; 
  selectedTreeId: string | null;
  
  setSelectedTreeId: (id: string | null) => void; 
  setExpenseInput: (input: Partial<ExpenseInputState>) => void; 
  resetExpenseInput: () => void; 
  saveExpenseInput: () => Promise<void>; 
  setReturnToCategoryDetail: (categoryId: string | null, date?: string | null) => void;
  setPendingSettings: (settings: HouseholdSettings | null) => void; 
  
  fetchSettings: () => Promise<void>; 
  updateSettings: (newSettings: HouseholdSettings) => Promise<void>; 
  fetchExpenses: (month: string) => Promise<void>; 
  fetchMonthlyBudget: (month: string) => Promise<void>; 
  updateMonthlyBudget: (budgets: Record<string, number>, bonusAllocation: Record<string, number>, deficitRule: MonthlyBudget['deficitRule'], month: string) => Promise<void>; 
  addExpense: (expense: ExpenseRecord) => Promise<void>; 
  updateExpense: (expense: ExpenseRecord) => Promise<void>; 
  deleteExpense: (date_id: string) => Promise<void>;
  
  waterGarden: () => Promise<void>; 
  updateGardenPlacements: (placements: GardenPlacement[]) => Promise<void>; 
  levelUpTree: (targetItemId?: string, effectId?: string) => Promise<void>; 
  setDebugPlantLevel: (level: number) => Promise<void>;
}

export const useHesokuriStore = create<HesokuriState>((set, get, api) => ({
  ...createSettingsSlice(set, get, api),
  ...createExpenseSlice(set, get, api),
  ...createGardenSlice(set, get, api),
}));