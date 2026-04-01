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

  /**
   * ============================================================================
   * [AI・開発者向け TIPS: タブ遷移とカレンダー復帰状態の競合管理について]
   * ！！警告：ここを適当に書き換えると、キャンセルボタンやタブ操作のデグレが再発します！！
   *
   * 【問題の背景】
   * カレンダーから入力画面に遷移した場合、Zustand に `returnToCategoryDetail` (復帰先ID) が保存される。
   * これが残っている状態でダッシュボードを描画すると、自動的にカレンダーが開く仕様となっている。
   *
   * 【3つのケースと厳密なフラグ制御】
   * 1. ボトムタブの「ホーム」ボタンを押した時 (通常のタブ遷移)
   * -> 意図せずカレンダーが開く「暴発バグ」を防ぐため、必ず `preserveCalendarState: false` (デフォルト) で
   * `setReturnToCategoryDetail(null, null)` を実行し、状態を完全にリセットしてからホームを出す。
   *
   * 2. カレンダー経由の入力画面で「保存」または「キャンセル」を押し、完了した時
   * -> 元のカレンダーに戻る必要があるため、`preserveCalendarState: true` を指定して遷移させる。
   * これにより状態リセット処理がバイパスされ、ダッシュボード遷移後にカレンダーが再展開される。
   *
   * 3. 入力画面(入力途中)から、ボトムタブの他画面を押した時
   * -> 入力破棄の警告ダイアログを出す必要があるため、`forceTransition: false` (デフォルト) で呼ぶ。
   * ============================================================================
   */
  type TabNavOptions = {
    forceTransition?: boolean;       // true: 入力中アラートをスキップして強制遷移する
    preserveCalendarState?: boolean; // true: カレンダーの復帰状態をリセットせずに維持する
  };

  const executeTabChange = async (targetTab: typeof activeTab, options: TabNavOptions) => {
    // 設定画面から離れる際の自動保存
    if (activeTab === 'settings' && targetTab !== 'settings' && pendingSettings) {
      await updateSettings(pendingSettings);
      setPendingSettings(null);
    }

    // ダッシュボード遷移時、カレンダー維持フラグ(preserveCalendarState)が「無い」場合のみ状態をリセットする
    if (targetTab === 'dashboard' && !options.preserveCalendarState) {
      setReturnToCategoryDetail(null, null);
    }

    // 入力画面から離れる場合は入力データを確実に破棄
    if (activeTab === 'input' && targetTab !== 'input') {
      resetExpenseInput();
    }

    setActiveTab(targetTab);
  };

  const handleTabChange = (targetTab: typeof activeTab, options: TabNavOptions = {}) => {
    // 強制遷移フラグがなく、入力画面から他のタブへ移動しようとした場合は確認ダイアログを出す
    if (!options.forceTransition && activeTab === 'input' && targetTab !== 'input') {
      const isInputting = expenseInput.amount !== '0' || !!expenseInput.storeName || !!expenseInput.memo;
      
      if (isInputting) {
        Alert.alert(
          '入力を破棄しますか？',
          '入力中の内容は保存されません。',
          [
            { text: 'いいえ', style: 'cancel' },
            { 
              text: 'はい', 
              style: 'destructive', 
              onPress: () => executeTabChange(targetTab, options) 
            }
          ]
        );
        return; // ダイアログの返答待ち
      }
    }

    // 入力途中でない、または強制遷移の場合はそのまま遷移
    executeTabChange(targetTab, options);
  };

  if (isLoading && !settings) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
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

  if (!settings) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.welcomeTitle}>節約帖へようこそ</Text>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 入力画面以外で共通ヘッダーを表示 */}
      {activeTab !== 'input' && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {activeTab === 'dashboard' ? 'ダッシュボード' : 
             activeTab === 'history' ? 'お庭' : 
             activeTab === 'hesokuriHistory' ? 'へそくり履歴' : '設定'}
          </Text>
        </View>
      )}

      <View style={styles.contentWrapper}>
        {activeTab === 'dashboard' && (
          <DashboardScreen 
            onNavigateToHesokuriHistory={() => handleTabChange('hesokuriHistory')} 
            onNavigateToInput={() => handleTabChange('input')} 
          />
        )}
        
        {/* 入力画面の完了時：強制遷移（アラート無視）かつカレンダー状態を維持（元のカレンダーへ戻る） */}
        {activeTab === 'input' && (
          <InputScreen 
            onComplete={() => handleTabChange('dashboard', { forceTransition: true, preserveCalendarState: true })} 
          />
        )}
        
        {activeTab === 'settings' && <SettingsScreen />}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'hesokuriHistory' && <HesokuriHistoryScreen onBack={() => handleTabChange('dashboard')} />}
      </View>

      {activeTab !== 'hesokuriHistory' && (
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]} 
            onPress={() => handleTabChange('dashboard')}
          >
            <Text style={[styles.navIcon, activeTab === 'dashboard' && styles.navIconActive]}>🏠</Text>
            <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>ホーム</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'history' && styles.navItemActive]} 
            onPress={() => handleTabChange('history')}
          >
            <Text style={[styles.navIcon, activeTab === 'history' && styles.navIconActive]}>🌱</Text>
            <Text style={[styles.navText, activeTab === 'history' && styles.navTextActive]}>庭</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'input' && styles.navItemActive]} 
            activeOpacity={0.8} 
            onPress={() => handleTabChange('input')}
          >
            <Text style={[styles.navIcon, activeTab === 'input' && styles.navIconActive]}>➕</Text>
            <Text style={[styles.navText, activeTab === 'input' && styles.navTextActive]}>入力</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]} 
            onPress={() => handleTabChange('settings')}
          >
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
  // ボトムナビゲーションのデザインを統一・調整
  bottomNav: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    paddingBottom: 24, 
    paddingTop: 8, 
    borderTopWidth: 1, 
    borderTopColor: '#E5E5EA', 
    justifyContent: 'space-around', 
    alignItems: 'center' 
  }, 
  navItem: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  }, 
  navItemActive: {
    backgroundColor: '#E5F1FF', // アクティブなタブの背景を薄い青色にして強調
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.5, // 非アクティブ時はアイコンを少し薄く
  },
  navIconActive: {
    opacity: 1.0, // アクティブ時はくっきり
  },
  navText: { 
    fontSize: 10, 
    color: '#8E8E93', 
    fontWeight: 'bold' 
  }, 
  navTextActive: { 
    color: '#007AFF' 
  }, 
});