// src/components/dashboard/CategoryDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ExpenseRecord, Category } from '../../types';

interface CategoryDetailModalProps {
  visible: boolean;
  category: Category | null;
  expenses: ExpenseRecord[];
  currentMonth: string;
  initialDate?: string | null; // 自動帰還用の初期日付
  onClose: () => void;
  onEditExpense: (exp: ExpenseRecord) => void;
  onAddExpense: (categoryId: string, date: string) => void;
  onDelete: (date_id: string) => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ visible, category, expenses, currentMonth, initialDate, onClose, onEditExpense, onAddExpense, onDelete }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // モーダル表示時に初期日付があればセット
  useEffect(() => {
    if (visible && initialDate) {
      setSelectedDate(initialDate);
    } else if (!visible) {
      setSelectedDate(null);
    }
  }, [visible, initialDate]);

  if (!category) return null;

  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    if (i < firstDay) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(i - firstDay + 1).padStart(2, '0')}`;
  });

  const expensesByDate = expenses.reduce((acc, exp) => {
    if (!acc[exp.date]) acc[exp.date] = [];
    acc[exp.date].push(exp);
    return acc;
  }, {} as Record<string, ExpenseRecord[]>);

  const selectedExpenses = selectedDate ? (expensesByDate[selectedDate] || []) : [];

  const handleDelete = (exp: ExpenseRecord) => {
    Alert.alert('確認', '削除しますか？', [{ text: 'キャンセル', style: 'cancel' }, { text: '削除', style: 'destructive', onPress: () => onDelete(exp.date_id) }]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* フルスクリーンに近い広々としたモーダル */}
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>{category.name} の明細カレンダー</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeText}>閉じる</Text></TouchableOpacity>
          </View>

          {/* カレンダーUI */}
          <View style={styles.calendarGrid}>
            {['日','月','火','水','木','金','土'].map(d => <Text key={d} style={styles.weekday}>{d}</Text>)}
            {calendarDays.map((dateStr, idx) => {
              if (!dateStr) return <View key={idx} style={styles.dayCell} />;
              const dayTotal = expensesByDate[dateStr]?.reduce((s, e) => s + e.amount, 0) || 0;
              const isSelected = selectedDate === dateStr;
              return (
                <TouchableOpacity key={dateStr} style={[styles.dayCell, isSelected && styles.selectedDayCell]} onPress={() => setSelectedDate(dateStr)}>
                  <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{parseInt(dateStr.split('-')[2], 10)}</Text>
                  {dayTotal > 0 && <Text style={styles.dayAmount} numberOfLines={1}>￥{dayTotal.toLocaleString()}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 選択された日付の明細リスト（縦に広くスクロール可能に） */}
          {selectedDate && (
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailDateText}>{month}月{parseInt(selectedDate.split('-')[2], 10)}日の記録</Text>
                <TouchableOpacity style={styles.addDirectBtn} onPress={() => onAddExpense(category.id, selectedDate)}>
                  <Text style={styles.addDirectBtnText}>＋ 追加</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {selectedExpenses.length === 0 ? <Text style={styles.emptyText}>記録はありません</Text> : 
                  selectedExpenses.map(exp => (
                    <TouchableOpacity key={exp.id} style={styles.recordItem} onPress={() => onEditExpense(exp)} activeOpacity={0.7}>
                      <View style={styles.recordHeader}>
                        <Text style={styles.methodBadge}>{exp.paymentMethod}</Text>
                        <Text style={styles.amount}>￥{exp.amount.toLocaleString()}</Text>
                      </View>
                      <View style={styles.recordBody}>
                        <View style={styles.textContainer}>
                          {exp.storeName ? <Text style={styles.storeName} numberOfLines={1}>📍 {exp.storeName}</Text> : null}
                          {exp.memo ? <Text style={styles.memo} numberOfLines={1}>💬 {exp.memo}</Text> : null}
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(exp)} style={styles.actionBtn}><Text style={styles.deleteText}>削除</Text></TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                }
              </ScrollView>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { flex: 0.95, backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  closeText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  weekday: { width: '14.28%', textAlign: 'center', fontSize: 12, color: '#8E8E93', fontWeight: 'bold', marginBottom: 8 },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#F2F2F7', padding: 2 },
  selectedDayCell: { backgroundColor: '#E5F1FF', borderRadius: 8, borderBottomWidth: 0 },
  dayText: { fontSize: 14, color: '#1C1C1E', fontWeight: '500' },
  selectedDayText: { color: '#007AFF', fontWeight: 'bold' },
  dayAmount: { fontSize: 8, color: '#8E8E93', marginTop: 2 },
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
  methodBadge: { fontSize: 10, backgroundColor: '#E5E5EA', color: '#8E8E93', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  recordBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  textContainer: { flex: 1, marginRight: 8 },
  storeName: { fontSize: 13, color: '#1C1C1E', marginBottom: 2, fontWeight: '500' },
  memo: { fontSize: 12, color: '#8E8E93' },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FFF0F0', borderRadius: 6 },
  deleteText: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
});