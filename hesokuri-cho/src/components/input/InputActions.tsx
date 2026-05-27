// src/components/input/InputActions.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface InputActionsProps {
  isEditing: boolean;
  hasReturnTarget: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const InputActions: React.FC<InputActionsProps> = ({ isEditing, hasReturnTarget, onCancel, onSubmit }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

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

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, marginBottom: 32, gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA', paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, // ▼ 変更: ダークモードで視認性を調整
  cancelBtnText: { color: colors.textSecondary, fontSize: 16, fontWeight: 'bold' }, // ▼ 変更
  submitBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }, // ▼ 変更
  submitBtnHalf: { flex: 2 },
  submitBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }, // ※色付き背景上の文字は白固定
});