// src/screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useHesokuriStore } from '../store';

interface HistoryScreenProps {
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const { expenses, fetchExpenses, settings, isLoading } = useHesokuriStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  // 表示対象の月が変わるたびにAPIからデータを再取得する
  useEffect(() => {
    const monthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM
    fetchExpenses(monthStr);
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const getCategoryName = (id: string) => settings?.categories.find(c => c.id === id)?.name || '不明';
  const getPayerName = (id: string) => settings?.payers.find(p => p.id === id)?.name || '不明';

  return (
    <View style={styles.container}>
      {/* 画面内ヘッダー */}
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>＜ 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>支出履歴</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* 月選択カレンダーUI */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.monthBtn}>
          <Text style={styles.monthBtnText}>◀ 前月</Text>
        </TouchableOpacity>
        <Text style={styles.currentMonthText}>
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.monthBtn}>
          <Text style={styles.monthBtnText}>次月 ▶</Text>
        </TouchableOpacity>
      </View>

      {/* 履歴リスト */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
        ) : expenses.length === 0 ? (
          <Text style={styles.emptyText}>この月の記録はありません</Text>
        ) : (
          expenses.map(exp => (
            <View key={exp.id} style={styles.recordCard}>
              <View style={styles.recordLeft}>
                <Text style={styles.dateText}>{exp.date.split('-')[2]}日</Text>
                <View>
                  <Text style={styles.catName}>{getCategoryName(exp.categoryId)}</Text>
                  <Text style={styles.payerName}>{getPayerName(exp.payerId)}</Text>
                </View>
              </View>
              <Text style={styles.amountText}>￥{exp.amount.toLocaleString()}</Text>
            </View>
          ))
        )}
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
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, marginBottom: 12 },
  monthBtn: { padding: 8 },
  monthBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  currentMonthText: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  listContent: { paddingHorizontal: 16 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontSize: 14 },
  recordCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 8 },
  recordLeft: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93', marginRight: 16, width: 32 },
  catName: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginBottom: 2 },
  payerName: { fontSize: 12, color: '#8E8E93' },
  amountText: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
});