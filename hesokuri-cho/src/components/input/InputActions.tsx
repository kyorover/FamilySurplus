// src/components/input/InputActions.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface InputActionsProps {
  isEditing: boolean;
  hasReturnTarget: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const InputActions: React.FC<InputActionsProps> = ({ isEditing, hasReturnTarget, onCancel, onSubmit }) => {
  return (
    <View style={styles.actionRow}>
      {hasReturnTarget && (
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>キャンセル</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.submitBtn, hasReturnTarget && styles.submitBtnHalf]} onPress={onSubmit}>
        <Text style={styles.submitBtnText}>{isEditing ? '修正を保存する' : 'この内容で記録する'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, marginBottom: 32, gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#E5E5EA', paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: '#8E8E93', fontSize: 16, fontWeight: 'bold' },
  submitBtn: { flex: 1, backgroundColor: '#007AFF', paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnHalf: { flex: 2 },
  submitBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});