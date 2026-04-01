// src/components/garden/GardenInventoryTray.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { UniversalSprite } from './UniversalSprite';

interface Props {
  ownedItems: string[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

export const GardenInventoryTray: React.FC<Props> = ({ ownedItems, selectedItemId, onSelectItem }) => {
  return (
    <View style={styles.inventory}>
      <Text style={styles.inventoryTitle}>配置アイテムを選択（所持品）</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {ownedItems.map((itemId) => (
          <TouchableOpacity
            key={itemId}
            style={[styles.inventoryItem, selectedItemId === itemId && styles.activeItem]}
            onPress={() => onSelectItem(itemId)}
          >
            <UniversalSprite itemId={itemId} frameIndex={0} displaySize={32} />
          </TouchableOpacity>
        ))}
        {ownedItems.length === 0 && (
          <Text style={styles.emptyText}>アイテムがありません</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  inventory: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  inventoryTitle: { fontSize: 12, color: '#666', marginBottom: 8 },
  inventoryItem: { padding: 8, backgroundColor: '#E0E0E0', borderRadius: 8, marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  activeItem: { borderColor: '#4CAF50' },
  emptyText: { color: '#999', paddingVertical: 8 },
});