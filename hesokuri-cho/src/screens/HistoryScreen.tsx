// src/screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useHesokuriStore } from '../store';
import { GardenShopModal } from '../components/garden/GardenShopModal';
import { GARDEN_ITEMS } from '../constants/gardenItems'; // ← 追加：アイテムマスター

export const HistoryScreen: React.FC = () => {
  const { settings, fetchHistoryData } = useHesokuriStore();
  const [viewMonth, setViewMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [isLoading, setIsLoading] = useState(false);
  const [isShopVisible, setIsShopVisible] = useState(false);
  
  const [plantLevel, setPlantLevel] = useState(1);
  const [monthlyNMD, setMonthlyNMD] = useState(0);

  useEffect(() => {
    const loadGardenData = async () => {
      setIsLoading(true);
      const data = await fetchHistoryData(viewMonth);
      
      const expensesByDate = data.expenses.reduce((acc, exp) => {
        acc[exp.date] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      const [yearStr, monthStr] = viewMonth.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, month, 0).getDate();
      
      let nmdCount = 0;
      const today = new Date();
      const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
      const calcTargetDays = isCurrentMonth ? today.getDate() : daysInMonth;

      for (let i = 1; i <= calcTargetDays; i++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        if (!expensesByDate[dateStr]) nmdCount++;
      }
      
      setMonthlyNMD(nmdCount);
      
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
      case 5: return '🌳'; 
      case 4: return '🌷'; 
      case 3: return '🌿'; 
      case 2: return '🌱'; 
      case 1: default: return '🌰'; 
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
        
        <View style={styles.gardenCanvas}>
          {isLoading ? (
            <Text style={styles.loadingText}>お庭の様子を確認中...</Text>
          ) : (
            <>
              <View style={styles.skyArea} />
              <View style={styles.groundArea} />
              
              {/* メインの植物 */}
              <View style={styles.plantWrapper}>
                <Text style={styles.plantEmoji}>{getPlantEmoji(plantLevel)}</Text>
              </View>

              {/* 購入したアイテムの自動配置 */}
              {settings?.ownedGardenItemIds?.map((itemId, index) => {
                const itemDef = GARDEN_ITEMS.find(i => i.id === itemId);
                if (!itemDef) return null;

                // 簡単な散らし配置ロジック（左右交互、高さを少しずつ変える）
                const isLeft = index % 2 === 0;
                const positionStyle = isLeft 
                  ? { left: `${10 + (index * 10) % 30}%`, bottom: `${5 + (index * 3) % 15}%` }
                  : { right: `${10 + (index * 10) % 30}%`, bottom: `${5 + (index * 3) % 15}%` };

                return (
                  <View key={itemId} style={[styles.placedItem, positionStyle]}>
                    <Text style={styles.placedItemEmoji}>{itemDef.imageUrl}</Text>
                  </View>
                );
              })}
            </>
          )}
        </View>

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

        <TouchableOpacity style={styles.shopBtn} activeOpacity={0.8} onPress={() => setIsShopVisible(true)}>
          <Text style={styles.shopBtnIcon}>🛒</Text>
          <View style={styles.shopBtnTextWrap}>
            <Text style={styles.shopBtnTitle}>アイテムショップへ</Text>
            <Text style={styles.shopBtnSub}>貯まったポイントでお庭を飾り付けましょう</Text>
          </View>
          <Text style={styles.shopBtnArrow}>＞</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ショップモーダル */}
      <GardenShopModal visible={isShopVisible} onClose={() => setIsShopVisible(false)} />
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
  
  plantWrapper: { position: 'absolute', bottom: '15%', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  plantEmoji: { fontSize: 100, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 2, height: 4 }, textShadowRadius: 4 },
  
  placedItem: { position: 'absolute', zIndex: 2 },
  placedItemEmoji: { fontSize: 32, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 2 },
  
  loadingText: { fontSize: 14, color: '#8E8E93', fontWeight: 'bold', zIndex: 10 },

  statusCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  statusTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  plantMessage: { fontSize: 14, color: '#3C3C43', lineHeight: 20, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#F2F2F7', padding: 12, borderRadius: 12, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#8E8E93', fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#1C1C1E' },

  shopBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  shopBtnIcon: { fontSize: 28, marginRight: 16 },
  shopBtnTextWrap: { flex: 1 },
  shopBtnTitle: { fontSize: 15, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4 },
  shopBtnSub: { fontSize: 11, color: '#8E8E93' },
  shopBtnArrow: { fontSize: 16, color: '#C7C7CC', fontWeight: 'bold' }
});