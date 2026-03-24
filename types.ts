// types.ts

// ==========================================
// 1. 基本となる型定義（Union Types）
// ==========================================
export type Role = '大人' | '子供';
export type PaymentMethod = '電子決済' | 'クレジット' | '現金';

// ==========================================
// 2. マスタデータ（家計設定）の型定義
// ==========================================

/**
 * 家族メンバー
 * - 人数や年齢に応じて世間目安の適正予算を算出するベースとなる
 */
export interface FamilyMember {
  id: string;
  name: string;
  role: Role;
  age?: number;             // 任意項目。子供の年齢に応じた予算の傾斜算出などに使用
  hasPocketMoney: boolean;  // 単身者や子供など、小遣い管理が不要な場合はfalse
  pocketMoneyAmount: number;// hasPocketMoneyがfalseの場合は0として扱う
}

/**
 * 支出カテゴリ（ハイブリッド設計）
 * - 収入の概念は存在せず、すべて「生きるためのコスト（またはゆとり費）」として扱う
 */
export interface Category {
  id: string;
  name: string;
  budget: number;           // 毎月の割り当て予算額
  isFixed: boolean;         // true: システム固定（食費、養育費等 / 削除不可） false: ユーザー独自（削除可）
  // ※ 「養育費」などを表示するかどうかの `isActive` の状態は、
  // 家族メンバーに「子供」が含まれるかどうかでフロントエンドが動的に判定するため、
  // DBスキーマ（永続化データ）としては持たせない設計とします。
}

/**
 * 支払者（財布の種類）
 */
export interface Payer {
  id: string;
  name: string;             // 例: "夫の財布", "共通口座", "自分"
}

/**
 * アプリ全体の設定情報（ユーザー/世帯に紐づくルートオブジェクト）
 */
export interface HouseholdSettings {
  householdId: string;
  familyMembers: FamilyMember[];
  categories: Category[];
  payers: Payer[];
  notificationsEnabled: boolean;
  updatedAt: Date;
}

// ==========================================
// 3. トランザクション（日々の支出記録）の型定義
// ==========================================

/**
 * 支出記録（へそくりを算出するためのマイナス要素）
 * - 収入のレコード型は意図的に定義しない（存在しない）
 */
export interface ExpenseRecord {
  id: string;
  householdId: string;      // どの世帯の記録か
  date: string;             // YYYY-MM-DD形式（カレンダーUIや集計で扱いやすいフォーマット）
  categoryId: string;       // CategoryのIDと紐付け
  amount: number;           // 支出金額（常に正の整数。UI側でマイナス入力させない）
  payerId: string;          // PayerのIDと紐付け
  paymentMethod: PaymentMethod;
  memo: string;             // 最大50文字
  createdAt: Date;
}

// ==========================================
// 4. 分析・評価用の型定義（フロントエンド計算・表示用）
// ==========================================

/**
 * 予算評価結果
 * - 世間目安と設定予算を比較し、ポジティブなフィードバックを返すための型
 */
export interface BudgetEvaluation {
  title: string;            // 例: "堅実な貯蓄特化モデル 🚀"
  message: string;          // 例: "世間平均よりかなり抑えられています！..."
  color: string;            // テーマカラー（文字色等）
  bgColor: string;          // 背景色
}