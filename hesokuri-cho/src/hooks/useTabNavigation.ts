// src/hooks/useTabNavigation.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { useHesokuriStore } from '../store';

export type TabType = 'dashboard' | 'input' | 'settings' | 'history' | 'hesokuriHistory';
export type TabNavOptions = { forceTransition?: boolean; preserveCalendarState?: boolean; };

export const useTabNavigation = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const { 
    expenseInput, resetExpenseInput, setReturnToCategoryDetail, 
    settings, pendingSettings, setPendingSettings, updateSettings 
  } = useHesokuriStore();

  const executeTabChange = async (targetTab: TabType, options: TabNavOptions) => {
    if (targetTab === 'dashboard' && !options.preserveCalendarState) {
      setReturnToCategoryDetail(null, null);
    }
    if (activeTab === 'input' && targetTab !== 'input') {
      resetExpenseInput();
    }
    setActiveTab(targetTab);
  };

  const handleTabChange = (targetTab: TabType, options: TabNavOptions = {}) => {
    if (!options.forceTransition && activeTab === 'input' && targetTab !== 'input') {
      const isInputting = expenseInput.amount !== '0' || !!expenseInput.storeName || !!expenseInput.memo;
      if (isInputting) {
        Alert.alert(
          '入力を破棄しますか？', '入力中の内容は保存されません。',
          [
            { text: 'いいえ', style: 'cancel' },
            { text: 'はい', style: 'destructive', onPress: () => executeTabChange(targetTab, options) }
          ]
        );
        return;
      }
    }

    if (!options.forceTransition && activeTab === 'settings' && targetTab !== 'settings') {
      const hasSettingsChanged = settings && pendingSettings && JSON.stringify(settings) !== JSON.stringify(pendingSettings);
      if (hasSettingsChanged) {
        Alert.alert(
          '未保存の変更があります', '変更内容を保存しますか？',
          [
            { text: 'キャンセル', style: 'cancel' },
            { text: '破棄する', style: 'destructive', onPress: () => { 
              if (settings) setPendingSettings(JSON.parse(JSON.stringify(settings))); 
              executeTabChange(targetTab, options); 
            }},
            { text: '保存する', onPress: async () => { 
              if (pendingSettings) await updateSettings(pendingSettings); 
              executeTabChange(targetTab, options); 
            }}
          ]
        );
        return;
      }
    }
    executeTabChange(targetTab, options);
  };

  return { activeTab, handleTabChange };
};