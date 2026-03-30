// src/hooks/useExpenseSubmit.ts
import { Alert } from 'react-native';
import { useHesokuriStore } from '../store';

export const useExpenseSubmit = (onComplete: () => void, setIsAmountFocused: (val: boolean) => void) => {
  const { settings, expenseInput, setExpenseInput, saveExpenseInput, returnToCategoryDetail, updateSettings, resetExpenseInput } = useHesokuriStore();

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
            // カレンダー復帰フラグは維持し、入力状態のみをリセットすることで元のカレンダーに戻る
            resetExpenseInput();
            setIsAmountFocused(false);
            onComplete();
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
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
      
      // 保存完了後も、元の仕様通り returnToCategoryDetail の状態に従ってカレンダーに復帰する
      onComplete();
    } catch (e: any) {
      Alert.alert('エラー', e.message);
    }
  };

  return { handleSubmit, handleCancel, hasReturnTarget: !!returnToCategoryDetail };
};