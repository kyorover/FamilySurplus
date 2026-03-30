// src/components/input/InputScreenHeader.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface InputScreenHeaderProps {
  isEditing: boolean;
  hasReturnTarget: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const InputScreenHeader: React.FC<InputScreenHeaderProps> = ({ isEditing, hasReturnTarget, onCancel, onSubmit }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.sideColumn}>
        {hasReturnTarget && (
          <TouchableOpacity onPress={onCancel} style={styles.actionBtn}>
            <Text style={styles.cancelText}>キャンセル</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.centerColumn}>
        <Text style={styles.titleText}>支出の記録</Text>
      </View>
      
      <View style={styles.sideColumn}>
        <TouchableOpacity onPress={onSubmit} style={styles.actionBtn}>
          <Text style={styles.submitText}>{isEditing ? '修正' : '保存'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E5EA',
    zIndex: 100 // プルダウン等より上に表示
  },
  sideColumn: { flex: 1, justifyContent: 'center' },
  centerColumn: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { paddingVertical: 4 },
  titleText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  cancelText: { fontSize: 15, color: '#8E8E93' },
  submitText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', textAlign: 'right' }
});