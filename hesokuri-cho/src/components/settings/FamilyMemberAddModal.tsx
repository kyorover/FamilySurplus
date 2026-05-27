// src/components/settings/FamilyMemberAddModal.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { FamilyMember } from '../../types';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface FamilyMemberAddModalProps {
  visible: boolean;
  onSave: (member: FamilyMember) => void;
  onClose: () => void;
}

export const FamilyMemberAddModal: React.FC<FamilyMemberAddModalProps> = ({ visible, onSave, onClose }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  const [name, setName] = useState('');
  const [role, setRole] = useState<'大人' | '子供'>('大人');
  const [age, setAge] = useState('');
  const [hasPocketMoney, setHasPocketMoney] = useState(false);
  const [pocketMoneyAmount, setPocketMoneyAmount] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    // ▼ 変更: 子供の場合は年齢入力を必須とし、未入力なら保存させない
    if (role === '子供' && !age.trim()) return;

    onSave({
      id: `m_${Date.now()}`,
      name: name.trim(),
      role,
      age: role === '子供' ? parseInt(age, 10) : undefined,
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

          <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName} 
            placeholder="名前" 
            placeholderTextColor={colors.textSecondary} // ▼ 追加
          />
          
          {/* ▼ 変更: プレースホルダーを必須に変更（コメント位置を外に移動） */}
          {role === '子供' && (
            <TextInput 
              style={styles.input} 
              value={age} 
              onChangeText={setAge} 
              placeholder="年齢（必須）" 
              keyboardType="numeric" 
              placeholderTextColor={colors.textSecondary} // ▼ 追加
            />
          )}

          {/* 役割(role)に関係なく小遣い設定スイッチを表示する */}
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
              <Text style={styles.saveButtonText}>追加</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', backgroundColor: colors.surface, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20, textAlign: 'center' },
  roleSelector: { flexDirection: 'row', marginBottom: 16 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.background, borderRadius: 8, marginHorizontal: 4 },
  roleBtnActive: { backgroundColor: colors.primary },
  roleBtnActiveChild: { backgroundColor: isDark ? '#32D74B' : '#34C759' }, // ▼ 変更: ダークモード時は視認性の高い緑に
  roleBtnText: { fontWeight: 'bold', color: colors.textSecondary },
  roleBtnTextActive: { color: '#FFFFFF' }, // ※アクセントカラー上の文字は白固定
  input: { backgroundColor: colors.background, color: colors.textPrimary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  switchLabel: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cancelButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.border, borderRadius: 8, marginRight: 8 },
  saveButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8, marginLeft: 8 },
  cancelButtonText: { fontWeight: 'bold', color: colors.textSecondary, fontSize: 16 },
  saveButtonText: { fontWeight: 'bold', color: '#FFFFFF', fontSize: 16 }, // ※プライマリカラー上の文字は白固定
});