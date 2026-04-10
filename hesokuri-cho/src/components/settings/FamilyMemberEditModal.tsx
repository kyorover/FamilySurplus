// src/components/settings/FamilyMemberEditModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { FamilyMember } from '../../types';

interface FamilyMemberEditModalProps {
  member: FamilyMember | null;
  onSave: (updatedMember: FamilyMember) => void;
  onClose: () => void;
}

export const FamilyMemberEditModal: React.FC<FamilyMemberEditModalProps> = ({ member, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [hasPocketMoney, setHasPocketMoney] = useState(false);
  const [pocketMoneyAmount, setPocketMoneyAmount] = useState('');

  // 渡されたメンバーが変更されたらローカルステートに反映
  useEffect(() => {
    if (member) {
      setName(member.name);
      setAge(member.age !== undefined ? String(member.age) : '');
      setHasPocketMoney(member.hasPocketMoney || false);
      setPocketMoneyAmount(member.pocketMoneyAmount ? String(member.pocketMoneyAmount) : '');
    }
  }, [member]);

  const handleSave = () => {
    if (member && name.trim()) {
      onSave({ 
        ...member, 
        name: name.trim(),
        // 子供の場合のみ年齢を保存し、大人の場合は undefined にする（AddModalと同期）
        age: member.role === '子供' && age.trim() !== '' ? parseInt(age, 10) : undefined,
        hasPocketMoney,
        pocketMoneyAmount: hasPocketMoney && pocketMoneyAmount ? parseInt(pocketMoneyAmount, 10) : 0
      });
      onClose();
    }
  };

  return (
    <Modal visible={!!member} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>メンバー情報の編集</Text>
          
          <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName} 
            placeholder="名前"
          />

          {/* 子供の場合のみ年齢入力フィールドを表示（AddModalの仕様に準拠） */}
          {member?.role === '子供' && (
            <TextInput 
              style={styles.input} 
              value={age} 
              onChangeText={setAge} 
              placeholder="年齢（任意）"
              keyboardType="numeric"
            />
          )}

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>小遣い制にする</Text>
            <Switch value={hasPocketMoney} onValueChange={setHasPocketMoney} />
          </View>

          {hasPocketMoney && (
            <TextInput 
              style={styles.input} 
              placeholder="月額（円）" 
              keyboardType="numeric" 
              value={pocketMoneyAmount} 
              onChangeText={setPocketMoneyAmount} 
            />
          )}

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
  input: { backgroundColor: '#F2F2F7', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, fontSize: 16, color: '#1C1C1E' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  switchLabel: { fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cancelButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 8, marginRight: 8 },
  saveButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#007AFF', borderRadius: 8, marginLeft: 8 },
  cancelButtonText: { fontWeight: 'bold', color: '#8E8E93', fontSize: 16 },
  saveButtonText: { fontWeight: 'bold', color: '#FFFFFF', fontSize: 16 },
});