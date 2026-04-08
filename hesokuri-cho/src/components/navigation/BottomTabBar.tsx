// src/components/navigation/BottomTabBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TabType } from '../../hooks/useTabNavigation';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
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

const styles = StyleSheet.create({
  bottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingBottom: 24, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E5EA', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, marginHorizontal: 4 },
  navItemActive: { backgroundColor: '#E5F1FF' },
  navIcon: { fontSize: 20, marginBottom: 4, opacity: 0.5 },
  navIconActive: { opacity: 1.0 },
  navText: { fontSize: 10, color: '#8E8E93', fontWeight: 'bold' },
  navTextActive: { color: '#007AFF' },
});