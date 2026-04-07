// App.tsx
import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useHesokuriStore } from './src/store';
import { useAuthStore } from './src/stores/authStore';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { InputScreen } from './src/screens/InputScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { GardenScreen } from './src/screens/GardenScreen';
import { HesokuriHistoryScreen } from './src/screens/HesokuriHistoryScreen';
import { LoginScreen } from './src/screens/LoginScreen';

export default function App() {
  const { authToken, initAuth } = useAuthStore();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const { 
    settings, pendingSettings, setPendingSettings, monthlyBudget, isLoading, error, 
    fetchSettings, updateSettings, fetchExpenses, fetchMonthlyBudget, 
    expenseInput, resetExpenseInput, setReturnToCategoryDetail 
  } = useHesokuriStore();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'settings' | 'history' | 'hesokuriHistory'>('dashboard');

  useEffect(() => {
    const initialize = async () => {
      await initAuth();
      setIsAuthChecking(false);
    };
    initialize();
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchSettings();
      const currentMonth = new Date().toISOString().slice(0, 7);
      fetchExpenses(currentMonth);
      fetchMonthlyBudget(currentMonth);
    }
  }, [authToken]);

  type TabNavOptions = { forceTransition?: boolean; preserveCalendarState?: boolean; };

  const executeTabChange = async (targetTab: typeof activeTab, options: TabNavOptions) => {
    if (targetTab === 'dashboard' && !options.preserveCalendarState) setReturnToCategoryDetail(null, null);
    if (activeTab === 'input' && targetTab !== 'input') resetExpenseInput();
    setActiveTab(targetTab);
  };

  const handleTabChange = (targetTab: typeof activeTab, options: TabNavOptions = {}) => {
    if (!options.forceTransition && activeTab === 'input' && targetTab !== 'input') {
      const isInputting = expenseInput.amount !== '0' || !!expenseInput.storeName || !!expenseInput.memo;
      if (isInputting) {
        Alert.alert(
          '入力を破棄しますか？', '入力中の内容は保存されません。',
          [{ text: 'いいえ', style: 'cancel' }, { text: 'はい', style: 'destructive', onPress: () => executeTabChange(targetTab, options) }]
        );
        return;
      }
    }

    if (!options.forceTransition && activeTab === 'settings' && targetTab !== 'settings') {
      const hasSettingsChanged = settings && pendingSettings && JSON.stringify(settings) !== JSON.stringify(pendingSettings);
      if (hasSettingsChanged) {
        Alert.alert(
          '未保存の変更があります', '変更内容を保存しますか？',
          [
            { text: 'キャンセル', style: 'cancel' },
            { text: '破棄する', style: 'destructive', onPress: () => { if (settings) setPendingSettings(JSON.parse(JSON.stringify(settings))); executeTabChange(targetTab, options); } },
            { text: '保存する', onPress: async () => { if (pendingSettings) await updateSettings(pendingSettings); executeTabChange(targetTab, options); } }
          ]
        );
        return;
      }
    }
    executeTabChange(targetTab, options);
  };

  if (isAuthChecking) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!authToken) return <LoginScreen />;

  if (isLoading && !settings) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;

  if (error && !settings) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: 'red' }}>エラーが発生しました: {error}</Text>
        <TouchableOpacity onPress={fetchSettings} style={{ marginTop: 16 }}><Text style={{ color: '#007AFF', fontWeight: 'bold' }}>再試行</Text></TouchableOpacity>
      </View>
    );
  }

  if (!settings) return <View style={styles.centerContainer}><Text style={styles.welcomeTitle}>節約帖へようこそ</Text><ActivityIndicator size="small" color="#007AFF" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      {activeTab === 'hesokuriHistory' && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>へそくり履歴</Text>
        </View>
      )}

      <View style={styles.contentWrapper}>
        {activeTab === 'dashboard' && <DashboardScreen onNavigateToHesokuriHistory={() => handleTabChange('hesokuriHistory')} onNavigateToInput={() => handleTabChange('input')} />}
        {activeTab === 'input' && <InputScreen onComplete={() => handleTabChange('dashboard', { forceTransition: true, preserveCalendarState: true })} />}
        {activeTab === 'settings' && <SettingsScreen />}
        {activeTab === 'history' && <GardenScreen />}
        {activeTab === 'hesokuriHistory' && <HesokuriHistoryScreen onBack={() => handleTabChange('dashboard')} />}
      </View>

      {activeTab !== 'hesokuriHistory' && (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]} onPress={() => handleTabChange('dashboard')}>
            <Text style={[styles.navIcon, activeTab === 'dashboard' && styles.navIconActive]}>🏠</Text>
            <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>ホーム</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, activeTab === 'history' && styles.navItemActive]} onPress={() => handleTabChange('history')}>
            <Text style={[styles.navIcon, activeTab === 'history' && styles.navIconActive]}>🌱</Text>
            <Text style={[styles.navText, activeTab === 'history' && styles.navTextActive]}>庭</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, activeTab === 'input' && styles.navItemActive]} activeOpacity={0.8} onPress={() => handleTabChange('input')}>
            <Text style={[styles.navIcon, activeTab === 'input' && styles.navIconActive]}>➕</Text>
            <Text style={[styles.navText, activeTab === 'input' && styles.navTextActive]}>入力</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]} onPress={() => handleTabChange('settings')}>
            <Text style={[styles.navIcon, activeTab === 'settings' && styles.navIconActive]}>⚙️</Text>
            <Text style={[styles.navText, activeTab === 'settings' && styles.navTextActive]}>設定</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#F2F2F7' }, 
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' }, 
  contentWrapper: { flex: 1 }, 
  header: { alignItems: 'center', paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' }, 
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' }, 
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 32, color: '#1C1C1E' }, 
  bottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingBottom: 24, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E5EA', justifyContent: 'space-around', alignItems: 'center' }, 
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, marginHorizontal: 4 }, 
  navItemActive: { backgroundColor: '#E5F1FF' },
  navIcon: { fontSize: 20, marginBottom: 4, opacity: 0.5 },
  navIconActive: { opacity: 1.0 },
  navText: { fontSize: 10, color: '#8E8E93', fontWeight: 'bold' }, 
  navTextActive: { color: '#007AFF' }, 
});