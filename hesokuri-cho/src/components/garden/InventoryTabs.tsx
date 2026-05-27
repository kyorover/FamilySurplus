// src/components/garden/InventoryTabs.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

export type CategoryTab = 'ALL' | 'BG' | 'PL' | 'WP' | 'OTHER';

interface Props {
  activeTab: CategoryTab;
  onTabChange: (tab: CategoryTab) => void;
}

export const InventoryTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  const tabs: { key: CategoryTab; label: string }[] = [
    { key: 'ALL', label: 'すべて' },
    { key: 'BG', label: 'タイル' },
    { key: 'PL', label: '木' },
    { key: 'WP', label: '壁紙' },
    { key: 'OTHER', label: 'その他' }
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map(tab => (
        <TouchableOpacity 
          key={tab.key} 
          onPress={() => onTabChange(tab.key)} 
          style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  tabContainer: { flexDirection: 'row' },
  tabBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, backgroundColor: isDark ? '#3A3A3C' : '#F0F0F0', marginLeft: 4 }, // ▼ 変更: ダークモード対応
  tabBtnActive: { backgroundColor: colors.primary }, // ▼ 変更: テーマのプライマリカラーを適用
  tabText: { fontSize: 10, color: colors.textSecondary }, // ▼ 変更
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold' }, // ※色付き背景上の文字は白固定
});