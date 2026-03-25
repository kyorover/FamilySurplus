// src/components/settings/CategoryBudgetList.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Category } from '../../types';

interface CategoryBudgetListProps {
  categories: Category[];
}

export const CategoryBudgetList: React.FC<CategoryBudgetListProps> = ({ categories }) => {
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
            <Text style={styles.categoryBudgetText}>
              ￥{cat.budget.toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    overflow: 'hidden', 
    marginBottom: 24,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 2, 
    elevation: 1
  },
  divider: { 
    height: 1, 
    backgroundColor: '#E5E5EA', 
    marginLeft: 16 
  },
  categoryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16 
  },
  categoryInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  categoryName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1C1C1E', 
    marginRight: 8 
  },
  fixedBadge: { 
    fontSize: 10, 
    backgroundColor: '#007AFF', 
    color: '#FFFFFF', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4, 
    fontWeight: 'bold',
    overflow: 'hidden'
  },
  categoryBudgetText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1C1C1E' 
  },
});