// src/components/settings/FamilyMemberEditModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { FamilyMember } from '../../types';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface FamilyMemberEditModalProps {
  member: FamilyMember | null;
  onSave: (updatedMember: FamilyMember) => void;
  onClose: () => void;
}

export const FamilyMemberEditModal: React.FC<FamilyMemberEditModalProps> = ({ member, onSave, onClose }) => {
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

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
      // ▼ 追加: 子供の場合は年齢入力を必須とし、未入力なら保存させない
      if (member.role === '子供' && !age.trim()) return;

      onSave({ 
        ...member, 
        name: name.trim(),
        // ▼ 変更: 子供の場合は必ず年齢をパースして保存し、大人の場合は undefined にする
        age: member.role === '子供' ? parseInt(age, 10) : undefined,
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
            placeholderTextColor={colors.textSecondary} // ▼ 追加
          />

          {/* ▼ 変更: プレースホルダーを必須に変更 */}
          {member?.role === '子供' && (
            <TextInput 
              style={styles.input} 
              value={age} 
              onChangeText={setAge} 
              placeholder="年齢（必須）"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary} // ▼ 追加
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
              placeholderTextColor={colors.textSecondary} // ▼ 追加
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

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', backgroundColor: colors.surface, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, fontSize: 16, color: colors.textPrimary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  switchLabel: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cancelButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.border, borderRadius: 8, marginRight: 8 },
  saveButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8, marginLeft: 8 },
  cancelButtonText: { fontWeight: 'bold', color: colors.textSecondary, fontSize: 16 },
  saveButtonText: { fontWeight: 'bold', color: '#FFFFFF', fontSize: 16 }, // ※プライマリカラー上の文字は白固定
});