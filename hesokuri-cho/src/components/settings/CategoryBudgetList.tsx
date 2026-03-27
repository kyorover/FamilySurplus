// src/components/settings/CategoryBudgetList.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Category } from '../../types';

interface CategoryBudgetListProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
}

export const CategoryBudgetList: React.FC<CategoryBudgetListProps> = ({ categories, onCategoryPress }) => {
  return (
    <View style={styles.card}>
      {categories.map((cat, index) => (
        <View key={cat.id}>
          {index > 0 && <View style={styles.divider} />}
          <TouchableOpacity 
            style={styles.categoryRow} 
            activeOpacity={0.6}
            onPress={() => onCategoryPress(cat)}
          >
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              {cat.isFixed && <Text style={styles.fixedBadge}>固定</Text>}
            </View>
            <View style={styles.budgetActionWrap}>
              <Text style={styles.categoryBudgetText}>
                ￥{cat.budget.toLocaleString()}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      ))}
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
  budgetActionWrap: { flexDirection: 'row', alignItems: 'center' },
  categoryBudgetText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 8 },
  chevron: { fontSize: 20, color: '#C7C7CC', fontWeight: 'bold', paddingBottom: 2 },
});