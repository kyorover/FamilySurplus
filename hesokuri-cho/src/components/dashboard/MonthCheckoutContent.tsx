// src/components/dashboard/MonthCheckoutContent.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface MonthCheckoutContentProps {
  year: string;
  month: string;
  hesokuriAmount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 月締め確定モーダルの表示内容（単一責務：UI描画）
 */
export const MonthCheckoutContent: React.FC<MonthCheckoutContentProps> = ({
  year,
  month,
  hesokuriAmount,
  onConfirm,
  onCancel,
}) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>🎉 先月の結果発表 🎉</Text>
      <Text style={styles.subtitle}>
        {year}年{month}月の月締めが完了しました。
      </Text>

      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>獲得したへそくり</Text>
        <Text style={styles.amountText}>
          ¥ {hesokuriAmount.toLocaleString()}
        </Text>
      </View>

      <Text style={styles.description}>
        よく頑張りました！{'\n'}
        記録した金額は「へそくり履歴」に送られます。{'\n'}
        （※あとから過去の支出を追加・修正しても自動で再計算されます）
      </Text>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={onConfirm}
        activeOpacity={0.8}
      >
        <Text style={styles.confirmButtonText}>へそくりを記録する</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        activeOpacity={0.8}
      >
        <Text style={styles.cancelButtonText}>あとで入力する</Text>
      </TouchableOpacity>
    </View>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: isDark ? 'rgba(255, 149, 0, 0.15)' : '#FFF4E5', // ▼ 変更: ダークモード対応
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  resultLabel: {
    fontSize: 14,
    color: isDark ? '#FF9F0A' : '#FF9500', // ▼ 変更: ダークモードで視認性の高いオレンジに
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: isDark ? '#32D74B' : '#34C759', // ▼ 変更: ダークモード対応の緑
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12, // キャンセルボタンとの余白
  },
  confirmButtonText: {
    color: '#FFFFFF', // ※色付き背景上の文字は白固定
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});