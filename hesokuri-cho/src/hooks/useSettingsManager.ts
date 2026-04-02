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

  // 初回マウント時に現在の設定を pending（編集中）状態としてコピー
  useEffect(() => {
    if (settings && !pendingSettings) {
      setPendingSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings, pendingSettings, setPendingSettings]);

  // 表示用の有効なカテゴリを算出（子供がいない場合は養育費を隠す等）
  const activeCategories = useMemo(() => {
    if (!pendingSettings) return [];
    const hasChild = pendingSettings.familyMembers.some(m => m.role === '子供');
    return pendingSettings.categories.filter(cat => 
      cat.isFixed && cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE ? hasChild : true
    );
  }, [pendingSettings]);

  // --- 更新ハンドラ群 ---
  const handleUpdateFamily = (updatedMember: FamilyMember) => {
    if (!pendingSettings) return;
    setPendingSettings({ ...pendingSettings, familyMembers: pendingSettings.familyMembers.map(m => m.id === updatedMember.id ? updatedMember : m) });
  };

  const handleAddFamily = (member: FamilyMember) => {
    if (!pendingSettings) return;
    setPendingSettings({ ...pendingSettings, familyMembers: [...pendingSettings.familyMembers, member] });
    setFamilyModalVisible(false);
  };

  const handleDeleteFamily = (memberId: string) => {
    if (!pendingSettings) return;
    const isAdult = pendingSettings.familyMembers.find(m => m.id === memberId)?.role === '大人';
    const adultCount = pendingSettings.familyMembers.filter(m => m.role === '大人').length;
    if (isAdult && adultCount <= 1) return Alert.alert('エラー', '大人は最低1人必要です');
    setPendingSettings({ ...pendingSettings, familyMembers: pendingSettings.familyMembers.filter(m => m.id !== memberId) });
  };

  const handleUpdateFamilyList = (newList: FamilyMember[]) => {
    if (!pendingSettings) return;
    setPendingSettings({ ...pendingSettings, familyMembers: newList });
  };

  // 引数名を明確化し、プロパティへ明示的に代入
  const handleAddCategory = (categoryName: string) => {
    if (!pendingSettings) return;
    setPendingSettings({ 
      ...pendingSettings, 
      categories: [
        ...pendingSettings.categories, 
        { id: `c_${Date.now()}`, name: categoryName, budget: 0, isFixed: false }
      ] 
    });
    // モーダルの非表示はコンポーネント側の onClose コールバックで実行されるためここから削除
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!pendingSettings) return;
    Alert.alert('確認', 'このカテゴリを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => setPendingSettings({ ...pendingSettings, categories: pendingSettings.categories.filter(c => c.id !== categoryId) }) }
    ]);
  };

  const handleUpdateCategoryList = (newList: Category[]) => {
    if (!pendingSettings) return;
    // 非表示になっている固定カテゴリを維持しつつマージする
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