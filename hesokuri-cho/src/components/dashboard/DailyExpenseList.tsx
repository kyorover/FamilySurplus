// src/components/dashboard/DailyExpenseList.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ExpenseRecord, Category } from '../../types';

interface DailyExpenseListProps {
  selectedDate: string | null;
  selectedExpenses: ExpenseRecord[];
  categories: Category[];
  onAddExpense: (date: string | null) => void;
  onEditExpense: (exp: ExpenseRecord) => void;
  onDelete: (exp: ExpenseRecord) => void;
}

export const DailyExpenseList: React.FC<DailyExpenseListProps> = ({ selectedDate, selectedExpenses, categories, onAddExpense, onEditExpense, onDelete }) => {
  let headerTitle = '今月の記録';
  if (selectedDate) {
    const month = parseInt(selectedDate.split('-')[1], 10);
    const day = parseInt(selectedDate.split('-')[2], 10);
    headerTitle = `${month}月${day}日の記録`;
  }

  const handleDelete = (exp: ExpenseRecord) => {
    Alert.alert('確認', '削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => onDelete(exp) },
    ]);
  };

  return (
    <View style={styles.detailSection}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailDateText}>{headerTitle}</Text>
        <TouchableOpacity style={styles.addDirectBtn} onPress={() => onAddExpense(selectedDate)}>
          <Text style={styles.addDirectBtnText}>{selectedDate ? '＋ この日に追加' : '＋ 追加'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {selectedExpenses.length === 0 ? (
          <Text style={styles.emptyText}>記録はありません</Text>
        ) : (
          selectedExpenses.map((exp) => {
            const catName = categories.find((c) => c.id === exp.categoryId)?.name || '不明';
            const expDay = parseInt(exp.date.split('-')[2], 10);
            return (
              <TouchableOpacity key={exp.id} style={styles.recordItem} onPress={() => onEditExpense(exp)} activeOpacity={0.7}>
                <View style={styles.recordHeader}>
                  <View style={styles.badges}>
                    {!selectedDate && <Text style={styles.dateBadge}>{expDay}日</Text>}
                    <Text style={styles.catBadge}>{catName}</Text>
                    <Text style={styles.methodBadge}>{exp.paymentMethod}</Text>
                  </View>
                  <Text style={styles.amount}>￥{exp.amount.toLocaleString()}</Text>
                </View>
                <View style={styles.recordBody}>
                  <View style={styles.textContainer}>
                    {exp.storeName ? <Text style={styles.storeName} numberOfLines={1}>📍 {exp.storeName}</Text> : null}
                    {exp.memo ? <Text style={styles.memo} numberOfLines={1}>💬 {exp.memo}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(exp)} style={styles.actionBtn}>
                    <Text style={styles.deleteText}>削除</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  detailSection: { flex: 1, borderTopWidth: 1, borderTopColor: '#E5E5EA', paddingTop: 16 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailDateText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  addDirectBtn: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addDirectBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  list: { flex: 1 },
  listContent: { paddingBottom: 40 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 24, fontSize: 13 },
  recordItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', backgroundColor: '#FAFAFC', borderRadius: 8, paddingHorizontal: 12, marginBottom: 8 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badges: { flexDirection: 'row', alignItems: 'center' },
  dateBadge: { fontSize: 11, backgroundColor: '#007AFF', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: 'hidden', marginRight: 6, fontWeight: 'bold' },
  catBadge: { fontSize: 11, backgroundColor: '#1C1C1E', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: 'hidden', marginRight: 6, fontWeight: 'bold' },
  methodBadge: { fontSize: 10, backgroundColor: '#E5E5EA', color: '#8E8E93', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  recordBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  textContainer: { flex: 1, marginRight: 8 },
  storeName: { fontSize: 13, color: '#1C1C1E', marginBottom: 2, fontWeight: '500' },
  memo: { fontSize: 12, color: '#8E8E93' },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FFF0F0', borderRadius: 6 },
  deleteText: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
});