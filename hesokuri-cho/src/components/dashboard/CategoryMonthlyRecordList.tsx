// src/components/dashboard/CategoryMonthlyRecordList.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ExpenseRecord, Category } from '../../types';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface CategoryMonthlyRecordListProps {
  viewMonth: string;
  viewExpenses: ExpenseRecord[];
  category: Category;
  onAddExpense: (categoryId: string, date: string) => void;
  onEditExpense: (exp: ExpenseRecord) => void;
  onDeleteWrapper: (exp: ExpenseRecord) => void;
}

export const CategoryMonthlyRecordList: React.FC<CategoryMonthlyRecordListProps> = ({
  viewMonth, viewExpenses, category, onAddExpense, onEditExpense, onDeleteWrapper
}) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <View style={styles.monthlyListContainer}>
      <View style={styles.monthlyListHeader}>
        <Text style={styles.monthlyListTitle}>{viewMonth.split('-')[1].replace(/^0/, '')}月の全記録</Text>
        <TouchableOpacity style={styles.addDirectBtn} onPress={() => onAddExpense(category.id, getTodayStr())}>
          <Text style={styles.addDirectBtnText}>＋ 追加</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {viewExpenses.length === 0 ? <Text style={styles.emptyText}>記録はありません</Text> : 
          viewExpenses.slice().sort((a,b) => b.date.localeCompare(a.date)).map(exp => (
            <TouchableOpacity key={exp.id} style={styles.recordItem} onPress={() => onEditExpense(exp)} activeOpacity={0.7}>
              <View style={styles.recordHeader}>
                <View style={styles.badgeWrap}>
                  <Text style={styles.dateBadge}>{parseInt(exp.date.split('-')[2], 10)}日</Text>
                  <Text style={styles.methodBadge}>{exp.paymentMethod}</Text>
                </View>
                <Text style={styles.amount}>￥{exp.amount.toLocaleString()}</Text>
              </View>
              <View style={styles.recordBody}>
                <View style={styles.textContainer}>
                  {exp.storeName ? <Text style={styles.storeName} numberOfLines={1}>📍 {exp.storeName}</Text> : null}
                  {exp.memo ? <Text style={styles.memo} numberOfLines={1}>💬 {exp.memo}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => onDeleteWrapper(exp)} style={styles.deleteBtnWrap}>
                  <Text style={styles.deleteText}>削除</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  monthlyListContainer: { flex: 1, marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  monthlyListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  monthlyListTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  addDirectBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addDirectBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }, // ※プライマリカラー上のテキストは白固定
  listContent: { paddingBottom: 40 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 24, fontSize: 13 },
  
  recordItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAFAFC', borderRadius: 8, paddingHorizontal: 12, marginBottom: 8 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badgeWrap: { flexDirection: 'row', alignItems: 'center' },
  dateBadge: { fontSize: 11, backgroundColor: colors.textPrimary, color: colors.surface, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: 'hidden', marginRight: 6, fontWeight: 'bold' },
  methodBadge: { fontSize: 10, backgroundColor: colors.border, color: colors.textSecondary, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  amount: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  recordBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  textContainer: { flex: 1, marginRight: 8 },
  storeName: { fontSize: 13, color: colors.textPrimary, marginBottom: 2, fontWeight: '500' },
  memo: { fontSize: 12, color: colors.textSecondary },
  deleteBtnWrap: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : '#FFF0F0', borderRadius: 6 },
  deleteText: { fontSize: 12, color: colors.error, fontWeight: 'bold' },
});