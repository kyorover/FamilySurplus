// App.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useHesokuriStore } from './src/store';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { InputScreen } from './src/screens/InputScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HouseholdSettings } from './src/types';

export default function App() {
  const { settings, isLoading, error, fetchSettings, updateSettings, fetchExpenses } = useHesokuriStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'settings'>('dashboard');

  useEffect(() => {
    fetchSettings();
    const currentMonth = new Date().toISOString().slice(0, 7);
    fetchExpenses(currentMonth);
  }, []);

  if (isLoading && !settings) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16 }}>データを読み込んでいます...</Text>
      </View>
    );
  }

  if (error && !settings) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#FF3B30', marginBottom: 16, fontWeight: 'bold' }}>通信エラー</Text>
        <Text style={{ marginHorizontal: 32, textAlign: 'center', marginBottom: 24 }}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={fetchSettings}>
          <Text style={styles.primaryButtonText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 初回起動時のデータ作成画面
  if (!settings) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.welcomeTitle}>へそくり帳へようこそ！</Text>
        <Text style={styles.welcomeText}>最初の設定データを作成してアプリを開始します。</Text>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => {
            const defaultSettings: HouseholdSettings = {
              householdId: 'default-household-001',
              familyMembers: [{ id: 'm1', name: '自分', role: '大人', hasPocketMoney: false, pocketMoneyAmount: 0 }],
              categories: [
                { id: 'c1', name: '食費', budget: 50000, isFixed: true },
                { id: 'c2', name: '外食', budget: 15000, isFixed: true },
                { id: 'c3', name: '日用品', budget: 10000, isFixed: true },
                { id: 'c4', name: '養育費', budget: 0, isFixed: true },
                { id: 'c5', name: '趣味・自由費', budget: 10000, isFixed: false },
              ],
              payers: [{ id: 'p1', name: 'メイン財布' }],
              notificationsEnabled: true,
              updatedAt: new Date(),
            };
            updateSettings(defaultSettings);
          }}
        >
          <Text style={styles.primaryButtonText}>初期データを生成して開始</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === 'dashboard' ? 'へそくりダッシュボード' : activeTab === 'input' ? '支出の記録' : '家計の設定'}
        </Text>
      </View>

      <View style={styles.contentWrapper}>
        {activeTab === 'dashboard' && <DashboardScreen />}
        {activeTab === 'input' && <InputScreen onComplete={() => setActiveTab('dashboard')} />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('dashboard')}>
          <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>🏠 ホーム</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemMain} onPress={() => setActiveTab('input')}>
          <Text style={styles.navTextMain}>➕ 入力</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('settings')}>
          <Text style={[styles.navText, activeTab === 'settings' && styles.navTextActive]}>⚙️ 設定</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
  contentWrapper: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#1C1C1E' },
  welcomeText: { marginBottom: 32, textAlign: 'center', color: '#8E8E93', lineHeight: 22 },
  primaryButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingBottom: 30, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E5EA', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  navItemMain: { flex: 1, alignItems: 'center', backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 24, marginHorizontal: 16, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  navText: { fontSize: 12, color: '#8E8E93', fontWeight: '600', marginTop: 4 },
  navTextActive: { color: '#007AFF' },
  navTextMain: { fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' },
});