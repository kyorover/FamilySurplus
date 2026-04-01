// src/components/settings/FamilyMemberEditModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { FamilyMember } from '../../types';

interface FamilyMemberEditModalProps {
  member: FamilyMember | null;
  onSave: (updatedMember: FamilyMember) => void;
  onClose: () => void;
}

export const FamilyMemberEditModal: React.FC<FamilyMemberEditModalProps> = ({ member, onSave, onClose }) => {
  const [name, setName] = useState('');

  // 渡されたメンバーが変更されたらローカルステートに反映
  useEffect(() => {
    if (member) {
      setName(member.name);
    }
  }, [member]);

  const handleSave = () => {
    if (member && name.trim()) {
      onSave({ ...member, name: name.trim() });
      onClose();
    }
  };

  return (
    <Modal visible={!!member} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>名前の編集</Text>
          <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName} 
            autoFocus 
            placeholder="名前を入力"
            placeholderTextColor="#C7C7CC"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存</Text>
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
  input: { backgroundColor: '#F2F2F7', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24, fontSize: 16, color: '#1C1C1E' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 8, marginRight: 8 },
  cancelButtonText: { fontWeight: 'bold', color: '#8E8E93' },
  saveButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#007AFF', borderRadius: 8, marginLeft: 8 },
  saveButtonText: { fontWeight: 'bold', color: '#FFFFFF' },
});