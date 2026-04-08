// src/screens/SettingsScreen.tsx
import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text, SafeAreaView, Alert } from 'react-native';
import { useSettingsManager } from '../hooks/useSettingsManager';
import { useAuthStore } from '../stores/authStore';
import { useHesokuriStore } from '../store'; // ▼ 追記: accountInfo 取得のためストアをインポート
import { CategoryList } from '../components/settings/CategoryList';
import { CategoryAddModal } from '../components/settings/CategoryAddModal';
import { FamilyMemberList } from '../components/settings/FamilyMemberList';
import { FamilyMemberAddModal } from '../components/settings/FamilyMemberAddModal';
import { FamilyMemberEditModal } from '../components/settings/FamilyMemberEditModal';
import { InputHistoryManagerModal } from '../components/settings/InputHistoryManagerModal';
import { GardenBuilderScreen } from '../components/garden/GardenBuilderScreen'; // ▼ リネーム反映

export const SettingsScreen: React.FC = () => {
  const { pendingSettings, setPendingSettings, activeCategories, modals, modes, actions } = useSettingsManager();
  const { logout } = useAuthStore();
  const { accountInfo } = useHesokuriStore(); // ▼ 追記: アカウント情報を取得

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'アプリからログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'ログアウト', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
          } 
        }
      ]
    );
  };

  if (modals.garden) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>お庭デバッグ検証</Text>
          <TouchableOpacity onPress={() => modals.setGarden(false)}>
            <Text style={styles.modalCloseText}>閉じる</Text>
          </TouchableOpacity>
        </View>
        <GardenBuilderScreen />
      </SafeAreaView>
    );
  }

  if (!pendingSettings) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerSideColumn} />
        <View style={styles.headerCenterColumn}>
          <Text style={styles.headerTitleText}>設定</Text>
        </View>
        <View style={styles.headerSideColumn}>
          <TouchableOpacity onPress={actions.saveAll} style={styles.headerActionBtn}>
            <Text style={styles.headerSubmitText}>保存</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} scrollEnabled={modes.scroll}>
        
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏷️ カテゴリ一覧</Text>
        </View>
        <CategoryList 
          categories={activeCategories} 
          onDeleteCategory={actions.deleteCategory} 
          onAddCategory={() => modals.setCategory(true)} 
          onUpdateList={actions.updateCategoryList}
        />

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

        {/* ▼ 追記: 管理者(isAdmin === true)の場合のみ表示する */}
        {accountInfo?.isAdmin && (
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
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👤 アカウント</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>ログアウト</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <CategoryAddModal visible={modals.category} onSave={actions.addCategory} onClose={() => modals.setCategory(false)} />
      <FamilyMemberAddModal visible={modals.familyAdd} onSave={actions.addFamily} onClose={() => modals.setFamilyAdd(false)} />
      <FamilyMemberEditModal member={modals.familyEdit} onSave={actions.updateFamily} onClose={() => modals.setFamilyEdit(null)} />
      <InputHistoryManagerModal visible={modals.history} settings={pendingSettings} onUpdate={setPendingSettings} onClose={() => modals.setHistory(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' }, 
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA', zIndex: 100 },
  headerSideColumn: { flex: 1, justifyContent: 'center' },
  headerCenterColumn: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  headerActionBtn: { paddingVertical: 4 },
  headerTitleText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  headerSubmitText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', textAlign: 'right' },
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
  logoutBtn: { backgroundColor: '#FF3B30', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16, marginHorizontal: 8 },
  logoutBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE' },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  modalCloseText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },
});