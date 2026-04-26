// src/components/dashboard/DashboardSettingsMenu.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, Platform } from 'react-native';
import { styles } from '../../styles/DashboardStyles';

interface DashboardSettingsMenuProps {
  visible: boolean;
  onClose: () => void;
  onOpenPocketMoneyRule: () => void;
  onNavigateToHistory: () => void;
}

/**
 * 設定メニュー：日常の操作はリスト内ボタンに移動したため、低頻度アクションのみを表示
 */
export const DashboardSettingsMenu: React.FC<DashboardSettingsMenuProps> = ({
  visible,
  onClose,
  onOpenPocketMoneyRule,
  onNavigateToHistory,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.menuContent}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>メニュー</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.menuCloseBtn}>✕</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); onOpenPocketMoneyRule(); }}>
            <Text style={styles.menuItemIcon}>💰</Text>
            <Text style={styles.menuItemText}>お小遣いルールを設定</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); onNavigateToHistory(); }}>
            <Text style={styles.menuItemIcon}>📈</Text>
            <Text style={styles.menuItemText}>過去のへそくり履歴</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};