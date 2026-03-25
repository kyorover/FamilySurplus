// src/functions/budgetUtils.ts
import { FamilyMember } from '../types';

/**
 * 家族構成から世間一般の生活費目安（CPI考慮）を算出する関数
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

export interface BudgetEvaluationResult {
  title: string;
  message: string;
  color: string;
  bgColor: string;
}

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