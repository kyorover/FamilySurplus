import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
// Zustandのストアをインポート
import { useHesokuriStore } from './src/store';

export default function App() {
  // ==========================================
  // 1. 状態管理（Zustand）からのデータ取得
  // ==========================================
  const { 
    settings, 
    expenses, 
    isLoading, 
    error, 
    fetchSettings, 
    updateSettings 
  } = useHesokuriStore();

  // 画面遷移用のローカルステート（プロトタイプ用の簡易ルーティング）
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'settings'>('settings');

  // ==========================================
  // 2. アプリ起動時のデータ初期化
  // ==========================================
  useEffect(() => {
    // コンポーネントのマウント時にバックエンド（API）から設定データを取得
    fetchSettings();
  }, []);

  // ==========================================
  // 3. 評価・算出ロジック（UI表示用）
  // ==========================================
  const calculateAverageGuideline = (members: any[]) => {
    let total = 0;
    members.forEach(m => {
      if (m.role === '大人') total += 65000;
      if (m.role === '子供') {
        if (m.age === undefined) total += 30000;
        else if (m.age < 6) total += 25000;
        else if (m.age <= 12) total += 35000;
        else total += 50000;
      }
    });
    return Math.round(total * 1.05);
  };

  const evaluateBudget = (budget: number, guideline: number) => {
    const ratio = budget / guideline;
    if (ratio <= 0.85) {
      return { title: '堅実な貯蓄特化モデル 🚀', message: '世間平均よりかなり抑えられています！高い投資余剰金を生み出せる素晴らしい設定です。', color: '#34C759', bgColor: '#E5F9EA' };
    } else if (ratio <= 1.05) {
      return { title: '理想的な適正バランス ⚖️', message: '世間平均に近く、無理なく長期的に続けられる非常にバランスの良い理想的な設定です。', color: '#007AFF', bgColor: '#E5F1FF' };
    } else {
      return { title: 'ゆとり重視・充実モデル ☕️', message: '生活の質と家族の充実を重視したゆとりのある設定です。残った分を投資に回しましょう！', color: '#FF9500', bgColor: '#FFF4E5' };
    }
  };

  // ==========================================
  // 4. ローディング・エラー画面のハンドリング
  // ==========================================
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16 }}>データを読み込んでいます...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#FF3B30', marginBottom: 16 }}>エラーが発生しました</Text>
        <Text>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSettings}>
          <Text style={styles.retryButtonText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // APIからのデータ取得が完了する前は何も表示しない
  if (!settings) return null;

  // ==========================================
  // 5. 動的な表示制御と算出
  // ==========================================
  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  
  const activeCategories = settings.categories.filter(cat => {
    if (cat.isFixed && cat.name === '養育費') return hasChild;
    return true;
  });

  const totalMonthlyBudget = activeCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const averageGuideline = calculateAverageGuideline(settings.familyMembers);
  const evaluation = evaluateBudget(totalMonthlyBudget, averageGuideline);

  // ==========================================
  // 6. 設定変更ハンドラー（Zustandへの保存）
  // ==========================================
  const handleSaveAll = () => {
    // APIへPUTリクエストを送信し、状態を確定させる
    updateSettings(settings);
    Alert.alert('完了', '設定を保存しました。');
  };

  // 一時的なローカル更新用の関数群（本来は個別にstoreのactionを定義するか、画面内のローカルstateで管理し、保存時に一括でstoreへ送るのがベストプラクティスです）
  // 今回はラピッドプロトタイピングのため、storeの関数を直接介さず、まずは画面側で組み立てる想定としています。

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.cancelText}>閉じる</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>設定</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleSaveAll}>
          <Text style={styles.saveText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* ==========================================
            セクション1: 家計の予算と客観的評価
        ========================================== */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionTitle}>家計の予算（カテゴリ別）</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.totalBudgetRow}>
            <View>
              <Text style={styles.totalBudgetLabel}>今月の家計予算 (自動計算)</Text>
              <Text style={styles.guidelineCompareText}>世間の目安: ￥{averageGuideline.toLocaleString()}</Text>
            </View>
            <Text style={styles.totalBudgetAmount}>￥{totalMonthlyBudget.toLocaleString()}</Text>
          </View>

          <View style={[styles.evaluationContainer, { backgroundColor: evaluation.bgColor }]}>
            <Text style={[styles.evaluationTitle, { color: evaluation.color }]}>{evaluation.title}</Text>
            <Text style={[styles.evaluationMessage, { color: evaluation.color }]}>{evaluation.message}</Text>
          </View>
          
          <View style={styles.divider} />

          {activeCategories.map((cat, index) => (
            <View key={cat.id}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryNameWrap}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    {cat.name === '養育費' && (
                      <Text style={styles.categoryHintText}>(子供がいる場合のみ表示)</Text>
                    )}
                    {cat.isFixed && <Text style={styles.fixedBadge}>固定</Text>}
                  </View>
                </View>
                <View style={styles.pocketMoneyInputWrap}>
                  <Text style={styles.pocketMoneyLabel}>予算額</Text>
                  <View style={styles.inputWrap}>
                    <Text style={styles.currencyMark}>￥</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="number-pad"
                      value={String(cat.budget)}
                      editable={false} // プロトタイプ連携テスト用：一旦閲覧のみ
                    />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// スタイル定義 (前回のUIと同一内容のため主要部分のみ抜粋・維持)
const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
  retryButton: { marginTop: 16, backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerButton: { padding: 8 },
  cancelText: { fontSize: 16, color: '#007AFF' },
  saveText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  scrollContent: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginLeft: 8 },
  sectionHeaderWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 8, marginHorizontal: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  totalBudgetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF' },
  totalBudgetLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 4 },
  guidelineCompareText: { fontSize: 11, color: '#8E8E93' },
  totalBudgetAmount: { fontSize: 26, fontWeight: 'bold', color: '#1C1C1E' },
  evaluationContainer: { padding: 12, marginHorizontal: 16, marginBottom: 16, borderRadius: 10 },
  evaluationTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  evaluationMessage: { fontSize: 11, lineHeight: 16, opacity: 0.9 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#F9F9FB' },
  categoryInfo: { flex: 1, justifyContent: 'center' },
  categoryNameWrap: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 4 },
  categoryHintText: { fontSize: 11, color: '#8E8E93', marginRight: 6 },
  fixedBadge: { fontSize: 10, backgroundColor: '#007AFF', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginLeft: 16 },
  pocketMoneyInputWrap: { alignItems: 'flex-end' },
  pocketMoneyLabel: { fontSize: 11, color: '#8E8E93', marginBottom: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, minWidth: 100, borderWidth: 1, borderColor: '#E5E5EA' },
  currencyMark: { fontSize: 14, color: '#8E8E93', marginRight: 4 },
  textInput: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1C1C1E', textAlign: 'right' },
});