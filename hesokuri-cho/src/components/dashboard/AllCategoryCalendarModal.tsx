// src/components/dashboard/AllCategoryCalendarModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ExpenseRecord, Category } from '../../types';
import { useHesokuriStore } from '../../store';
import { MonthCalendar } from './MonthCalendar';
import { DailyExpenseList } from './DailyExpenseList';

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

  useEffect(() => {
    if (visible) {
      const targetMonth = initialDate ? initialDate.slice(0, 7) : currentMonth;
      setViewMonth(targetMonth);
      if (initialDate) setSelectedDate(initialDate);
    } else {
      setSelectedDate(null);
    }
  }, [visible, initialDate, currentMonth]);

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

  const expensesByDate = viewExpenses.reduce((acc, exp) => {
    if (!acc[exp.date]) acc[exp.date] = [];
    acc[exp.date].push(exp);
    return acc;
  }, {} as Record<string, ExpenseRecord[]>);

  const selectedExpenses = selectedDate ? expensesByDate[selectedDate] || [] : [];

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

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeText}>閉じる</Text></TouchableOpacity>
            <Text style={styles.title}>全カテゴリーカレンダー</Text>
            <View style={{ width: 40 }} />
          </View>

          <MonthCalendar
            viewMonth={viewMonth}
            expensesByDate={expensesByDate}
            selectedDate={selectedDate}
            isLoading={isLoading}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            onSelectDate={setSelectedDate}
          />

          {selectedDate && !isLoading && (
            <DailyExpenseList
              selectedDate={selectedDate}
              selectedExpenses={selectedExpenses}
              categories={categories}
              onAddExpense={onAddExpense}
              onEditExpense={onEditExpense}
              onDelete={handleDeleteWrapper}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  closeText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
});