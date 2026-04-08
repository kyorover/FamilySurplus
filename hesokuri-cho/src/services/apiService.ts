// src/services/apiService.ts
import { HouseholdSettings, ExpenseRecord, MonthlyBudget, AccountInfo } from '../types'; // ▼ 追記: AccountInfo
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = 'https://ocidhutos0.execute-api.ap-northeast-1.amazonaws.com/prod';
const HOUSEHOLD_ID = 'default-household-001'; // 元の定義を維持

const getAuthHeaders = () => {
  const token = useAuthStore.getState().authToken;
  return { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' };
};

export const apiService = {
  // ▼ 追記: アカウント情報の取得 (既存ロジックには干渉させない)
  async fetchAccountInfo(): Promise<AccountInfo | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/account`, { headers: getAuthHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error("Failed to fetch account info:", error);
      return null;
    }
  },

  async fetchSettings(): Promise<HouseholdSettings | null> {
    const res = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`, { headers: getAuthHeaders() });
    const data = await res.json();
    
    // 無限ロード回避: データが存在しない場合は初期設定を生成してサーバーに保存
    if (data.message === 'Settings not found' || data.message === 'Unauthorized') {
      const initial: HouseholdSettings = {
        householdId: HOUSEHOLD_ID, familyMembers: [], categories: [],
        itemLevels: { 'PL-01': 1 }, itemExps: { 'PL-01': 0 },
        gardenPoints: 0, gardenPlacements: [], updatedAt: new Date().toISOString()
      };
      await this.updateSettings(initial);
      return initial;
    }
    return {
      ...data, familyMembers: data.familyMembers || [], categories: data.categories || [],
      itemLevels: data.itemLevels || {}, itemExps: data.itemExps || {}, gardenPoints: data.gardenPoints || 0
    };
  },

  async updateSettings(settings: HouseholdSettings): Promise<HouseholdSettings> {
    const res = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(settings) });
    const data = await res.json();
    return { ...data.data, familyMembers: data.data?.familyMembers || [], categories: data.data?.categories || [], itemLevels: data.data?.itemLevels || {}, itemExps: data.data?.itemExps || {}, gardenPoints: data.data?.gardenPoints || 0 };
  },

  async fetchMonthlyBudget(month: string, currentSettings: HouseholdSettings | null): Promise<MonthlyBudget> {
    const res = await fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}?month=${month}`, { headers: getAuthHeaders() });
    const data = await res.json();
    let budgets = data.budgets || {}; 
    let bonusAllocation = data.bonusAllocation || {}; 
    let deficitRule = data.deficitRule || 'みんなで折半';
    
    if (Object.keys(budgets).length === 0 && currentSettings) {
      (currentSettings.categories || []).forEach(cat => { budgets[cat.id] = cat.budget; });
      const adults = (currentSettings.familyMembers || []).filter(m => m.role === '大人');
      adults.forEach(adult => { bonusAllocation[adult.id] = Math.floor(100 / adults.length); });
      await this.updateMonthlyBudget(month, budgets, bonusAllocation, deficitRule);
    }
    return { householdId: HOUSEHOLD_ID, month_id: month, budgets, bonusAllocation, deficitRule, updatedAt: new Date().toISOString() };
  },

  async updateMonthlyBudget(month: string, budgets: Record<string, number>, bonusAllocation: Record<string, number>, deficitRule: MonthlyBudget['deficitRule']): Promise<void> {
    await fetch(`${API_BASE_URL}/budgets/${HOUSEHOLD_ID}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ month_id: month, budgets, bonusAllocation, deficitRule }) });
  },

  async fetchExpenses(month: string): Promise<ExpenseRecord[]> {
    const res = await fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?month=${month}`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.expenses || [];
  },

  async addExpense(expense: any): Promise<ExpenseRecord> {
    const res = await fetch(`${API_BASE_URL}/expenses`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ ...expense, householdId: HOUSEHOLD_ID }) });
    const data = await res.json(); return data.data;
  },

  async updateExpense(expense: any): Promise<ExpenseRecord> {
    const res = await fetch(`${API_BASE_URL}/expenses`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(expense) });
    const data = await res.json(); return data.data;
  },

  async deleteExpense(date_id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?date_id=${encodeURIComponent(date_id)}`, { method: 'DELETE', headers: getAuthHeaders() });
  }
};