// src/components/dashboard/MonthlyBudgetEditModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Category, MonthlyBudget } from '../../types';
import { BudgetEvaluationCard } from '../settings/BudgetEvaluationCard';
import { CategoryBudgetList } from '../settings/CategoryBudgetList'; // ▼ 追加: 共通コンポーネントを使い回す
import { BudgetEditModal } from '../settings/BudgetEditModal';
import { evaluateBudget } from '../../functions/budgetUtils';
import { DEFAULT_CATEGORY_NAMES } from '../../constants';

interface MonthlyBudgetEditModalProps {
  visible: boolean;
  categories: Category[];
  monthlyBudget: MonthlyBudget;
  guideline: number;
  onSave: (newBudgets: Record<string, number>) => void;
  onClose: () => void;
}

export const MonthlyBudgetEditModal: React.FC<MonthlyBudgetEditModalProps> = ({ 
  visible, categories, monthlyBudget, guideline, onSave, onClose 
}) => {
  const [localBudgets, setLocalBudgets] = useState<Record<string, number>>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (visible) {
      setLocalBudgets({ ...monthlyBudget.budgets });
    }
  }, [visible, monthlyBudget]);

  // ▼ 設定画面のUIコンポーネント(CategoryBudgetList)に渡すため、
  // ローカルで編集中の予算額をマージし、計算対象外のカテゴリはリストから除外して整形する
  const displayCategories = categories
    .filter(cat => cat.isFixed || cat.isCalculationTarget !== false)
    .map(cat => ({
      ...cat,
      budget: localBudgets[cat.id] || 0
    }));

  // 【修正】評価対象となる予算総額の算出。固定費および計算対象カテゴリの合計値とする
  const totalTargetBudget = displayCategories.reduce((sum, cat) => sum + cat.budget, 0);
  
  // ダッシュボードから渡された、年齢考慮済みの正確な guideline を用いて評価
  const evaluation = evaluateBudget(totalTargetBudget, guideline);
  const hasChild = categories.some(cat => cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.cancelText}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>今月の予算編成</Text>
          <TouchableOpacity onPress={() => onSave(localBudgets)} style={styles.headerBtn}>
            <Text style={styles.saveText}>保存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BudgetEvaluationCard 
            fixedMonthlyBudget={totalTargetBudget} 
            averageGuideline={guideline} 
            evaluation={evaluation} 
            hasChild={hasChild} 
          />
          
          <Text style={styles.sectionTitle}>📋 カテゴリ別予算（タップで編集）</Text>
          
          {/* ▼ DRY原則: 設定画面と全く同じ共通UIコンポーネントを呼び出す */}
          <CategoryBudgetList 
            categories={displayCategories}
            onCategoryPress={setEditingCategory}
          />
        </ScrollView>
      </SafeAreaView>

      <BudgetEditModal 
        visible={!!editingCategory} 
        category={editingCategory} 
        onSave={(id, v) => { 
          setLocalBudgets(p => ({ ...p, [id]: v })); 
          setEditingCategory(null); 
        }} 
        onClose={() => setEditingCategory(null)} 
      />
    </Modal>
  );
};

// ▼ リスト用の冗長なスタイル定義を全て削除し、大幅にスリム化
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  cancelText: { fontSize: 16, color: '#007AFF' },
  saveText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  scrollContent: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93', marginLeft: 8, marginBottom: 8 },
});