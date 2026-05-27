// src/components/input/InputDisplayHeader.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Keyboard } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface InputDisplayHeaderProps {
  date: string;
  amount: string;
  isAmountFocused: boolean;
  hasError?: boolean;
  onPressDate: () => void;
  onPressAmount: () => void;
}

export const InputDisplayHeader: React.FC<InputDisplayHeaderProps> = ({ date, amount, isAmountFocused, hasError, onPressDate, onPressAmount }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

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
            <Text style={{ color: hasError ? colors.error : colors.textSecondary }}>0</Text>
          ) : (
            parseInt(amount, 10).toLocaleString()
          )}
          <Text style={{ color: cursorVisible && !hasError ? colors.primary : cursorVisible && hasError ? colors.error : 'transparent' }}>|</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  inputFocusWrapper: { backgroundColor: colors.surface, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  dateSelectorBtn: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.background, borderRadius: 20 },
  dateSelectorText: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary },
  inputDisplayArea: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAFAFC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minWidth: '80%' },
  inputDisplayAreaFocused: { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF' },
  inputDisplayAreaError: { borderColor: colors.error, backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : '#FFE5E5' },
  inputCurrency: { fontSize: 24, color: colors.textSecondary, marginRight: 8, fontWeight: 'bold' },
  inputCurrencyFocused: { color: colors.primary },
  inputCurrencyError: { color: colors.error },
  inputDisplayAmount: { fontSize: 48, fontWeight: 'bold', color: colors.textPrimary, letterSpacing: -1 },
  inputDisplayAmountError: { color: colors.error }
});