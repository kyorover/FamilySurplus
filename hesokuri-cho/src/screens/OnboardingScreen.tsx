// src/screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { HouseholdSettings, FamilyMember, Category } from '../types';
import { useHesokuriStore } from '../store';
import { syncFixedCategories } from '../functions/categoryUtils';
import { FamilyMemberList } from '../components/settings/FamilyMemberList';
import { FamilyMemberAddModal } from '../components/settings/FamilyMemberAddModal';
import { CategoryBudgetList } from '../components/settings/CategoryBudgetList';
import { BudgetEditModal } from '../components/settings/BudgetEditModal';
import { DEFAULT_BUDGET_INITIAL_VALUE } from '../constants';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { updateSettings } = useHesokuriStore();
  const [step, setStep] = useState(1);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>(
    syncFixedCategories({ categories: [] } as any)
  );
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleNext = () => {
    if (step === 1 && members.length === 0) {
      Alert.alert('確認', '家族メンバーが登録されていません。少なくとも1人登録してください。');
      return;
    }
    setStep(2);
  };

  const handleComplete = async () => {
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
        ownedGardenItemIds: ['BG-01', 'PL-01'], // spriteConfig.ts に基づく初期値
        plantLevel: 1,
        plantExp: 0,
      };
      await updateSettings(initialSettings);
      onComplete(); 
    } catch (e) {
      Alert.alert('エラー', '初期設定の保存に失敗しました。');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ようこそ！ 初期設定</Text>
          <Text style={styles.stepIndicator}>Step {step} / 2</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View>
              <Text style={styles.desc}>まずはアプリを利用する家族構成を登録しましょう。</Text>
              <FamilyMemberList 
                members={members} 
                isReorderMode={false}
                onUpdate={(m) => setMembers(members.map(x => x.id === m.id ? m : x))}
                onDelete={(id) => setMembers(members.filter(x => x.id !== id))}
                onAdd={() => setAddModalVisible(true)}
                onEditClick={() => Alert.alert('案内', '詳細な編集は、初期設定を完了させた後に行えます。まずは一旦削除して再登録してください。')}
                onUpdateList={setMembers} 
                onDragStart={() => {}} onDragEnd={() => {}}
              />
              <FamilyMemberAddModal
                visible={isAddModalVisible}
                onSave={(newMember) => setMembers([...members, newMember])}
                onClose={() => setAddModalVisible(false)}
              />
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.desc}>毎月の支出カテゴリの予算目標を設定しましょう。（暫定の固定項目が表示されています）</Text>
              <CategoryBudgetList 
                categories={categories}
                onCategoryPress={(c) => setEditingCategory(c)}
              />
              <BudgetEditModal 
                visible={!!editingCategory} 
                category={editingCategory}
                onSave={(id, budget) => {
                  setCategories(categories.map(c => c.id === id ? { ...c, budget } : c));
                  setEditingCategory(null);
                }}
                onClose={() => setEditingCategory(null)}
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step === 1 ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>次へ進む</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
                <Text style={styles.secondaryButtonText}>戻る</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginLeft: 12 }]} onPress={handleComplete}>
                <Text style={styles.primaryButtonText}>設定を確定してはじめる</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 16, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  stepIndicator: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  desc: { textAlign: 'center', color: '#8E8E93', fontSize: 14, paddingHorizontal: 24, marginBottom: 16 },
  content: { flex: 1 },
  footer: { padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E5E5EA' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  primaryButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#E5E5EA', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#8E8E93', fontSize: 16, fontWeight: 'bold' },
});