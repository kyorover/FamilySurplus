// src/screens/SettingsScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Alert } from 'react-native';
import { useHesokuriStore } from '../store';
import { CategoryList } from '../components/settings/CategoryList';
import { CategoryAddModal } from '../components/settings/CategoryAddModal';
import { FamilyMemberList } from '../components/settings/FamilyMemberList';
import { FamilyMemberAddModal } from '../components/settings/FamilyMemberAddModal';
import { InputHistoryManagerModal } from '../components/settings/InputHistoryManagerModal';
import { FamilyMember } from '../types';

export const SettingsScreen: React.FC = () => {
  const { settings, pendingSettings, setPendingSettings, updateSettings } = useHesokuriStore();
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isFamilyModalVisible, setFamilyModalVisible] = useState(false);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
  
  // ★ 新規：設定画面全体の並び替えモードを管理
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  useEffect(() => {
    if (settings && !pendingSettings) {
      setPendingSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings]);

  const activeCategories = useMemo(() => {
    if (!pendingSettings) return [];
    const hasChild = pendingSettings.familyMembers.some(m => m.role === '子供');
    return pendingSettings.categories.filter(cat => cat.isFixed && cat.name === '養育費' ? hasChild : true);
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
        
        {/* モード切替ボタン群 */}
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setIsReorderMode(!isReorderMode)} style={[styles.actionBtn, isReorderMode && styles.actionBtnActive]}>
            <Text style={[styles.actionBtnText, isReorderMode && styles.actionBtnTextActive]}>{isReorderMode ? '✅ 並び替え完了' : '↕️ 項目を並び替える'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>👨‍👩‍👦 家族構成と基本のお小遣い</Text>
        <FamilyMemberList 
          members={pendingSettings.familyMembers} 
          isReorderMode={isReorderMode} // モードを渡す
          onUpdate={handleUpdateFamily} 
          onDelete={handleDeleteFamily} 
          onAdd={() => setFamilyModalVisible(true)} 
          onUpdateList={(newList) => setPendingSettings({ ...pendingSettings, familyMembers: newList })}
          onDragStart={() => setIsScrollEnabled(false)}
          onDragEnd={() => setIsScrollEnabled(true)}
        />

        <Text style={styles.sectionTitle}>🏷️ カテゴリ一覧</Text>
        <CategoryList 
          categories={activeCategories} 
          isReorderMode={isReorderMode} // モードを渡す
          onDeleteCategory={handleDeleteCategory} 
          onAddCategory={() => setCategoryModalVisible(true)} 
          onUpdateList={(newList) => {
            const hiddenCategories = pendingSettings.categories.filter(c => !activeCategories.find(ac => ac.id === c.id));
            setPendingSettings({ ...pendingSettings, categories: [...newList, ...hiddenCategories] });
          }}
          onDragStart={() => setIsScrollEnabled(false)}
          onDragEnd={() => setIsScrollEnabled(true)}
        />

        <Text style={styles.sectionTitle}>⚙️ 詳細設定</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  actionBtnActive: { backgroundColor: '#007AFF' },
  actionBtnText: { fontSize: 13, fontWeight: 'bold', color: '#1C1C1E' },
  actionBtnTextActive: { color: '#FFFFFF' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginLeft: 8, marginTop: 16, marginBottom: 12 },
  historyManageCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  historyManageContent: { flexDirection: 'row', alignItems: 'center' },
  historyManageIcon: { fontSize: 24, marginRight: 16 },
  historyManageTitle: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 2 },
  historyManageDesc: { fontSize: 10, color: '#8E8E93' },
  chevron: { fontSize: 20, color: '#C7C7CC', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});