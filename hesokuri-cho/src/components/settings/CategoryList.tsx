// src/components/settings/CategoryList.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Category } from '../../types';

interface CategoryListProps {
  categories: Category[];
  onDeleteCategory: (categoryId: string) => void;
  onAddCategory: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onDeleteCategory, onAddCategory }) => {
  return (
    <View style={styles.card}>
      {categories.map((cat, index) => (
        <View key={cat.id}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              {cat.isFixed && <Text style={styles.fixedBadge}>固定</Text>}
            </View>
            {!cat.isFixed && (
              <TouchableOpacity onPress={() => onDeleteCategory(cat.id)} style={styles.deleteBtn} activeOpacity={0.6}>
                <Text style={styles.deleteBtnText}>削除</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
      <View style={styles.divider} />
      <TouchableOpacity style={styles.addBtn} onPress={onAddCategory} activeOpacity={0.6}>
        <Text style={styles.addBtnText}>＋ 新しいカテゴリを追加</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginLeft: 16 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  categoryInfo: { flexDirection: 'row', alignItems: 'center' },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 8 },
  fixedBadge: { fontSize: 10, backgroundColor: '#007AFF', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold', overflow: 'hidden' },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFF0F0', borderRadius: 6 },
  deleteBtnText: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
  addBtn: { padding: 16, alignItems: 'center', backgroundColor: '#F9F9FB' },
  addBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
});