import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

// ==========================================
// 1. ダミーデータ
// ==========================================
const dummyData = {
  monthlyBudget: 160000, // 当月予算の設定額
  guideline: {
    familyType: '夫婦＋子1人',
    recommendedTotal: 180000, 
  },
  budgets: [
    { category: '食費', budgetAmount: 60000, spentAmount: 45000 },
    { category: '外食', budgetAmount: 15000, spentAmount: 12000 },
    { category: '日用品', budgetAmount: 15000, spentAmount: 8000 },
    { category: '養育費', budgetAmount: 30000, spentAmount: 25000 },
  ],
  pocketMoney: {
    husband: { baseAmount: 30000, spentAmount: 10000 },
    wife: { baseAmount: 30000, spentAmount: 15000 },
  }
};

// ==========================================
// 2. マイクロ・コンポーネント群
// ==========================================

// 2.1. ゆとり資金（最終的な余剰金）インジケーター
const SurplusIndicator = ({ totalSurplus, guideline }) => (
  <View style={styles.surplusCard}>
    <Text style={styles.guidelineText}>
      世間の平均目安 ({guideline.familyType} / 最新の物価を反映): ￥{guideline.recommendedTotal.toLocaleString()}
    </Text>
    <Text style={styles.surplusLabel}>残るお金 (貯蓄・投資)</Text>
    <Text style={styles.surplusAmount}>￥{totalSurplus.toLocaleString()}</Text>
    
    <View style={styles.aiGraphicPlaceholder}>
      <Text style={styles.aiGraphicText}>【AI評価グラフィック領域】</Text>
      <Text style={styles.aiGraphicSubText}>ステータス: 優秀（家計黒字化で小遣いUP！）</Text>
    </View>
  </View>
);

// 2.2. 家計簿（各科目）の残額プログレスバー
const BudgetItem = ({ item }) => {
  const remaining = item.budgetAmount - item.spentAmount;
  const progressRatio = Math.min((item.spentAmount / item.budgetAmount) * 100, 100);
  const isDanger = progressRatio > 90;

  return (
    <View style={styles.budgetItemContainer}>
      <View style={styles.budgetHeader}>
        <View style={styles.categoryTitleGroup}>
          <Text style={styles.categoryName}>{item.category}</Text>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.detailLinkText}>内訳</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.amountWrap}>
          <Text style={styles.spentText}>支出: ￥{item.spentAmount.toLocaleString()}</Text>
          <Text style={styles.remainingText}>
            残 <Text style={[styles.remainingAmount, isDanger && styles.dangerText]}>
              ￥{remaining.toLocaleString()}
            </Text>
          </Text>
        </View>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressRatio}%`, backgroundColor: isDanger ? '#FF3B30' : '#34C759' }]} />
      </View>
    </View>
  );
};

// 2.3. 小遣い連動計算＆表示セクション
const PocketMoneySection = ({ pocketMoney, householdSurplus, allocation, setAllocation }) => {
  let husbandAdj = 0;
  let wifeAdj = 0;
  if (allocation === 'husband') husbandAdj = householdSurplus;
  else if (allocation === 'wife') wifeAdj = householdSurplus;
  else if (allocation === 'half') {
    husbandAdj = householdSurplus / 2;
    wifeAdj = householdSurplus / 2;
  }

  const husbandRemaining = pocketMoney.husband.baseAmount + husbandAdj - pocketMoney.husband.spentAmount;
  const wifeRemaining = pocketMoney.wife.baseAmount + wifeAdj - pocketMoney.wife.spentAmount;

  return (
    <View style={styles.pocketMoneyContainer}>
      <View style={styles.pocketMoneyHeader}>
        <Text style={styles.sectionTitle}>夫婦の小遣い</Text>
        <Text style={[styles.householdSurplusText, householdSurplus < 0 && styles.dangerText]}>
          家計の収支: {householdSurplus >= 0 ? '+' : ''}￥{householdSurplus.toLocaleString()}
        </Text>
      </View>

      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>収支の配分先:</Text>
        <View style={styles.selectorButtons}>
          {['husband', 'half', 'wife'].map((type) => (
            <TouchableOpacity 
              key={type} 
              style={[styles.selectorBtn, allocation === type && styles.selectorBtnActive]}
              onPress={() => setAllocation(type)}
            >
              <Text style={[styles.selectorBtnText, allocation === type && styles.selectorBtnTextActive]}>
                {type === 'husband' ? '夫のみ' : type === 'wife' ? '妻のみ' : '折半'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.personCard}>
        <Text style={styles.personName}>夫</Text>
        <View style={styles.personCalc}>
          <Text style={styles.calcDetailText}>基本 ￥{pocketMoney.husband.baseAmount.toLocaleString()} {husbandAdj >= 0 ? '+' : '-'} 家計反映 ￥{Math.abs(husbandAdj).toLocaleString()}</Text>
          <Text style={styles.calcDetailText}>支出済: ￥{pocketMoney.husband.spentAmount.toLocaleString()}</Text>
        </View>
        <Text style={styles.personRemaining}>残 ￥{husbandRemaining.toLocaleString()}</Text>
      </View>

      <View style={styles.personCard}>
        <Text style={styles.personName}>妻</Text>
        <View style={styles.personCalc}>
          <Text style={styles.calcDetailText}>基本 ￥{pocketMoney.wife.baseAmount.toLocaleString()} {wifeAdj >= 0 ? '+' : '-'} 家計反映 ￥{Math.abs(wifeAdj).toLocaleString()}</Text>
          <Text style={styles.calcDetailText}>支出済: ￥{pocketMoney.wife.spentAmount.toLocaleString()}</Text>
        </View>
        <Text style={styles.personRemaining}>残 ￥{wifeRemaining.toLocaleString()}</Text>
      </View>
    </View>
  );
};

// ==========================================
// 3. メイン画面（ダッシュボード）組み立て
// ==========================================
export default function App() {
  const [data] = useState(dummyData);
  const [allocation, setAllocation] = useState('half'); 

  const householdTotalBudget = data.budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const householdTotalSpent = data.budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const householdSurplus = householdTotalBudget - householdTotalSpent;

  let husbandAdj = allocation === 'husband' ? householdSurplus : (allocation === 'half' ? householdSurplus / 2 : 0);
  let wifeAdj = allocation === 'wife' ? householdSurplus : (allocation === 'half' ? householdSurplus / 2 : 0);
  const husbandRemaining = data.pocketMoney.husband.baseAmount + husbandAdj - data.pocketMoney.husband.spentAmount;
  const wifeRemaining = data.pocketMoney.wife.baseAmount + wifeAdj - data.pocketMoney.wife.spentAmount;
  const finalTotalSurplus = husbandRemaining + wifeRemaining;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.logoText}>ぺあマネ</Text>
        </View>

        {/* 最終的なゆとりインジケーター */}
        <SurplusIndicator totalSurplus={finalTotalSurplus} guideline={data.guideline} />

        {/* 小遣い連動セクション */}
        <PocketMoneySection 
          pocketMoney={data.pocketMoney} 
          householdSurplus={householdSurplus} 
          allocation={allocation} 
          setAllocation={setAllocation} 
        />

        {/* 家計簿 残額リスト */}
        <View style={styles.budgetListContainer}>
          {/* タイトルと予算額を横並びにするヘッダー */}
          <View style={styles.budgetListHeader}>
            <Text style={styles.sectionTitle}>家計の予算</Text>
            {/* 予算額をタイトル右側に表示（文言調整） */}
            <View style={styles.headerBudgetAmountWrap}>
              <Text style={styles.headerBudgetLabel}>今月の総額</Text>
              <Text style={styles.headerBudgetAmount}>￥{data.monthlyBudget.toLocaleString()}</Text>
            </View>
          </View>

          {data.budgets.map((budget, index) => (
            <BudgetItem key={index} item={budget} />
          ))}
        </View>

        {/* 下部の余白 */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* フローティングアクションボタン（入力） */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>＋ 支出を入力</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ==========================================
// 4. スタイル定義
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#007AFF',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  surplusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
    alignItems: 'center',
  },
  guidelineText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
  },
  surplusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  surplusAmount: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  aiGraphicPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#E5F1FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCE4FF',
    borderStyle: 'dashed',
  },
  aiGraphicText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  aiGraphicSubText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  budgetListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  budgetListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerBudgetAmountWrap: {
    alignItems: 'flex-end',
  },
  headerBudgetLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  headerBudgetAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  budgetItemContainer: {
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  categoryTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 12,
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  spentText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  remainingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  remainingAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  dangerText: {
    color: '#FF3B30',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  pocketMoneyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  pocketMoneyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  householdSurplusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F2F2F7',
    padding: 4,
    borderRadius: 8,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
    marginRight: 8,
  },
  selectorButtons: {
    flex: 1,
    flexDirection: 'row',
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectorBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectorBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  selectorBtnTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  personCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    width: 30,
  },
  personCalc: {
    flex: 1,
    paddingHorizontal: 8,
  },
  calcDetailText: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  personRemaining: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});