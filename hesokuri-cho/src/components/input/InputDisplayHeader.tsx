// src/components/input/InputDisplayHeader.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Keyboard } from 'react-native';

interface InputDisplayHeaderProps {
  date: string;
  amount: string;
  isAmountFocused: boolean;
  onPressDate: () => void;
  onPressAmount: () => void;
}

export const InputDisplayHeader: React.FC<InputDisplayHeaderProps> = ({ date, amount, isAmountFocused, onPressDate, onPressAmount }) => {
  const [cursorVisible, setCursorVisible] = useState(false);
  const formattedDate = `${date.split('-')[0]}年${date.split('-')[1]}月${date.split('-')[2]}日`;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAmountFocused) {
      setCursorVisible(true);
      interval = setInterval(() => setCursorVisible(v => !v), 500);
    } else {
      setCursorVisible(false);
    }
    return () => clearInterval(interval);
  }, [isAmountFocused]);

  return (
    <View style={styles.inputFocusWrapper}>
      <TouchableOpacity style={styles.dateSelectorBtn} onPress={onPressDate}>
        <Text style={styles.dateSelectorText}>📅 {formattedDate}  ▼</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.inputDisplayArea, isAmountFocused && styles.inputDisplayAreaFocused]} activeOpacity={0.8} onPress={() => { Keyboard.dismiss(); onPressAmount(); }}>
        <Text style={[styles.inputCurrency, isAmountFocused && styles.inputCurrencyFocused]}>￥</Text>
        <Text style={styles.inputDisplayAmount}>
          {isAmountFocused && amount === '0' ? (
            <Text style={{ color: '#C7C7CC' }}>0</Text>
          ) : (
            parseInt(amount, 10).toLocaleString()
          )}
          <Text style={{ color: cursorVisible ? '#007AFF' : 'transparent' }}>|</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputFocusWrapper: { backgroundColor: '#FFFFFF', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', alignItems: 'center' },
  dateSelectorBtn: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F2F2F7', borderRadius: 20 },
  dateSelectorText: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E' },
  inputDisplayArea: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E5E5EA', backgroundColor: '#FAFAFC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minWidth: '80%' },
  inputDisplayAreaFocused: { borderColor: '#007AFF', backgroundColor: '#F0F8FF' },
  inputCurrency: { fontSize: 24, color: '#C7C7CC', marginRight: 8, fontWeight: 'bold' },
  inputCurrencyFocused: { color: '#007AFF' },
  inputDisplayAmount: { fontSize: 48, fontWeight: 'bold', color: '#1C1C1E', letterSpacing: -1 },
});