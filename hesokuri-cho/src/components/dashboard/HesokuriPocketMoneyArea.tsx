// src/components/dashboard/HesokuriPocketMoneyArea.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface HesokuriPocketMoneyAreaProps {
  currentHesokuri?: number; // 未設定時の余剰金表示用
  pocketMoneyDetails: { id: string; name: string; base: number; bonus: number; total: number }[];
  onPressPocketMoney: () => void;
}

export const HesokuriPocketMoneyArea: React.FC<HesokuriPocketMoneyAreaProps> = ({ currentHesokuri = 0, pocketMoneyDetails, onPressPocketMoney }) => {
  
  // 小遣い制対象者がいない場合（未設定時）のフォールバックUI
  if (pocketMoneyDetails.length === 0) {
    return (
      <TouchableOpacity style={styles.pocketMoneyArea} activeOpacity={0.7} onPress={onPressPocketMoney}>
        <View style={styles.pmHeaderRow}>
          <Text style={styles.pocketMoneyTitle}>✨ 今月のへそくり見込み</Text>
          <Text style={styles.pmHintText}>お小遣いルール設定 ＞</Text>
        </View>
        <View style={styles.noPocketMoneyContainer}>
          <Text style={styles.noPocketMoneyLabel}>現在の余剰金</Text>
          <Text style={[styles.noPocketMoneyValue, currentHesokuri < 0 && styles.negativeValue]}>
            ￥{currentHesokuri.toLocaleString()}
          </Text>
        </View>
        <Text style={styles.noPocketMoneyDesc}>
          お小遣い制を設定すると、余剰金を家族のボーナスとして配分できます。
        </Text>
      </TouchableOpacity>
    );
  }

  const totalBase = pocketMoneyDetails.reduce((sum, pm) => sum + pm.base, 0);
  const totalBonus = pocketMoneyDetails.reduce((sum, pm) => sum + pm.bonus, 0);
  const absoluteTotal = totalBase + totalBonus;

  return (
    <TouchableOpacity style={styles.pocketMoneyArea} activeOpacity={0.7} onPress={onPressPocketMoney}>
      <View style={styles.pmHeaderRow}>
        <Text style={styles.pocketMoneyTitle}>✨ 今月のお小遣い着地見込み</Text>
        <Text style={styles.pmHintText}>ルール設定 ＞</Text>
      </View>
      {pocketMoneyDetails.map(pm => (
        <View key={pm.id} style={styles.pmRow}>
          <Text style={styles.pmName} numberOfLines={1}>{pm.name}</Text>
          <View style={styles.pmCalc}>
            {/* 【修正】基本小遣いが0円であっても非表示にせず、常に明示的に表示する */}
            <Text style={styles.pmBase}>基本￥{pm.base.toLocaleString()}</Text>
            <Text style={styles.pmPlus}>＋</Text>
            <Text style={styles.pmBonus}>ボーナス￥{pm.bonus.toLocaleString()}</Text>
          </View>
          <Text style={styles.pmTotal}>￥{pm.total.toLocaleString()}</Text>
        </View>
      ))}
      <View style={styles.summaryFooter}>
        <Text style={styles.summaryText}>総額: ￥{absoluteTotal.toLocaleString()} (基本: ￥{totalBase.toLocaleString()} + ボーナス: ￥{totalBonus.toLocaleString()})</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pocketMoneyArea: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, marginBottom: 16, padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  pmHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pocketMoneyTitle: { fontSize: 13, fontWeight: 'bold', color: '#1C1C1E' },
  pmHintText: { fontSize: 11, color: '#007AFF', fontWeight: 'bold' },
  pmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pmName: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E', width: 60 },
  pmCalc: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16 },
  pmBase: { fontSize: 12, color: '#8E8E93' },
  pmPlus: { fontSize: 12, color: '#8E8E93', marginHorizontal: 4 },
  pmBonus: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
  pmTotal: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E', width: 60, textAlign: 'right' },
  summaryFooter: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E5EA', alignItems: 'flex-end' },
  summaryText: { fontSize: 11, color: '#8E8E93' },
  noPocketMoneyContainer: { alignItems: 'center', marginVertical: 16 },
  noPocketMoneyLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  noPocketMoneyValue: { fontSize: 32, fontWeight: 'bold', color: '#34C759' },
  negativeValue: { color: '#FF3B30' },
  noPocketMoneyDesc: { fontSize: 12, color: '#8E8E93', textAlign: 'center', lineHeight: 18 },
});