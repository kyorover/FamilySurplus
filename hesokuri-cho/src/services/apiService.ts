// src/services/apiService.ts
import { HouseholdSettings, ExpenseRecord, MonthlyBudget, AccountInfo, MonthlySummary, NationalStatistics } from '../types'; // ▼ 追記: NationalStatistics
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = 'https://ocidhutos0.execute-api.ap-northeast-1.amazonaws.com/prod';
const HOUSEHOLD_ID = 'default-household-001'; // 元の定義を維持

const getAuthHeaders = () => {
  const token = useAuthStore.getState().authToken;
  return { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' };
};

// ▼ 新規追加: Fetchをラップして、401エラーの捕捉と詳細なログ出力を一元管理するインターセプター
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers: getAuthHeaders() });

  if (!response.ok) {
    if (response.status === 401) {
      // 401エラーの根本原因を追跡するための詳細なログ出力
      const tokenStr = useAuthStore.getState().authToken ? 'Token Exists (Possible Expiry)' : 'No Token Provided';
      console.error(`[API 401 Unauthorized] URL: ${url} | Token Status: ${tokenStr}`);
      throw new Error('認証セッションが切れました、または無効です。再度ログインしてください。');
    }

    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.message || JSON.stringify(errorJson);
    } catch (e) {
      errorDetail = 'レスポンスの解析に失敗しました';
    }
    console.error(`[API Error ${response.status}] URL: ${url} | Detail: ${errorDetail}`);
    throw new Error(`サーバーエラーが発生しました (${response.status})`);
  }

  return response;
};

export const apiService = {
  // ▼ 追記: アカウント情報の取得 (既存ロジックには干渉させない)
  async fetchAccountInfo(): Promise<AccountInfo | null> {
    try {
      const res = await fetchWithAuth('/account');
      return await res.json();
    } catch (error) {
      console.error("Failed to fetch account info:", error);
      return null;
    }
  },

  async fetchSettings(): Promise<HouseholdSettings | null> {
    // インターセプターにより、401等のエラー時は例外が投げられここで処理が止まる（サイレント上書きを防止）
    const res = await fetchWithAuth(`/settings/${HOUSEHOLD_ID}`);
    const data = await res.json();
    
    // 無限ロード回避: データが存在しない場合は初期化
    if (!data || Object.keys(data).length === 0 || data.message === 'Settings not found') return null;
    return data;
  },

  async updateSettings(settings: HouseholdSettings): Promise<void> {
    await fetchWithAuth(`/settings/${HOUSEHOLD_ID}`, { method: 'PUT', body: JSON.stringify(settings) });
  },

  async fetchMonthlyBudget(month: string, settings: HouseholdSettings | null): Promise<MonthlyBudget> {
    const res = await fetchWithAuth(`/budgets/${HOUSEHOLD_ID}?month=${month}`);
    const data = await res.json();
    if (data && data.budgets && Object.keys(data.budgets).length > 0) return data;
    
    const budgets: Record<string, number> = {}; const bonusAllocation: Record<string, number> = {};
    if (settings) { settings.categories.forEach(c => { budgets[c.id] = c.budget; }); }
    return { householdId: HOUSEHOLD_ID, month_id: month, budgets, bonusAllocation, deficitRule: 'みんなで折半', updatedAt: new Date().toISOString() };
  },

  async updateMonthlyBudget(month: string, budgets: Record<string, number>, bonusAllocation: Record<string, number>, deficitRule: MonthlyBudget['deficitRule']): Promise<void> {
    await fetchWithAuth(`/budgets/${HOUSEHOLD_ID}`, { method: 'PUT', body: JSON.stringify({ month_id: month, budgets, bonusAllocation, deficitRule }) });
  },

  // ▼ 新規追加: 指定した年の確定済みサマリー一覧を取得
  async fetchMonthlySummaries(year: string): Promise<MonthlySummary[]> {
    const res = await fetchWithAuth(`/summaries/${HOUSEHOLD_ID}?year=${year}`);
    const data = await res.json();
    return data.summaries || [];
  },

  // ▼ 新規追加: 過去のへそくり額の確定（月次サマリー）を保存するAPIコール
  async saveMonthlySummary(monthId: string, confirmedAmount: number): Promise<MonthlySummary> {
    const payload = {
      householdId: HOUSEHOLD_ID,
      month_id: monthId,
      isConfirmed: true,
      confirmedHesokuriAmount: confirmedAmount,
      confirmedAt: new Date().toISOString(),
    };
    const res = await fetchWithAuth(`/summaries`, { method: 'POST', body: JSON.stringify(payload) });
    const data = await res.json();
    return data.data || payload;
  },

  async fetchExpenses(month: string): Promise<ExpenseRecord[]> {
    const res = await fetchWithAuth(`/expenses/${HOUSEHOLD_ID}?month=${month}`);
    const data = await res.json();
    return data.expenses || [];
  },

  async addExpense(expense: any): Promise<ExpenseRecord> {
    const res = await fetchWithAuth(`/expenses`, { method: 'POST', body: JSON.stringify({ ...expense, householdId: HOUSEHOLD_ID }) });
    const data = await res.json(); return data.data;
  },

  async updateExpense(expense: any): Promise<ExpenseRecord> {
    const res = await fetchWithAuth(`/expenses`, { method: 'PUT', body: JSON.stringify(expense) });
    const data = await res.json(); return data.data;
  },

  async deleteExpense(date_id: string): Promise<void> {
    await fetchWithAuth(`/expenses/${HOUSEHOLD_ID}?date_id=${date_id}`, { method: 'DELETE' });
  },

  // ▼ 新規追加: バックエンドでキャッシュされている公的統計データを取得
  async fetchNationalStatistics(): Promise<NationalStatistics | null> {
    try {
      const res = await fetchWithAuth(`/statistics`);
      const data = await res.json();
      const stats = data.data || null;
      
      // データが存在する場合、乳幼児コスト項目の存在を保証して返す
      if (stats && stats.averageExpenses) {
        return {
          ...stats,
          averageExpenses: {
            ...stats.averageExpenses,
            infant: stats.averageExpenses.infant ?? 0
          }
        };
      }
      return stats;
    } catch (error) {
      console.error("Failed to fetch national statistics:", error);
      return null;
    }
  }
};