// src/components/dashboard/MonthCheckoutContent.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FFFFFF',
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
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: '#FFF4E5', // 暖色系の背景でポジティブな印象
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  resultLabel: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },
  description: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12, // キャンセルボタンとの余白
  },
  confirmButtonText: {
    color: '#FFFFFF',
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
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
});