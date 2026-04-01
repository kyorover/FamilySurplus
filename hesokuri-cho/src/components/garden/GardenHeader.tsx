// src/components/garden/GardenHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface GardenHeaderProps {
  onOpenShop: () => void;
}

export const GardenHeader: React.FC<GardenHeaderProps> = ({ onOpenShop }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>みんなのお庭</Text>
      <TouchableOpacity style={styles.shopBtn} onPress={onOpenShop}>
        <Text style={styles.shopBtnText}>ショップ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  shopBtn: { 
    backgroundColor: '#4CAF50', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  shopBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});