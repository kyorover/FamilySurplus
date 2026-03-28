// App.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useHesokuriStore } from './src/store';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { InputScreen } from './src/screens/InputScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HesokuriHistoryScreen } from './src/screens/HesokuriHistoryScreen';
import { HouseholdSettings } from './src/types';

export default function App() {
  const { settings, pendingSettings, setPendingSettings, monthlyBudget, isLoading, error, fetchSettings, updateSettings, fetchExpenses, fetchMonthlyBudget, expenseInput, setExpenseInput, resetExpenseInput, saveExpenseInput, setReturnToCategoryDetail } = useHesokuriStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'settings' | 'history' | 'hesokuriHistory'>('dashboard');

  useEffect(() => {
    fetchSettings();
    const currentMonth = new Date().toISOString().slice(0, 7);
    fetchExpenses(currentMonth);
    fetchMonthlyBudget(currentMonth);
  }, []);

  const handleTabChange = (targetTab: typeof activeTab) => {
    if (activeTab === 'settings' && targetTab !== 'settings') {
      const isChanged = JSON.stringify(settings) !== JSON.stringify(pendingSettings);
      if (isChanged && pendingSettings) {
        Alert.alert('未保存の変更', '設定が変更されています。保存して移動しますか？', [{ text: '破棄して移動', style: 'destructive', onPress: () => { setPendingSettings(null); setActiveTab(targetTab); } }, { text: 'キャンセル', style: 'cancel' }, { text: '保存して移動', onPress: async () => { await updateSettings(pendingSettings); setActiveTab(targetTab); } }]);
        return;
      }
    }
    if (activeTab === 'input' && targetTab !== 'input') {
      if (expenseInput.amount !== '0' || expenseInput.storeName !== '' || expenseInput.memo !== '') {
        Alert.alert('未保存の入力データ', '入力途中のデータがあります。保存して移動しますか？', [{ text: '破棄して移動', style: 'destructive', onPress: () => { resetExpenseInput(); setReturnToCategoryDetail(null); setActiveTab(targetTab); } }, { text: 'キャンセル', style: 'cancel' }, { text: '保存して移動', onPress: async () => { try { await saveExpenseInput(); setActiveTab(targetTab); } catch (e: any) { Alert.alert('エラー', e.message); } }}]);
        return;
      }
    }
    setActiveTab(targetTab);
  };

  if (isLoading && (!settings || !monthlyBudget)) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#007AFF" /><Text style={{ marginTop: 16 }}>読み込み中...</Text></View>;
  if (error && !settings) return <View style={styles.centerContainer}><Text style={{ color: '#FF3B30', marginBottom: 16, fontWeight: 'bold' }}>通信エラー</Text><Text style={{ textAlign: 'center', marginBottom: 24 }}>{error}</Text><TouchableOpacity style={styles.primaryButton} onPress={() => { fetchSettings(); fetchMonthlyBudget(new Date().toISOString().slice(0, 7)); }}><Text style={styles.primaryButtonText}>再試行</Text></TouchableOpacity></View>;
  if (!settings) return <View style={styles.centerContainer}><Text style={styles.welcomeTitle}>へそくり帳へようこそ！</Text><TouchableOpacity style={styles.primaryButton} onPress={async () => { const defaultSettings: HouseholdSettings = { householdId: 'default-household-001', familyMembers: [{ id: 'm1', name: '自分', role: '大人', hasPocketMoney: true, pocketMoneyAmount: 30000 }], categories: [{ id: 'c1', name: '食費', budget: 50000, isFixed: true }, { id: 'c2', name: '外食', budget: 15000, isFixed: true }, { id: 'c3', name: '日用品', budget: 10000, isFixed: true }, { id: 'c4', name: '養育費', budget: 0, isFixed: true }], notificationsEnabled: true, updatedAt: new Date(), }; await updateSettings(defaultSettings); await fetchMonthlyBudget(new Date().toISOString().slice(0, 7)); }}><Text style={styles.primaryButtonText}>初期データを生成して開始</Text></TouchableOpacity></View>;

  const isSubScreen = activeTab === 'history' || activeTab === 'hesokuriHistory';

  return (
    <SafeAreaView style={styles.container}>
      {!isSubScreen && <View style={styles.header}><Text style={styles.headerTitle}>{activeTab === 'dashboard' ? 'へそくりダッシュボード' : activeTab === 'input' ? '支出の記録' : '家計の設定'}</Text></View>}
      <View style={styles.contentWrapper}>
        {activeTab === 'dashboard' && <DashboardScreen onNavigateToHesokuriHistory={() => handleTabChange('hesokuriHistory')} onNavigateToInput={() => setActiveTab('input')} />}
        {activeTab === 'input' && <InputScreen onComplete={() => setActiveTab('dashboard')} />}
        {activeTab === 'settings' && <SettingsScreen />}
        {activeTab === 'history' && <HistoryScreen onBack={() => handleTabChange('dashboard')} />}
        {activeTab === 'hesokuriHistory' && <HesokuriHistoryScreen onBack={() => handleTabChange('dashboard')} currentMonthHesokuri={20000} />}
      </View>
      {!isSubScreen && (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => handleTabChange('dashboard')}><Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>🏠 ホーム</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navItemMain} onPress={() => { setExpenseInput({ isLocked: false }); setReturnToCategoryDetail(null); handleTabChange('input'); }}><Text style={styles.navTextMain}>➕ 入力</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => handleTabChange('settings')}><Text style={[styles.navText, activeTab === 'settings' && styles.navTextActive]}>⚙️ 設定</Text></TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F2F2F7' }, centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' }, contentWrapper: { flex: 1 }, header: { alignItems: 'center', paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' }, headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' }, welcomeTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 32, color: '#1C1C1E' }, primaryButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8 }, primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }, bottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingBottom: 30, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E5EA', justifyContent: 'space-around', alignItems: 'center' }, navItem: { flex: 1, alignItems: 'center', paddingVertical: 8 }, navItemMain: { flex: 1, alignItems: 'center', backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 24, marginHorizontal: 16 }, navText: { fontSize: 12, color: '#8E8E93', fontWeight: '600', marginTop: 4 }, navTextActive: { color: '#007AFF' }, navTextMain: { fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' } });