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
  const consumeAmount = Math.min(unit, points, remainingCost);
  const canLevelUp = !isMaxLevel && consumeAmount > 0;
  
  const progressPercent = isMaxLevel ? 100 : Math.min(100, (exp / cost) * 100);

  // ▼ 修正: Single Source of Truth に基づき、配置情報(gardenPlacements)から現在の木を特定する
  const currentTreePlacement = settings?.gardenPlacements?.find(p => p.itemId.startsWith('PL-'));
  const currentTreeId = currentTreePlacement?.itemId || GLOBAL_GARDEN_SETTINGS.DEFAULT_TREE_ID;
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
          
          <TouchableOpacity 
            style={[styles.levelUpBtn, !canLevelUp && styles.levelUpBtnDisabled]} 
            disabled={!canLevelUp || isWatering}
            onPress={handleGrowthPress}
          >
            <Text style={styles.levelUpBtnText}>
              成長させる{canLevelUp ? `\n(${consumeAmount}pt)` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* エフェクトはパネル全体を基準に絶対配置し、ボタンの直上付近に浮かせる */}
      {isWatering && (
        <View style={styles.effectOverlay}>
          <EffectSprite 
            effectId={effectId} 
            displaySize={70} 
            loop={false} 
            onAnimationEnd={() => setIsWatering(false)} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: { 
    padding: 12, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0',
    position: 'relative', // 追加: 子要素（エフェクト）の絶対配置の基準
    zIndex: 1,
  },
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
  
  // パネル右下を基準に上へずらし、ボタンの真上に配置
  effectOverlay: { 
    position: 'absolute', 
    bottom: 55, // ボタンの高さ分上に持ち上げる
    right: 20,  // ボタンの位置（右端）に合わせる
    zIndex: 100, 
    elevation: 10,
  },
});