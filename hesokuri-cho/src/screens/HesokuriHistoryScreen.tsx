// src/screens/HesokuriHistoryScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface HesokuriHistoryScreenProps {
  onBack: () => void;
  currentMonthHesokuri: number;
}

export const HesokuriHistoryScreen: React.FC<HesokuriHistoryScreenProps> = ({ onBack, currentMonthHesokuri }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const currentMonth = new Date().getMonth() + 1;
  const isCurrentYear = selectedYear === new Date().getFullYear();

  // プロトタイプ用ダミーデータ（バックエンド実装後に動的データへ差し替え）
  const getDummyHesokuri = (month: number) => {
    if (isCurrentYear && month === currentMonth) return currentMonthHesokuri;
    if (isCurrentYear && month > currentMonth) return null; // 未来の月
    return Math.floor(Math.random() * 20000) + 15000; // 過去の月は1.5万〜3.5万のダミー
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1).reverse();

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backBtnText}>＜ 戻る</Text></TouchableOpacity>
        <Text style={styles.subHeaderTitle}>へそくり創出履歴</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.yearSelector}>
        <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)} style={styles.yearBtn}><Text style={styles.yearBtnText}>◀ 前年</Text></TouchableOpacity>
        <Text style={styles.currentYearText}>{selectedYear}年</Text>
        <TouchableOpacity onPress={() => setSelectedYear(y => y + 1)} style={styles.yearBtn} disabled={isCurrentYear}>
          <Text style={[styles.yearBtnText, isCurrentYear && styles.disabledText]}>次年 ▶</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {months.map(month => {
          const amount = getDummyHesokuri(month);
          if (amount === null) return null;

          return (
            <View key={month} style={styles.recordCard}>
              <Text style={styles.monthText}>{month}月</Text>
              <Text style={[styles.amountText, amount < 0 && styles.negativeAmount]}>
                {amount >= 0 ? '+' : ''}￥{amount.toLocaleString()}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  backBtn: { width: 50 },
  backBtnText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  subHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  yearSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, marginBottom: 12 },
  yearBtn: { padding: 8 },
  yearBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  disabledText: { color: '#C7C7CC' },
  currentYearText: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  recordCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  monthText: { fontSize: 16, fontWeight: 'bold', color: '#8E8E93' },
  amountText: { fontSize: 22, fontWeight: 'bold', color: '#34C759' },
  negativeAmount: { color: '#FF3B30' },
});