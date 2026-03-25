// src/components/dashboard/HesokuriSummaryCard.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface HesokuriSummaryCardProps {
  currentHesokuri: number;
  totalMonthlyBudget: number;
  totalSpent: number;
}

export const HesokuriSummaryCard: React.FC<HesokuriSummaryCardProps> = ({
  currentHesokuri,
  totalMonthlyBudget,
  totalSpent
}) => {
  const isNegative = currentHesokuri < 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>今月のへそくり（浮いたお金）</Text>
      <Text style={[styles.amount, { color: isNegative ? '#FF3B30' : '#007AFF' }]}>
        ￥{currentHesokuri.toLocaleString()}
      </Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>総予算: ￥{totalMonthlyBudget.toLocaleString()}</Text>
        <Text style={styles.summaryText}>支出済: ￥{totalSpent.toLocaleString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#FFFFFF', 
    padding: 24, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 3 
  },
  label: { 
    fontSize: 14, 
    color: '#8E8E93', 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  amount: { 
    fontSize: 40, 
    fontWeight: '900', 
    marginBottom: 16 
  },
  summaryRow: { 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-around', 
    borderTopWidth: 1, 
    borderTopColor: '#E5E5EA', 
    paddingTop: 16 
  },
  summaryText: { 
    fontSize: 12, 
    color: '#8E8E93', 
    fontWeight: '600' 
  },
});