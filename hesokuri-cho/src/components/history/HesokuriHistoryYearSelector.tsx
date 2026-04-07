// src/components/history/HesokuriHistoryYearSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface HesokuriHistoryYearSelectorProps {
  selectedYear: number;
  isCurrentYear: boolean;
  onPrevYear: () => void;
  onNextYear: () => void;
}

export const HesokuriHistoryYearSelector: React.FC<HesokuriHistoryYearSelectorProps> = ({
  selectedYear, isCurrentYear, onPrevYear, onNextYear
}) => {
  return (
    <View style={styles.yearSelector}>
      <TouchableOpacity onPress={onPrevYear} style={styles.yearBtn} activeOpacity={0.7}>
        <Text style={styles.yearBtnText}>◀ 前年</Text>
      </TouchableOpacity>
      <Text style={styles.currentYearText}>{selectedYear}年</Text>
      <TouchableOpacity 
        onPress={onNextYear} 
        style={styles.yearBtn} 
        disabled={isCurrentYear}
        activeOpacity={0.7}
      >
        <Text style={[styles.yearBtnText, isCurrentYear && styles.disabledText]}>次年 ▶</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  yearSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, marginBottom: 12 },
  yearBtn: { padding: 8 },
  yearBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  disabledText: { color: '#C7C7CC' },
  currentYearText: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
});