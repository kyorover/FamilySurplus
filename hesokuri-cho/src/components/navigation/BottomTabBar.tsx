// src/components/navigation/BottomTabBar.tsx
import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TabType } from '../../hooks/useTabNavigation';
import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../../constants/colors';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const { colors } = useTheme();
  // テーマ変更時にスタイルを再生成する
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (activeTab === 'hesokuriHistory') return null;

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]} onPress={() => onTabChange('dashboard')}>
        <Text style={[styles.navIcon, activeTab === 'dashboard' && styles.navIconActive]}>🏠</Text>
        <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>ホーム</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navItem, activeTab === 'history' && styles.navItemActive]} onPress={() => onTabChange('history')}>
        <Text style={[styles.navIcon, activeTab === 'history' && styles.navIconActive]}>🌱</Text>
        <Text style={[styles.navText, activeTab === 'history' && styles.navTextActive]}>庭</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navItem, activeTab === 'input' && styles.navItemActive]} activeOpacity={0.8} onPress={() => onTabChange('input')}>
        <Text style={[styles.navIcon, activeTab === 'input' && styles.navIconActive]}>➕</Text>
        <Text style={[styles.navText, activeTab === 'input' && styles.navTextActive]}>入力</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]} onPress={() => onTabChange('settings')}>
        <Text style={[styles.navIcon, activeTab === 'settings' && styles.navIconActive]}>⚙️</Text>
        <Text style={[styles.navText, activeTab === 'settings' && styles.navTextActive]}>設定</Text>
      </TouchableOpacity>
    </View>
  );
};

// 色を引数に取ってスタイルを生成する関数に変更
const createStyles = (colors: Colors) => StyleSheet.create({
  bottomNav: { flexDirection: 'row', backgroundColor: colors.surface, paddingBottom: 24, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border, justifyContent: 'space-around', alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, marginHorizontal: 4 },
  navItemActive: { backgroundColor: colors.primaryLight },
  navIcon: { fontSize: 24, marginBottom: 4, opacity: 0.5 },
  navIconActive: { opacity: 1 },
  navText: { fontSize: 10, color: colors.textSecondary, fontWeight: '500' },
  navTextActive: { color: colors.primary, fontWeight: 'bold' }
});