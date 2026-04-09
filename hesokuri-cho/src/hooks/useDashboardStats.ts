// src/hooks/useDashboardStats.ts
import { useMemo } from 'react';
import { HouseholdSettings, MonthlyBudget, ExpenseRecord } from '../types';
import { DEFAULT_CATEGORY_NAMES } from '../constants';

export const useDashboardStats = (
  settings: HouseholdSettings | null,
  monthlyBudget: MonthlyBudget | null,
  expenses: ExpenseRecord[] | null
) => {
  const activeCategories = useMemo(() => {
    if (!settings) return [];
    const hasChild = (settings.familyMembers || []).some(m => m.role === '子供');
    return (settings.categories || []).filter(cat => cat.isFixed && cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE ? hasChild : true);
  }, [settings]);

  return useMemo(() => {
    if (!settings || !monthlyBudget) {
      return { activeCategories: [], totalMonthlyBudget: 0, totalSpent: 0, currentHesokuri: 0, spentByCategory: {}, pocketMoneyDetails: [] };
    }

    const targetCategories = activeCategories.filter(cat => cat.isFixed || cat.isCalculationTarget !== false);
    const targetCategoryIds = new Set(targetCategories.map(c => c.id));
    const safeExpenses = expenses || [];
    
    const totalMonthlyBudget = targetCategories.reduce((sum, cat) => sum + (monthlyBudget.budgets[cat.id] || 0), 0);
    const totalSpent = safeExpenses.filter(exp => targetCategoryIds.has(exp.categoryId)).reduce((sum, exp) => sum + exp.amount, 0);
    const currentHesokuri = totalMonthlyBudget - totalSpent;
    const spentByCategory = safeExpenses.reduce((acc, exp) => { acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.amount; return acc; }, {} as Record<string, number>);

    const familyMembers = settings.familyMembers || [];
    const bonusAllocation = monthlyBudget.bonusAllocation || {};
    
    // 誰か一人でも明示的に配分が設定されているか判定
    const isAnyAllocationSet = Object.keys(bonusAllocation).length > 0;

    // 【修正】小遣い制のOff設定を無視してボーナス配分を強制0にする誤ったロジックを撤廃。
    // 家族全員をボーナス配分の対象として、ルール通りの比率を正しく算出します。
    const allocationRatios = familyMembers.map(m => {
      const manualRatio = bonusAllocation[m.id];
      // 手動設定があればそれを使用。手動設定がなく、他の誰かが設定済みなら 0。誰も設定していなければ 1 (均等割り)
      const finalRatio = manualRatio !== undefined ? manualRatio : (isAnyAllocationSet ? 0 : 1);
      return { id: m.id, ratio: finalRatio };
    });
    
    const totalRatio = allocationRatios.reduce((sum, item) => sum + item.ratio, 0);

    const pocketMoneyDetails = familyMembers.map(m => {
      const base = m.hasPocketMoney ? (m.pocketMoneyAmount || 0) : 0;
      const allocObj = allocationRatios.find(a => a.id === m.id);
      const ratio = allocObj ? allocObj.ratio : 0;
      
      // 算出した割合(ratio)に基づき、余剰金からボーナスを配分
      const bonus = (currentHesokuri > 0 && totalRatio > 0) 
        ? Math.floor(currentHesokuri * (ratio / totalRatio)) 
        : 0;
        
      return { id: m.id, name: m.name, base, bonus, total: base + bonus };
    });

    return { activeCategories, totalMonthlyBudget, totalSpent, currentHesokuri, spentByCategory, pocketMoneyDetails };
  }, [settings, monthlyBudget, expenses, activeCategories]);
};