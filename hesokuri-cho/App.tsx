// App.tsx
import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants'; // ▼ 変更: 実行環境判定用モジュールを追加
import Purchases from 'react-native-purchases'; // ▼ 新規追加: RevenueCat SDK
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
import { useTrackingPermission } from './src/hooks/useTrackingPermission';
import { useTheme } from './src/hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from './src/constants/colors';

export default function App() {
  const { authToken, initAuth } = useAuthStore();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isDataFetched, setIsDataFetched] = useState(false); // ▼ 新規追加: 初期データ取得完了フラグ

  // iOS14以降必須のATT許諾要求を実行
  useTrackingPermission();

  const { colors } = useTheme(); // ▼ 新規追加: 現在のテーマカラーを取得
  const styles = createStyles(colors);

  // ▼ 変更: fetchAccountInfo と fetchNationalStatistics を呼び出しに追加
  const { 
    settings, 
    accountInfo, // ▼ 新規追加: RevenueCatへのログイン用IDとして使用
    isLoading, 
    error, 
    fetchAccountInfo, 
    fetchSettings, 
    fetchExpenses, 
    fetchMonthlyBudget,
    fetchNationalStatistics // ▼ 追加: 統計データのフェッチ関数
  } = useHesokuriStore();
  
  const { activeTab, handleTabChange } = useTabNavigation();

  // ▼ 新規追加: Expo Go環境かどうかの判定フラグ（Go環境では課金モジュールをスキップする）
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  useEffect(() => {
    const initialize = async () => {
      await initAuth();
      setIsAuthChecking(false);
    };
    initialize();
  }, []);

  // ▼ 変更: アプリ起動時のRevenueCat初期化処理 (Expo Goではスキップ)
  useEffect(() => {
    const initializePurchases = () => {
      if (isExpoGo) {
        console.log('[Dev] Running in Expo Go: Skipping RevenueCat Initialization.');
        return; // Expo Go環境ではクラッシュを防ぐためスキップ
      }

      const { revenueCatApiKeyIos, revenueCatApiKeyAndroid } = Constants.expoConfig?.extra || {};
      
      if (Platform.OS === 'ios' && revenueCatApiKeyIos) {
        Purchases.configure({ apiKey: revenueCatApiKeyIos });
      } else if (Platform.OS === 'android' && revenueCatApiKeyAndroid) {
        Purchases.configure({ apiKey: revenueCatApiKeyAndroid });
      }
    };
    initializePurchases();
  }, [isExpoGo]);

  // ▼ 変更: アカウント情報取得後、RevenueCatへログインしIDを強固に紐付け (Expo Goではスキップ)
  useEffect(() => {
    const loginToRevenueCat = async () => {
      if (isExpoGo) return; // Expo Go環境ではスキップ

      if (accountInfo?.accountId) {
        try {
          await Purchases.logIn(accountInfo.accountId);
        } catch (err) {
          console.warn('RevenueCat Login Failed:', err);
        }
      }
    };
    loginToRevenueCat();
  }, [accountInfo?.accountId, isExpoGo]);

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
          fetchMonthlyBudget(currentMonth),
          fetchNationalStatistics() // ▼ 新規追加: アプリ起動時に統計データをキャッシュ
        ]);
        setIsDataFetched(true);
      } else {
        setIsDataFetched(false);
      }
    };
    fetchInitialData();
  }, [authToken]);

  if (isAuthChecking) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!authToken) return <LoginScreen />;

  // ▼ 初期データ取得が未完了、またはストアがローディング中の場合はローディング表示（Onboardingのちらつき防止）
  if (!isDataFetched || (isLoading && !settings)) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (error && !settings) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: colors.error }}>エラーが発生しました: {error}</Text>
        <TouchableOpacity onPress={fetchSettings} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ▼ 初期データの取得が完了した上で、settingsが存在しない場合はオンボーディングへ
  if (isDataFetched && !settings && !error) {
    return <OnboardingScreen onComplete={fetchSettings} />;
  }

  if (!settings) {
    return <View style={styles.centerContainer}><ActivityIndicator size="small" color={colors.primary} /></View>;
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

const createStyles = (colors: Colors) => StyleSheet.create({ 
  container: { flex: 1, backgroundColor: colors.background }, 
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }, 
  contentWrapper: { flex: 1 }, 
  header: { alignItems: 'center', paddingVertical: 14, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }, 
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }
});