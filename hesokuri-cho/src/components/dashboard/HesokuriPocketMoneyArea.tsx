// src/components/dashboard/HesokuriPocketMoneyArea.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useHesokuriStore } from '../../store';

interface HesokuriPocketMoneyAreaProps {
  pocketMoneyDetails: { id: string; name: string; base: number; bonus: number; total: number }[];
  onPressPocketMoney: () => void;
}

export const HesokuriPocketMoneyArea: React.FC<HesokuriPocketMoneyAreaProps> = ({ pocketMoneyDetails, onPressPocketMoney }) => {
  const { settings, monthlyBudget, expenses } = useHesokuriStore();

  if (pocketMoneyDetails.length === 0) return null;

  let currentHesokuri = 0;
  if (settings && monthlyBudget && expenses) {
    const activeCategories = settings.categories.filter(cat => cat.isFixed || cat.isCalculationTarget !== false);
    const targetCategoryIds = new Set(activeCategories.map(c => c.id));
    const totalMonthlyBudget = activeCategories.reduce((sum, cat) => sum + (monthlyBudget.budgets[cat.id] || 0), 0);
    const totalSpent = expenses.filter(exp => targetCategoryIds.has(exp.categoryId)).reduce((sum, exp) => sum + exp.amount, 0);
    currentHesokuri = totalMonthlyBudget - totalSpent;
  }

  const positiveHesokuri = currentHesokuri > 0 ? currentHesokuri : 0;
  let totalBonus = 0;
  let totalBase = 0;

  pocketMoneyDetails.forEach(pm => {
    totalBase += pm.base;
    const member = settings?.familyMembers.find(m => m.id === pm.id);
    if (member && (member as any).surplusRatio) {
      totalBonus += Math.floor(positiveHesokuri * ((member as any).surplusRatio / 100));
    }
  });

  const absoluteTotal = totalBase + totalBonus;

  return (
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
      <View style={styles.summaryFooter}>
        <Text style={styles.summaryText}>総額: ￥{absoluteTotal.toLocaleString()} (基本: ￥{totalBase.toLocaleString()} + 追加で増える金額: ￥{totalBonus.toLocaleString()})</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pocketMoneyArea: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginHorizontal: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  pmHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pocketMoneyTitle: { fontSize: 13, fontWeight: 'bold', color: '#1C1C1E' },
  pmHintText: { fontSize: 11, color: '#007AFF', fontWeight: 'bold' },
  pmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pmName: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E', width: 60 },
  pmCalc: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16 },
  pmBase: { fontSize: 12, color: '#8E8E93', marginRight: 8 },
  pmBonus: { fontSize: 12, fontWeight: 'bold' },
  pmTotal: { fontSize: 16, fontWeight: '900', color: '#1C1C1E', width: 80, textAlign: 'right' },
  summaryFooter: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E5EA', alignItems: 'flex-end' },
  summaryText: { fontSize: 12, fontWeight: 'bold', color: '#1C1C1E' },
});