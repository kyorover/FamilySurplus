// src/hooks/useCategoryActions.ts
import { Alert } from 'react-native';
import { Category, HouseholdSettings } from '../types';

export const useCategoryActions = (
  pendingSettings: HouseholdSettings | null,
  setPendingSettings: (settings: HouseholdSettings) => void,
  activeCategories: Category[]
) => {
  const updateCategoryBudget = (categoryId: string, newBudget: number) => {
    if (!pendingSettings) return;
    const categories = pendingSettings.categories || [];
    setPendingSettings({
      ...pendingSettings,
      categories: categories.map(c => c.id === categoryId ? { ...c, budget: newBudget } : c)
    });
  };

  const addCategory = (categoryName: string) => {
    if (!pendingSettings) return;
    const categories = pendingSettings.categories || [];
    setPendingSettings({ 
      ...pendingSettings, 
      categories: [
        ...categories, 
        { id: `c_${Date.now()}`, name: categoryName, budget: 0, isFixed: false }
      ] 
    });
  };

  const deleteCategory = (categoryId: string) => {
    if (!pendingSettings) return;
    const categories = pendingSettings.categories || [];
    Alert.alert('確認', 'このカテゴリを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => setPendingSettings({ ...pendingSettings, categories: categories.filter(c => c.id !== categoryId) }) }
    ]);
  };

  const updateCategoryList = (newList: Category[]) => {
    if (!pendingSettings) return;
    const categories = pendingSettings.categories || [];
    // 非表示になっている固定カテゴリを維持しつつマージする
    const hiddenCategories = categories.filter(c => !activeCategories.find(ac => ac.id === c.id));
    setPendingSettings({ ...pendingSettings, categories: [...newList, ...hiddenCategories] });
  };

  return { updateCategoryBudget, addCategory, deleteCategory, updateCategoryList };
};