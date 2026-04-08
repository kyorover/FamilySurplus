// src/components/settings/FamilyMemberAddModal.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { FamilyMember } from '../../types';

interface FamilyMemberAddModalProps {
  visible: boolean;
  onSave: (member: FamilyMember) => void;
  onClose: () => void;
}

export const FamilyMemberAddModal: React.FC<FamilyMemberAddModalProps> = ({ visible, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'大人' | '子供'>('大人');
  const [age, setAge] = useState('');
  const [hasPocketMoney, setHasPocketMoney] = useState(false);
  const [pocketMoneyAmount, setPocketMoneyAmount] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: `m_${Date.now()}`,
      name: name.trim(),
      role,
      age: role === '子供' && age ? parseInt(age, 10) : undefined,
      hasPocketMoney,
      pocketMoneyAmount: hasPocketMoney && pocketMoneyAmount ? parseInt(pocketMoneyAmount, 10) : 0
    });
    // State Reset
    setName(''); setRole('大人'); setAge(''); setHasPocketMoney(false); setPocketMoneyAmount('');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>メンバーの追加</Text>
          
          <View style={styles.roleSelector}>
            <TouchableOpacity style={[styles.roleBtn, role === '大人' && styles.roleBtnActive]} onPress={() => setRole('大人')}>
              <Text style={[styles.roleBtnText, role === '大人' && styles.roleBtnTextActive]}>大人</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roleBtn, role === '子供' && styles.roleBtnActiveChild]} onPress={() => setRole('子供')}>
              <Text style={[styles.roleBtnText, role === '子供' && styles.roleBtnTextActive]}>子供</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="名前" />
          {role === '子供' && (
            <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="年齢（任意）" keyboardType="numeric" />
          )}

          {/* 役割(role)に関係なく小遣い設定スイッチを表示する */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>小遣い制にする</Text>
            <Switch value={hasPocketMoney} onValueChange={setHasPocketMoney} />
          </View>

          {hasPocketMoney && (
            <TextInput style={styles.input} placeholder="月額（円）" keyboardType="numeric" value={pocketMoneyAmount} onChangeText={setPocketMoneyAmount} />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>追加</Text>
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
  roleSelector: { flexDirection: 'row', marginBottom: 16 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 8, marginHorizontal: 4 },
  roleBtnActive: { backgroundColor: '#007AFF' },
  roleBtnActiveChild: { backgroundColor: '#34C759' },
  roleBtnText: { fontWeight: 'bold', color: '#8E8E93' },
  roleBtnTextActive: { color: '#FFFFFF' },
  input: { backgroundColor: '#F2F2F7', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  switchLabel: { fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cancelButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 8, marginRight: 8 },
  saveButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#007AFF', borderRadius: 8, marginLeft: 8 },
  cancelButtonText: { fontWeight: 'bold', color: '#8E8E93', fontSize: 16 },
  saveButtonText: { fontWeight: 'bold', color: '#FFFFFF', fontSize: 16 },
});