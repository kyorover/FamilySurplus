// src/screens/SettingsScreen.tsx
import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { useSettingsManager } from '../hooks/useSettingsManager';
import { CategoryList } from '../components/settings/CategoryList';
import { CategoryAddModal } from '../components/settings/CategoryAddModal';
import { FamilyMemberList } from '../components/settings/FamilyMemberList';
import { FamilyMemberAddModal } from '../components/settings/FamilyMemberAddModal';
import { FamilyMemberEditModal } from '../components/settings/FamilyMemberEditModal';
import { InputHistoryManagerModal } from '../components/settings/InputHistoryManagerModal';
import { GardenBuilderTest } from '../components/garden/GardenBuilderTest';

export const SettingsScreen: React.FC = () => {
  const { pendingSettings, setPendingSettings, activeCategories, modals, modes, actions, hasUnsavedChanges } = useSettingsManager();

  // テスト用画面のオーバーライド
  if (modals.garden) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>お庭デバッグ検証</Text>
          <TouchableOpacity onPress={() => modals.setGarden(false)}>
            <Text style={styles.modalCloseText}>閉じる</Text>
          </TouchableOpacity>
        </View>
        <GardenBuilderTest />
      </SafeAreaView>
    );
  }

  // 読み込み完了前は表示しない
  if (!pendingSettings) return null;

  return (
    <View style={styles.container}>
      {/* 設定画面専用ヘッダー */}
      <View style={styles.screenHeader}>
        <View style={styles.headerSpacer} />
        <Text style={styles.screenTitle}>設定</Text>
        <TouchableOpacity 
          onPress={actions.saveAll} 
          disabled={!hasUnsavedChanges}
          style={[styles.headerSaveBtn, !hasUnsavedChanges && styles.headerSaveBtnDisabled]}
        >
          <Text style={[styles.headerSaveBtnText, !hasUnsavedChanges && styles.headerSaveBtnTextDisabled]}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} scrollEnabled={modes.scroll}>
        
        {/* 家族構成セクション */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👨‍👩‍👦 家族構成と基本のお小遣い</Text>
          <TouchableOpacity onPress={() => modes.setFamilyEdit(!modes.familyEdit)} style={[styles.actionBtn, modes.familyEdit && styles.actionBtnActive]}>
            <Text style={[styles.actionBtnText, modes.familyEdit && styles.actionBtnTextActive]}>{modes.familyEdit ? '✅ 完了' : '↕️ 並び替え'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hintText}>「≡」をタップしたままスライドして並び替えます。</Text>
        <FamilyMemberList 
          members={pendingSettings.familyMembers} 
          isReorderMode={modes.familyEdit}
          onUpdate={actions.updateFamily} 
          onDelete={actions.deleteFamily} 
          onAdd={() => modals.setFamilyAdd(true)} 
          onEditClick={modals.setFamilyEdit}
          onUpdateList={actions.updateFamilyList}
          onDragStart={() => modes.setScroll(false)}
          onDragEnd={() => modes.setScroll(true)}
        />

        {/* カテゴリセクション */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏷️ カテゴリ一覧</Text>
          <TouchableOpacity onPress={() => modes.setCategoryEdit(!modes.categoryEdit)} style={[styles.actionBtn, modes.categoryEdit && styles.actionBtnActive]}>
            <Text style={[styles.actionBtnText, modes.categoryEdit && styles.actionBtnTextActive]}>{modes.categoryEdit ? '✅ 完了' : '↕️ 並び替え'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hintText}>ここでの順番がダッシュボードや入力画面にも反映されます。</Text>
        <CategoryList 
          categories={activeCategories} 
          isReorderMode={modes.categoryEdit}
          onDeleteCategory={actions.deleteCategory} 
          onAddCategory={() => modals.setCategory(true)} 
          onUpdateList={actions.updateCategoryList}
          onDragStart={() => modes.setScroll(false)}
          onDragEnd={() => modes.setScroll(true)}
        />

        {/* 詳細設定セクション */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚙️ 詳細設定</Text>
        </View>
        <TouchableOpacity style={styles.historyManageCard} onPress={() => modals.setHistory(true)} activeOpacity={0.6}>
          <View style={styles.historyManageContent}>
            <Text style={styles.historyManageIcon}>📖</Text>
            <View>
              <Text style={styles.historyManageTitle}>入力履歴マスタの管理</Text>
              <Text style={styles.historyManageDesc}>店名やコメントの入力候補を整理します</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyManageCard} onPress={() => modals.setGarden(true)} activeOpacity={0.6}>
          <View style={styles.historyManageContent}>
            <Text style={styles.historyManageIcon}>🌻</Text>
            <View>
              <Text style={styles.historyManageTitle}>お庭機能のテスト（開発用）</Text>
              <Text style={styles.historyManageDesc}>アイテムの購入・配置・描画を検証します</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 各種モーダル */}
      <CategoryAddModal visible={modals.category} onSave={actions.addCategory} onClose={() => modals.setCategory(false)} />
      <FamilyMemberAddModal visible={modals.familyAdd} onSave={actions.addFamily} onClose={() => modals.setFamilyAdd(false)} />
      <FamilyMemberEditModal member={modals.familyEdit} onSave={actions.updateFamily} onClose={() => modals.setFamilyEdit(null)} />
      <InputHistoryManagerModal visible={modals.history} settings={pendingSettings} onUpdate={setPendingSettings} onClose={() => modals.setHistory(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // 新設したヘッダースタイル
  screenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerSpacer: { width: 60 }, // タイトルを中央に配置するためのダミー
  screenTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'center', flex: 1 },
  headerSaveBtn: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#007AFF', borderRadius: 16, minWidth: 60, alignItems: 'center' },
  headerSaveBtnDisabled: { backgroundColor: '#F2F2F7' },
  headerSaveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  headerSaveBtnTextDisabled: { color: '#C7C7CC' },

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
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE' },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  modalCloseText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },
});