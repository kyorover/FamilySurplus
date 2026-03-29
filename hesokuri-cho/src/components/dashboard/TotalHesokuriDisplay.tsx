// src/components/dashboard/TotalHesokuriDisplay.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface TotalHesokuriDisplayProps {
  currentMonthHesokuri: number;
  onPress: () => void;
}

export const TotalHesokuriDisplay: React.FC<TotalHesokuriDisplayProps> = ({ currentMonthHesokuri, onPress }) => {
  // 実際は全期間のデータをストアから計算しますが、現状はモック計算としています
  const totalAmount = currentMonthHesokuri > 0 ? currentMonthHesokuri * 5 : 120000;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.title}>節約の実績</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.currency}>￥</Text>
        <Text style={styles.amount}>{totalAmount.toLocaleString()}</Text>
      </View>
      <Text style={styles.subtitle}>タップして履歴を見る ＞</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#007AFF', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, marginTop: 8 },
  title: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', opacity: 0.9, marginBottom: 8 },
  amountContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  currency: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4, marginRight: 4 },
  amount: { color: '#FFFFFF', fontSize: 40, fontWeight: 'bold', letterSpacing: -1 },
  subtitle: { color: '#FFFFFF', fontSize: 12, opacity: 0.8, marginTop: 8 },
});