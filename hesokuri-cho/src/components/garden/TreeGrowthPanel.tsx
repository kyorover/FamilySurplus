// src/components/garden/TreeGrowthPanel.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHesokuriStore } from '../../store';
import { GARDEN_CONSTANTS } from '../../constants';
import { GLOBAL_GARDEN_SETTINGS } from '../../config/spriteConfig';
import { EffectSprite } from './EffectSprite';
import { ALL_GARDEN_ITEMS } from '../../constants/gardenItems';

export const TreeGrowthPanel: React.FC = () => {
  const { settings, levelUpTree } = useHesokuriStore();
  const [isWatering, setIsWatering] = useState(false);

  const level = settings?.plantLevel || 1;
  const points = settings?.gardenPoints || 0;
  const exp = settings?.plantExp || 0;
  
  const isMaxLevel = level >= GLOBAL_GARDEN_SETTINGS.MAX_PLANT_LEVEL;
  const cost = isMaxLevel ? 0 : GARDEN_CONSTANTS.LEVEL_UP_COSTS[level];
  const remainingCost = isMaxLevel ? 0 : cost - exp;
  
  const unit = GLOBAL_GARDEN_SETTINGS.LEVEL_UP_UNIT_COST;
  // 今回のボタン押下で実際に消費されるポイント
  const consumeAmount = Math.min(unit, points, remainingCost);
  const canLevelUp = !isMaxLevel && consumeAmount > 0;
  
  const progressPercent = isMaxLevel ? 100 : Math.min(100, (exp / cost) * 100);

  // 選択中の木のデータを取得し、エフェクトIDを決定
  const currentTreeId = settings?.selectedTreeId || GLOBAL_GARDEN_SETTINGS.DEFAULT_TREE_ID;
  const currentTreeData = ALL_GARDEN_ITEMS.find(item => item.id === currentTreeId);
  const effectId = currentTreeData?.growthEffectId || 'EF-01';

  const handleGrowthPress = async () => {
    if (!canLevelUp) return;
    setIsWatering(true);
    await levelUpTree();
  };

  return (
    <View style={styles.panel}>
      <View style={styles.infoRow}>
        <Text style={styles.levelText}>知恵の木 レベル {level}{isMaxLevel ? ' (MAX)' : ''}</Text>
        <Text style={styles.pointsText}>所持ポイント: {points} pt</Text>
      </View>
      
      {!isMaxLevel && (
        <View style={styles.actionRow}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            <Text style={styles.progressText}>{exp} / {cost} pt</Text>
          </View>
          <View style={styles.btnWrapper}>
            <TouchableOpacity 
              style={[styles.levelUpBtn, !canLevelUp && styles.levelUpBtnDisabled]} 
              disabled={!canLevelUp || isWatering}
              onPress={handleGrowthPress}
            >
              <Text style={styles.levelUpBtnText}>
                成長させる{canLevelUp ? `\n(${consumeAmount}pt)` : ''}
              </Text>
            </TouchableOpacity>

            {/* ボタンの直上に水やりエフェクトを表示 */}
            {isWatering && (
              <View style={styles.effectOverlay}>
                <EffectSprite 
                  effectId={effectId} 
                  displaySize={80} 
                  loop={false} 
                  onAnimationEnd={() => setIsWatering(false)} 
                />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: { padding: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', overflow: 'visible' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  levelText: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32' },
  pointsText: { fontSize: 14, color: '#555' },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  progressContainer: { flex: 1, height: 30, backgroundColor: '#E0E0E0', borderRadius: 15, overflow: 'hidden', marginRight: 12, justifyContent: 'center' },
  progressBar: { height: '100%', backgroundColor: '#4CAF50' },
  progressText: { position: 'absolute', width: '100%', textAlign: 'center', fontSize: 12, color: '#000', fontWeight: 'bold' },
  btnWrapper: { position: 'relative', alignItems: 'center' },
  levelUpBtn: { backgroundColor: '#FF9800', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, minWidth: 90, alignItems: 'center' },
  levelUpBtnDisabled: { backgroundColor: '#BDBDBD' },
  levelUpBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  // ボタンの真上に配置されるよう調整
  effectOverlay: { position: 'absolute', bottom: '100%', left: '50%', transform: [{ translateX: -40 }], zIndex: 10, elevation: 10, marginBottom: 5 },
});