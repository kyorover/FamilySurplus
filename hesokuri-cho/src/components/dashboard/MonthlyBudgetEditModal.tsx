// src/components/dashboard/MonthlyBudgetEditModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Category, MonthlyBudget } from '../../types';
import { BudgetFrame } from '../budget/BudgetFrame'; // ▼ 新設した共通フレーム
import { BudgetEditModal } from '../settings/BudgetEditModal';

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

  // 編集中の予算額をマージした表示用カテゴリリスト
  const displayCategories = categories.map(cat => ({
    ...cat,
    budget: localBudgets[cat.id] || 0
  }));

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
          {/* 【根本解決】独自計算を廃止し、共通フレームに全てを委ねる */}
          <BudgetFrame 
            categories={displayCategories}
            guideline={guideline}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  cancelText: { fontSize: 16, color: '#007AFF' },
  saveText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  scrollContent: { padding: 16 },
});