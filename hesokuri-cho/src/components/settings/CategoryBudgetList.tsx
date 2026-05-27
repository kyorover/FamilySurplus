// src/components/settings/CategoryBudgetList.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Category } from '../../types';
import { DEFAULT_BUDGET_INITIAL_VALUE } from '../../constants';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface CategoryBudgetListProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
}

export const CategoryBudgetList: React.FC<CategoryBudgetListProps> = ({ categories, onCategoryPress }) => {
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

  return (
    <View>
      <View style={styles.card}>
        {categories.map((cat, index) => {
          const isUnset = cat.budget === DEFAULT_BUDGET_INITIAL_VALUE;
          return (
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
                  {/* 【修正】暫定値(0)の場合は赤字で警告し、ユーザーに入力を促す */}
                  <Text style={[styles.categoryBudgetText, isUnset && styles.categoryBudgetTextAlert]}>
                    {isUnset ? '未設定 (タップして入力)' : `￥${cat.budget.toLocaleString()}`}
                  </Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.guideContainer}>
        <Text style={styles.guideText}>
          ※ 新しいカテゴリの追加や並び替えは、初期設定を完了させた後、「設定」タブのカテゴリ管理から行えます。
        </Text>
      </View>
    </View>
  );
};

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 16 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  categoryInfo: { flexDirection: 'row', alignItems: 'center' },
  categoryName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginRight: 8 },
  fixedBadge: { fontSize: 10, backgroundColor: colors.primary, color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold', overflow: 'hidden' }, // ※色付き背景上の文字は白固定
  budgetActionWrap: { flexDirection: 'row', alignItems: 'center' },
  categoryBudgetText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginRight: 8 },
  categoryBudgetTextAlert: { color: colors.error, fontSize: 14, fontWeight: 'bold' }, // 警告用の赤文字スタイル
  chevron: { fontSize: 20, color: colors.textSecondary, fontWeight: 'bold', paddingBottom: 2 },
  guideContainer: { paddingHorizontal: 12, paddingBottom: 16 },
  guideText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
});