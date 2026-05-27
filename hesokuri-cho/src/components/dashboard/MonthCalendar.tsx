// src/components/dashboard/MonthCalendar.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ExpenseRecord } from '../../types';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

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
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

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
        <View style={styles.loadingArea}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <View style={styles.calendarGrid}>
          {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
            <Text key={d} style={[styles.weekday, i === 0 && { color: colors.error }, i === 6 && { color: colors.primary }]}>{d}</Text>
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
                <Text style={[styles.dayText, isSundayOrHoliday && { color: colors.error }, isSaturday && !isHoliday && { color: colors.primary }, isSelected && styles.selectedDayText]}>
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

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  monthControl: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 2 },
  controlGroup: { flexDirection: 'row', alignItems: 'center' },
  monthBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  monthBtnText: { fontSize: 14, color: colors.primary, fontWeight: 'bold' },
  currentMonthText: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  loadingArea: { height: 200, justifyContent: 'center', alignItems: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  weekday: { width: '14.28%', textAlign: 'center', fontSize: 12, color: colors.textSecondary, fontWeight: 'bold', marginBottom: 8 },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, padding: 2 },
  selectedDayCell: { backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : colors.primaryLight, borderRadius: 8, borderBottomWidth: 0 },
  dayText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  selectedDayText: { fontWeight: 'bold' },
  dayAmount: { fontSize: 8, color: colors.textSecondary, marginTop: 2 },
});