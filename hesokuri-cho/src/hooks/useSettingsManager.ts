// src/hooks/useSettingsManager.ts
import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useHesokuriStore } from '../store';
import { FamilyMember, Category } from '../types';
import { DEFAULT_CATEGORY_NAMES } from '../constants';

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

  // 修正: 冗長でエラーの原因となっていた直接の fetch 処理を削除。
  // グローバルストアですでに取得済みの settings を pendingSettings にコピーするだけにする。
  useEffect(() => {
    if (settings && !pendingSettings) {
      setPendingSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings, pendingSettings, setPendingSettings]);

  // 表示用の有効なカテゴリを算出（子供がいない場合は養育費を隠す等）
  const activeCategories = useMemo(() => {
    if (!pendingSettings) return [];
    const members = pendingSettings.familyMembers || [];
    const categories = pendingSettings.categories || [];
    
    const hasChild = members.some(m => m.role === '子供');
    return categories.filter(cat => 
      cat.isFixed && cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE ? hasChild : true
    );
  }, [pendingSettings]);

  // --- 更新ハンドラ群 ---
  const handleUpdateFamily = (updatedMember: FamilyMember) => {
    if (!pendingSettings) return;
    const members = pendingSettings.familyMembers || [];
    setPendingSettings({ ...pendingSettings, familyMembers: members.map(m => m.id === updatedMember.id ? updatedMember : m) });
  };

  const handleAddFamily = (member: FamilyMember) => {
    if (!pendingSettings) return;
    const members = pendingSettings.familyMembers || [];
    setPendingSettings({ ...pendingSettings, familyMembers: [...members, member] });
    setFamilyModalVisible(false);
  };

  const handleDeleteFamily = (memberId: string) => {
    if (!pendingSettings) return;
    const members = pendingSettings.familyMembers || [];
    const isAdult = members.find(m => m.id === memberId)?.role === '大人';
    const adultCount = members.filter(m => m.role === '大人').length;
    if (isAdult && adultCount <= 1) return Alert.alert('エラー', '大人は最低1人必要です');
    setPendingSettings({ ...pendingSettings, familyMembers: members.filter(m => m.id !== memberId) });
  };

  const handleUpdateFamilyList = (newList: FamilyMember[]) => {
    if (!pendingSettings) return;
    setPendingSettings({ ...pendingSettings, familyMembers: newList });
  };

  const handleAddCategory = (categoryName: string) => {
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

  const handleDeleteCategory = (categoryId: string) => {
    if (!pendingSettings) return;
    const categories = pendingSettings.categories || [];
    Alert.alert('確認', 'このカテゴリを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => setPendingSettings({ ...pendingSettings, categories: categories.filter(c => c.id !== categoryId) }) }
    ]);
  };

  const handleUpdateCategoryList = (newList: Category[]) => {
    if (!pendingSettings) return;
    const categories = pendingSettings.categories || [];
    // 非表示になっている固定カテゴリを維持しつつマージする
    const hiddenCategories = categories.filter(c => !activeCategories.find(ac => ac.id === c.id));
    setPendingSettings({ ...pendingSettings, categories: [...newList, ...hiddenCategories] });
  };

  const handleSaveAll = () => {
    if (!pendingSettings) return;
    updateSettings(pendingSettings);
    Alert.alert('完了', '設定を保存しました！');
  };

  return {
    pendingSettings,
    setPendingSettings,
    activeCategories,
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