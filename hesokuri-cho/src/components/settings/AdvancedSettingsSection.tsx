// src/components/settings/AdvancedSettingsSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { AccountInfo } from '../../types';
import { DebugControlPanel } from './DebugControlPanel';

interface AdvancedSettingsSectionProps {
  modals: any; // useSettingsManagerから渡されるモーダル制御オブジェクト
  accountInfo: AccountInfo | null;
}

export const AdvancedSettingsSection: React.FC<AdvancedSettingsSectionProps> = ({ modals, accountInfo }) => {
  const { logout } = useAuthStore();

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

  return (
    <>
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

      {/* ▼ 新規追加: タイムトラベル用デバッグパネル（コンポーネント内部で isAdmin を判定） */}
      <DebugControlPanel />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👤 アカウント</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutBtnText}>ログアウト</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, marginBottom: 8, paddingHorizontal: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  historyManageCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  historyManageContent: { flexDirection: 'row', alignItems: 'center' },
  historyManageIcon: { fontSize: 24, marginRight: 16 },
  historyManageTitle: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 2 },
  historyManageDesc: { fontSize: 10, color: '#8E8E93' },
  chevron: { fontSize: 20, color: '#C7C7CC', fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#FF3B30', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16, marginHorizontal: 8 },
  logoutBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});