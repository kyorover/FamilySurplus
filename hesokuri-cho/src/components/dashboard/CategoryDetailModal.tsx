// src/components/dashboard/CategoryDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ExpenseRecord, Category } from '../../types';
import { useHesokuriStore } from '../../store';
import { MonthCalendar } from './MonthCalendar';
import { DailyExpenseList } from './DailyExpenseList';

interface CategoryDetailModalProps {
  visible: boolean;
  category: Category | null;
  expenses: ExpenseRecord[];
  currentMonth: string;
  initialDate?: string | null;
  onClose: () => void;
  onEditExpense: (exp: ExpenseRecord) => void;
  onAddExpense: (categoryId: string, date: string) => void;
  onDelete: (date_id: string) => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  visible, category, expenses, currentMonth, initialDate, onClose, onEditExpense, onAddExpense, onDelete,
}) => {
  const { fetchHistoryData } = useHesokuriStore();
  const [viewMonth, setViewMonth] = useState<string>(currentMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewExpenses, setViewExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setViewMonth(initialDate ? initialDate.slice(0, 7) : currentMonth);
      setSelectedDate(initialDate || null);
    } else {
      setSelectedDate(null);
    }
  }, [visible, initialDate, currentMonth]);

  useEffect(() => {
    if (!visible || !category) return;
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchHistoryData(viewMonth);
      setViewExpenses(data.expenses.filter((e) => e.categoryId === category.id));
      setIsLoading(false);
    };
    loadData();
  }, [viewMonth, visible, category]);

  if (!category) return null;

  const expensesByDate = viewExpenses.reduce((acc, exp) => {
    if (!acc[exp.date]) acc[exp.date] = [];
    acc[exp.date].push(exp);
    return acc;
  }, {} as Record<string, ExpenseRecord[]>);

  const handleMonthChange = (diff: number) => {
    const [yearStr, monthStr] = viewMonth.split('-');
    const next = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + diff, 1);
    setViewMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
    setSelectedDate(null);
  };

  const handleYearChange = (diff: number) => {
    const [yearStr, monthStr] = viewMonth.split('-');
    const next = new Date(parseInt(yearStr, 10) + diff, parseInt(monthStr, 10) - 1, 1);
    setViewMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
    setSelectedDate(null);
  };

  const handleDeleteWrapper = (exp: ExpenseRecord) => {
    onDelete(exp.date_id!);
    setViewExpenses((prev) => prev.filter((e) => e.date_id !== exp.date_id));
  };

  // 月間リストからの追加時は「今日」をデフォルトにする
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>{category.name} の明細</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeText}>閉じる</Text></TouchableOpacity>
          </View>

          <MonthCalendar
            viewMonth={viewMonth} expensesByDate={expensesByDate} selectedDate={selectedDate}
            isLoading={isLoading} onMonthChange={handleMonthChange} onYearChange={handleYearChange} onSelectDate={setSelectedDate}
          />

          {/* 未選択（デフォルト）時は、当月の全明細リストを表示 */}
          {!selectedDate && !isLoading && (
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
                        <TouchableOpacity onPress={() => handleDeleteWrapper(exp)} style={styles.deleteBtnWrap}><Text style={styles.deleteText}>削除</Text></TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                }
              </ScrollView>
            </View>
          )}

          {/* 日付選択時はその日の明細を表示 */}
          {selectedDate && !isLoading && (
            <DailyExpenseList
              selectedDate={selectedDate} selectedExpenses={expensesByDate[selectedDate] || []} categories={[category]}
              onAddExpense={(date) => onAddExpense(category.id, date)} onEditExpense={onEditExpense} onDelete={handleDeleteWrapper}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { flex: 0.95, backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  closeText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  
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