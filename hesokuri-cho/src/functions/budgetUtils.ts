// src/functions/budgetUtils.ts
import { ExpenseRecord, FamilyMember, NationalStatistics } from '../types';

export interface BudgetEvaluationResult {
  title: string;
  message: string;
  color: string;
  bgColor: string;
}

/**
 * 外部の公的統計データ(CPI, 世帯平均支出)と家族構成(OECD改定等価尺度)をもとに、
 * 世間一般的な適正予算額（ベースライン）を算出する純粋関数
 * @param members 家族構成リスト
 * @param stats バックエンドから取得した最新の公的統計データ
 * @returns 算出された世間一般的な適正予算額
 */
export const calculateAverageGuideline = (members: FamilyMember[], stats?: NationalStatistics | null): number => {
  // 統計データが取得できていない場合のフェールセーフ（最低限の動作保証）
  if (!stats) return 150000; 

  // 1. OECD改定等価尺度を用いた世帯スコアの算出
  // （世帯主: 1.0、その他大人: 0.5、子供[簡易的に一律]: 0.3）
  let isHeadCounted = false;
  let householdScore = 0;
  let infantCount = 0; // 0〜3歳の乳幼児の数

  members.forEach(m => {
    if (m.role === '大人') {
      if (!isHeadCounted) {
        householdScore += 1.0;
        isHeadCounted = true;
      } else {
        householdScore += 0.5;
      }
    } else if (m.role === '子供') {
      // 本格実装時は年齢に応じて変動させる
      if (m.age !== undefined && m.age <= 3) {
        // 0〜3歳：おむつやミルク等、特殊な固定消耗品がかかるため係数計算の対象外とする
        infantCount += 1;
      } else if (m.age !== undefined && m.age >= 14) {
        // 14歳以上：大人と同等の食費・生活費スケールになるため 0.5
        householdScore += 0.5;
      } else {
        // 4歳〜13歳、または年齢未入力(フォールバック)：基本スコアとして0.3を加算
        householdScore += 0.3;
      }
    }
  });

  // 2. 単身世帯の平均支出額（統計データ）の合算をベース値とする
  const baseSingleExpense = Object.values(stats.averageExpenses.single).reduce((sum, val) => sum + val, 0);

  // 3. 物価指数（CPI）の補正 (例: 105.2 -> 1.052)
  const cpiRatio = stats.cpi / 100;

  // 世帯のベースライン = 単身平均 × 物価指数 × 世帯スコア
  let guideline = Math.round(baseSingleExpense * cpiRatio * householdScore);

  // 4. 乳幼児特有のコストを統計データから取得して加算
  // stats.averageExpenses.infant が存在することを前提とし、未定義時は0で計算
  const infantBaseCost = (stats.averageExpenses as any).infant || 0;
  if (infantCount > 0) {
    guideline += (infantCount * infantBaseCost);
  }

  return guideline;
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

/**
 * 過去月のへそくり額（余剰金）を算出する純粋関数
 * @param budgetAmount 対象月の予算総額
 * @param expenses 対象月の支出記録配列
 * @returns 算出されたへそくり額（予算 - 支出総額）
 */
export const calculateConfirmedHesokuri = (
  budgetAmount: number,
  expenses: ExpenseRecord[]
): number => {
  const totalExpense = expenses.reduce((sum, record) => sum + record.amount, 0);
  return budgetAmount - totalExpense;
};