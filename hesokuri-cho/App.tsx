// App.tsx
import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useHesokuriStore } from './src/store';
import { useAuthStore } from './src/stores/authStore';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { InputScreen } from './src/screens/InputScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { GardenScreen } from './src/screens/GardenScreen';
import { HesokuriHistoryScreen } from './src/screens/HesokuriHistoryScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { useTabNavigation } from './src/hooks/useTabNavigation';
import { BottomTabBar } from './src/components/navigation/BottomTabBar';

export default function App() {
  const { authToken, initAuth } = useAuthStore();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isDataFetched, setIsDataFetched] = useState(false); // ▼ 新規追加: 初期データ取得完了フラグ

  // ▼ 変更: fetchAccountInfo を呼び出しに追加
  const { settings, isLoading, error, fetchAccountInfo, fetchSettings, fetchExpenses, fetchMonthlyBudget } = useHesokuriStore();
  const { activeTab, handleTabChange } = useTabNavigation();

  useEffect(() => {
    const initialize = async () => {
      await initAuth();
      setIsAuthChecking(false);
    };
    initialize();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (authToken) {
        setIsDataFetched(false);
        const currentMonth = new Date().toISOString().slice(0, 7);
        // ▼ 変更: 初期データを一括で取得し、完了するまで待機する
        await Promise.all([
          fetchAccountInfo(), // ▼ 新規追加: 起動時にアカウント情報（isAdmin等）を取得
          fetchSettings(),
          fetchExpenses(currentMonth),
          fetchMonthlyBudget(currentMonth)
        ]);
        setIsDataFetched(true);
      } else {
        setIsDataFetched(false);
      }
    };
    fetchInitialData();
  }, [authToken]);

  if (isAuthChecking) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (!authToken) return <LoginScreen />;

  // ▼ 初期データ取得が未完了、またはストアがローディング中の場合はローディング表示（Onboardingのちらつき防止）
  if (!isDataFetched || (isLoading && !settings)) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (error && !settings) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: 'red' }}>エラーが発生しました: {error}</Text>
        <TouchableOpacity onPress={fetchSettings} style={{ marginTop: 16 }}>
          <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ▼ 初期データの取得が完了した上で、settingsが存在しない場合はオンボーディングへ
  if (isDataFetched && !settings && !error) {
    return <OnboardingScreen onComplete={fetchSettings} />;
  }

  if (!settings) {
    return <View style={styles.centerContainer}><ActivityIndicator size="small" color="#007AFF" /></View>;
  }

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

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#F2F2F7' }, 
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' }, 
  contentWrapper: { flex: 1 }, 
  header: { alignItems: 'center', paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' }, 
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' }
});