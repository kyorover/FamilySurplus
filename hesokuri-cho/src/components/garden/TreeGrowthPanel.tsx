// src/components/garden/TreeGrowthPanel.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHesokuriStore } from '../../store';
import { GARDEN_CONSTANTS } from '../../constants';

export const TreeGrowthPanel: React.FC = () => {
  const { settings, levelUpTree } = useHesokuriStore();
  const level = settings?.plantLevel || 1;
  const points = settings?.gardenPoints || 0;
  
  const isMaxLevel = level >= GARDEN_CONSTANTS.MAX_PLANT_LEVEL;
  const cost = isMaxLevel ? 0 : GARDEN_CONSTANTS.LEVEL_UP_COSTS[level];
  const canLevelUp = !isMaxLevel && points >= cost;
  
  const progressPercent = isMaxLevel ? 100 : Math.min(100, (points / cost) * 100);

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
            <Text style={styles.progressText}>{points} / {cost} pt</Text>
          </View>
          <TouchableOpacity 
            style={[styles.levelUpBtn, !canLevelUp && styles.levelUpBtnDisabled]} 
            disabled={!canLevelUp}
            onPress={levelUpTree}
          >
            <Text style={styles.levelUpBtnText}>成長させる</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: { padding: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  levelText: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32' },
  pointsText: { fontSize: 14, color: '#555' },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  progressContainer: { flex: 1, height: 20, backgroundColor: '#E0E0E0', borderRadius: 10, overflow: 'hidden', marginRight: 12, justifyContent: 'center' },
  progressBar: { height: '100%', backgroundColor: '#4CAF50' },
  progressText: { position: 'absolute', width: '100%', textAlign: 'center', fontSize: 12, color: '#000', fontWeight: 'bold' },
  levelUpBtn: { backgroundColor: '#FF9800', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  levelUpBtnDisabled: { backgroundColor: '#BDBDBD' },
  levelUpBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
});