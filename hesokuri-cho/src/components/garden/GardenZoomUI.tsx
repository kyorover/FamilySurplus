// src/components/garden/GardenZoomUI.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GLOBAL_GARDEN_SETTINGS } from '../../config/spriteConfig';

interface Props {
  zoomScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const GardenZoomUI: React.FC<Props> = ({ zoomScale, onZoomIn, onZoomOut }) => {
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

const styles = StyleSheet.create({
  zoomControls: { position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 8, padding: 4, elevation: 4, zIndex: 100 },
  zoomBtn: { padding: 8, alignItems: 'center', justifyContent: 'center' },
  zoomText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  disabledText: { color: '#CCC' }
});