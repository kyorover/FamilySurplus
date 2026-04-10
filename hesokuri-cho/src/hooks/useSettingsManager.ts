// src/hooks/useSettingsManager.ts
import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useHesokuriStore } from '../store';
import { FamilyMember, Category, HouseholdSettings } from '../types';
import { DEFAULT_CATEGORY_NAMES } from '../constants';
import { evaluateBudget, calculateAverageGuideline } from '../functions/budgetUtils';
import { useFamilyActions } from './useFamilyActions';
import { useCategoryActions } from './useCategoryActions';

export const useSettingsManager = () => {
  const { settings, updateSettings, statistics } = useHesokuriStore();
  const [pendingSettings, setPendingSettings] = useState<HouseholdSettings | null>(null);
  
  // モーダル・モード状態
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isFamilyModalVisible, setFamilyModalVisible] = useState(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
  const [isGardenTestVisible, setGardenTestVisible] = useState(false);
  const [editingBudgetCategory, setEditingBudgetCategory] = useState<Category | null>(null);
  
  const [isFamilyEditMode, setIsFamilyEditMode] = useState(false);
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  useEffect(() => {
    if (settings && !pendingSettings) {
      setPendingSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings, pendingSettings]);

  const activeCategories = useMemo(() => {
    if (!pendingSettings) return [];
    const members = pendingSettings.familyMembers || [];
    const categories = pendingSettings.categories || [];
    const hasChild = members.some(m => m.role === '子供');
    return categories.filter(cat => 
      cat.isFixed && cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE ? hasChild : true
    );
  }, [pendingSettings]);

  const budgetEvaluation = useMemo(() => {
    if (!pendingSettings) return null;
    const members = pendingSettings.familyMembers || [];
    const hasChild = members.some(m => m.role === '子供');

    const fixedCategories = activeCategories.filter(c => c.isFixed);
    const totalFixedBudget = fixedCategories.reduce((sum, c) => sum + (c.budget || 0), 0);

    const averageGuideline = calculateAverageGuideline(members, statistics);
    const evaluation = evaluateBudget(totalFixedBudget, averageGuideline);

    return { totalFixedBudget, averageGuideline, evaluation, hasChild };
  }, [pendingSettings, activeCategories, statistics]);

  // サブフック（ロジック層）の呼び出し
  const familyActions = useFamilyActions(pendingSettings, setPendingSettings);
  const categoryActions = useCategoryActions(pendingSettings, setPendingSettings, activeCategories);

  const handleSaveAll = () => {
    if (!pendingSettings) return;
    updateSettings(pendingSettings);
    Alert.alert('完了', '設定を保存しました！');
  };

  return {
    pendingSettings,
    setPendingSettings,
    activeCategories,
    budgetEvaluation, 
    modals: {
      category: isCategoryModalVisible, setCategory: setCategoryModalVisible,
      familyAdd: isFamilyModalVisible, setFamilyAdd: setFamilyModalVisible,
      familyEdit: editingFamilyMember, setFamilyEdit: setEditingFamilyMember,
      history: isHistoryModalVisible, setHistory: setHistoryModalVisible,
      garden: isGardenTestVisible, setGarden: setGardenTestVisible,
      budgetEdit: editingBudgetCategory, setBudgetEdit: setEditingBudgetCategory,
    },
    modes: {
      familyEdit: isFamilyEditMode, setFamilyEdit: setIsFamilyEditMode,
      categoryEdit: isCategoryEditMode, setCategoryEdit: setIsCategoryEditMode,
      scroll: isScrollEnabled, setScroll: setIsScrollEnabled,
    },
    actions: {
      updateFamily: familyActions.updateFamily,
      addFamily: (m: FamilyMember) => { familyActions.addFamily(m); setFamilyModalVisible(false); },
      deleteFamily: familyActions.deleteFamily,
      updateFamilyList: familyActions.updateFamilyList,
      
      updateCategoryBudget: (id: string, val: number) => { categoryActions.updateCategoryBudget(id, val); setEditingBudgetCategory(null); },
      addCategory: categoryActions.addCategory,
      deleteCategory: categoryActions.deleteCategory,
      updateCategoryList: categoryActions.updateCategoryList,
      saveAll: handleSaveAll,
    }
  };
};