// src/hooks/useExpenseSubmit.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { useHesokuriStore } from '../store';

export const useExpenseSubmit = (onComplete: () => void, setIsAmountFocused: (val: boolean) => void) => {
  const { settings, expenseInput, setExpenseInput, saveExpenseInput, returnToCategoryDetail, updateSettings, resetExpenseInput } = useHesokuriStore();
  const [isAmountError, setIsAmountError] = useState(false);

  const handleCancel = () => {
    Alert.alert(
      '入力を破棄しますか？',
      '入力中の内容は保存されません。',
      [
        { text: 'いいえ', style: 'cancel' },
        { 
          text: 'はい', 
          style: 'destructive', 
          onPress: () => {
            resetExpenseInput();
            setIsAmountFocused(false);
            onComplete();
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    // ゼロ円バリデーション（視覚的エラーを有効化）
    if (!expenseInput.amount || expenseInput.amount === '0') {
      setIsAmountError(true);
      Alert.alert('エラー', '金額が入力されていません');
      return;
    }

    try {
      const displayDate = expenseInput.date || new Date().toISOString().slice(0, 10);
      if (!expenseInput.date) setExpenseInput({ date: displayDate });

      let settingsUpdated = false;
      const newSettings = settings ? { ...settings } : null;
      const newStore = expenseInput.storeName?.trim();
      const newMemo = expenseInput.memo?.trim();

      if (newSettings && newStore) {
        const currentStoreHistory = newSettings.storeNameHistory || [];
        if (!currentStoreHistory.includes(newStore)) {
          newSettings.storeNameHistory = [newStore, ...currentStoreHistory].slice(0, 50);
          settingsUpdated = true;
        }
      }
      if (newSettings && newMemo) {
        const currentMemoHistory = newSettings.memoHistory || [];
        if (!currentMemoHistory.includes(newMemo)) {
          newSettings.memoHistory = [newMemo, ...currentMemoHistory].slice(0, 50);
          settingsUpdated = true;
        }
      }

      if (settingsUpdated && newSettings) updateSettings(newSettings);

      await saveExpenseInput();
      Alert.alert('完了', '記録を保存しました！');
      setIsAmountFocused(false);
      onComplete(); // App.tsx側でforce=trueフラグ付きで処理される
    } catch (e: any) {
      Alert.alert('エラー', e.message);
    }
  };

  return { handleSubmit, handleCancel, hasReturnTarget: !!returnToCategoryDetail, isAmountError, setIsAmountError };
};