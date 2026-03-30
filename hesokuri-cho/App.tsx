// App.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useHesokuriStore } from './src/store';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { InputScreen } from './src/screens/InputScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HesokuriHistoryScreen } from './src/screens/HesokuriHistoryScreen';

export default function App() {
  const { 
    settings, pendingSettings, setPendingSettings, monthlyBudget, isLoading, error, 
    fetchSettings, updateSettings, fetchExpenses, fetchMonthlyBudget, 
    expenseInput, resetExpenseInput, setReturnToCategoryDetail 
  } = useHesokuriStore();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'settings' | 'history' | 'hesokuriHistory'>('dashboard');

  useEffect(() => {
    fetchSettings();
    const currentMonth = new Date().toISOString().slice(0, 7);
    fetchExpenses(currentMonth);
    fetchMonthlyBudget(currentMonth);
  }, []);

  const executeTabChange = async (targetTab: typeof activeTab) => {
    if (activeTab === 'settings' && targetTab !== 'settings' && pendingSettings) {
      await updateSettings(pendingSettings);
      setPendingSettings(null);
    }
    if (targetTab === 'dashboard') {
      setReturnToCategoryDetail(null, null);
    }
    if (activeTab === 'input' && targetTab !== 'input') {
      resetExpenseInput();
    }
    setActiveTab(targetTab);
  };

  // forceフラグがtrueの場合は入力中の破棄確認をスキップする
  const handleTabChange = (targetTab: typeof activeTab, force = false) => {
    if (!force && activeTab === 'input' && targetTab !== 'input') {
      const isInputting = expenseInput.amount !== '0' || !!expenseInput.storeName || !!expenseInput.memo;
      if (isInputting) {
        Alert.alert(
          '入力を破棄しますか？',
          '入力中の内容は保存されません。',
          [
            { text: 'いいえ', style: 'cancel' },
            { text: 'はい', style: 'destructive', onPress: () => executeTabChange(targetTab) }
          ]
        );
        return;
      }
    }
    executeTabChange(targetTab);
  };

  if (isLoading && !settings) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;
  if (error && !settings) return <View style={styles.centerContainer}><Text style={{ color: 'red' }}>エラー: {error}</Text><TouchableOpacity onPress={fetchSettings} style={{ marginTop: 16 }}><Text style={{ color: '#007AFF', fontWeight: 'bold' }}>再試行</Text></TouchableOpacity></View>;
  if (!settings) return <View style={styles.centerContainer}><Text style={styles.welcomeTitle}>節約帖へようこそ</Text><ActivityIndicator size="small" color="#007AFF" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === 'dashboard' ? 'ダッシュボード' : activeTab === 'input' ? '支出の記録' : activeTab === 'history' ? 'ガーデン履歴' : activeTab === 'hesokuriHistory' ? 'へそくり履歴' : '設定'}
        </Text>
      </View>

      <View style={styles.contentWrapper}>
        {/* InputScreen完了時は force=true でホームへ戻る */}
        {activeTab === 'dashboard' && <DashboardScreen onNavigateToHesokuriHistory={() => handleTabChange('hesokuriHistory')} onNavigateToInput={() => handleTabChange('input')} />}
        {activeTab === 'input' && <InputScreen onComplete={() => handleTabChange('dashboard', true)} />}
        {activeTab === 'settings' && <SettingsScreen />}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'hesokuriHistory' && <HesokuriHistoryScreen onBack={() => handleTabChange('dashboard')} />}
      </View>

      {activeTab !== 'hesokuriHistory' && (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => handleTabChange('dashboard')}><Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>🏠 ホーム</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => handleTabChange('history')}><Text style={[styles.navText, activeTab === 'history' && styles.navTextActive]}>🌱 庭</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navItemMain} activeOpacity={0.8} onPress={() => handleTabChange('input')}><Text style={styles.navTextMain}>➕ 入力</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => handleTabChange('settings')}><Text style={[styles.navText, activeTab === 'settings' && styles.navTextActive]}>⚙️ 設定</Text></TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#F2F2F7' }, centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' }, contentWrapper: { flex: 1 }, 
  header: { alignItems: 'center', paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' }, headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' }, 
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 32, color: '#1C1C1E' }, 
  bottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingBottom: 30, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E5EA', justifyContent: 'space-around', alignItems: 'center' }, 
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8 }, navItemMain: { flex: 1, alignItems: 'center', backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 24, marginHorizontal: 8, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }, 
  navText: { fontSize: 10, color: '#8E8E93', marginTop: 4, fontWeight: 'bold' }, navTextActive: { color: '#007AFF' }, navTextMain: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' } 
});