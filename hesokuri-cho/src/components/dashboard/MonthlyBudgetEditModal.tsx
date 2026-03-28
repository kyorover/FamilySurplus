// src/components/dashboard/MonthlyBudgetEditModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Category, MonthlyBudget } from '../../types';
import { BudgetEvaluationCard } from '../settings/BudgetEvaluationCard';
import { BudgetEditModal } from '../settings/BudgetEditModal';
import { calculateAverageGuideline, evaluateBudget } from '../../functions/budgetUtils';

interface MonthlyBudgetEditModalProps {
  visible: boolean;
  categories: Category[];
  monthlyBudget: MonthlyBudget;
  guideline: number;
  onSave: (newBudgets: Record<string, number>) => void;
  onClose: () => void;
}

export const MonthlyBudgetEditModal: React.FC<MonthlyBudgetEditModalProps> = ({ visible, categories, monthlyBudget, guideline, onSave, onClose }) => {
  const [localBudgets, setLocalBudgets] = useState<Record<string, number>>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (visible) setLocalBudgets({ ...monthlyBudget.budgets });
  }, [visible, monthlyBudget]);

  const totalMonthlyBudget = categories.reduce((sum, cat) => sum + (localBudgets[cat.id] || 0), 0);
  const evaluation = evaluateBudget(totalMonthlyBudget, guideline);

  const handleSaveItem = (categoryId: string, newBudget: number) => {
    setLocalBudgets(prev => ({ ...prev, [categoryId]: newBudget }));
    setEditingCategory(null);
  };

  const pseudoCategoryForEdit = editingCategory ? { ...editingCategory, budget: localBudgets[editingCategory.id] || 0 } : null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}><Text style={styles.cancelText}>キャンセル</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>今月の予算編成</Text>
          <TouchableOpacity onPress={() => onSave(localBudgets)} style={styles.headerBtn}><Text style={styles.saveText}>保存</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BudgetEvaluationCard totalMonthlyBudget={totalMonthlyBudget} averageGuideline={guideline} evaluation={evaluation} />
          
          <Text style={styles.sectionTitle}>カテゴリ別予算（タップで編集）</Text>
          <View style={styles.listCard}>
            {categories.map((cat, index) => (
              <View key={cat.id}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity style={styles.categoryRow} activeOpacity={0.6} onPress={() => setEditingCategory(cat)}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    {cat.isFixed && <Text style={styles.fixedBadge}>固定</Text>}
                  </View>
                  <View style={styles.budgetActionWrap}>
                    <Text style={styles.categoryBudgetText}>￥{(localBudgets[cat.id] || 0).toLocaleString()}</Text>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BudgetEditModal visible={!!editingCategory} category={pseudoCategoryForEdit} onSave={handleSaveItem} onClose={() => setEditingCategory(null)} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  cancelText: { fontSize: 16, color: '#007AFF' },
  saveText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  scrollContent: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93', marginLeft: 8, marginBottom: 8 },
  listCard: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginLeft: 16 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  categoryInfo: { flexDirection: 'row', alignItems: 'center' },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 8 },
  fixedBadge: { fontSize: 10, backgroundColor: '#007AFF', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold', overflow: 'hidden' },
  budgetActionWrap: { flexDirection: 'row', alignItems: 'center' },
  categoryBudgetText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 8 },
  chevron: { fontSize: 20, color: '#C7C7CC', fontWeight: 'bold', paddingBottom: 2 },
});