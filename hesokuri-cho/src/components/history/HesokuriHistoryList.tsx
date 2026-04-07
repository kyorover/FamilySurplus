// src/components/history/HesokuriHistoryList.tsx
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';

interface HesokuriHistoryListProps {
  isLoading: boolean;
  months: number[];
  historyData: Record<number, number | null>;
}

export const HesokuriHistoryList: React.FC<HesokuriHistoryListProps> = ({ isLoading, months, historyData }) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>データを取得中...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
      {months.map(month => {
        const amount = historyData[month];
        if (amount === undefined || amount === null) return null;

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
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#8E8E93', fontWeight: 'bold' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  recordCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  monthText: { fontSize: 16, fontWeight: 'bold', color: '#8E8E93' },
  amountText: { fontSize: 22, fontWeight: 'bold', color: '#34C759' },
  negativeAmount: { color: '#FF3B30' },
});