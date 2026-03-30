// src/screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useHesokuriStore } from '../store';

export const HistoryScreen: React.FC = () => {
  const { settings, fetchHistoryData } = useHesokuriStore();
  const [viewMonth, setViewMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [isLoading, setIsLoading] = useState(false);
  
  // プロトタイプ用のガーデンステート（支出履歴から動的に算出）
  const [plantLevel, setPlantLevel] = useState(1);
  const [monthlyNMD, setMonthlyNMD] = useState(0);

  useEffect(() => {
    const loadGardenData = async () => {
      setIsLoading(true);
      const data = await fetchHistoryData(viewMonth);
      
      // その月の「無買日(NMD: No Money Day)」の数を算出するロジック
      const expensesByDate = data.expenses.reduce((acc, exp) => {
        acc[exp.date] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      const [yearStr, monthStr] = viewMonth.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, month, 0).getDate();
      
      let nmdCount = 0;
      // 未来の日付の分はカウントしないよう、現在日までの日数を上限とする
      const today = new Date();
      const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
      const calcTargetDays = isCurrentMonth ? today.getDate() : daysInMonth;

      for (let i = 1; i <= calcTargetDays; i++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        if (!expensesByDate[dateStr]) nmdCount++;
      }
      
      setMonthlyNMD(nmdCount);
      
      // NMDの達成日数に応じた植物のレベル判定 (1〜5)
      // ※金額の多寡ではなく、管理の継続性（お金を使わなかった日）を評価する
      if (nmdCount >= 20) setPlantLevel(5);
      else if (nmdCount >= 15) setPlantLevel(4);
      else if (nmdCount >= 10) setPlantLevel(3);
      else if (nmdCount >= 5) setPlantLevel(2);
      else setPlantLevel(1);
      
      setIsLoading(false);
    };
    
    loadGardenData();
  }, [viewMonth]);

  const handleMonthChange = (diff: number) => {
    const [yearStr, monthStr] = viewMonth.split('-');
    const next = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + diff, 1);
    setViewMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const getPlantEmoji = (level: number) => {
    switch (level) {
      case 5: return '🌳'; // 大樹
      case 4: return '🌷'; // 咲いた花
      case 3: return '🌿'; // 茂る葉
      case 2: return '🌱'; // 芽
      case 1: default: return '🌰'; // 種
    }
  };

  const getPlantMessage = (level: number) => {
    switch (level) {
      case 5: return '見事な大樹に育ちました！お金を使わない日をたくさん作れた素晴らしい月でした！';
      case 4: return '綺麗なお花が咲きました！日々のやりくりの努力の結晶です！';
      case 3: return '順調に葉が茂っています。この調子で自分のペースで育てていきましょう！';
      case 2: return '可愛い芽が出ました。これからの成長が楽しみですね。';
      case 1: default: return 'まだ種の状態です。ここからゆっくり育てていきましょう！';
    }
  };

  return (
    <View style={styles.container}>
      {/* 月切り替えヘッダー */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => handleMonthChange(-1)} style={styles.arrowBtn}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{viewMonth.replace('-', '年')}月 のお庭</Text>
        <TouchableOpacity onPress={() => handleMonthChange(1)} style={styles.arrowBtn}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* ガーデン描画エリア */}
        <View style={styles.gardenCanvas}>
          {isLoading ? (
            <Text style={styles.loadingText}>お庭の様子を確認中...</Text>
          ) : (
            <>
              {/* 背景の空と地面 */}
              <View style={styles.skyArea} />
              <View style={styles.groundArea} />
              
              {/* メインの植物 */}
              <View style={styles.plantWrapper}>
                <Text style={styles.plantEmoji}>{getPlantEmoji(plantLevel)}</Text>
              </View>
            </>
          )}
        </View>

        {/* 評価・ステータス表示エリア */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>成長レポート</Text>
          <Text style={styles.plantMessage}>{getPlantMessage(plantLevel)}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>無買日 (NMD)</Text>
              <Text style={styles.statValue}>{monthlyNMD} 日</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>現在のポイント</Text>
              <Text style={styles.statValue}>{settings?.gardenPoints || 0} pt</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoArea}>
          <Text style={styles.infoText}>💡 ポイントを使ってお庭を飾り付ける「アイテムショップ」機能は、今後のアップデートで追加されます。</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  arrowBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F2F2F7', borderRadius: 8 },
  arrowText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  monthText: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  
  gardenCanvas: { height: width * 0.8, backgroundColor: '#87CEEB', borderRadius: 16, overflow: 'hidden', marginBottom: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  skyArea: { position: 'absolute', top: 0, left: 0, right: 0, bottom: '25%', backgroundColor: '#E0F7FA' },
  groundArea: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '25%', backgroundColor: '#A5D6A7' },
  plantWrapper: { position: 'absolute', bottom: '15%', alignItems: 'center', justifyContent: 'center' },
  plantEmoji: { fontSize: 100, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 2, height: 4 }, textShadowRadius: 4 },
  loadingText: { fontSize: 14, color: '#8E8E93', fontWeight: 'bold', zIndex: 10 },

  statusCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  statusTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  plantMessage: { fontSize: 14, color: '#3C3C43', lineHeight: 20, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#F2F2F7', padding: 12, borderRadius: 12, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#8E8E93', fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#1C1C1E' },

  infoArea: { paddingHorizontal: 8 },
  infoText: { fontSize: 12, color: '#8E8E93', lineHeight: 18 }
});