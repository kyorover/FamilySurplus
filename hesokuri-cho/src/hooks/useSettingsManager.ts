// src/hooks/useSettingsManager.ts
import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useHesokuriStore } from '../store';
import { FamilyMember, Category } from '../types';

export const useSettingsManager = () => {
  const { settings, pendingSettings, setPendingSettings, updateSettings } = useHesokuriStore();
  
  // モーダル表示状態
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isFamilyModalVisible, setFamilyModalVisible] = useState(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
  const [isGardenTestVisible, setGardenTestVisible] = useState(false);
  
  // 画面モード状態
  const [isFamilyEditMode, setIsFamilyEditMode] = useState(false);
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  // 初回マウント時に現在の設定を pending（編集中）状態としてコピー
  useEffect(() => {
    if (settings && !pendingSettings) {
      setPendingSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings, pendingSettings, setPendingSettings]);

  // 変更検知フラグ
  const hasUnsavedChanges = useMemo(() => {
    if (!settings || !pendingSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(pendingSettings);
  }, [settings, pendingSettings]);

  // 固定カテゴリを除外したアクティブなカテゴリ一覧（UI表示用）
  const activeCategories = useMemo(() => {
    if (!pendingSettings) return [];
    return pendingSettings.categories.filter(c => !c.isFixed);
  }, [pendingSettings]);

  const handleUpdateFamily = (updatedMember: FamilyMember) => {
    if (!pendingSettings) return;
    const newList = pendingSettings.familyMembers.map(m => m.id === updatedMember.id ? updatedMember : m);
    setPendingSettings({ ...pendingSettings, familyMembers: newList });
  };

  const handleAddFamily = (newMember: FamilyMember) => {
    if (!pendingSettings) return;
    setPendingSettings({ ...pendingSettings, familyMembers: [...pendingSettings.familyMembers, newMember] });
  };

  const handleDeleteFamily = (memberId: string) => {
    if (!pendingSettings) return;
    const newList = pendingSettings.familyMembers.filter(m => m.id !== memberId);
    setPendingSettings({ ...pendingSettings, familyMembers: newList });
  };

  const handleUpdateFamilyList = (newList: FamilyMember[]) => {
    if (!pendingSettings) return;
    setPendingSettings({ ...pendingSettings, familyMembers: newList });
  };

  const handleAddCategory = (newCategory: Category) => {
    if (!pendingSettings) return;
    setPendingSettings({ ...pendingSettings, categories: [...pendingSettings.categories, newCategory] });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!pendingSettings) return;
    const newList = pendingSettings.categories.filter(c => c.id !== categoryId || c.isFixed);
    setPendingSettings({ ...pendingSettings, categories: newList });
  };

  const handleUpdateCategoryList = (newList: Category[]) => {
    if (!pendingSettings) return;
    const hiddenCategories = pendingSettings.categories.filter(c => !activeCategories.find(ac => ac.id === c.id));
    setPendingSettings({ ...pendingSettings, categories: [...newList, ...hiddenCategories] });
  };

  const handleSaveAll = () => {
    if (!pendingSettings) return;
    updateSettings(pendingSettings);
    Alert.alert('完了', '設定を保存しました！\nダッシュボードの表示順にも反映されます。');
  };

  return {
    pendingSettings,
    setPendingSettings,
    activeCategories,
    hasUnsavedChanges, // ← 追加
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
      updateFamily: handleUpdateFamily,
      addFamily: handleAddFamily,
      deleteFamily: handleDeleteFamily,
      updateFamilyList: handleUpdateFamilyList,
      addCategory: handleAddCategory,
      deleteCategory: handleDeleteCategory,
      updateCategoryList: handleUpdateCategoryList,
      saveAll: handleSaveAll,
    }
  };
};