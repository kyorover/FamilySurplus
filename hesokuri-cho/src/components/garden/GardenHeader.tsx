// src/components/garden/GardenHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GARDEN_CONSTANTS } from '../../constants';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface GardenHeaderProps {
  onOpenShop: () => void;
}

export const GardenHeader: React.FC<GardenHeaderProps> = ({ onOpenShop }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{GARDEN_CONSTANTS.GARDEN_TITLE}</Text>
      <TouchableOpacity style={styles.shopBtn} onPress={onOpenShop}>
        <Text style={styles.shopBtnText}>ショップ</Text>
      </TouchableOpacity>
    </View>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16, 
    backgroundColor: colors.surface, // ▼ 変更
    borderBottomWidth: 1,
    borderBottomColor: colors.border // ▼ 変更
  },
  headerText: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }, // ▼ 変更
  shopBtn: { 
    backgroundColor: isDark ? '#66BB6A' : '#4CAF50', // ▼ 変更: ダークモードで視認性を調整
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  shopBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }, // ※色付き背景上の文字は白固定
});