// src/components/dashboard/CategoryDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ExpenseRecord, Category } from '../../types';
import { apiService } from '../../services/apiService';
import { MonthCalendar } from './MonthCalendar';
import { DailyExpenseList } from './DailyExpenseList';
import { CategoryMonthlyRecordList } from './CategoryMonthlyRecordList';

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
  visible, category, currentMonth, initialDate, onClose, onEditExpense, onAddExpense, onDelete,
}) => {
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
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const fetchedExpenses = await apiService.fetchExpenses(viewMonth);
        if (isMounted) setViewExpenses(fetchedExpenses.filter((e) => e.categoryId === category.id));
      } catch (error) {
        if (isMounted) setViewExpenses([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [viewMonth, visible, category?.id]);

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

          {!selectedDate && !isLoading && (
            <CategoryMonthlyRecordList 
              viewMonth={viewMonth} viewExpenses={viewExpenses} category={category}
              onAddExpense={onAddExpense} onEditExpense={onEditExpense} onDeleteWrapper={handleDeleteWrapper}
            />
          )}

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
});