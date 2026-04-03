// src/screens/HesokuriHistoryScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useHesokuriStore } from '../store';
import { DEFAULT_CATEGORY_NAMES } from '../constants';

interface HesokuriHistoryScreenProps {
  onBack: () => void;
}

export const HesokuriHistoryScreen: React.FC<HesokuriHistoryScreenProps> = ({ onBack }) => {
  const { settings, fetchHistoryData } = useHesokuriStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [historyData, setHistoryData] = useState<Record<number, number | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const isCurrentYear = selectedYear === currentYear;

  // 計算対象カテゴリのIDセットを抽出（DashboardScreenと同一ロジック）
  const targetCategoryIds = useMemo(() => {
    if (!settings) return new Set<string>();
    const hasChild = settings.familyMembers.some(m => m.role === '子供');
    const activeCategories = settings.categories.filter(cat => 
      cat.isFixed && cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE ? hasChild : true
    );
    const targetCats = activeCategories.filter(cat => cat.isFixed || cat.isCalculationTarget !== false);
    return new Set(targetCats.map(c => c.id));
  }, [settings]);

  useEffect(() => {
    const loadYearData = async () => {
      if (!settings) return;
      setIsLoading(true);
      
      const newData: Record<number, number | null> = {};
      const monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);
      
      // 12ヶ月分のデータを並列取得
      const fetchPromises = monthsToFetch.map(async (month) => {
        if (isCurrentYear && month > currentMonth) {
          newData[month] = null; // 未来の月
          return;
        }
        
        const monthStr = `${selectedYear}-${String(month).padStart(2, '0')}`;
        const { expenses, budgets } = await fetchHistoryData(monthStr);
        
        let totalBudget = 0;
        let totalSpent = 0;
        
        targetCategoryIds.forEach(catId => {
          totalBudget += (budgets[catId] || 0);
        });
        
        expenses.forEach(exp => {
          if (targetCategoryIds.has(exp.categoryId)) {
            totalSpent += exp.amount;
          }
        });
        
        newData[month] = totalBudget - totalSpent;
      });

      await Promise.all(fetchPromises);
      setHistoryData(newData);
      setIsLoading(false);
    };

    loadYearData();
  }, [selectedYear, settings, targetCategoryIds, isCurrentYear, currentMonth, fetchHistoryData]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1).reverse();

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>＜ 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>へそくり創出履歴</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.yearSelector}>
        <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)} style={styles.yearBtn} activeOpacity={0.7}>
          <Text style={styles.yearBtnText}>◀ 前年</Text>
        </TouchableOpacity>
        <Text style={styles.currentYearText}>{selectedYear}年</Text>
        <TouchableOpacity 
          onPress={() => setSelectedYear(y => y + 1)} 
          style={styles.yearBtn} 
          disabled={isCurrentYear}
          activeOpacity={0.7}
        >
          <Text style={[styles.yearBtnText, isCurrentYear && styles.disabledText]}>次年 ▶</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>データを取得中...</Text>
        </View>
      ) : (
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
      )}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#8E8E93', fontWeight: 'bold' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  recordCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  monthText: { fontSize: 16, fontWeight: 'bold', color: '#8E8E93' },
  amountText: { fontSize: 22, fontWeight: 'bold', color: '#34C759' },
  negativeAmount: { color: '#FF3B30' },
});