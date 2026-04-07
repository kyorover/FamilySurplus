// src/components/settings/CategoryList.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { Category } from '../../types';

interface CategoryListProps {
  categories: Category[];
  onDeleteCategory: (id: string) => void;
  onAddCategory: () => void;
  onUpdateList: (newList: Category[]) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onDeleteCategory, onAddCategory, onUpdateList }) => {
  const [isSorting, setIsSorting] = useState(false);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  React.useEffect(() => {
    if (!isSorting) {
      setLocalCategories(categories);
    }
  }, [categories, isSorting]);

  const handleToggleCalculation = (id: string, value: boolean) => {
    const arr = [...categories];
    const index = arr.findIndex(c => c.id === id);
    if (index !== -1) {
      arr[index] = { ...arr[index], isCalculationTarget: value };
      onUpdateList(arr);
    }
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= localCategories.length) return;
    const newItems = [...localCategories];
    const temp = newItems[index];
    newItems[index] = newItems[newIndex];
    newItems[newIndex] = temp;
    setLocalCategories(newItems);
  };

  const handleSortComplete = () => {
    onUpdateList(localCategories);
    setIsSorting(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>支出カテゴリ</Text>
          {!isSorting && (
            <TouchableOpacity style={styles.sortBtn} onPress={() => setIsSorting(true)}>
              <Text style={styles.sortBtnText}>並び替え</Text>
            </TouchableOpacity>
          )}
        </View>

        <View>
          {(isSorting ? localCategories : categories).map((item, index) => {
            const key = item.id || `fallback-cat-${index}`;
            const isFirst = index === 0;
            const isLast = index === (isSorting ? localCategories.length - 1 : categories.length - 1);
            
            return (
              <View key={key} style={[styles.row, isSorting && styles.rowSorting]}>
                <View style={[styles.infoWrapper, { paddingLeft: 16 }]}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.isFixed && <Text style={styles.fixedBadge}>固定</Text>}
                </View>

                {isSorting ? (
                  <View style={styles.sortActions}>
                    <TouchableOpacity onPress={() => moveItem(index, -1)} disabled={isFirst} style={[styles.moveBtn, isFirst && styles.disabledMoveBtn]}>
                      <Text style={[styles.moveIcon, isFirst && styles.disabledMove]}>▲</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => moveItem(index, 1)} disabled={isLast} style={[styles.moveBtn, isLast && styles.disabledMoveBtn]}>
                      <Text style={[styles.moveIcon, isLast && styles.disabledMove]}>▼</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.customActions}>
                    <View style={styles.switchWrap}>
                      <Text style={styles.switchLabel}>集計</Text>
                      <Switch
                        value={item.isCalculationTarget ?? true}
                        onValueChange={(val) => handleToggleCalculation(item.id, val)}
                        style={styles.switchControl}
                      />
                    </View>
                    {!item.isFixed && (
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDeleteCategory(item.id)}>
                        <Text style={styles.deleteBtnText}>削除</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {!isSorting && (
          <TouchableOpacity style={styles.addBtn} onPress={onAddCategory}>
            <Text style={styles.addBtnText}>＋ カテゴリを追加</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ゼロベースのUX改善: 編集モード時はフローティングの確定ボタンを表示 */}
      {isSorting && (
        <View style={styles.floatingActionContainer}>
          <TouchableOpacity style={styles.floatingSaveBtn} onPress={handleSortComplete} activeOpacity={0.8}>
            <Text style={styles.floatingSaveBtnText}>この並び順で確定する</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F9F9F9', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93' },
  sortBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#E5E5EA' },
  sortBtnText: { fontSize: 12, fontWeight: '600', color: '#1C1C1E' },
  row: { flexDirection: 'row', alignItems: 'center', height: 65, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', backgroundColor: '#FFFFFF' },
  rowSorting: { backgroundColor: '#F8F8F8' }, // 並べ替え中は背景色を変えて浮き立たせる
  infoWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 12 },
  fixedBadge: { fontSize: 10, backgroundColor: '#007AFF', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold', overflow: 'hidden' },
  customActions: { flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  sortActions: { flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  moveBtn: { padding: 10, marginHorizontal: 4, backgroundColor: '#E5E5EA', borderRadius: 8 },
  disabledMoveBtn: { backgroundColor: '#F2F2F7' },
  moveIcon: { fontSize: 16, color: '#1C1C1E', fontWeight: 'bold' },
  disabledMove: { color: '#C7C7CC' },
  switchWrap: { alignItems: 'center', marginRight: 12 },
  switchLabel: { fontSize: 9, color: '#8E8E93', fontWeight: 'bold', marginBottom: 2 },
  switchControl: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FF3B30', borderRadius: 8 },
  deleteBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  addBtn: { padding: 16, alignItems: 'center', backgroundColor: '#F9F9F9' },
  addBtnText: { color: '#007AFF', fontWeight: 'bold', fontSize: 14 },
  
  // フローティングボタンのスタイル
  floatingActionContainer: { position: 'absolute', bottom: 16, left: 16, right: 16, alignItems: 'center' },
  floatingSaveBtn: { width: '100%', backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
  floatingSaveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});