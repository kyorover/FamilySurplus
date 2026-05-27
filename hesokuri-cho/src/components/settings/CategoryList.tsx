// src/components/settings/CategoryList.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { Category } from '../../types';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface CategoryListProps {
  categories: Category[];
  onDeleteCategory: (id: string) => void;
  onAddCategory: () => void;
  onUpdateList: (newList: Category[]) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onDeleteCategory, onAddCategory, onUpdateList }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

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
      <View style={styles.normalHeader}>
        <Text style={styles.headerTitle}>支出カテゴリ</Text>
      </View>
      
      {/* ユーザーへの案内表示 */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>※カテゴリの並び替えは、ダッシュボード画面の「カテゴリ別内訳」から行えます。</Text>
      </View>

      <View>
        {categories.map((item, index) => {
          const key = item.id || `fallback-cat-${index}`;
          return (
            <View key={key} style={styles.row}>
              <View style={[styles.infoWrapper, { paddingLeft: 16 }]}>
                <Text style={styles.name}>{item.name}</Text>
                {item.isFixed && <Text style={styles.fixedBadge}>固定</Text>}
              </View>

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
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={onAddCategory}>
        <Text style={styles.addBtnText}>＋ カテゴリを追加</Text>
      </TouchableOpacity>
    </View>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  normalHeader: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F9F9', borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textSecondary },
  
  // 案内バナーのスタイル
  infoBanner: { backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoBannerText: { fontSize: 12, color: colors.primary, fontWeight: '500' },

  row: { flexDirection: 'row', alignItems: 'center', height: 65, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  infoWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginRight: 12 },
  fixedBadge: { fontSize: 10, backgroundColor: colors.primary, color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold', overflow: 'hidden' }, // ※プライマリ上のテキストは白固定
  
  customActions: { flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  switchWrap: { alignItems: 'center', marginRight: 12 },
  switchLabel: { fontSize: 9, color: colors.textSecondary, fontWeight: 'bold', marginBottom: 2 },
  switchControl: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.error, borderRadius: 8 },
  deleteBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  addBtn: { padding: 16, alignItems: 'center', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F9F9' },
  addBtnText: { color: colors.primary, fontWeight: 'bold', fontSize: 14 },
});