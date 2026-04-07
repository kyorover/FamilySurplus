// src/screens/HesokuriHistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useHesokuriStore } from '../store';
import { DEFAULT_CATEGORY_NAMES } from '../constants';
import { apiService } from '../services/apiService';
import { HesokuriHistoryYearSelector } from '../components/history/HesokuriHistoryYearSelector';
import { HesokuriHistoryList } from '../components/history/HesokuriHistoryList';

interface HesokuriHistoryScreenProps {
  onBack: () => void;
}

export const HesokuriHistoryScreen: React.FC<HesokuriHistoryScreenProps> = ({ onBack }) => {
  const { settings } = useHesokuriStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [historyData, setHistoryData] = useState<Record<number, number | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const isCurrentYear = selectedYear === currentYear;
  const months = Array.from({ length: 12 }, (_, i) => i + 1).reverse();

  useEffect(() => {
    let isMounted = true;
    const loadYearData = async () => {
      if (!settings) return;
      setIsLoading(true);
      
      try {
        const hasChild = settings.familyMembers.some(m => m.role === '子供');
        const activeCategories = settings.categories.filter(cat => 
          cat.isFixed && cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE ? hasChild : true
        );
        const targetCats = activeCategories.filter(cat => cat.isFixed || cat.isCalculationTarget !== false);
        const targetCategoryIds = new Set(targetCats.map(c => c.id));

        const newData: Record<number, number | null> = {};
        const monthsToFetch = Array.from({ length: 12 }, (_, i) => i + 1);
        
        const fetchPromises = monthsToFetch.map(async (month) => {
          if (isCurrentYear && month > currentMonth) {
            newData[month] = null;
            return;
          }
          const monthStr = `${selectedYear}-${String(month).padStart(2, '0')}`;
          try {
            const [expenses, budgetData] = await Promise.all([
              apiService.fetchExpenses(monthStr).catch(() => []),
              apiService.fetchMonthlyBudget(monthStr, settings).catch(() => ({ budgets: {} }))
            ]);
            
            const budgets = (budgetData as any).budgets || {};
            let totalBudget = 0;
            let totalSpent = 0;
            
            targetCategoryIds.forEach(catId => { totalBudget += (budgets[catId] || 0); });
            expenses.forEach(exp => {
              if (targetCategoryIds.has(exp.categoryId)) totalSpent += exp.amount;
            });
            newData[month] = totalBudget - totalSpent;
          } catch (e) {
            newData[month] = null;
          }
        });

        await Promise.all(fetchPromises);
        if (isMounted) setHistoryData(newData);
      } catch (error) {
        console.error('Failed to load history', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadYearData();
    return () => { isMounted = false; };
  }, [selectedYear, settings?.updatedAt, isCurrentYear, currentMonth]);

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>＜ 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>へそくり創出履歴</Text>
        <View style={{ width: 50 }} />
      </View>

      <HesokuriHistoryYearSelector 
        selectedYear={selectedYear} 
        isCurrentYear={isCurrentYear} 
        onPrevYear={() => setSelectedYear(y => y - 1)} 
        onNextYear={() => setSelectedYear(y => y + 1)} 
      />

      <HesokuriHistoryList 
        isLoading={isLoading} 
        months={months} 
        historyData={historyData} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  backBtn: { width: 50 },
  backBtnText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  subHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
});