// src/components/input/ExpenseInputPad.tsx
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface ExpenseInputPadProps {
  onKeyPress: (val: string) => void;
}

export const ExpenseInputPad: React.FC<ExpenseInputPadProps> = ({ onKeyPress }) => {
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

  const padLayout = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['00', '0', 'BS']
  ];

  return (
    <View style={styles.numpadContainer}>
      {padLayout.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.numpadRow}>
          {row.map(key => (
            <TouchableOpacity 
              key={key} 
              style={styles.numpadBtn} 
              onPress={() => onKeyPress(key)}
            >
              <Text style={styles.numpadBtnText}>
                {key === 'BS' ? '⌫' : key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  numpadContainer: { 
    padding: 16, 
    backgroundColor: colors.surface, 
    flex: 1, 
    justifyContent: 'center' 
  },
  numpadRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  numpadBtn: { 
    flex: 1, 
    backgroundColor: colors.background, 
    marginHorizontal: 6, 
    paddingVertical: 18, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  numpadBtnText: { 
    fontSize: 24, 
    fontWeight: '500', 
    color: colors.textPrimary 
  }
});