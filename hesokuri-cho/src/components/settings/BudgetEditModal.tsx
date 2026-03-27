// src/components/settings/BudgetEditModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Category } from '../../types';

interface BudgetEditModalProps {
  visible: boolean;
  category: Category | null;
  onSave: (categoryId: string, newBudget: number) => void;
  onClose: () => void;
}

export const BudgetEditModal: React.FC<BudgetEditModalProps> = ({ visible, category, onSave, onClose }) => {
  const [inputValue, setInputValue] = useState('');

  // モーダルが開くたびに、選択されたカテゴリの現在の予算額をセットする
  useEffect(() => {
    if (category) {
      setInputValue(String(category.budget));
    }
  }, [category, visible]);

  const handleSave = () => {
    if (!category) return;
    const newBudget = parseInt(inputValue, 10);
    if (isNaN(newBudget) || newBudget < 0) return;
    onSave(category.id, newBudget);
  };

  if (!category) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{category.name}の予算を設定</Text>
          
          <View style={styles.inputWrap}>
            <Text style={styles.currencyMark}>￥</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus={true}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>決定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 20, textAlign: 'center' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24 },
  currencyMark: { fontSize: 18, color: '#8E8E93', marginRight: 8 },
  textInput: { flex: 1, fontSize: 24, fontWeight: 'bold', color: '#1C1C1E' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#E5E5EA', borderRadius: 8, marginRight: 8 },
  cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: '#8E8E93' },
  saveButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#007AFF', borderRadius: 8, marginLeft: 8 },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});