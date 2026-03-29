// src/components/dashboard/HesokuriSummaryCard.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { BudgetEvaluationResult } from '../../functions/budgetUtils';
import { DEFAULT_CATEGORY_NAMES } from '../../constants';

interface HesokuriSummaryCardProps {
  currentHesokuri: number;
  totalMonthlyBudget: number;
  totalSpent: number;
  averageGuideline: number;
  evaluation: BudgetEvaluationResult;
  hasChild: boolean;
  pocketMoneyDetails: { id: string, name: string, base: number, bonus: number, total: number }[];
  onPressCard: () => void;
  onPressEditBudget: () => void;
  onPressPocketMoney: () => void; 
}

export const HesokuriSummaryCard: React.FC<HesokuriSummaryCardProps> = ({
  currentHesokuri, totalMonthlyBudget, totalSpent, averageGuideline, evaluation, hasChild, pocketMoneyDetails, onPressCard, onPressEditBudget, onPressPocketMoney
}) => {
  const isNegative = currentHesokuri < 0;
  
  // 定数から動的にカテゴリ名の文字列を組み立てる
  const baseCategories = [DEFAULT_CATEGORY_NAMES.FOOD, DEFAULT_CATEGORY_NAMES.EATING_OUT, DEFAULT_CATEGORY_NAMES.DAILY_NECESSITIES].join('、');
  const fixedCategoriesText = hasChild ? `${baseCategories}、${DEFAULT_CATEGORY_NAMES.CHILD_CARE}` : baseCategories;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.editBudgetBtnTop} onPress={onPressEditBudget}>
        <Text style={styles.editBudgetBtnText}>今月の予算を編成する</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.6} onPress={onPressCard} style={styles.topArea}>
        <Text style={styles.label}>今月の余るお金</Text>
        <Text style={[styles.amount, { color: isNegative ? '#FF3B30' : '#007AFF' }]}>
          ￥{currentHesokuri.toLocaleString()}
        </Text>
        
        <Text style={styles.spentLabel}>支出の合計</Text>
        <Text style={styles.spentAmount}>￥{totalSpent.toLocaleString()}</Text>
        <Text style={styles.hintText}>タップして全カテゴリーのカレンダーを見る ＞</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {pocketMoneyDetails.length > 0 && (
        <TouchableOpacity style={styles.pocketMoneyArea} activeOpacity={0.7} onPress={onPressPocketMoney}>
          <View style={styles.pmHeaderRow}>
            <Text style={styles.pocketMoneyTitle}>✨ 今月のお小遣い着地見込み</Text>
            <Text style={styles.pmHintText}>ルール設定 ＞</Text>
          </View>
          {pocketMoneyDetails.map(pm => (
            <View key={pm.id} style={styles.pmRow}>
              <Text style={styles.pmName}>{pm.name}</Text>
              <View style={styles.pmCalc}>
                <Text style={styles.pmBase}>基本￥{pm.base.toLocaleString()}</Text>
                <Text style={[styles.pmBonus, { color: pm.bonus >= 0 ? '#34C759' : '#FF3B30' }]}>
                  {pm.bonus >= 0 ? '+' : ''}￥{pm.bonus.toLocaleString()}
                </Text>
              </View>
              <Text style={styles.pmTotal}>￥{pm.total.toLocaleString()}</Text>
            </View>
          ))}
        </TouchableOpacity>
      )}

      <View style={styles.budgetArea}>
        <Text style={styles.budgetLabel}>今月の総予算： ￥{totalMonthlyBudget.toLocaleString()}</Text>
        <View style={[styles.evaluationContainer, { backgroundColor: evaluation.bgColor }]}>
          <View style={styles.evalHeader}>
            <Text style={[styles.evaluationTitle, { color: evaluation.color }]}>{evaluation.title}</Text>
            <Text style={[styles.guidelineCompareText, { color: evaluation.color }]}>世間の目安: ￥{averageGuideline.toLocaleString()}</Text>
          </View>
          <Text style={[styles.evaluationMessage, { color: evaluation.color }]}>{evaluation.message}</Text>
          <Text style={[styles.guidelineNote, { color: evaluation.color }]}>※固定費（{fixedCategoriesText}）から算出</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  editBudgetBtnTop: { backgroundColor: '#E5F1FF', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  editBudgetBtnText: { color: '#007AFF', fontWeight: 'bold', fontSize: 13 },
  topArea: { alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, color: '#8E8E93', fontWeight: 'bold', marginBottom: 4 },
  amount: { fontSize: 44, fontWeight: '900', marginBottom: 16, letterSpacing: -1 },
  spentLabel: { fontSize: 14, color: '#8E8E93', fontWeight: 'bold', marginBottom: 2 },
  spentAmount: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 16 },
  hintText: { fontSize: 12, color: '#007AFF', fontWeight: 'bold', paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginBottom: 20 },
  pocketMoneyArea: { backgroundColor: '#FAFAFC', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#E5E5EA' },
  pmHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pocketMoneyTitle: { fontSize: 13, fontWeight: 'bold', color: '#1C1C1E' },
  pmHintText: { fontSize: 11, color: '#007AFF', fontWeight: 'bold' },
  pmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pmName: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E', width: 60 },
  pmCalc: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16 },
  pmBase: { fontSize: 12, color: '#8E8E93', marginRight: 8 },
  pmBonus: { fontSize: 12, fontWeight: 'bold' },
  pmTotal: { fontSize: 16, fontWeight: '900', color: '#1C1C1E', width: 80, textAlign: 'right' },
  budgetArea: { marginBottom: 16 },
  budgetLabel: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 12, textAlign: 'center' },
  evaluationContainer: { padding: 16, borderRadius: 12 },
  evalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  evaluationTitle: { fontSize: 14, fontWeight: 'bold' },
  guidelineCompareText: { fontSize: 12, opacity: 0.8, fontWeight: '600' },
  evaluationMessage: { fontSize: 12, lineHeight: 18, opacity: 0.9 },
  guidelineNote: { fontSize: 10, marginTop: 8, opacity: 0.7, fontWeight: 'bold' },
});