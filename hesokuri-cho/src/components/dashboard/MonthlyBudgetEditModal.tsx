// src/components/dashboard/MonthlyBudgetEditModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Category, MonthlyBudget } from '../../types';
import { BudgetFrame } from '../budget/BudgetFrame'; // ▼ 新設した共通フレーム
import { BudgetEditModal } from '../settings/BudgetEditModal';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

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
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

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

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  cancelText: { fontSize: 16, color: colors.primary },
  saveText: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  scrollContent: { padding: 16 },
});