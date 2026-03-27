// src/components/dashboard/BudgetProgressBar.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface BudgetProgressBarProps {
  categoryId: string;
  categoryName: string;
  budget: number;
  spent: number;
  onPressDetail: (categoryId: string) => void;
  onPressEditBudget: (categoryId: string) => void;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ categoryId, categoryName, budget, spent, onPressDetail, onPressEditBudget }) => {
  const remain = budget - spent;
  const ratio = budget > 0 ? Math.min(spent / budget, 1) : 1;
  const isWarning = remain < (budget * 0.1);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.catName}>{categoryName}</Text>
          <TouchableOpacity onPress={() => onPressEditBudget(categoryId)} style={styles.editBudgetBtn}>
            <Text style={styles.editBudgetText}>✏️ 予算編集</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.amountText}>
          残 <Text style={{ fontWeight: 'bold', color: isWarning ? '#FF3B30' : '#1C1C1E' }}>￥{remain.toLocaleString()}</Text>
        </Text>
      </View>
      <TouchableOpacity onPress={() => onPressDetail(categoryId)} activeOpacity={0.6} style={styles.barContainer}>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${ratio * 100}%`, backgroundColor: isWarning ? '#FF3B30' : '#34C759' }]} />
        </View>
        <Text style={styles.hintText}>タップして明細を見る・修正する</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  titleWrap: { flexDirection: 'row', alignItems: 'center' },
  catName: { fontSize: 15, fontWeight: 'bold', color: '#1C1C1E', marginRight: 12 },
  editBudgetBtn: { backgroundColor: '#F2F2F7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  editBudgetText: { fontSize: 11, color: '#007AFF', fontWeight: 'bold' },
  amountText: { fontSize: 14, color: '#8E8E93' },
  barContainer: { marginTop: 4 },
  barBg: { height: 12, backgroundColor: '#E5E5EA', borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: '100%', borderRadius: 6 },
  hintText: { fontSize: 11, color: '#8E8E93', textAlign: 'right' },
});