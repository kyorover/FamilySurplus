// src/components/dashboard/AllCategoryCalendarModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ExpenseRecord, Category } from '../../types';
import { useHesokuriStore } from '../../store';

interface AllCategoryCalendarModalProps {
  visible: boolean;
  categories: Category[];
  currentMonth: string;
  initialDate?: string | null;
  onClose: () => void;
  onEditExpense: (exp: ExpenseRecord) => void;
  onAddExpense: (date: string) => void;
  onDelete: (date_id: string) => void;
}

export const AllCategoryCalendarModal: React.FC<AllCategoryCalendarModalProps> = ({ visible, categories, currentMonth, initialDate, onClose, onEditExpense, onAddExpense, onDelete }) => {
  const { fetchHistoryData } = useHesokuriStore();
  const [viewMonth, setViewMonth] = useState<string>(currentMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewExpenses, setViewExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // モーダルが開かれた時の初期化
  useEffect(() => {
    if (visible) {
      const targetMonth = initialDate ? initialDate.slice(0, 7) : currentMonth;
      setViewMonth(targetMonth);
      if (initialDate) setSelectedDate(initialDate);
    } else {
      setSelectedDate(null);
    }
  }, [visible, initialDate, currentMonth]);

  // 表示する月（viewMonth）が変わるたびに履歴データを取得
  useEffect(() => {
    if (!visible) return;
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchHistoryData(viewMonth);
      setViewExpenses(data.expenses);
      setIsLoading(false);
    };
    loadData();
  }, [viewMonth, visible]);

  const [yearStr, monthStr] = viewMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    if (i < firstDay) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(i - firstDay + 1).padStart(2, '0')}`;
  });

  const expensesByDate = viewExpenses.reduce((acc, exp) => {
    if (!acc[exp.date]) acc[exp.date] = [];
    acc[exp.date].push(exp);
    return acc;
  }, {} as Record<string, ExpenseRecord[]>);

  const selectedExpenses = selectedDate ? (expensesByDate[selectedDate] || []) : [];

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 2, 1);
    setViewMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    const next = new Date(year, month, 1);
    setViewMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
    setSelectedDate(null);
  };

  const handleDelete = (exp: ExpenseRecord) => {
    Alert.alert('確認', '削除しますか？', [{ text: 'キャンセル', style: 'cancel' }, { text: '削除', style: 'destructive', onPress: () => {
      onDelete(exp.date_id!);
      setViewExpenses(prev => prev.filter(e => e.date_id !== exp.date_id));
    }}]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeText}>閉じる</Text></TouchableOpacity>
            <Text style={styles.title}>全カテゴリーカレンダー</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* 月切り替えコントロール */}
          <View style={styles.monthControl}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthBtn}><Text style={styles.monthBtnText}>◀ 前月</Text></TouchableOpacity>
            <Text style={styles.currentMonthText}>{year}年 {month}月</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.monthBtn}><Text style={styles.monthBtnText}>次月 ▶</Text></TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingArea}><ActivityIndicator size="large" color="#007AFF" /></View>
          ) : (
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
          )}

          {selectedDate && !isLoading && (
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailDateText}>{month}月{parseInt(selectedDate.split('-')[2], 10)}日の記録</Text>
                <TouchableOpacity style={styles.addDirectBtn} onPress={() => onAddExpense(selectedDate)}>
                  <Text style={styles.addDirectBtnText}>＋ この日に追加</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {selectedExpenses.length === 0 ? <Text style={styles.emptyText}>記録はありません</Text> : 
                  selectedExpenses.map(exp => {
                    const catName = categories.find(c => c.id === exp.categoryId)?.name || '不明';
                    return (
                      <TouchableOpacity key={exp.id} style={styles.recordItem} onPress={() => onEditExpense(exp)} activeOpacity={0.7}>
                        <View style={styles.recordHeader}>
                          <View style={styles.badges}>
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
                          <TouchableOpacity onPress={() => handleDelete(exp)} style={styles.actionBtn}><Text style={styles.deleteText}>削除</Text></TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  closeText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  monthControl: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, backgroundColor: '#F2F2F7', borderRadius: 8, padding: 4 },
  monthBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  monthBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  currentMonthText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  loadingArea: { height: 200, justifyContent: 'center', alignItems: 'center' },
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
  badges: { flexDirection: 'row', alignItems: 'center' },
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