// src/screens/SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Alert } from 'react-native';
import { useHesokuriStore } from '../store';
import { CategoryList } from '../components/settings/CategoryList';
import { CategoryAddModal } from '../components/settings/CategoryAddModal';
import { FamilyMemberList } from '../components/settings/FamilyMemberList';
import { FamilyMemberAddModal } from '../components/settings/FamilyMemberAddModal';
import { HouseholdSettings, FamilyMember } from '../types';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useHesokuriStore();
  const [localSettings, setLocalSettings] = useState<HouseholdSettings | null>(null);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isFamilyModalVisible, setFamilyModalVisible] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings]);

  if (!localSettings) return null;

  // 家族の中に「子供」がいるか判定
  const hasChild = localSettings.familyMembers.some(m => m.role === '子供');
  
  // 子供がいない場合は「養育費」カテゴリを自動的に除外（非表示化）
  const activeCategories = localSettings.categories.filter(cat => 
    cat.isFixed && cat.name === '養育費' ? hasChild : true
  );

  // 家族の追加・削除
  const handleAddFamily = (member: FamilyMember) => {
    setLocalSettings(prev => prev ? { ...prev, familyMembers: [...prev.familyMembers, member] } : prev);
    setFamilyModalVisible(false);
  };

  const handleDeleteFamily = (memberId: string) => {
    const isAdult = localSettings.familyMembers.find(m => m.id === memberId)?.role === '大人';
    const adultCount = localSettings.familyMembers.filter(m => m.role === '大人').length;
    if (isAdult && adultCount <= 1) return Alert.alert('エラー', '大人は最低1人必要です');

    setLocalSettings(prev => prev ? { ...prev, familyMembers: prev.familyMembers.filter(m => m.id !== memberId) } : prev);
  };

  // カスタムカテゴリの追加・削除
  const handleAddCategory = (name: string) => {
    setLocalSettings(prev => prev ? { ...prev, categories: [...prev.categories, { id: `c_${Date.now()}`, name, budget: 0, isFixed: false }] } : prev);
    setCategoryModalVisible(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert('確認', 'このカテゴリを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => setLocalSettings(prev => prev ? { ...prev, categories: prev.categories.filter(c => c.id !== categoryId) } : prev) }
    ]);
  };

  const handleSaveAll = () => {
    updateSettings(localSettings);
    Alert.alert('完了', '設定を保存しました！\nダッシュボードに反映されます。');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
        <Text style={styles.sectionTitle}>👨‍👩‍👦 家族構成</Text>
        <Text style={styles.hintText}>子供を追加すると「養育費」の枠が自動で解放され、世間の目安計算が補正されます。</Text>
        <FamilyMemberList members={localSettings.familyMembers} onDelete={handleDeleteFamily} onAdd={() => setFamilyModalVisible(true)} />

        <Text style={styles.sectionTitle}>🏷️ カテゴリ一覧</Text>
        <Text style={styles.hintText}>趣味や自由費など、不要なものは「削除」できます。（※固定科目は削除不可）</Text>
        <CategoryList categories={activeCategories} onDeleteCategory={handleDeleteCategory} onAddCategory={() => setCategoryModalVisible(true)} />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveAll}>
          <Text style={styles.primaryButtonText}>設定を保存する</Text>
        </TouchableOpacity>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <CategoryAddModal visible={isCategoryModalVisible} onSave={handleAddCategory} onClose={() => setCategoryModalVisible(false)} />
      <FamilyMemberAddModal visible={isFamilyModalVisible} onSave={handleAddFamily} onClose={() => setFamilyModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginLeft: 8, marginTop: 16, marginBottom: 4 },
  hintText: { fontSize: 12, color: '#8E8E93', marginLeft: 8, marginBottom: 12, lineHeight: 18 },
  primaryButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});