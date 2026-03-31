import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
// 作成した IsometricGardenCanvas をインポート
import { IsometricGardenCanvas } from '../components/garden/IsometricGardenCanvas';

export const HistoryScreen: React.FC = () => {
  const [viewMonth, setViewMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  return (
    <View style={styles.container}>
      {/* 上部ヘッダー類 */}
      <View style={styles.monthSelector}>
        <Text style={styles.monthText}>{viewMonth.replace('-', '年')}月 のお庭</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ベースキャンバスの描画 */}
        <View style={styles.gardenFrame}>
          <IsometricGardenCanvas />
        </View>

        {/* その他のステータスUI類（省略） */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  monthSelector: { padding: 16, alignItems: 'center', backgroundColor: '#FFFFFF' },
  monthText: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  gardenFrame: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 5,
  },
});