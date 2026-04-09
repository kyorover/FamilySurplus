// src/components/dashboard/MonthCheckoutModal.tsx
import React, { useMemo } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { ExpenseRecord } from '../../types';
import { calculateConfirmedHesokuri } from '../../functions/budgetUtils';
import { MonthCheckoutContent } from './MonthCheckoutContent';

interface MonthCheckoutModalProps {
  visible: boolean;
  monthId: string; // 確定対象の年月 (例: "2026-03")
  budgetAmount: number; // 確定対象月の予算総額
  expenses: ExpenseRecord[]; // 確定対象月の支出記録配列
  onConfirm: (confirmedAmount: number) => void; // 確定ボタン押下時のコールバック
  onCancel: () => void; // 追加: キャンセル（あとで）ボタン押下時のコールバック
}

/**
 * 月締め確定モーダル（単一責務：モーダル制御とデータ計算）
 */
export const MonthCheckoutModal: React.FC<MonthCheckoutModalProps> = ({
  visible,
  monthId,
  budgetAmount,
  expenses,
  onConfirm,
  onCancel,
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
        <MonthCheckoutContent
          year={year}
          month={month}
          hesokuriAmount={hesokuriAmount}
          onConfirm={() => onConfirm(hesokuriAmount)}
          onCancel={onCancel}
        />
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
});