// src/components/dashboard/AllCategoryCalendarModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ExpenseRecord, Category } from '../../types';
import { MonthCalendar } from './MonthCalendar';
import { DailyExpenseList } from './DailyExpenseList';
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

export const AllCategoryCalendarModal: React.FC<AllCategoryCalendarModalProps> = ({ 
  visible, categories, currentMonth, initialDate, onClose, onEditExpense, onAddExpense, onDelete 
}) => {
  // 単一情報源（Store）から状態とメソッドを取得
  const { expenses, fetchExpenses, isLoading } = useHesokuriStore();
  const [viewMonth, setViewMonth] = useState<string>(currentMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      const targetMonth = initialDate ? initialDate.slice(0, 7) : currentMonth;
      setViewMonth(targetMonth);
      
      // デフォルト日付の決定（指定がなければ、当月なら「今日」、それ以外の月なら「1日」とする）
      let defaultDate = initialDate;
      if (!defaultDate) {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (todayStr.startsWith(currentMonth)) {
          defaultDate = todayStr;
        } else {
          defaultDate = `${currentMonth}-01`;
        }
      }
      setSelectedDate(defaultDate);
    } else {
      setSelectedDate(null);
    }
  }, [visible, initialDate, currentMonth]);

  useEffect(() => {
    if (visible) {
      fetchExpenses(viewMonth);
    }
  }, [viewMonth, visible]);

  const handleClose = () => {
    // 親画面（ダッシュボード）の表示月とずれている場合は元に戻してから閉じる
    if (viewMonth !== currentMonth) {
      fetchExpenses(currentMonth);
    }
    onClose();
  };

  // ストアの全支出から、現在表示中の月のデータのみを抽出
  const viewExpenses = expenses.filter(e => e.date.startsWith(viewMonth));

  const expensesByDate = viewExpenses.reduce((acc, exp) => {
    if (!acc[exp.date]) acc[exp.date] = [];
    acc[exp.date].push(exp);
    return acc;
  }, {} as Record<string, ExpenseRecord[]>);

  const selectedExpenses = selectedDate ? expensesByDate[selectedDate] || [] : [];

  const handleMonthChange = (diff: number) => {
    const [yearStr, monthStr] = viewMonth.split('-');
    const next = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + diff, 1);
    const nextMonthStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    setViewMonth(nextMonthStr);
    
    // 月を切り替えた際も、その月における適切な日付をデフォルト選択する
    const todayStr = new Date().toISOString().slice(0, 10);
    if (todayStr.startsWith(nextMonthStr)) {
      setSelectedDate(todayStr);
    } else {
      setSelectedDate(`${nextMonthStr}-01`);
    }
  };

  const handleYearChange = (diff: number) => {
    const [yearStr, monthStr] = viewMonth.split('-');
    const next = new Date(parseInt(yearStr, 10) + diff, parseInt(monthStr, 10) - 1, 1);
    const nextMonthStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    setViewMonth(nextMonthStr);
    
    // 年を切り替えた際も同様にデフォルト選択
    const todayStr = new Date().toISOString().slice(0, 10);
    if (todayStr.startsWith(nextMonthStr)) {
      setSelectedDate(todayStr);
    } else {
      setSelectedDate(`${nextMonthStr}-01`);
    }
  };

  const handleDeleteWrapper = (exp: ExpenseRecord) => {
    onDelete(exp.date_id!);
    // グローバルなStore側で削除され再レンダリングされるため、ローカル配列の操作は不要
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeText}>閉じる</Text>
            </TouchableOpacity>
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