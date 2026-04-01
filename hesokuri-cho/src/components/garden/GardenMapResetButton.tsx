// src/components/garden/GardenMapResetButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  onReset: () => void;
}

export const GardenMapResetButton: React.FC<Props> = ({ onReset }) => {
  return (
    <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.7}>
      <Text style={styles.resetText}>表示位置をリセット</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  resetBtn: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 8, zIndex: 1000,
  },
  resetText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});