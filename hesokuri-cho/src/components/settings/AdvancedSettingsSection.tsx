// src/components/settings/AdvancedSettingsSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { AccountInfo } from '../../types';
import { DebugControlPanel } from './DebugControlPanel';
import { apiService } from '../../services/apiService';
import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../../constants/colors';
import { useHesokuriStore } from '../../store'; // ▼ 新規追加: Storeからテーマ状態を取得・更新するため

interface AdvancedSettingsSectionProps {
  modals: any; // useSettingsManagerから渡されるモーダル制御オブジェクト
  accountInfo: AccountInfo | null;
}

export const AdvancedSettingsSection: React.FC<AdvancedSettingsSectionProps> = ({ modals, accountInfo }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const { logout } = useAuthStore();
  
  // ▼ 新規追加: テーマモードの取得と更新関数
  const { themeMode, setThemeMode } = useHesokuriStore();

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

  // 退会処理（アカウント削除）
  const handleDeleteAccount = () => {
    Alert.alert(
      '退会の確認',
      '退会すると、これまでの支出データ、予算設定、お庭のデータを含むすべての情報が完全に削除され、元に戻すことはできません。本当に退会しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '退会する',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAccount();
              await logout(); // 成功したらセッションを破棄して初期画面へ
            } catch (error: any) {
              Alert.alert('エラー', '退会処理に失敗しました。しばらく経ってから再度お試しください。');
            }
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

      {/* ▼ 新規追加: テーマ切り替えUI */}
      <View style={styles.themeContainer}>
        <Text style={styles.themeLabel}>アプリのテーマ設定</Text>
        <View style={styles.themeToggleRow}>
          <TouchableOpacity
            style={[styles.themeBtn, themeMode === 'light' && styles.themeBtnActive]}
            onPress={() => setThemeMode('light')}
            activeOpacity={0.8}
          >
            <Text style={[styles.themeBtnText, themeMode === 'light' && styles.themeBtnTextActive]}>ライト</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeBtn, themeMode === 'dark' && styles.themeBtnActive]}
            onPress={() => setThemeMode('dark')}
            activeOpacity={0.8}
          >
            <Text style={[styles.themeBtnText, themeMode === 'dark' && styles.themeBtnTextActive]}>ダーク</Text>
          </TouchableOpacity>
        </View>
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

      {/* 管理者(isAdmin === true)の場合のみ表示する */}
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

      {/* タイムトラベル用デバッグパネル（コンポーネント内部で isAdmin を判定） */}
      <DebugControlPanel />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👤 アカウント</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutBtnText}>ログアウト</Text>
      </TouchableOpacity>

      {/* 退会（アカウント削除）ボタン */}
      <TouchableOpacity style={styles.deleteAccountBtn} onPress={handleDeleteAccount} activeOpacity={0.8}>
        <Text style={styles.deleteAccountBtnText}>退会する（全データを削除）</Text>
      </TouchableOpacity>
    </>
  );
};

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, marginBottom: 8, paddingHorizontal: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  
  // ▼ 新規追加: テーマ切り替え用のスタイル
  themeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  themeLabel: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary },
  themeToggleRow: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: 8, padding: 4 },
  themeBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6 },
  themeBtnActive: { backgroundColor: colors.primary },
  themeBtnText: { fontSize: 12, fontWeight: 'bold', color: colors.textSecondary },
  themeBtnTextActive: { color: '#FFFFFF' },

  historyManageCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  historyManageContent: { flexDirection: 'row', alignItems: 'center' },
  historyManageIcon: { fontSize: 24, marginRight: 16 },
  historyManageTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 2 },
  historyManageDesc: { fontSize: 10, color: colors.textSecondary },
  chevron: { fontSize: 20, color: colors.textSecondary, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: colors.error, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, marginHorizontal: 8 },
  logoutBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }, // ※エラー背景上の文字は白固定
  deleteAccountBtn: { paddingVertical: 12, alignItems: 'center', marginBottom: 24 },
  deleteAccountBtnText: { color: colors.error, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});