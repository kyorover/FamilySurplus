// src/functions/categoryUtils.ts
import { Category, HouseholdSettings } from '../types';

export const DEFAULT_FIXED_CATEGORIES: Category[] = [
  { id: 'fixed-1', name: '食費', budget: 50000, isFixed: true, isCalculationTarget: true },
  { id: 'fixed-2', name: '日用品', budget: 10000, isFixed: true, isCalculationTarget: true },
  { id: 'fixed-3', name: '外食', budget: 15000, isFixed: true, isCalculationTarget: true },
];

/**
 * ユーザーの設定データを検査し、必須の固定カテゴリおよび
 * 家族構成（子供）に依存するカテゴリ（養育費）を安全に補完・同期する純粋関数
 */
export const syncFixedCategories = (settings: HouseholdSettings): Category[] => {
  const currentCategories = settings.categories || [];
  // 副作用を防ぐため配列をコピー
  const newCategories = [...currentCategories];

  // 1. 基本の固定科目が存在しない場合は追加
  DEFAULT_FIXED_CATEGORIES.forEach(defaultCat => {
    if (!newCategories.some(cat => cat.id === defaultCat.id)) {
      newCategories.push({ ...defaultCat });
    }
  });

  // 2. 家族構成に「子供」が含まれるか判定し、「養育費」を同期（追加・削除）
  const hasChild = settings.familyMembers?.some(m => m.role === '子供');
  const childCategoryId = 'fixed-child';
  const childCategoryIndex = newCategories.findIndex(c => c.id === childCategoryId);

  if (hasChild && childCategoryIndex === -1) {
    // 子供がいてカテゴリが無い場合は追加
    newCategories.push({
      id: childCategoryId,
      name: '養育費',
      budget: 30000,
      isFixed: true,
      isCalculationTarget: true,
    });
  } else if (!hasChild && childCategoryIndex !== -1) {
    // 子供が一人もいなくなってカテゴリが残っている場合は削除
    newCategories.splice(childCategoryIndex, 1);
  }

  return newCategories;
};