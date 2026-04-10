// src/hooks/useSettingsManager.ts
import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useHesokuriStore } from '../store';
import { FamilyMember, HouseholdSettings } from '../types';
import { DEFAULT_CATEGORY_NAMES } from '../constants';
import { useFamilyActions } from './useFamilyActions';
import { useCategoryActions } from './useCategoryActions';

export const useSettingsManager = () => {
  const { settings, setPendingSettings: setStorePending, updateSettings } = useHesokuriStore();
  const [localPending, setLocalPending] = useState<HouseholdSettings | null>(null);
  
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isFamilyModalVisible, setFamilyModalVisible] = useState(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
  const [isGardenTestVisible, setGardenTestVisible] = useState(false);
  
  const [isFamilyEditMode, setIsFamilyEditMode] = useState(false);
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  // 初期化：ストアの settings をローカルステートへ
  useEffect(() => {
    if (settings && !localPending) {
      setLocalPending(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings]);

  // ▼ 【重要】未保存ガード復旧の鍵
  // ローカルでの変更を即座にストア側の pendingSettings へ同期する。
  // これにより useTabNavigation が「変更あり」と判定できるようになる。
  useEffect(() => {
    if (localPending) {
      setStorePending(localPending);
    }
  }, [localPending, setStorePending]);

  const hasChanges = useMemo(() => {
    if (!settings || !localPending) return false;
    return JSON.stringify(settings) !== JSON.stringify(localPending);
  }, [settings, localPending]);

  const activeCategories = useMemo(() => {
    if (!localPending) return [];
    const members = localPending.familyMembers || [];
    const categories = localPending.categories || [];
    const hasChild = members.some(m => m.role === '子供');
    return categories.filter(cat => 
      cat.isFixed && cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE ? hasChild : true
    );
  }, [localPending]);

  const familyActions = useFamilyActions(localPending, setLocalPending);
  const categoryActions = useCategoryActions(localPending, setLocalPending, activeCategories);

  const handleSaveAll = async () => {
    if (!localPending) return;
    await updateSettings(localPending);
    Alert.alert('完了', '設定を保存しました！');
  };

  return {
    pendingSettings: localPending,
    setPendingSettings: setLocalPending,
    activeCategories,
    hasChanges,
    modals: {
      category: isCategoryModalVisible, setCategory: setCategoryModalVisible,
      familyAdd: isFamilyModalVisible, setFamilyAdd: setFamilyModalVisible,
      familyEdit: editingFamilyMember, setFamilyEdit: setEditingFamilyMember,
      history: isHistoryModalVisible, setHistory: setHistoryModalVisible,
      garden: isGardenTestVisible, setGarden: setGardenTestVisible,
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
      addCategory: categoryActions.addCategory,
      deleteCategory: categoryActions.deleteCategory,
      updateCategoryList: categoryActions.updateCategoryList,
      saveAll: handleSaveAll,
    }
  };
};