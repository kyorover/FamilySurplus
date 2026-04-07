// src/components/garden/InventoryTabs.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type CategoryTab = 'ALL' | 'BG' | 'PL' | 'WP' | 'OTHER';

interface Props {
  activeTab: CategoryTab;
  onTabChange: (tab: CategoryTab) => void;
}

export const InventoryTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
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

const styles = StyleSheet.create({
  tabContainer: { flexDirection: 'row' },
  tabBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, backgroundColor: '#F0F0F0', marginLeft: 4 },
  tabBtnActive: { backgroundColor: '#4CAF50' },
  tabText: { fontSize: 10, color: '#666' },
  tabTextActive: { color: '#FFF', fontWeight: 'bold' },
});