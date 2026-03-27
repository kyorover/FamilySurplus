// src/screens/SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Alert } from 'react-native';
import { useHesokuriStore } from '../store';
import { BudgetEvaluationCard } from '../components/settings/BudgetEvaluationCard';
import { CategoryBudgetList } from '../components/settings/CategoryBudgetList';
import { BudgetEditModal } from '../components/settings/BudgetEditModal';
import { calculateAverageGuideline, evaluateBudget } from '../functions/budgetUtils';
import { HouseholdSettings, Category } from '../types';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useHesokuriStore();
  const [localSettings, setLocalSettings] = useState<HouseholdSettings | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings]);

  if (!localSettings) return null;

  const hasChild = localSettings.familyMembers.some(m => m.role === '子供');
  const activeCategories = localSettings.categories.filter(cat => 
    cat.isFixed && cat.name === '養育費' ? hasChild : true
  );

  const totalMonthlyBudget = activeCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const averageGuideline = calculateAverageGuideline(localSettings.familyMembers);
  const evaluation = evaluateBudget(totalMonthlyBudget, averageGuideline);

  const handleSaveBudget = (categoryId: string, newBudget: number) => {
    setLocalSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: prev.categories.map(cat => 
          cat.id === categoryId ? { ...cat, budget: newBudget } : cat
        )
      };
    });
    setEditingCategory(null);
  };

  const handleSaveAllToAWS = () => {
    updateSettings(localSettings);
    Alert.alert('完了', '設定を保存しました！');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BudgetEvaluationCard 
          totalMonthlyBudget={totalMonthlyBudget}
          averageGuideline={averageGuideline}
          evaluation={evaluation}
        />

        <Text style={styles.sectionTitle}>カテゴリ一覧と予算（タップで編集）</Text>
        <CategoryBudgetList 
          categories={activeCategories} 
          onCategoryPress={setEditingCategory} 
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveAllToAWS}>
          <Text style={styles.primaryButtonText}>設定を保存する</Text>
        </TouchableOpacity>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <BudgetEditModal 
        visible={!!editingCategory}
        category={editingCategory}
        onSave={handleSaveBudget}
        onClose={() => setEditingCategory(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93', marginLeft: 8, marginBottom: 8 },
  primaryButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});