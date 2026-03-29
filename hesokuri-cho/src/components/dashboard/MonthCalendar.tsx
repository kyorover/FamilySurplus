// src/components/dashboard/MonthCalendar.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ExpenseRecord } from '../../types';

const JapaneseHolidays = require('japanese-holidays');

interface MonthCalendarProps {
  viewMonth: string;
  expensesByDate: Record<string, ExpenseRecord[]>;
  selectedDate: string | null;
  isLoading: boolean;
  onMonthChange: (diff: number) => void;
  onYearChange: (diff: number) => void;
  onSelectDate: (date: string) => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({ viewMonth, expensesByDate, selectedDate, isLoading, onMonthChange, onYearChange, onSelectDate }) => {
  const [yearStr, monthStr] = viewMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    if (i < firstDay) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(i - firstDay + 1).padStart(2, '0')}`;
  });

  return (
    <View>
      <View style={styles.monthControl}>
        <View style={styles.controlGroup}>
          <TouchableOpacity onPress={() => onYearChange(-1)} style={styles.monthBtn}><Text style={styles.monthBtnText}>≪ 年</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onMonthChange(-1)} style={styles.monthBtn}><Text style={styles.monthBtnText}>＜ 月</Text></TouchableOpacity>
        </View>
        <Text style={styles.currentMonthText}>{year}年 {month}月</Text>
        <View style={styles.controlGroup}>
          <TouchableOpacity onPress={() => onMonthChange(1)} style={styles.monthBtn}><Text style={styles.monthBtnText}>月 ＞</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onYearChange(1)} style={styles.monthBtn}><Text style={styles.monthBtnText}>年 ≫</Text></TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingArea}><ActivityIndicator size="large" color="#007AFF" /></View>
      ) : (
        <View style={styles.calendarGrid}>
          {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
            <Text key={d} style={[styles.weekday, i === 0 && { color: '#FF3B30' }, i === 6 && { color: '#007AFF' }]}>{d}</Text>
          ))}
          {calendarDays.map((dateStr, idx) => {
            if (!dateStr) return <View key={idx} style={styles.dayCell} />;
            const dayTotal = expensesByDate[dateStr]?.reduce((s, e) => s + e.amount, 0) || 0;
            const isSelected = selectedDate === dateStr;
            const dayOfWeek = idx % 7;
            const [y, m, d] = dateStr.split('-').map(Number);
            const isHoliday = !!JapaneseHolidays.isHoliday(new Date(y, m - 1, d));
            const isSundayOrHoliday = dayOfWeek === 0 || isHoliday;
            const isSaturday = dayOfWeek === 6;

            return (
              <TouchableOpacity key={dateStr} style={[styles.dayCell, isSelected && styles.selectedDayCell]} onPress={() => onSelectDate(dateStr)}>
                <Text style={[styles.dayText, isSundayOrHoliday && { color: '#FF3B30' }, isSaturday && !isHoliday && { color: '#007AFF' }, isSelected && styles.selectedDayText]}>
                  {parseInt(dateStr.split('-')[2], 10)}
                </Text>
                {dayTotal > 0 && <Text style={styles.dayAmount} numberOfLines={1}>￥{dayTotal.toLocaleString()}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  monthControl: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, backgroundColor: '#F2F2F7', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 2 },
  controlGroup: { flexDirection: 'row', alignItems: 'center' },
  monthBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  monthBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  currentMonthText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  loadingArea: { height: 200, justifyContent: 'center', alignItems: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  weekday: { width: '14.28%', textAlign: 'center', fontSize: 12, color: '#8E8E93', fontWeight: 'bold', marginBottom: 8 },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#F2F2F7', padding: 2 },
  selectedDayCell: { backgroundColor: '#E5F1FF', borderRadius: 8, borderBottomWidth: 0 },
  dayText: { fontSize: 14, color: '#1C1C1E', fontWeight: '500' },
  selectedDayText: { fontWeight: 'bold' },
  dayAmount: { fontSize: 8, color: '#8E8E93', marginTop: 2 },
});