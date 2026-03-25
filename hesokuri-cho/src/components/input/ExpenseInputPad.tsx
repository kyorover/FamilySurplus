// src/components/input/ExpenseInputPad.tsx
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';

interface ExpenseInputPadProps {
  onKeyPress: (val: string) => void;
}

export const ExpenseInputPad: React.FC<ExpenseInputPadProps> = ({ onKeyPress }) => {
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

const styles = StyleSheet.create({
  numpadContainer: { 
    padding: 16, 
    backgroundColor: '#FFFFFF', 
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
    backgroundColor: '#F2F2F7', 
    marginHorizontal: 6, 
    paddingVertical: 18, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  numpadBtnText: { 
    fontSize: 24, 
    fontWeight: '500', 
    color: '#1C1C1E' 
  }
});