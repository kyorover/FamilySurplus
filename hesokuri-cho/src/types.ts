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
  itemLevels?: Record<string, number>; // 追加: 木それぞれ(itemId)のレベル
  itemExps?: Record<string, number>;   // 追加: 木それぞれ(itemId)の蓄積経験値
  itemCounts?: Record<string, number>; // 追加: アイテムごとの所持個数
  selectedTreeId?: string; // 選択中の木のID
  selectedTileId?: string; // 選択中のタイルのID
  isInitialSetupComplete?: boolean; // 新規追加: オンボーディング（初期設定）の完了フラグ
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

// === 新規追加：月次サマリー（へそくり確定履歴） ===
export interface MonthlySummary {
  householdId: string;
  month_id: string; // YYYY-MM形式 (例: 2026-03)
  isConfirmed: boolean; // 月締めが完了し、へそくり額が確定したか
  confirmedHesokuriAmount: number; // 確定後のへそくり額（以後の支出変更の影響を受けない）
  confirmedAt?: string; // 確定処理を行った日時（ISO文字列等）
}

// === 新規追加：アカウント・課金情報（拡張性） ===
export interface AccountInfo {
  accountId: string; // Cognitoのsubと一致させる (= householdId)
  email: string;
  subscriptionPlan: 'FREE' | 'PREMIUM'; // 広告表示等の制御に使用
  subscriptionExpiry?: string; // 追加: サブスクリプションの有効期限 (ISO 8601形式)
  createdAt: string;
  isAdmin?: boolean; // ▼ 追加: デバッグ機能等の制御に使用する管理者フラグ
}

// === 公的統計データキャッシュ ===
export interface NationalStatistics {
  month: string;           // 例: "2026-04"
  cpi: number;               // 最新の消費者物価指数 (基準年=100)
  averageExpenses: {
    single: Record<string, number>; // 単身世帯の平均支出
    twoPerson: Record<string, number>; // 2人世帯の平均支出
    threePlus: Record<string, number>; // 3人以上世帯の平均支出
    /**
     * ▼ 修正：乳幼児(0-3歳)固有の加算コスト
     * 政府統計の「夫婦のみ」と「夫婦＋子」の差分から項目別に機械的に抽出した値。
     * ハードコーディング値を廃止し、バックエンドの演算結果を格納する構造。
     */
     infantSpecific?: Record<string, number>; 
  };
  updatedAt: string;
}