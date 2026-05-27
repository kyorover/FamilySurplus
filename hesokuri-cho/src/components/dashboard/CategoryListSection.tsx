// src/components/dashboard/CategoryListSection.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import { BudgetProgressBar } from './BudgetProgressBar';
import { Category, MonthlyBudget } from '../../types';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface CategoryListSectionProps {
  categories: Category[];
  monthlyBudget: MonthlyBudget;
  spentByCategory: Record<string, number>;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  onSaveOrder: (newList: Category[]) => void; 
  onDragStateChange: (isDragging: boolean) => void;
  onSelectCategory: (id: string) => void;
  // ▼ 追加: 予算編成モーダルを開くためのアクション
  onPressBudgetEdit: () => void;
}

export const CategoryListSection: React.FC<CategoryListSectionProps> = ({
  categories, 
  monthlyBudget, 
  spentByCategory, 
  isEditMode, 
  setIsEditMode, 
  onSaveOrder, 
  onDragStateChange, 
  onSelectCategory,
  onPressBudgetEdit
}) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加: 現在のテーマ状態を取得
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

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
        <Text style={[styles.dragIcon, isActive && { color: colors.primary }]}>≡</Text>
      </TouchableOpacity>
      <View style={styles.progressWrap} pointerEvents="none">
        <BudgetProgressBar categoryId={cat.id} categoryName={cat.name} budget={monthlyBudget.budgets[cat.id] || 0} spent={spentByCategory[cat.id] || 0} isCalculationTarget={cat.isCalculationTarget} onPressDetail={() => {}} />
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      {/* モードによってヘッダーを切り替える */}
      {!isEditMode ? (
        <View style={styles.header}>
          <Text style={styles.title}>カテゴリ別内訳</Text>
          <View style={styles.headerActions}>
            {/* ▼ 予算編成ボタンを追加：操作をこのフレームに集約 */}
            <TouchableOpacity onPress={onPressBudgetEdit} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>✎ 予算編成</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleStartEdit} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>↕️ 並び替え</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerActionBtn}>
            <Text style={styles.cancelText}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.editTitle}>並び替え中</Text>
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

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  card: { backgroundColor: colors.surface, marginHorizontal: 16, borderRadius: 24, paddingVertical: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  
  // 通常時のヘッダー：アクションボタンを横並びに
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 },
  title: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  headerActions: { flexDirection: 'row' },
  actionBtn: { backgroundColor: colors.background, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginLeft: 8 },
  actionBtnText: { color: colors.primary, fontSize: 12, fontWeight: 'bold' },
  
  // 編集モード時のヘッダー
  editHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16, backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#E3F2FD', paddingVertical: 8, borderRadius: 8, marginHorizontal: 16 },
  headerActionBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  cancelText: { fontSize: 15, color: colors.textSecondary, fontWeight: 'bold' },
  saveText: { fontSize: 15, color: colors.primary, fontWeight: 'bold' },
  editTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dragRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingVertical: 4 },
  dragRowActive: { backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF', zIndex: 999, elevation: 5 },
  dragHandle: { paddingLeft: 20, paddingRight: 8, paddingVertical: 16, justifyContent: 'center' },
  dragIcon: { fontSize: 24, color: colors.textSecondary, fontWeight: '300' },
  progressWrap: { flex: 1, paddingHorizontal: 16 },
});