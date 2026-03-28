// src/components/dashboard/MonthlyBudgetEditModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { Category, MonthlyBudget, FamilyMember } from '../../types';
import { BudgetEvaluationCard } from '../settings/BudgetEvaluationCard';
import { BudgetEditModal } from '../settings/BudgetEditModal';
import { evaluateBudget } from '../../functions/budgetUtils';

interface MonthlyBudgetEditModalProps {
  visible: boolean;
  categories: Category[];
  familyMembers: FamilyMember[];
  monthlyBudget: MonthlyBudget;
  guideline: number;
  onSave: (budgets: Record<string, number>, bonusAllocation: Record<string, number>, deficitRule: MonthlyBudget['deficitRule']) => void;
  onClose: () => void;
}

export const MonthlyBudgetEditModal: React.FC<MonthlyBudgetEditModalProps> = ({ visible, categories, familyMembers, monthlyBudget, guideline, onSave, onClose }) => {
  const [localBudgets, setLocalBudgets] = useState<Record<string, number>>({});
  const [localAllocation, setLocalAllocation] = useState<Record<string, number>>({});
  const [localRule, setLocalRule] = useState<MonthlyBudget['deficitRule']>('みんなで折半');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (visible) {
      setLocalBudgets({ ...monthlyBudget.budgets });
      setLocalAllocation({ ...monthlyBudget.bonusAllocation });
      setLocalRule(monthlyBudget.deficitRule || 'みんなで折半');
    }
  }, [visible, monthlyBudget]);

  const adults = familyMembers.filter(m => m.role === '大人');
  const fixedMonthlyBudget = categories.filter(cat => cat.isFixed).reduce((sum, cat) => sum + (localBudgets[cat.id] || 0), 0);
  const evaluation = evaluateBudget(fixedMonthlyBudget, guideline);
  const hasChild = categories.some(cat => cat.name === '養育費');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}><Text style={styles.cancelText}>キャンセル</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>今月の予算編成</Text>
          <TouchableOpacity onPress={() => onSave(localBudgets, localAllocation, localRule)} style={styles.headerBtn}><Text style={styles.saveText}>保存</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BudgetEvaluationCard fixedMonthlyBudget={fixedMonthlyBudget} averageGuideline={guideline} evaluation={evaluation} hasChild={hasChild} />
          
          <Text style={styles.sectionTitle}>💰 今月のへそくりルール</Text>
          <View style={styles.ruleCard}>
            <Text style={styles.ruleLabel}>余ったお金（へそくり）の配分比率</Text>
            {adults.map(adult => (
              <View key={adult.id} style={styles.allocRow}>
                <Text style={styles.allocName}>{adult.name}</Text>
                <View style={styles.allocInputWrap}>
                  <TextInput
                    style={styles.allocInput}
                    keyboardType="number-pad"
                    value={String(localAllocation[adult.id] || 0)}
                    onChangeText={(val) => setLocalAllocation(prev => ({ ...prev, [adult.id]: parseInt(val, 10) || 0 }))}
                  />
                  <Text style={styles.allocPercent}>%</Text>
                </View>
              </View>
            ))}

            <View style={styles.ruleDivider} />
            
            <Text style={styles.ruleLabel}>予算オーバー時のカバー方法</Text>
            <View style={styles.ruleSelectors}>
              {(['みんなで折半', '配分比率でカバー', 'お小遣いは減らさない'] as MonthlyBudget['deficitRule'][]).map(rule => (
                <TouchableOpacity key={rule} style={[styles.ruleBtn, localRule === rule && styles.ruleBtnActive]} onPress={() => setLocalRule(rule)}>
                  <Text style={[styles.ruleBtnText, localRule === rule && styles.ruleBtnTextActive]}>{rule}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>📋 カテゴリ別予算（タップで編集）</Text>
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

      <BudgetEditModal visible={!!editingCategory} category={editingCategory ? { ...editingCategory, budget: localBudgets[editingCategory.id] || 0 } : null} onSave={(id, v) => { setLocalBudgets(p => ({ ...p, [id]: v })); setEditingCategory(null); }} onClose={() => setEditingCategory(null)} />
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
  ruleCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  ruleLabel: { fontSize: 13, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 12 },
  allocRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  allocName: { fontSize: 14, color: '#1C1C1E', fontWeight: '500' },
  allocInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, width: 80 },
  allocInput: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'right', padding: 0 },
  allocPercent: { fontSize: 12, color: '#8E8E93', marginLeft: 4 },
  ruleDivider: { height: 1, backgroundColor: '#E5E5EA', marginVertical: 16 },
  ruleSelectors: { flexDirection: 'row', justifyContent: 'space-between' },
  ruleBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, backgroundColor: '#F2F2F7', borderRadius: 6, marginHorizontal: 2 },
  ruleBtnActive: { backgroundColor: '#007AFF' },
  ruleBtnText: { fontSize: 10, fontWeight: 'bold', color: '#8E8E93' },
  ruleBtnTextActive: { color: '#FFFFFF' },
  listCard: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 40 },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginLeft: 16 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  categoryInfo: { flexDirection: 'row', alignItems: 'center' },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 8 },
  fixedBadge: { fontSize: 10, backgroundColor: '#007AFF', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold', overflow: 'hidden' },
  budgetActionWrap: { flexDirection: 'row', alignItems: 'center' },
  categoryBudgetText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 8 },
  chevron: { fontSize: 20, color: '#C7C7CC', fontWeight: 'bold', paddingBottom: 2 },
});