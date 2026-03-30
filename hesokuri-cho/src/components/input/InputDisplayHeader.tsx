// src/components/input/InputDisplayHeader.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Keyboard } from 'react-native';

interface InputDisplayHeaderProps {
  date: string;
  amount: string;
  isAmountFocused: boolean;
  hasError?: boolean;
  onPressDate: () => void;
  onPressAmount: () => void;
}

export const InputDisplayHeader: React.FC<InputDisplayHeaderProps> = ({ date, amount, isAmountFocused, hasError, onPressDate, onPressAmount }) => {
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

      <TouchableOpacity 
        style={[styles.inputDisplayArea, isAmountFocused && styles.inputDisplayAreaFocused, hasError && styles.inputDisplayAreaError]} 
        activeOpacity={0.8} 
        onPress={() => { Keyboard.dismiss(); onPressAmount(); }}
      >
        <Text style={[styles.inputCurrency, isAmountFocused && styles.inputCurrencyFocused, hasError && styles.inputCurrencyError]}>￥</Text>
        <Text style={[styles.inputDisplayAmount, hasError && styles.inputDisplayAmountError]}>
          {isAmountFocused && amount === '0' ? (
            <Text style={{ color: hasError ? '#FF3B30' : '#C7C7CC' }}>0</Text>
          ) : (
            parseInt(amount, 10).toLocaleString()
          )}
          <Text style={{ color: cursorVisible && !hasError ? '#007AFF' : cursorVisible && hasError ? '#FF3B30' : 'transparent' }}>|</Text>
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
  inputDisplayAreaError: { borderColor: '#FF3B30', backgroundColor: '#FFE5E5' },
  inputCurrency: { fontSize: 24, color: '#C7C7CC', marginRight: 8, fontWeight: 'bold' },
  inputCurrencyFocused: { color: '#007AFF' },
  inputCurrencyError: { color: '#FF3B30' },
  inputDisplayAmount: { fontSize: 48, fontWeight: 'bold', color: '#1C1C1E', letterSpacing: -1 },
  inputDisplayAmountError: { color: '#FF3B30' }
});