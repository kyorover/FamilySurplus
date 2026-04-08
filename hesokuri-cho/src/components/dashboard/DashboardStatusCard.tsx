// src/components/dashboard/DashboardStatusCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DashboardStatusCardProps {
  gardenPoints: number;
  lastWateringDate?: string;
  currentHesokuri: number;
  totalSpent: number;
  totalMonthlyBudget: number;
  progressRatio: number;
  progressColor: string;
  onWaterGarden: () => void;
  onPressCard: () => void;
}

export const DashboardStatusCard: React.FC<DashboardStatusCardProps> = ({
  gardenPoints, lastWateringDate, currentHesokuri, totalSpent, totalMonthlyBudget, progressRatio, progressColor, onWaterGarden, onPressCard
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const isWateredToday = lastWateringDate === todayStr;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPressCard} style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subTitle}>今月のへそくり残高</Text>
          <Text style={[styles.totalAmount, { color: progressColor }]}>¥{currentHesokuri.toLocaleString()}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.points}>{gardenPoints} pt</Text>
          <TouchableOpacity onPress={onWaterGarden} disabled={isWateredToday} style={[styles.btn, isWateredToday && styles.btnDisabled]}>
            <Text style={styles.btnText}>{isWateredToday ? '🌿 完了' : '💧 水やり'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.body}>
        <View style={styles.progressHeader}>
          <Text style={styles.subTitle}>今月の予算消化状況</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progressRatio * 100}%`, backgroundColor: progressColor }]} />
        </View>
        <View style={styles.labels}>
          <Text style={styles.labelText}>支出 ¥{totalSpent.toLocaleString()}</Text>
          <Text style={styles.labelText}>予算 ¥{totalMonthlyBudget.toLocaleString()}</Text>
        </View>
      </View>
      <Text style={styles.footerText}>👉 タップでカレンダー・履歴を確認</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, marginBottom: 16, padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  subTitle: { fontSize: 12, color: '#8E8E93', fontWeight: '600', marginBottom: 4 },
  totalAmount: { fontSize: 28, fontWeight: 'bold' },
  badge: { alignItems: 'center', backgroundColor: '#F2F2F7', padding: 8, borderRadius: 16 },
  points: { fontSize: 14, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  btn: { backgroundColor: '#007AFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  btnDisabled: { backgroundColor: '#C7C7CC' },
  btnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginBottom: 16 },
  body: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  monthAmount: { fontSize: 18, fontWeight: 'bold' },
  track: { height: 12, backgroundColor: '#E5E5EA', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  fill: { height: '100%', borderRadius: 6 },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  labelText: { fontSize: 11, color: '#8E8E93' },
  footerText: { fontSize: 12, color: '#007AFF', textAlign: 'center', fontWeight: '600', marginTop: 8 },
});