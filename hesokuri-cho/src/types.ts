// src/types.ts

export interface FamilyMember {
  id: string;
  name: string;
  role: '大人' | '子供';
  age?: number;
  hasPocketMoney: boolean;
  pocketMoneyAmount: number;
}

export interface Category {
  id: string;
  name: string;
  budget: number; // マスタ側のデフォルト予算として維持（UI上では見せずに初期値として利用します）
  isFixed: boolean;
}

export interface Payer {
  id: string;
  name: string;
}

export interface HouseholdSettings {
  householdId: string;
  familyMembers: FamilyMember[];
  categories: Category[];
  payers: Payer[];
  notificationsEnabled: boolean;
  updatedAt: Date | string;
}

export interface ExpenseRecord {
  id: string;
  householdId: string;
  date: string; // YYYY-MM-DD
  categoryId: string;
  amount: number;
  payerId: string;
  paymentMethod: string;
  memo: string;
  createdAt?: string;
  date_id?: string;
}

// === 新規追加：月次予算データ ===
export interface MonthlyBudget {
  householdId: string;
  month_id: string; // "YYYY-MM"
  budgets: Record<string, number>; // { categoryId: amount } の形式
  updatedAt: string;
}