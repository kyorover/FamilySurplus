// src/components/input/DatePickerModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';

interface DatePickerModalProps {
  visible: boolean;
  initialDate: string; // "YYYY-MM-DD"
  onSelect: (date: string) => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({ visible, initialDate, onSelect, onClose }) => {
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    if (visible && initialDate) {
      setViewDate(new Date(initialDate));
    }
  }, [visible, initialDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    if (i < firstDay) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(i - firstDay + 1).padStart(2, '0')}`;
  });

  const handlePrevMonth = () => setViewDate(new Date(year, month - 2, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month, 1));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthBtn}><Text style={styles.monthBtnText}>◀ 前月</Text></TouchableOpacity>
            <Text style={styles.title}>{year}年 {month}月</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.monthBtn}><Text style={styles.monthBtnText}>次月 ▶</Text></TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {['日','月','火','水','木','金','土'].map(d => <Text key={d} style={styles.weekday}>{d}</Text>)}
            {calendarDays.map((dateStr, idx) => {
              if (!dateStr) return <View key={idx} style={styles.dayCell} />;
              const isSelected = dateStr === initialDate;
              return (
                <TouchableOpacity key={dateStr} style={[styles.dayCell, isSelected && styles.selectedDayCell]} onPress={() => { onSelect(dateStr); onClose(); }}>
                  <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{parseInt(dateStr.split('-')[2], 10)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  monthBtn: { padding: 8 },
  monthBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.28%', textAlign: 'center', fontSize: 12, color: '#8E8E93', fontWeight: 'bold', marginBottom: 8 },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  selectedDayCell: { backgroundColor: '#007AFF', borderRadius: 20 },
  dayText: { fontSize: 14, color: '#1C1C1E', fontWeight: '500' },
  selectedDayText: { color: '#FFFFFF', fontWeight: 'bold' },
});