// src/screens/SettingsScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Alert, Modal, SafeAreaView } from 'react-native';
import { useHesokuriStore } from '../store';
import { CategoryList } from '../components/settings/CategoryList';
import { CategoryAddModal } from '../components/settings/CategoryAddModal';
import { FamilyMemberList } from '../components/settings/FamilyMemberList';
import { FamilyMemberAddModal } from '../components/settings/FamilyMemberAddModal';
import { InputHistoryManagerModal } from '../components/settings/InputHistoryManagerModal';
import { GardenBuilderTest } from '../components/garden/GardenBuilderTest';
import { FamilyMember } from '../types';
import { DEFAULT_CATEGORY_NAMES } from '../constants';

export const SettingsScreen: React.FC = () => {
  const { settings, pendingSettings, setPendingSettings, updateSettings } = useHesokuriStore();
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isFamilyModalVisible, setFamilyModalVisible] = useState(false);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
  const [isGardenTestVisible, setGardenTestVisible] = useState(false);
  
  const [isFamilyEditMode, setIsFamilyEditMode] = useState(false);
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  useEffect(() => {
    if (settings && !pendingSettings) {
      setPendingSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings]);

  const activeCategories = useMemo(() => {
    if (!pendingSettings) return [];
    const hasChild = pendingSettings.familyMembers.some(m => m.role === '子供');
    return pendingSettings.categories.filter(cat => cat.isFixed && cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE ? hasChild : true);
  }, [pendingSettings]);

  if (!pendingSettings) return null;

  const handleUpdateFamily = (updatedMember: FamilyMember) => {
    setPendingSettings({ ...pendingSettings, familyMembers: pendingSettings.familyMembers.map(m => m.id === updatedMember.id ? updatedMember : m) });
  };
  const handleAddFamily = (member: FamilyMember) => {
    setPendingSettings({ ...pendingSettings, familyMembers: [...pendingSettings.familyMembers, member] });
    setFamilyModalVisible(false);
  };
  const handleDeleteFamily = (memberId: string) => {
    const isAdult = pendingSettings.familyMembers.find(m => m.id === memberId)?.role === '大人';
    const adultCount = pendingSettings.familyMembers.filter(m => m.role === '大人').length;
    if (isAdult && adultCount <= 1) return Alert.alert('エラー', '大人は最低1人必要です');
    setPendingSettings({ ...pendingSettings, familyMembers: pendingSettings.familyMembers.filter(m => m.id !== memberId) });
  };

  const handleAddCategory = (name: string) => {
    setPendingSettings({ ...pendingSettings, categories: [...pendingSettings.categories, { id: `c_${Date.now()}`, name, budget: 0, isFixed: false }] });
    setCategoryModalVisible(false);
  };
  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert('確認', 'このカテゴリを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => setPendingSettings({ ...pendingSettings, categories: pendingSettings.categories.filter(c => c.id !== categoryId) }) }
    ]);
  };

  const handleSaveAll = () => {
    updateSettings(pendingSettings);
    Alert.alert('完了', '設定を保存しました！\nダッシュボードの表示順にも反映されます。');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }} scrollEnabled={isScrollEnabled}>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👨‍👩‍👦 家族構成と基本のお小遣い</Text>
          <TouchableOpacity onPress={() => setIsFamilyEditMode(!isFamilyEditMode)} style={[styles.actionBtn, isFamilyEditMode && styles.actionBtnActive]}>
            <Text style={[styles.actionBtnText, isFamilyEditMode && styles.actionBtnTextActive]}>{isFamilyEditMode ? '✅ 完了' : '↕️ 並び替え'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hintText}>「≡」をタップしたままスライドして並び替えます。</Text>
        <FamilyMemberList 
          members={pendingSettings.familyMembers} 
          isReorderMode={isFamilyEditMode}
          onUpdate={handleUpdateFamily} 
          onDelete={handleDeleteFamily} 
          onAdd={() => setFamilyModalVisible(true)} 
          onUpdateList={(newList) => setPendingSettings({ ...pendingSettings, familyMembers: newList })}
          onDragStart={() => setIsScrollEnabled(false)}
          onDragEnd={() => setIsScrollEnabled(true)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏷️ カテゴリ一覧</Text>
          <TouchableOpacity onPress={() => setIsCategoryEditMode(!isCategoryEditMode)} style={[styles.actionBtn, isCategoryEditMode && styles.actionBtnActive]}>
            <Text style={[styles.actionBtnText, isCategoryEditMode && styles.actionBtnTextActive]}>{isCategoryEditMode ? '✅ 完了' : '↕️ 並び替え'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hintText}>ここでの順番がダッシュボードや入力画面にも反映されます。</Text>
        <CategoryList 
          categories={activeCategories} 
          isReorderMode={isCategoryEditMode}
          onDeleteCategory={handleDeleteCategory} 
          onAddCategory={() => setCategoryModalVisible(true)} 
          onUpdateList={(newList) => {
            const hiddenCategories = pendingSettings.categories.filter(c => !activeCategories.find(ac => ac.id === c.id));
            setPendingSettings({ ...pendingSettings, categories: [...newList, ...hiddenCategories] });
          }}
          onDragStart={() => setIsScrollEnabled(false)}
          onDragEnd={() => setIsScrollEnabled(true)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚙️ 詳細設定</Text>
        </View>
        <TouchableOpacity style={styles.historyManageCard} onPress={() => setHistoryModalVisible(true)} activeOpacity={0.6}>
          <View style={styles.historyManageContent}>
            <Text style={styles.historyManageIcon}>📖</Text>
            <View>
              <Text style={styles.historyManageTitle}>入力履歴マスタの管理</Text>
              <Text style={styles.historyManageDesc}>店名やコメントの入力候補を整理します</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyManageCard} onPress={() => setGardenTestVisible(true)} activeOpacity={0.6}>
          <View style={styles.historyManageContent}>
            <Text style={styles.historyManageIcon}>🌻</Text>
            <View>
              <Text style={styles.historyManageTitle}>お庭機能のテスト（開発用）</Text>
              <Text style={styles.historyManageDesc}>アイテムの購入・配置・描画を検証します</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveAll}>
          <Text style={styles.primaryButtonText}>設定を保存する</Text>
        </TouchableOpacity>
        <View style={{ height: 100 }} />
      </ScrollView>

      <CategoryAddModal visible={isCategoryModalVisible} onSave={handleAddCategory} onClose={() => setCategoryModalVisible(false)} />
      <FamilyMemberAddModal visible={isFamilyModalVisible} onSave={handleAddFamily} onClose={() => setFamilyModalVisible(false)} />
      
      <InputHistoryManagerModal 
        visible={isHistoryModalVisible} 
        settings={pendingSettings} 
        onUpdate={(newSettings) => setPendingSettings(newSettings)} 
        onClose={() => setHistoryModalVisible(false)} 
      />

      <Modal visible={isGardenTestVisible} animationType="slide">
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>お庭デバッグ検証</Text>
            <TouchableOpacity onPress={() => setGardenTestVisible(false)}>
              <Text style={styles.modalCloseText}>閉じる</Text>
            </TouchableOpacity>
          </View>
          <GardenBuilderTest />
        </SafeAreaView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, marginBottom: 8, paddingHorizontal: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#F2F2F7', borderRadius: 8 },
  actionBtnActive: { backgroundColor: '#007AFF' },
  actionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#1C1C1E' },
  actionBtnTextActive: { color: '#FFFFFF' },
  hintText: { fontSize: 12, color: '#8E8E93', marginLeft: 8, marginBottom: 12, lineHeight: 18 },
  historyManageCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  historyManageContent: { flexDirection: 'row', alignItems: 'center' },
  historyManageIcon: { fontSize: 24, marginRight: 16 },
  historyManageTitle: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 2 },
  historyManageDesc: { fontSize: 10, color: '#8E8E93' },
  chevron: { fontSize: 20, color: '#C7C7CC', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  
  modalSafeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE' },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  modalCloseText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },
});