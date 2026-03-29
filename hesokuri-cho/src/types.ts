// src/types.ts

export interface FamilyMember {
  id: string;
  name: string;
  role: '大人' | '子供';
  age?: number;
  hasPocketMoney: boolean;
  pocketMoneyAmount: number; // 基本のお小遣い
}

export interface Category {
  id: string;
  name: string;
  budget: number; 
  isFixed: boolean;
  isCalculationTarget?: boolean; // 新規追加：余剰金計算対象フラグ（未設定・固定カテゴリはtrue扱い）
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
  date: string;
  categoryId: string;
  amount: number;
  paymentMethod: string;
  storeName?: string;
  memo?: string;
  createdAt?: string;
  date_id?: string;
}

export interface MonthlyBudget {
  householdId: string;
  month_id: string;
  budgets: Record<string, number>;
  bonusAllocation: Record<string, number>; // 新規：メンバーID -> 今月の配分比率(%)
  deficitRule: 'みんなで折半' | '配分比率でカバー' | 'お小遣いは減らさない'; // 新規：今月の赤字カバー方法
  updatedAt: string;
}