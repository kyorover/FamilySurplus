// src/components/settings/BudgetEditModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Category } from '../../types';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface BudgetEditModalProps {
  visible: boolean;
  category: Category | null;
  onSave: (categoryId: string, newBudget: number) => void;
  onClose: () => void;
}

export const BudgetEditModal: React.FC<BudgetEditModalProps> = ({ visible, category, onSave, onClose }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (category) {
      setInputValue(String(category.budget));
    }
  }, [category, visible]);

  const handleSave = () => {
    if (!category) return;
    const newBudget = parseInt(inputValue, 10);
    // 空欄の場合は0として扱う
    if (isNaN(newBudget) || newBudget < 0) {
      onSave(category.id, 0);
      return;
    }
    onSave(category.id, newBudget);
  };

  if (!category) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
              selectTextOnFocus={true} // フォーカス時にテキストを全選択
              onFocus={() => {
                if (inputValue === '0') setInputValue(''); // 0の場合は空にして入力を受け入れる
              }}
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

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', backgroundColor: colors.surface, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20, textAlign: 'center' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24 },
  currencyMark: { fontSize: 18, color: colors.textSecondary, marginRight: 8 },
  textInput: { flex: 1, fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA', borderRadius: 8, marginRight: 8 }, // ▼ 変更: ダークモードで視認性を調整
  cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary },
  saveButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8, marginLeft: 8 },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }, // ※色付き背景上の文字は白固定
});