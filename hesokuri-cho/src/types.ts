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
  budget: number; 
  isFixed: boolean;
}

export interface HouseholdSettings {
  householdId: string;
  familyMembers: FamilyMember[];
  categories: Category[];
  notificationsEnabled: boolean;
  updatedAt: Date | string;
}

export interface ExpenseRecord {
  id: string;
  householdId: string;
  date: string; // YYYY-MM-DD
  categoryId: string;
  amount: number;
  paymentMethod: string; // '現金' | '電子PAY' | 'クレジット'
  storeName?: string; // 新規：店名（任意）
  memo?: string;      // 新規：コメント（任意）
  createdAt?: string;
  date_id?: string;
}

export interface MonthlyBudget {
  householdId: string;
  month_id: string; // "YYYY-MM"
  budgets: Record<string, number>;
  updatedAt: string;
}