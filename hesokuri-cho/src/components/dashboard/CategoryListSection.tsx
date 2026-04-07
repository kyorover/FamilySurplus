// src/components/dashboard/CategoryListSection.tsx
import React, { useState, useEffect } from 'react';
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
  // ★変更点：from/toではなく、保存時に新しい配列を丸ごと渡す形に変更
  onSaveOrder: (newList: Category[]) => void; 
  onDragStateChange: (isDragging: boolean) => void;
  onSelectCategory: (id: string) => void;
}

export const CategoryListSection: React.FC<CategoryListSectionProps> = ({
  categories, monthlyBudget, spentByCategory, isEditMode, setIsEditMode, onSaveOrder, onDragStateChange, onSelectCategory
}) => {
  // 並び替え用のローカルステート
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  // 通常モード時は親のデータと同期
  useEffect(() => {
    if (!isEditMode) {
      setLocalCategories(categories);
    }
  }, [categories, isEditMode]);

  // ドラッグ完了時（ローカルでのみ順序を入れ替える）
  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newData = [...localCategories];
    const [removed] = newData.splice(fromIndex, 1);
    newData.splice(toIndex, 0, removed);
    setLocalCategories(newData);
  };

  const handleStartEdit = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocalCategories(categories);
    setIsEditMode(true);
  };

  // キャンセル時は元の順序に戻してモード終了
  const handleCancel = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocalCategories(categories);
    setIsEditMode(false);
  };

  // 保存時はローカルの順序を親に渡して確定
  const handleSave = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onSaveOrder(localCategories);
    setIsEditMode(false);
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
      {/* モードによってヘッダーを完全に切り替える */}
      {!isEditMode ? (
        <View style={styles.header}>
          <Text style={styles.title}>カテゴリ別内訳</Text>
          <TouchableOpacity onPress={handleStartEdit} style={styles.btn}>
            <Text style={styles.btnText}>↕️ 並び替え</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerActionBtn}>
            <Text style={styles.cancelText}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.editTitle}>並び替え</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerActionBtn}>
            <Text style={styles.saveText}>保存</Text>
          </TouchableOpacity>
        </View>
      )}

      {isEditMode ? (
        <DragList 
          data={localCategories} 
          keyExtractor={(item) => item.id} 
          onReordered={handleReorder} 
          renderItem={renderItem} 
          onDragBegin={() => onDragStateChange(false)} 
          onDragEnd={() => onDragStateChange(true)} 
          scrollEnabled={false} 
        />
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
  
  // 通常時のヘッダー
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  btn: { backgroundColor: '#F2F2F7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  btnText: { color: '#1C1C1E', fontSize: 12, fontWeight: '600' },
  
  // 編集モード時のヘッダー
  editHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16, backgroundColor: '#E3F2FD', paddingVertical: 8, borderRadius: 8, marginHorizontal: 16 },
  headerActionBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  cancelText: { fontSize: 15, color: '#8E8E93', fontWeight: 'bold' },
  saveText: { fontSize: 15, color: '#007AFF', fontWeight: 'bold' },
  editTitle: { fontSize: 15, fontWeight: 'bold', color: '#1C1C1E' },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dragRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 4 },
  dragRowActive: { backgroundColor: '#F0F8FF', zIndex: 999, elevation: 5 },
  dragHandle: { paddingLeft: 20, paddingRight: 8, paddingVertical: 16, justifyContent: 'center' },
  dragIcon: { fontSize: 24, color: '#C7C7CC', fontWeight: '300' },
  progressWrap: { flex: 1, paddingHorizontal: 16 },
});