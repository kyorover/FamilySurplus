// src/components/garden/GardenZoomUI.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GLOBAL_GARDEN_SETTINGS } from '../../config/spriteConfig';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface Props {
  zoomScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const GardenZoomUI: React.FC<Props> = ({ zoomScale, onZoomIn, onZoomOut }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  return (
    <View style={styles.zoomControls}>
      <TouchableOpacity 
        style={styles.zoomBtn} 
        onPress={onZoomIn} 
        disabled={zoomScale >= GLOBAL_GARDEN_SETTINGS.MAX_ZOOM_SCALE}
      >
        <Text style={[styles.zoomText, zoomScale >= GLOBAL_GARDEN_SETTINGS.MAX_ZOOM_SCALE && styles.disabledText]}>＋</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.zoomBtn} 
        onPress={onZoomOut} 
        disabled={zoomScale <= GLOBAL_GARDEN_SETTINGS.MIN_ZOOM_SCALE}
      >
        <Text style={[styles.zoomText, zoomScale <= GLOBAL_GARDEN_SETTINGS.MIN_ZOOM_SCALE && styles.disabledText]}>－</Text>
      </TouchableOpacity>
    </View>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  zoomControls: { position: 'absolute', bottom: 16, right: 16, backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255,255,255,0.85)', borderRadius: 8, padding: 4, elevation: 4, zIndex: 100 }, // ▼ 変更: ダークモード対応
  zoomBtn: { padding: 8, alignItems: 'center', justifyContent: 'center' },
  zoomText: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary }, // ▼ 変更
  disabledText: { color: colors.textSecondary } // ▼ 変更
});