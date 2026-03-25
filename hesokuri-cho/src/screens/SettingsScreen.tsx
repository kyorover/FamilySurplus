// src/screens/SettingsScreen.tsx
import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Alert } from 'react-native';
import { useHesokuriStore } from '../store';
import { BudgetEvaluationCard } from '../components/settings/BudgetEvaluationCard';
import { CategoryBudgetList } from '../components/settings/CategoryBudgetList';
import { calculateAverageGuideline, evaluateBudget } from '../functions/budgetUtils';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useHesokuriStore();

  if (!settings) return null;

  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  const activeCategories = settings.categories.filter(cat => 
    cat.isFixed && cat.name === '養育費' ? hasChild : true
  );

  const totalMonthlyBudget = activeCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const averageGuideline = calculateAverageGuideline(settings.familyMembers);
  const evaluation = evaluateBudget(totalMonthlyBudget, averageGuideline);

  const handleSaveAll = () => {
    updateSettings(settings);
    Alert.alert('完了', '設定をAWSに保存しました！');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      
      <BudgetEvaluationCard 
        totalMonthlyBudget={totalMonthlyBudget}
        averageGuideline={averageGuideline}
        evaluation={evaluation}
      />

      <Text style={styles.sectionTitle}>カテゴリ一覧と予算</Text>
      <CategoryBudgetList categories={activeCategories} />

      <TouchableOpacity style={styles.primaryButton} onPress={handleSaveAll}>
        <Text style={styles.primaryButtonText}>設定を保存する</Text>
      </TouchableOpacity>
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#8E8E93', 
    marginLeft: 8, 
    marginBottom: 8 
  },
  primaryButton: { 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    borderRadius: 8 
  },
  primaryButtonText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 16, 
    textAlign: 'center' 
  },
});