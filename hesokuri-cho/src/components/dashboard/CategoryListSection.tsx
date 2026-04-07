// src/components/dashboard/CategoryListSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import { BudgetProgressBar } from './BudgetProgressBar';
import { Category, MonthlyBudget } from '../../types';

interface CategoryListSectionProps {
  categories: Category[];
  monthlyBudget: MonthlyBudget;
  spentByCategory: Record<string, number>;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  onReorder: (from: number, to: number) => void;
  onDragStateChange: (isDragging: boolean) => void;
  onSelectCategory: (id: string) => void;
}

export const CategoryListSection: React.FC<CategoryListSectionProps> = ({
  categories, monthlyBudget, spentByCategory, isEditMode, setIsEditMode, onReorder, onDragStateChange, onSelectCategory
}) => {
  const toggleEdit = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsEditMode(!isEditMode);
  };

  const renderItem = ({ item: cat, onDragStart, onDragEnd, isActive }: DragListRenderItemInfo<Category>) => (
    <View style={[styles.dragRow, isActive && styles.dragRowActive]}>
      <TouchableOpacity activeOpacity={0.6} onPressIn={onDragStart} onPressOut={onDragEnd} style={styles.dragHandle}>
        <Text style={[styles.dragIcon, isActive && { color: '#007AFF' }]}>≡</Text>
      </TouchableOpacity>
      <View style={styles.progressWrap} pointerEvents="none">
        <BudgetProgressBar categoryId={cat.id} categoryName={cat.name} budget={monthlyBudget.budgets[cat.id] || 0} spent={spentByCategory[cat.id] || 0} isCalculationTarget={cat.isCalculationTarget} onPressDetail={() => {}} />
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>カテゴリ別内訳</Text>
        <TouchableOpacity onPress={toggleEdit} style={isEditMode ? styles.btnActive : styles.btn}>
          <Text style={isEditMode ? styles.btnTextActive : styles.btnText}>{isEditMode ? '✅ 完了' : '↕️ 並び替え'}</Text>
        </TouchableOpacity>
      </View>

      {isEditMode ? (
        <DragList data={categories} keyExtractor={(item) => item.id} onReordered={onReorder} renderItem={renderItem} onDragBegin={() => onDragStateChange(false)} onDragEnd={() => onDragStateChange(true)} scrollEnabled={false} />
      ) : (
        <View>
          {categories.map(cat => (
            <View key={cat.id} style={styles.row}>
              <View style={styles.progressWrap}>
                <BudgetProgressBar categoryId={cat.id} categoryName={cat.name} budget={monthlyBudget.budgets[cat.id] || 0} spent={spentByCategory[cat.id] || 0} isCalculationTarget={cat.isCalculationTarget} onPressDetail={onSelectCategory} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 24, paddingVertical: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  btn: { backgroundColor: '#F2F2F7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  btnText: { color: '#1C1C1E', fontSize: 12, fontWeight: '600' },
  btnActive: { backgroundColor: '#007AFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  btnTextActive: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dragRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 4 },
  dragRowActive: { backgroundColor: '#F0F8FF', zIndex: 999, elevation: 5 },
  dragHandle: { paddingLeft: 20, paddingRight: 8, paddingVertical: 16, justifyContent: 'center' },
  dragIcon: { fontSize: 24, color: '#C7C7CC', fontWeight: '300' },
  progressWrap: { flex: 1, paddingHorizontal: 16 },
});