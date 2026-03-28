// src/components/dashboard/TotalHesokuriDisplay.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface TotalHesokuriDisplayProps {
  currentMonthHesokuri: number;
  onPress: () => void;
}

export const TotalHesokuriDisplay: React.FC<TotalHesokuriDisplayProps> = ({ currentMonthHesokuri, onPress }) => {
  // ※プロトタイプ用：本来は全期間の (総予算 - 総支出) をバックエンドAPIで集計して取得します
  const pastAccumulated = 185000;
  const total = pastAccumulated + currentMonthHesokuri;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.title}>🎉 これまで生み出したへそくり額</Text>
      <Text style={styles.amount}>￥{total.toLocaleString()}</Text>
      <Text style={styles.note}>（過去の累計 ￥{pastAccumulated.toLocaleString()} ＋ 今月分）</Text>
      <Text style={styles.description}>
        このアプリを通じてあなたがこれまでに生み出した、自由な「タネ銭」の総額です。タップして履歴を見る。
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#1C1C1E', padding: 24, borderRadius: 16, alignItems: 'center', marginTop: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  title: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 12 },
  amount: { fontSize: 36, fontWeight: '900', color: '#34C759', marginBottom: 8 },
  note: { fontSize: 12, color: '#8E8E93', marginBottom: 12 },
  description: { fontSize: 12, color: '#E5E5EA', textAlign: 'center', lineHeight: 18, opacity: 0.8 },
});