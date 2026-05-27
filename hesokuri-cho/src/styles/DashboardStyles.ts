// src/styles/DashboardStyles.ts
import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/colors'; // ▼ 新規追加: カラー型のインポート

// ▼ 変更: colorsを引数に取る関数に変更
export const createDashboardStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  menuBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.background, borderRadius: 8 },
  menuBtnText: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary },
  evaluationWrapper: { paddingHorizontal: 16, marginTop: 8 },
  fab: { position: 'absolute', right: 24, bottom: 24, backgroundColor: colors.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
  fabText: { color: '#FFFFFF', fontSize: 32, fontWeight: '300', marginTop: -2 }, // ※背景がPrimary(青)のため白固定
  menuOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  menuContent: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  menuCloseBtn: { fontSize: 20, color: colors.textSecondary, padding: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  menuItemIcon: { fontSize: 20, marginRight: 16, width: 24, textAlign: 'center' },
  menuItemText: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },
});