// src/components/dashboard/HesokuriPocketMoneyArea.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface HesokuriPocketMoneyAreaProps {
  pocketMoneyDetails: { id: string; name: string; base: number; bonus: number; total: number }[];
  onPressPocketMoney: () => void;
}

export const HesokuriPocketMoneyArea: React.FC<HesokuriPocketMoneyAreaProps> = ({ pocketMoneyDetails, onPressPocketMoney }) => {
  if (pocketMoneyDetails.length === 0) return null;

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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});