import { create } from 'zustand';
import { HouseholdSettings, ExpenseRecord } from './types'; // 前のステップで作成した中央スキーマ

// ==========================================
// 1. 環境設定
// ==========================================
// AWS CDKで構築したAPI GatewayのエンドポイントURLに置き換えます
const API_BASE_URL = 'https://your-api-id.execute-api.ap-northeast-1.amazonaws.com/prod';
// プロトタイプ開発用の固定世帯ID（本番では認証機能から取得）
const HOUSEHOLD_ID = 'default-household-001';

// ==========================================
// 2. ストアの型定義
// ==========================================
interface HesokuriState {
  // --- 状態 (State) ---
  settings: HouseholdSettings | null;
  expenses: ExpenseRecord[];
  isLoading: boolean;
  error: string | null;

  // --- アクション (Actions) ---
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: HouseholdSettings) => Promise<void>;
  fetchExpenses: (month: string) => Promise<void>;
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => Promise<void>;
}

// ==========================================
// 3. Zustand ストアの作成
// ==========================================
export const useHesokuriStore = create<HesokuriState>((set, get) => ({
  // 初期状態
  settings: null,
  expenses: [],
  isLoading: false,
  error: null,

  // --------------------------------------------------
  // A. マスタ設定の取得
  // --------------------------------------------------
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`);
      if (!response.ok) {
        throw new Error(`設定データの取得に失敗しました (Status: ${response.status})`);
      }
      const data = await response.json();
      set({ settings: data, isLoading: false });
    } catch (error: any) {
      console.error('fetchSettings error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // --------------------------------------------------
  // B. マスタ設定の更新
  // --------------------------------------------------
  updateSettings: async (newSettings) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${HOUSEHOLD_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) {
        throw new Error(`設定データの保存に失敗しました (Status: ${response.status})`);
      }
      const data = await response.json();
      // バックエンドから返却された最新データでローカルのStateを上書き
      set({ settings: data.data, isLoading: false });
    } catch (error: any) {
      console.error('updateSettings error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // --------------------------------------------------
  // C. 特定月の支出一覧取得
  // --------------------------------------------------
  fetchExpenses: async (month) => {
    // monthの形式は 'YYYY-MM' (例: '2026-03')
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${HOUSEHOLD_ID}?month=${month}`);
      if (!response.ok) {
        throw new Error(`支出データの取得に失敗しました (Status: ${response.status})`);
      }
      const data = await response.json();
      set({ expenses: data.expenses, isLoading: false });
    } catch (error: any) {
      console.error('fetchExpenses error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // --------------------------------------------------
  // D. 支出の記録（へそくりの消費）
  // --------------------------------------------------
  addExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenseData, householdId: HOUSEHOLD_ID }),
      });
      if (!response.ok) {
        throw new Error(`支出の記録に失敗しました (Status: ${response.status})`);
      }
      const data = await response.json();

      // 成功後、現在のState（expenses配列）に新しいレコードを追加
      // これにより、画面上の「今月のへそくり」が即座に再計算・UI反映される
      set((state) => ({
        expenses: [...state.expenses, data.data],
        isLoading: false
      }));
    } catch (error: any) {
      console.error('addExpense error:', error);
      set({ error: error.message, isLoading: false });
    }
  },
}));