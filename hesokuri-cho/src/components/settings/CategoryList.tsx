// src/components/settings/CategoryList.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { Category } from '../../types';

interface CategoryListProps {
  categories: Category[];
  onDeleteCategory: (id: string) => void;
  onAddCategory: () => void;
  onUpdateList: (newList: Category[]) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onDeleteCategory, onAddCategory, onUpdateList }) => {

  const handleToggleCalculation = (id: string, value: boolean) => {
    const arr = [...categories];
    const index = arr.findIndex(c => c.id === id);
    if (index !== -1) {
      arr[index] = { ...arr[index], isCalculationTarget: value };
      onUpdateList(arr);
    }
  };

  return (
    <View style={styles.card}>
      <View>
        {categories.map((item, index) => {
          // IDが存在しない・重複する場合に備えたフォールバック処理
          const key = item.id || `fallback-cat-${index}`;
          
          return (
            <View key={key} style={styles.row}>
              <View style={[styles.infoWrapper, { paddingLeft: 16 }]}>
                <Text style={styles.name}>{item.name}</Text>
                {item.isFixed && <Text style={styles.fixedBadge}>固定</Text>}
              </View>

              {!item.isFixed ? (
                <View style={styles.customActions}>
                  <View style={styles.switchWrap}>
                    <Text style={styles.switchLabel}>計算対象</Text>
                    <Switch
                      value={item.isCalculationTarget !== false}
                      onValueChange={(val) => handleToggleCalculation(item.id, val)}
                      style={styles.switchControl}
                    />
                  </View>
                  <TouchableOpacity onPress={() => onDeleteCategory(item.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>削除</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.placeholderBtn} />
              )}
            </View>
          );
        })}
      </View>

      <View style={{ height: 1, backgroundColor: '#E5E5EA' }} />
      <TouchableOpacity style={styles.addBtn} onPress={onAddCategory}>
        <Text style={styles.addBtnText}>＋ カテゴリを追加</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', height: 65, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', backgroundColor: '#FFFFFF' },
  infoWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 12 },
  fixedBadge: { fontSize: 10, backgroundColor: '#007AFF', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold', overflow: 'hidden' },
  customActions: { flexDirection: 'row', alignItems: 'center' },
  switchWrap: { alignItems: 'center', marginRight: 12 },
  switchLabel: { fontSize: 9, color: '#8E8E93', fontWeight: 'bold', marginBottom: 2 },
  switchControl: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFF0F0', borderRadius: 6, marginRight: 16 },
  deleteBtnText: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
  placeholderBtn: { width: 48, marginRight: 16 },
  addBtn: { padding: 16, alignItems: 'center', backgroundColor: '#F9F9FB' },
  addBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
});