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
  isCalculationTarget?: boolean;
}

export interface HouseholdSettings {
  householdId: string;
  familyMembers: FamilyMember[];
  categories: Category[];
  notificationsEnabled: boolean;
  updatedAt: Date | string;
  storeNameHistory?: string[]; // 新規：店名の入力履歴マスタ
  memoHistory?: string[];      // 新規：コメントの入力履歴マスタ
  // --- ガーデン機能追加分 ---
  gardenPoints: number;        // 現在のガーデンポイント残高
  lastWateringDate: string | null; // 最後に水やり(確認)をした日付 (YYYY-MM-DD)
  ownedGardenItemIds: string[];    // 所持しているガーデンアイテムのIDリスト
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
  bonusAllocation: Record<string, number>;
  deficitRule: 'みんなで折半' | '配分比率でカバー' | 'お小遣いは減らさない';
  updatedAt: string;
}

// ==========================================
// ガーデン機能・ゲーミフィケーション用 追加型定義
// ==========================================

export interface GardenItem {
  id: string;
  name: string;
  type: 'flower' | 'pot' | 'ornament';
  cost: number; // 交換に必要なガーデンポイント
  imageUrl?: string; 
}

export interface GardenPlacement {
  itemId: string;
  x: number;
  y: number;
  scale?: number;
}

export interface MonthlyGarden {
  householdId: string;
  month_id: string; // YYYY-MM
  placements: GardenPlacement[]; // ガーデンに配置されたアイテム
  plantLevel: number; // その月のメイン植物の成長度合い（0〜5など）
  savedAt: string;
}