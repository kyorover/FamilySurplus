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
  storeNameHistory?: string[];
  memoHistory?: string[];
  gardenPoints: number;
  lastWateringDate: string | null;
  ownedGardenItemIds: string[];
  gardenPlacements?: GardenPlacement[]; // 永続化されるお庭の配置情報
  plantLevel?: number; // 知恵の木のレベル(1〜5)
  plantExp?: number;   // 知恵の木に蓄積された経験値ポイント
  selectedTreeId?: string; // 追加: 選択中の木のID
  selectedTileId?: string; // 追加: 選択中のタイルのID
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

export interface GardenItem {
  id: string;
  name: string;
  type: 'flower' | 'pot' | 'ornament' | 'plant' | 'bg'; // plant, bg を追加
  cost: number;
  imageUrl?: string;
  growthEffectId?: string; // 追加: 成長(水やり)時のエフェクトID
}

export interface GardenPlacement {
  itemId: string;
  x: number;
  y: number;
  scale?: number;
  isFlipped?: boolean; // 新規追加: アイコンの鏡写し反転
}