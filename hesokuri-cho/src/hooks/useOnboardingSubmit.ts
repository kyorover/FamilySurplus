// src/hooks/useOnboardingSubmit.ts
import { Alert } from 'react-native';
import { useHesokuriStore } from '../store';
import { HouseholdSettings, FamilyMember, Category } from '../types';
import { DEFAULT_BUDGET_INITIAL_VALUE } from '../constants';

interface UseOnboardingSubmitProps {
  categories: Category[];
  members: FamilyMember[];
  onComplete: () => void;
}

export const useOnboardingSubmit = ({ categories, members, onComplete }: UseOnboardingSubmitProps) => {
  const { updateSettings, updateMonthlyBudget } = useHesokuriStore();

  const executeComplete = async () => {
    try {
      const initialSettings: HouseholdSettings = {
        householdId: `hh-${Date.now().toString(36)}`,
        familyMembers: members,
        categories: categories,
        notificationsEnabled: false,
        updatedAt: new Date().toISOString(),
        gardenPoints: 0,
        lastWateringDate: null,
        ownedGardenItemIds: ['BG-01', 'PL-01'],
        plantLevel: 1,
        plantExp: 0,
      };
      
      await updateSettings(initialSettings);

      const currentMonth = new Date().toISOString().slice(0, 7);
      const initialBudgets: Record<string, number> = {};
      categories.forEach(c => {
        initialBudgets[c.id] = c.budget;
      });
      await updateMonthlyBudget(initialBudgets, {}, 'みんなで折半', currentMonth);

      onComplete(); 
    } catch (e) {
      Alert.alert('エラー', '初期設定の保存に失敗しました。');
    }
  };

  const handleComplete = () => {
    const hasUnsetBudget = categories.some(c => c.budget === DEFAULT_BUDGET_INITIAL_VALUE);
    if (hasUnsetBudget) {
      Alert.alert('確認', '予算が「未設定」の項目があります。このまま始めてもよろしいですか？', [
        { text: '見直す', style: 'cancel' },
        { text: 'はじめる', style: 'default', onPress: executeComplete }
      ]);
      return;
    }
    executeComplete();
  };

  return { handleComplete };
};