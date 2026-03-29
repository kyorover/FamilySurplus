// src/components/settings/InputHistoryManagerModal.tsx
import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { HouseholdSettings } from '../../types';

interface InputHistoryManagerModalProps {
  visible: boolean;
  settings: HouseholdSettings;
  onUpdate: (newSettings: HouseholdSettings) => void;
  onClose: () => void;
}

export const InputHistoryManagerModal: React.FC<InputHistoryManagerModalProps> = ({ visible, settings, onUpdate, onClose }) => {
  const storeHistory = settings.storeNameHistory || [];
  const memoHistory = settings.memoHistory || [];

  const handleDeleteStore = (item: string) => {
    Alert.alert('削除確認', `「${item}」を店名マスタから削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => {
        onUpdate({ ...settings, storeNameHistory: storeHistory.filter(h => h !== item) });
      }}
    ]);
  };

  const handleDeleteMemo = (item: string) => {
    Alert.alert('削除確認', `「${item}」をコメントマスタから削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => {
        onUpdate({ ...settings, memoHistory: memoHistory.filter(h => h !== item) });
      }}
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>入力履歴マスタの管理</Text>
          <TouchableOpacity onPress={onClose} style={styles.headerSpacer}>
            <Text style={styles.closeText}>完了</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>🛒 店名マスタ（全{storeHistory.length}件）</Text>
          <View style={styles.listCard}>
            {storeHistory.length === 0 ? <Text style={styles.emptyText}>登録履歴はありません</Text> : 
              storeHistory.map((item, index) => (
                <View key={`store-${index}`} style={[styles.row, index === storeHistory.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.itemName}>{item}</Text>
                  <TouchableOpacity onPress={() => handleDeleteStore(item)} style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>削除</Text>
                  </TouchableOpacity>
                </View>
              ))
            }
          </View>

          <Text style={styles.sectionTitle}>💬 コメントマスタ（全{memoHistory.length}件）</Text>
          <View style={styles.listCard}>
            {memoHistory.length === 0 ? <Text style={styles.emptyText}>登録履歴はありません</Text> : 
              memoHistory.map((item, index) => (
                <View key={`memo-${index}`} style={[styles.row, index === memoHistory.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.itemName}>{item}</Text>
                  <TouchableOpacity onPress={() => handleDeleteMemo(item)} style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>削除</Text>
                  </TouchableOpacity>
                </View>
              ))
            }
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerSpacer: { width: 60, alignItems: 'flex-end' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  closeText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93', marginLeft: 8, marginBottom: 8, marginTop: 16 },
  listCard: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' },
  emptyText: { padding: 16, color: '#8E8E93', textAlign: 'center', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  itemName: { fontSize: 16, color: '#1C1C1E', flex: 1, marginRight: 16 },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFF0F0', borderRadius: 6 },
  deleteText: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
});