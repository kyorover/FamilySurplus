// src/screens/HesokuriHistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useHesokuriStore } from '../store';
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
  const isCurrentYear = selectedYear === currentYear;
  const months = Array.from({ length: 12 }, (_, i) => i + 1).reverse();

  useEffect(() => {
    let isMounted = true;
    const loadYearData = async () => {
      if (!settings) return;
      setIsLoading(true);
      
      try {
        // ▼ N+1問題を解消し、対象年の確定済みサマリーを一括取得する
        const yearStr = String(selectedYear);
        const summaries = await apiService.fetchMonthlySummaries(yearStr);

        const newData: Record<number, number | null> = {};
        
        // 1月〜12月までのデータをマッピング
        for (let month = 1; month <= 12; month++) {
          const monthStr = `${yearStr}-${String(month).padStart(2, '0')}`;
          const summary = summaries.find(s => s.month_id === monthStr);

          // サマリーが存在し、かつ確定済みの場合はその金額をセット。未確定・未来月はnullとして扱う
          if (summary && summary.isConfirmed) {
            newData[month] = summary.confirmedHesokuriAmount;
          } else {
            newData[month] = null;
          }
        }

        if (isMounted) setHistoryData(newData);
      } catch (error) {
        console.error('Failed to load history', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadYearData();
    return () => { isMounted = false; };
  }, [selectedYear, settings]);

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