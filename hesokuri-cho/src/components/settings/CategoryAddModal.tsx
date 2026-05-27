// src/components/settings/CategoryAddModal.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface CategoryAddModalProps {
  visible: boolean;
  onSave: (categoryName: string) => void;
  onClose: () => void;
}

export const CategoryAddModal: React.FC<CategoryAddModalProps> = ({ visible, onSave, onClose }) => {
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

  const [inputValue, setInputValue] = useState('');

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setInputValue('');
    onClose(); // 保存後に確実にダイアログを閉じる
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>新しいカテゴリを追加</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="例：美容代、ガソリン代"
              placeholderTextColor={colors.textSecondary} // ▼ 変更: テーマのセカンダリテキスト色を適用
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus={true}
            />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
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

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', backgroundColor: colors.surface, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20, textAlign: 'center' },
  inputWrap: { backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24 },
  textInput: { fontSize: 16, color: colors.textPrimary },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.border, borderRadius: 8, marginRight: 8 },
  cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary },
  saveButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8, marginLeft: 8 },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }, // ※プライマリカラー上のテキストは白固定
});