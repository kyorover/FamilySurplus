// src/components/dashboard/BudgetProgressBar.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface BudgetProgressBarProps {
  categoryId: string;
  categoryName: string;
  budget: number;
  spent: number;
  onPress: (categoryId: string) => void;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  categoryId,
  categoryName,
  budget,
  spent,
  onPress
}) => {
  const remain = budget - spent;
  const ratio = budget > 0 ? Math.min(spent / budget, 1) : 1;
  const isWarning = remain < (budget * 0.1);

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.6}
      onPress={() => onPress(categoryId)}
    >
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.catName}>{categoryName}</Text>
          <Text style={styles.hintText}>タップして明細を見る</Text>
        </View>
        <Text style={styles.amountText}>
          残 <Text style={{ fontWeight: 'bold', color: isWarning ? '#FF3B30' : '#1C1C1E' }}>￥{remain.toLocaleString()}</Text>
        </Text>
      </View>
      <View style={styles.barBg}>
        <View style={[
          styles.barFill, 
          { width: `${ratio * 100}%`, backgroundColor: isWarning ? '#FF3B30' : '#34C759' }
        ]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  titleWrap: { flexDirection: 'row', alignItems: 'center' },
  catName: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E', marginRight: 8 },
  hintText: { fontSize: 10, color: '#8E8E93' },
  amountText: { fontSize: 14, color: '#8E8E93' },
  barBg: { height: 8, backgroundColor: '#E5E5EA', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
});