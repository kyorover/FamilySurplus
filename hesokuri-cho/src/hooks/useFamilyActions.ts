// src/hooks/useFamilyActions.ts
import { Alert } from 'react-native';
import { FamilyMember, HouseholdSettings } from '../types';

export const useFamilyActions = (
  pendingSettings: HouseholdSettings | null,
  setPendingSettings: (settings: HouseholdSettings) => void
) => {
  const updateFamily = (updatedMember: FamilyMember) => {
    if (!pendingSettings) return;
    const members = pendingSettings.familyMembers || [];
    setPendingSettings({ ...pendingSettings, familyMembers: members.map(m => m.id === updatedMember.id ? updatedMember : m) });
  };

  const addFamily = (member: FamilyMember) => {
    if (!pendingSettings) return;
    const members = pendingSettings.familyMembers || [];
    setPendingSettings({ ...pendingSettings, familyMembers: [...members, member] });
  };

  const deleteFamily = (memberId: string) => {
    if (!pendingSettings) return;
    const members = pendingSettings.familyMembers || [];
    const isAdult = members.find(m => m.id === memberId)?.role === '大人';
    const adultCount = members.filter(m => m.role === '大人').length;
    if (isAdult && adultCount <= 1) return Alert.alert('エラー', '大人は最低1人必要です');
    setPendingSettings({ ...pendingSettings, familyMembers: members.filter(m => m.id !== memberId) });
  };

  const updateFamilyList = (newList: FamilyMember[]) => {
    if (!pendingSettings) return;
    setPendingSettings({ ...pendingSettings, familyMembers: newList });
  };

  return { updateFamily, addFamily, deleteFamily, updateFamilyList };
};