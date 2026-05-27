// src/components/dashboard/DashboardSettingsMenu.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

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
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

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

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  menuOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  menuContent: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, paddingBottom: 40 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  menuCloseBtn: { fontSize: 20, color: colors.textSecondary, fontWeight: 'bold', padding: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuItemIcon: { fontSize: 24, marginRight: 16 },
  menuItemText: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' }
});