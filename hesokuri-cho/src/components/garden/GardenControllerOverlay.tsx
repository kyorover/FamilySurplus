// src/components/garden/GardenControllerOverlay.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  onMove: (dx: number, dy: number) => void;
  onRemove: () => void;
  onConfirm: () => void;
  showRemoveButton: boolean;
}

export const GardenControllerOverlay: React.FC<Props> = ({ onMove, onRemove, onConfirm, showRemoveButton }) => {
  return (
    <View style={styles.isoControlsOverlay} pointerEvents="box-none">
      <View style={styles.isoDiamond}>
        <TouchableOpacity style={[styles.isoBtn, styles.btnTop]} onPress={() => onMove(0, -1)}>
          <Text style={styles.isoArrow}>↗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.isoBtn, styles.btnLeft]} onPress={() => onMove(-1, 0)}>
          <Text style={styles.isoArrow}>↖</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.isoBtn, styles.btnRight]} onPress={() => onMove(1, 0)}>
          <Text style={styles.isoArrow}>↘</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.isoBtn, styles.btnBottom]} onPress={() => onMove(0, 1)}>
          <Text style={styles.isoArrow}>↙</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionRow}>
        {showRemoveButton && (
          <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
            <Text style={styles.actionBtnText}>片付ける</Text>
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
  isoControlsOverlay: { 
    position: 'absolute', bottom: 12, right: 12, alignItems: 'center',
  },
  isoDiamond: { width: 120, height: 120, position: 'relative', marginBottom: 8 },
  isoBtn: {
    position: 'absolute', width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 4,
    borderWidth: 1, borderColor: '#E0E0E0'
  },
  btnTop: { top: 0, left: 38 },
  btnLeft: { top: 38, left: 0 },
  btnRight: { top: 38, left: 76 },
  btnBottom: { top: 76, left: 38 },
  isoArrow: { fontSize: 22, color: '#333', fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  removeBtn: { 
    paddingVertical: 10, paddingHorizontal: 16, backgroundColor: 'rgba(255, 59, 48, 0.95)', 
    borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3,
  },
  confirmBtn: { 
    paddingVertical: 10, paddingHorizontal: 20, backgroundColor: 'rgba(76, 175, 80, 0.95)', 
    borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3,
  },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});