// src/components/garden/TreeGrowthPanel.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHesokuriStore } from '../../store';
import { GARDEN_CONSTANTS } from '../../constants';
import { GLOBAL_GARDEN_SETTINGS } from '../../config/spriteConfig';
import { ALL_GARDEN_ITEMS } from '../../constants/gardenItems';

export const TreeGrowthPanel: React.FC = () => {
  const { settings, selectedTreeId, levelUpTree } = useHesokuriStore();
  const [isWatering, setIsWatering] = useState(false);

  // 選択中の木、無ければデフォルトの木を対象とする
  const targetTreeId = selectedTreeId || 'PL-01';
  
  // 木(PL-)以外が選択されている場合は成長パネルを表示しない
  if (!targetTreeId.startsWith('PL-')) return null;

  const masterItem = ALL_GARDEN_ITEMS.find(i => i.id === targetTreeId);
  const treeName = masterItem?.name || '知恵の木';
  // 修正: マスターデータからエフェクトIDを取得
  const growthEffectId = masterItem?.growthEffectId;

  // マップ上に存在（配置されている）かのチェック
  const isPlaced = settings?.gardenPlacements?.some(p => p.itemId === targetTreeId) ?? false;

  const level = settings?.itemLevels?.[targetTreeId] || (targetTreeId === 'PL-01' ? settings?.plantLevel : 1) || 1;
  const exp = settings?.itemExps?.[targetTreeId] || (targetTreeId === 'PL-01' ? settings?.plantExp : 0) || 0;
  const points = settings?.gardenPoints || 0;
  
  const isMaxLevel = level >= GLOBAL_GARDEN_SETTINGS.MAX_PLANT_LEVEL;
  const cost = isMaxLevel ? 0 : GARDEN_CONSTANTS.LEVEL_UP_COSTS[level];
  const remainingCost = isMaxLevel ? 0 : cost - exp;
  
  const unit = GLOBAL_GARDEN_SETTINGS.LEVEL_UP_UNIT_COST;
  const consumeAmount = Math.min(unit, points, remainingCost);
  
  // レベルアップ可能かつ、マップに配置されている場合のみボタンを活性化する
  const canLevelUp = !isMaxLevel && consumeAmount > 0;
  const isButtonEnabled = canLevelUp && isPlaced && !isWatering;
  
  const progressPercent = isMaxLevel ? 100 : Math.min(100, (exp / cost) * 100);

  const handleGrowthPress = async () => {
    if (!isButtonEnabled) return;
    setIsWatering(true);
    // 修正: levelUpTree に targetTreeId と growthEffectId を渡す
    await levelUpTree(targetTreeId, growthEffectId);
    setIsWatering(false);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.infoRow}>
        <Text style={styles.levelText}>{treeName} レベル {level}{isMaxLevel ? ' (MAX)' : ''}</Text>
        <Text style={styles.pointsText}>所持ポイント: {points} pt</Text>
      </View>
      
      {!isMaxLevel && (
        <View style={styles.actionRow}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            <Text style={styles.progressText}>{exp} / {cost} pt</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.levelUpBtn, !isButtonEnabled && styles.levelUpBtnDisabled]} 
            disabled={!isButtonEnabled}
            onPress={handleGrowthPress}
          >
            <Text style={styles.levelUpBtnText}>
              {!isPlaced ? '未配置' : `成長させる${canLevelUp ? `\n(${consumeAmount}pt)` : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: { padding: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', zIndex: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  levelText: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32' },
  pointsText: { fontSize: 14, color: '#555' },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  progressContainer: { flex: 1, height: 30, backgroundColor: '#E0E0E0', borderRadius: 15, overflow: 'hidden', marginRight: 12, justifyContent: 'center' },
  progressBar: { height: '100%', backgroundColor: '#4CAF50' },
  progressText: { position: 'absolute', width: '100%', textAlign: 'center', fontSize: 12, color: '#000', fontWeight: 'bold' },
  levelUpBtn: { backgroundColor: '#FF9800', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, minWidth: 90, alignItems: 'center' },
  levelUpBtnDisabled: { backgroundColor: '#BDBDBD' },
  levelUpBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
});