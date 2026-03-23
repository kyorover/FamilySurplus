import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Switch, Alert } from 'react-native';

// ==========================================
// 1. ダミーデータ（スキーマ要件を反映）
// ==========================================
const initialSettings = {
  familyMembers: [
    { id: 'm1', name: '夫', role: '大人', age: 35, hasPocketMoney: true, pocketMoneyAmount: 30000 },
    { id: 'm2', name: '妻', role: '大人', age: 33, hasPocketMoney: true, pocketMoneyAmount: 30000 },
    { id: 'm3', name: '長男', role: '子供', age: 5, hasPocketMoney: false, pocketMoneyAmount: 0 },
  ],
  categories: [
    // isFixed: true（固定科目＝統計データと紐づく、削除不可）
    { id: 'c1', name: '食費', budget: 60000, isFixed: true },
    { id: 'c2', name: '外食', budget: 15000, isFixed: true },
    { id: 'c3', name: '日用品', budget: 15000, isFixed: true },
    { id: 'c4', name: '養育費', budget: 30000, isFixed: true },
    // isFixed: false（カスタム科目＝ユーザーが任意に増減可能）
    { id: 'c5', name: '趣味', budget: 10000, isFixed: false },
  ],
  payers: ['夫の財布', '妻の財布', '共通口座'],
  notificationsEnabled: true,
};

// ==========================================
// 2. 評価・算出ロジック
// ==========================================
const calculateAverageGuideline = (members) => {
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
  return Math.round(total * 1.05); // CPI補正想定
};

const evaluateBudget = (budget, guideline) => {
  const ratio = budget / guideline;
  if (ratio <= 0.85) {
    return {
      title: '堅実な貯蓄特化モデル 🚀',
      message: '世間平均よりかなり抑えられています！高い投資余剰金を生み出せる素晴らしい設定です。',
      color: '#34C759',
      bgColor: '#E5F9EA',
    };
  } else if (ratio <= 1.05) {
    return {
      title: '理想的な適正バランス ⚖️',
      message: '世間平均に近く、無理なく長期的に続けられる非常にバランスの良い理想的な設定です。',
      color: '#007AFF',
      bgColor: '#E5F1FF',
    };
  } else {
    return {
      title: 'ゆとり重視・充実モデル ☕️',
      message: '生活の質と家族の充実を重視したゆとりのある設定です。残った分を投資に回しましょう！',
      color: '#FF9500',
      bgColor: '#FFF4E5',
    };
  }
};

// ==========================================
// 3. マスタ設定画面メインコンポーネント
// ==========================================
export default function App() {
  const [settings, setSettings] = useState(initialSettings);

  // --- 動的な表示制御（子供がいるか判定） ---
  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  
  // --- 有効なカテゴリのみを抽出 ---
  const activeCategories = settings.categories.filter(cat => {
    // 養育費は、子供がいない場合は非表示・計算対象外とする
    if (cat.isFixed && cat.name === '養育費') {
      return hasChild;
    }
    return true;
  });

  // 自動計算: 有効なカテゴリ予算の合計
  const totalMonthlyBudget = activeCategories.reduce((sum, cat) => sum + cat.budget, 0);
  // 自動計算: 世間の目安
  const averageGuideline = calculateAverageGuideline(settings.familyMembers);
  // 評価結果の取得
  const evaluation = evaluateBudget(totalMonthlyBudget, averageGuideline);

  // --- ハンドラー群 ---
  const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const updateMemberPocketMoney = (id, amountStr) => {
    const numValue = Number(amountStr.replace(/[^0-9]/g, ''));
    setSettings(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member => 
        member.id === id ? { ...member, pocketMoneyAmount: numValue } : member
      )
    }));
  };

  const updateCategoryBudget = (id, amountStr) => {
    const numValue = Number(amountStr.replace(/[^0-9]/g, ''));
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === id ? { ...cat, budget: numValue } : cat
      )
    }));
  };

  const removeMember = (id, name) => {
    Alert.alert('確認', `'${name}' を家族から削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => {
          setSettings(prev => ({ 
            ...prev, 
            familyMembers: prev.familyMembers.filter(m => m.id !== id) 
          }));
        }
      }
    ]);
  };

  const removeCategory = (id, name) => {
    Alert.alert('確認', `'${name}' を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => {
          setSettings(prev => ({ 
            ...prev, 
            categories: prev.categories.filter(c => c.id !== id) 
          }));
        }
      }
    ]);
  };

  const removePayer = (payerToRemove) => {
    Alert.alert('確認', `'${payerToRemove}' を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => {
          setSettings(prev => ({ ...prev, payers: prev.payers.filter(p => p !== payerToRemove) }));
        }
      }
    ]);
  };

  const handleSaveAll = () => {
    alert('設定を保存しました。');
  };

  return (
    <SafeAreaView style={styles.container}>
      
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
          <TouchableOpacity onPress={() => alert('カテゴリ追加画面へ遷移')}>
            <Text style={styles.sectionAddText}>＋ カスタム科目追加</Text>
          </TouchableOpacity>
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

          {/* アクティブなカテゴリのみを描画 */}
          {activeCategories.map((cat, index) => (
            <View key={cat.id}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.categoryRow}>
                
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryNameWrap}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    {/* 養育費の場合のみ補足コメントを表示 */}
                    {cat.name === '養育費' && (
                      <Text style={styles.categoryHintText}>(子供がいる場合のみ表示)</Text>
                    )}
                    {cat.isFixed && <Text style={styles.fixedBadge}>固定</Text>}
                  </View>
                  {!cat.isFixed && (
                    <TouchableOpacity onPress={() => removeCategory(cat.id, cat.name)}>
                      <Text style={styles.removeMemberText}>削除</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.pocketMoneyInputWrap}>
                  <Text style={styles.pocketMoneyLabel}>予算額</Text>
                  <View style={styles.inputWrap}>
                    <Text style={styles.currencyMark}>￥</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="number-pad"
                      value={String(cat.budget)}
                      onChangeText={(text) => updateCategoryBudget(cat.id, text)}
                    />
                  </View>
                </View>

              </View>
            </View>
          ))}
        </View>

        {/* ==========================================
            セクション2: 家族メンバーと小遣い設定
        ========================================== */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionTitle}>家族メンバーと小遣い設定</Text>
          <TouchableOpacity onPress={() => alert('家族追加画面へ遷移')}>
            <Text style={styles.sectionAddText}>＋ 家族を追加</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionHint}>
          ※家族の人数と年齢（任意）から、世間の適正な生活費目安が計算されます。
        </Text>

        <View style={styles.card}>
          {settings.familyMembers.map((member, index) => (
            <View key={member.id}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.memberRow}>
                
                <View style={styles.memberInfo}>
                  <View style={styles.memberNameWrap}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRoleBadge}>{member.role}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.memberAgeText}>
                      {member.age !== undefined ? `${member.age}歳` : '年齢未設定'}
                    </Text>
                    <TouchableOpacity onPress={() => removeMember(member.id, member.name)}>
                      <Text style={[styles.removeMemberText, { marginLeft: 12 }]}>削除</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {member.hasPocketMoney ? (
                  <View style={styles.pocketMoneyInputWrap}>
                    <Text style={styles.pocketMoneyLabel}>小遣い</Text>
                    <View style={styles.inputWrap}>
                      <Text style={styles.currencyMark}>￥</Text>
                      <TextInput
                        style={styles.textInput}
                        keyboardType="number-pad"
                        value={String(member.pocketMoneyAmount)}
                        onChangeText={(text) => updateMemberPocketMoney(member.id, text)}
                      />
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.addPocketMoneyBtn}
                    onPress={() => {
                      setSettings(prev => ({
                        ...prev,
                        familyMembers: prev.familyMembers.map(m => 
                          m.id === member.id ? { ...m, hasPocketMoney: true } : m
                        )
                      }));
                    }}
                  >
                    <Text style={styles.addPocketMoneyText}>＋小遣いを設定</Text>
                  </TouchableOpacity>
                )}

              </View>
            </View>
          ))}
        </View>

        {/* ==========================================
            セクション3: 支払者（財布）のカスタマイズ
        ========================================== */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionTitle}>支払者 (財布の種類)</Text>
          <TouchableOpacity onPress={() => alert('支払者追加画面へ遷移')}>
            <Text style={styles.sectionAddText}>＋ 追加</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <View style={styles.chipSection}>
            <View style={styles.chipContainer}>
              {settings.payers.map(payer => (
                <View key={payer} style={styles.chip}>
                  <Text style={styles.chipText}>{payer}</Text>
                  <TouchableOpacity onPress={() => removePayer(payer)} style={styles.deleteIconBtn}>
                    <Text style={styles.deleteIconText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ==========================================
            セクション4: アプリ設定
        ========================================== */}
        <Text style={styles.sectionTitle}>アプリ設定</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.rowLabel}>入力忘れ防止通知</Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(val) => updateSetting('notificationsEnabled', val)}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow} onPress={() => alert('e-Statデータ最終更新: 2026/03/01\n現在のCPI: 106.5')}>
            <Text style={styles.rowLabel}>世間目安データの更新状況</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.dangerButton} onPress={() => alert('ログアウトしますか？')}>
          <Text style={styles.dangerButtonText}>ログアウト</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// 4. スタイル定義
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerButton: { padding: 8 },
  cancelText: { fontSize: 16, color: '#007AFF' },
  saveText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  scrollContent: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginLeft: 8 },
  sectionHeaderWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 8, marginHorizontal: 8 },
  sectionAddText: { fontSize: 14, color: '#007AFF', fontWeight: '600', marginBottom: 2 },
  sectionHint: { fontSize: 11, color: '#8E8E93', marginLeft: 8, marginBottom: 8, marginRight: 8, lineHeight: 16 },
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
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  memberInfo: { flex: 1 },
  memberNameWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  memberName: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 8 },
  memberRoleBadge: { fontSize: 10, backgroundColor: '#E5E5EA', color: '#8E8E93', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  memberAgeText: { fontSize: 12, color: '#8E8E93' },
  removeMemberText: { fontSize: 12, color: '#FF3B30' },
  pocketMoneyInputWrap: { alignItems: 'flex-end' },
  pocketMoneyLabel: { fontSize: 11, color: '#8E8E93', marginBottom: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, minWidth: 100, borderWidth: 1, borderColor: '#E5E5EA' },
  currencyMark: { fontSize: 14, color: '#8E8E93', marginRight: 4 },
  textInput: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1C1C1E', textAlign: 'right' },
  addPocketMoneyBtn: { backgroundColor: '#F2F2F7', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  addPocketMoneyText: { fontSize: 12, color: '#007AFF', fontWeight: '500' },
  chipSection: { paddingVertical: 16, paddingHorizontal: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5E5EA', borderRadius: 16, paddingVertical: 6, paddingLeft: 12, paddingRight: 6, marginRight: 8, marginBottom: 8 },
  chipText: { fontSize: 14, color: '#1C1C1E', marginRight: 6 },
  deleteIconBtn: { backgroundColor: '#C7C7CC', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  deleteIconText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', lineHeight: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  rowLabel: { fontSize: 16, color: '#1C1C1E' },
  arrowIcon: { fontSize: 20, color: '#C7C7CC' },
  dangerButton: { marginTop: 24, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  dangerButtonText: { fontSize: 16, fontWeight: '600', color: '#FF3B30' },
});