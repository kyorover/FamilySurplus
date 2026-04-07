// src/components/dashboard/CategoryMonthlyRecordList.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ExpenseRecord, Category } from '../../types';

interface CategoryMonthlyRecordListProps {
  viewMonth: string;
  viewExpenses: ExpenseRecord[];
  category: Category;
  onAddExpense: (categoryId: string, date: string) => void;
  onEditExpense: (exp: ExpenseRecord) => void;
  onDeleteWrapper: (exp: ExpenseRecord) => void;
}

export const CategoryMonthlyRecordList: React.FC<CategoryMonthlyRecordListProps> = ({
  viewMonth, viewExpenses, category, onAddExpense, onEditExpense, onDeleteWrapper
}) => {
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <View style={styles.monthlyListContainer}>
      <View style={styles.monthlyListHeader}>
        <Text style={styles.monthlyListTitle}>{viewMonth.split('-')[1].replace(/^0/, '')}月の全記録</Text>
        <TouchableOpacity style={styles.addDirectBtn} onPress={() => onAddExpense(category.id, getTodayStr())}>
          <Text style={styles.addDirectBtnText}>＋ 追加</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {viewExpenses.length === 0 ? <Text style={styles.emptyText}>記録はありません</Text> : 
          viewExpenses.slice().sort((a,b) => b.date.localeCompare(a.date)).map(exp => (
            <TouchableOpacity key={exp.id} style={styles.recordItem} onPress={() => onEditExpense(exp)} activeOpacity={0.7}>
              <View style={styles.recordHeader}>
                <View style={styles.badgeWrap}>
                  <Text style={styles.dateBadge}>{parseInt(exp.date.split('-')[2], 10)}日</Text>
                  <Text style={styles.methodBadge}>{exp.paymentMethod}</Text>
                </View>
                <Text style={styles.amount}>￥{exp.amount.toLocaleString()}</Text>
              </View>
              <View style={styles.recordBody}>
                <View style={styles.textContainer}>
                  {exp.storeName ? <Text style={styles.storeName} numberOfLines={1}>📍 {exp.storeName}</Text> : null}
                  {exp.memo ? <Text style={styles.memo} numberOfLines={1}>💬 {exp.memo}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => onDeleteWrapper(exp)} style={styles.deleteBtnWrap}>
                  <Text style={styles.deleteText}>削除</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  monthlyListContainer: { flex: 1, marginTop: 16, borderTopWidth: 1, borderTopColor: '#E5E5EA', paddingTop: 16 },
  monthlyListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  monthlyListTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  addDirectBtn: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addDirectBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  listContent: { paddingBottom: 40 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 24, fontSize: 13 },
  
  recordItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', backgroundColor: '#FAFAFC', borderRadius: 8, paddingHorizontal: 12, marginBottom: 8 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badgeWrap: { flexDirection: 'row', alignItems: 'center' },
  dateBadge: { fontSize: 11, backgroundColor: '#1C1C1E', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: 'hidden', marginRight: 6, fontWeight: 'bold' },
  methodBadge: { fontSize: 10, backgroundColor: '#E5E5EA', color: '#8E8E93', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  recordBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  textContainer: { flex: 1, marginRight: 8 },
  storeName: { fontSize: 13, color: '#1C1C1E', marginBottom: 2, fontWeight: '500' },
  memo: { fontSize: 12, color: '#8E8E93' },
  deleteBtnWrap: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FFF0F0', borderRadius: 6 },
  deleteText: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
});