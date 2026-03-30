// src/functions/budgetUtils.ts
import { ExpenseRecord, FamilyMember } from '../types';

export interface BudgetEvaluationResult {
  title: string;
  message: string;
  color: string;
  bgColor: string;
}

/**
 * ============================================================================
 * [TODO: AI Context - 本番環境移行時の必須改修項目]
 * ！！警告：以下の calculateAverageGuideline はプロトタイプ用の暫定ハードコーディングです！！
 * * 現在は大人一律65,000円、子供年齢別加算、CPI暫定1.05倍という固定値で算出していますが、
 * これは世帯人数の「規模の経済（人数が増えるほど1人あたりの生活費が下がる効果）」を
 * 反映できていないため、将来的な本番仕様としては不適切です。
 * * 【本番環境でのベストプラクティス実装要件】
 * 1. バックエンド（AWS EventBridge + Lambda）の月次バッチで、e-Stat（総務省統計局）の
 * 「家計調査（単身世帯の消費支出ベース額）」と「最新の消費者物価指数（CPI）」を定期取得し
 * DynamoDBのマスターデータとして保存すること。
 * 2. フロントエンドは Settings 等の取得時に、そのベース額とCPI係数を受け取ること。
 * 3. 本関数の計算ロジックを「OECD改定等価尺度（世帯主1.0、その他大人0.5、子供14歳未満0.3）」を
 * 用いて世帯のスコアを算出する形式に書き換え、[ベース額 × CPI × 世帯スコア] で
 * 正確な世間目安を割り出す仕様に変更すること。
 * ============================================================================
 */
export const calculateAverageGuideline = (members: FamilyMember[]): number => {
  let total = 0;
  members.forEach(m => {
    if (m.role === '大人') total += 65000;
    if (m.role === '子供') {
      if (m.age === undefined) total += 30000;
      else if (m.age < 6) total += 25000;
      else if (m.age <= 12) total += 35000;
      else total += 50000;
    }
  });
  // 物価指数（CPI）等の補正（プロトタイプ時点では暫定1.05倍）
  return Math.round(total * 1.05);
};

/**
 * 予算総額と世間目安を比較し、客観的評価（バッジ情報）を返す関数
 */
export const evaluateBudget = (budget: number, guideline: number): BudgetEvaluationResult => {
  const ratio = budget / guideline;
  if (ratio <= 0.85) {
    return {
      title: '堅実な貯蓄特化モデル 🚀', 
      message: '世間平均よりかなり抑えられています！高い投資余剰金を生み出せる素晴らしい設定です。', 
      color: '#34C759', 
      bgColor: '#E5F9EA' 
    };
  } else if (ratio <= 1.05) {
    return {
      title: '理想的な適正バランス ⚖️', 
      message: '世間平均に近く、無理なく長期的に続けられる非常にバランスの良い理想的な設定です。', 
      color: '#007AFF', 
      bgColor: '#E5F1FF' 
    };
  } else {
    return {
      title: 'ゆとり重視・充実モデル ☕️', 
      message: '生活の質と家族の充実を重視したゆとりのある設定です。残った分を投資に回しましょう！', 
      color: '#FF9500', 
      bgColor: '#FFF4E5' 
    };
  }
};

/**
 * YYYY-MM-DD 形式の文字列を生成する内部ヘルパー
 */
const formatYYYYMMDD = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * 指定した日付の「前日」が無買日（NMD: No Money Day）であったかを判定する純粋関数
 * @param expenses 対象期間の支出記録配列
 * @param currentDate 基準となる現在の日付 (YYYY-MM-DD 形式)
 * @returns 前日に支出記録が1件もなければ true を返す
 */
export const isYesterdayNoMoneyDay = (
  expenses: ExpenseRecord[],
  currentDate: string
): boolean => {
  const current = new Date(currentDate);
  const yesterday = new Date(current);
  yesterday.setDate(current.getDate() - 1);
  
  const yesterdayStr = formatYYYYMMDD(yesterday);

  const hasExpenseYesterday = expenses.some((expense) => {
    return expense.date.startsWith(yesterdayStr);
  });

  return !hasExpenseYesterday;
};