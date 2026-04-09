// src/components/dashboard/MonthCheckoutModal.tsx
import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ExpenseRecord } from '../../types';
import { calculateConfirmedHesokuri } from '../../functions/budgetUtils';

interface MonthCheckoutModalProps {
  visible: boolean;
  monthId: string; // 確定対象の年月 (例: "2026-03")
  budgetAmount: number; // 確定対象月の予算総額
  expenses: ExpenseRecord[]; // 確定対象月の支出記録配列
  onConfirm: (confirmedAmount: number) => void; // 確定ボタン押下時のコールバック
}

/**
 * 月締め確定モーダル（単一責務：先月の結果発表とへそくり確定アクション）
 */
export const MonthCheckoutModal: React.FC<MonthCheckoutModalProps> = ({
  visible,
  monthId,
  budgetAmount,
  expenses,
  onConfirm,
}) => {
  // 純粋関数を用いて確定へそくり額を算出（マイナスの場合は0にクランプする等のビジネス要件があればここで調整）
  const hesokuriAmount = useMemo(() => {
    const rawAmount = calculateConfirmedHesokuri(budgetAmount, expenses);
    return Math.max(0, rawAmount); // 赤字(マイナス)の場合は一旦0円として扱う
  }, [budgetAmount, expenses]);

  const [year, month] = monthId.split('-');

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.overlay}>
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
            確定した金額は「へそくり履歴」に記録されます。{'\n'}
            （※確定後は過去の支出を変更しても金額は変動しません）
          </Text>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => onConfirm(hesokuriAmount)}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>へそくりを確定する</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});