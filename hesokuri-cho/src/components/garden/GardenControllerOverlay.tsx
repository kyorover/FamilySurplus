// src/components/garden/GardenControllerOverlay.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { SPRITE_CONFIG, GLOBAL_GARDEN_SETTINGS } from '../../config/spriteConfig';

interface Props {
  onMove: (dx: number, dy: number) => void;
  onRemove: () => void;
  onConfirm: () => void;
  onToggleMirror?: () => void;
  showRemoveButton: boolean;
}

/**
 * 各方向のボタンID定義
 * EF-05: 右上, EF-07: 左上, EF-08: 右下, EF-06: 左下
 */
const ARROW_IDS = {
  top: 'EF-05',
  left: 'EF-07',
  right: 'EF-08',
  bottom: 'EF-06',
};

export const GardenControllerOverlay: React.FC<Props> = ({ onMove, onRemove, onConfirm, onToggleMirror, showRemoveButton }) => {
  
  // ▼ ヘルパー: スプライト設定に基づき、動的なボタンスタイルを生成する
  const getDynamicBtnStyle = (id: string, centerX: number, centerY: number): ViewStyle => {
    const config = SPRITE_CONFIG[id];
    const scale = config?.baseScale ?? 1.0;
    const size = 44 * scale; // ベースサイズ44に縮尺を適用
    const offX = (config?.offsetX || 0) * scale;
    const offY = (config?.offsetY || 0) * scale;

    return {
      position: 'absolute',
      width: size,
      height: size,
      // 指定された中心座標 (centerX, centerY) に対して、画像サイズと個別のオフセットを考慮して配置
      left: centerX - size / 2 + offX,
      top: centerY - size / 2 + offY,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    };
  };

  // コントローラーのコンテナ(120x120)の中心座標
  const center = 60;
  // GLOBAL_GARDEN_SETTINGS で定義したボタンの中心点からの距離
  const spacing = GLOBAL_GARDEN_SETTINGS.CONTROLLER_SPACING;

  return (
    <View style={styles.isoControlsOverlay} pointerEvents="box-none">
      <View style={styles.isoDiamond}>
        {/* Top: Y軸をマイナス方向へ配置 */}
        <TouchableOpacity 
          style={getDynamicBtnStyle(ARROW_IDS.top, center, center - spacing)} 
          onPress={() => onMove(0, -1)}
        >
          <UniversalSprite itemId={ARROW_IDS.top} frameIndex={0} displaySize={44 * (SPRITE_CONFIG[ARROW_IDS.top]?.baseScale ?? 1.0)} />
        </TouchableOpacity>

        {/* Left: X軸をマイナス方向へ配置 */}
        <TouchableOpacity 
          style={getDynamicBtnStyle(ARROW_IDS.left, center - spacing, center)} 
          onPress={() => onMove(-1, 0)}
        >
          <UniversalSprite itemId={ARROW_IDS.left} frameIndex={0} displaySize={44 * (SPRITE_CONFIG[ARROW_IDS.left]?.baseScale ?? 1.0)} />
        </TouchableOpacity>

        {/* Right: X軸をプラス方向へ配置 */}
        <TouchableOpacity 
          style={getDynamicBtnStyle(ARROW_IDS.right, center + spacing, center)} 
          onPress={() => onMove(1, 0)}
        >
          <UniversalSprite itemId={ARROW_IDS.right} frameIndex={0} displaySize={44 * (SPRITE_CONFIG[ARROW_IDS.right]?.baseScale ?? 1.0)} />
        </TouchableOpacity>

        {/* Bottom: Y軸をプラス方向へ配置 */}
        <TouchableOpacity 
          style={getDynamicBtnStyle(ARROW_IDS.bottom, center, center + spacing)} 
          onPress={() => onMove(0, 1)}
        >
          <UniversalSprite itemId={ARROW_IDS.bottom} frameIndex={0} displaySize={44 * (SPRITE_CONFIG[ARROW_IDS.bottom]?.baseScale ?? 1.0)} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionRow}>
        {showRemoveButton && (
          <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
            <Text style={styles.actionBtnText}>片付ける</Text>
          </TouchableOpacity>
        )}
        {onToggleMirror && (
          <TouchableOpacity style={styles.mirrorBtn} onPress={onToggleMirror}>
            <Text style={styles.actionBtnText}>反転</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.actionBtnText}>設置確定</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  isoControlsOverlay: { position: 'absolute', bottom: 12, right: 12, alignItems: 'center' },
  isoDiamond: { width: 120, height: 120, position: 'relative', marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  removeBtn: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: 'rgba(255, 59, 48, 0.95)', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  mirrorBtn: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: 'rgba(33, 150, 243, 0.95)', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  confirmBtn: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: 'rgba(76, 175, 80, 0.95)', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});