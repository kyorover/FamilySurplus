// src/components/dashboard/PocketMoneyRuleModal.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MonthlyBudget, FamilyMember } from '../../types';

interface PocketMoneyRuleModalProps {
  visible: boolean;
  familyMembers: FamilyMember[];
  monthlyBudget: MonthlyBudget;
  onSave: (bonusAllocation: Record<string, number>, deficitRule: MonthlyBudget['deficitRule']) => void;
  onClose: () => void;
}

export const PocketMoneyRuleModal: React.FC<PocketMoneyRuleModalProps> = ({ visible, familyMembers, monthlyBudget, onSave, onClose }) => {
  const [localAllocation, setLocalAllocation] = useState<Record<string, number>>({});
  const [localRule, setLocalRule] = useState<MonthlyBudget['deficitRule']>('みんなで折半');

  const adults = familyMembers.filter(m => m.role === '大人');

  useEffect(() => {
    if (visible) {
      let alloc = { ...monthlyBudget.bonusAllocation };
      
      // 大人1人の場合（単身、または親1人+子供）は自動的に100%にする
      if (adults.length === 1) {
        alloc[adults[0].id] = 100;
      } else if (Object.keys(alloc).length === 0 && adults.length > 0) {
        // 未設定の場合は均等割り
        const val = Math.floor(100 / adults.length);
        adults.forEach(a => { alloc[a.id] = val; });
      }
      
      setLocalAllocation(alloc);
      setLocalRule(monthlyBudget.deficitRule || 'みんなで折半');
    }
  }, [visible, monthlyBudget]);

  const applyPreset = (targetId: string | 'equal') => {
    const newAlloc: Record<string, number> = {};
    if (targetId === 'equal') {
      const val = Math.floor(100 / adults.length);
      adults.forEach(a => { newAlloc[a.id] = val; });
    } else {
      adults.forEach(a => { newAlloc[a.id] = a.id === targetId ? 100 : 0; });
    }
    setLocalAllocation(newAlloc);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}><Text style={styles.cancelText}>キャンセル</Text></TouchableOpacity>
            <Text style={styles.headerTitle}>今月のへそくりルール</Text>
            <TouchableOpacity onPress={() => onSave(localAllocation, localRule)} style={styles.headerBtn}><Text style={styles.saveText}>保存</Text></TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.ruleLabel}>💰 余ったお金（へそくり）の配分比率</Text>
            
            <View style={styles.ruleCard}>
              {/* 大人が2人以上の場合のみ、フレーム内にワンタッチボタンを表示 */}
              {adults.length > 1 && (
                <View style={styles.presetRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {adults.map(adult => (
                      <TouchableOpacity key={adult.id} style={styles.presetBtn} onPress={() => applyPreset(adult.id)}>
                        <Text style={styles.presetBtnText}>{adult.name}に100%</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.presetBtn} onPress={() => applyPreset('equal')}>
                      <Text style={styles.presetBtnText}>均等に分ける</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}

              {adults.map(adult => (
                <View key={adult.id} style={[styles.allocRow, adults.length === 1 && { marginBottom: 0 }]}>
                  <Text style={styles.allocName}>{adult.name}</Text>
                  <View style={styles.allocInputWrap}>
                    <TextInput
                      style={styles.allocInput}
                      keyboardType="number-pad"
                      value={String(localAllocation[adult.id] || 0)}
                      onChangeText={(val) => setLocalAllocation(prev => ({ ...prev, [adult.id]: parseInt(val, 10) || 0 }))}
                      selectTextOnFocus={true}
                      editable={adults.length > 1} // 1人の場合は編集不可にする
                    />
                    <Text style={styles.allocPercent}>%</Text>
                  </View>
                </View>
              ))}
            </View>
            
            <Text style={styles.ruleLabel}>⚠️ 予算オーバー時のカバー方法</Text>
            <View style={styles.ruleCard}>
              <View style={styles.ruleSelectors}>
                {(['みんなで折半', '配分比率でカバー', 'お小遣いは減らさない'] as MonthlyBudget['deficitRule'][]).map(rule => (
                  <TouchableOpacity key={rule} style={[styles.ruleBtn, localRule === rule && styles.ruleBtnActive]} onPress={() => setLocalRule(rule)}>
                    <Text style={[styles.ruleBtnText, localRule === rule && styles.ruleBtnTextActive]}>{rule}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  cancelText: { fontSize: 16, color: '#007AFF' },
  saveText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  content: { padding: 16 },
  ruleLabel: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93', marginLeft: 8, marginBottom: 8, marginTop: 16 },
  ruleCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  presetRow: { flexDirection: 'row', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  presetBtn: { backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  presetBtnText: { fontSize: 13, color: '#1C1C1E', fontWeight: 'bold' },
  allocRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  allocName: { fontSize: 16, color: '#1C1C1E', fontWeight: 'bold' },
  allocInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, width: 100 },
  allocInput: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'right', padding: 0 },
  allocPercent: { fontSize: 14, color: '#8E8E93', marginLeft: 4 },
  ruleSelectors: { flexDirection: 'column' },
  ruleBtn: { paddingVertical: 14, backgroundColor: '#F2F2F7', borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  ruleBtnActive: { backgroundColor: '#007AFF' },
  ruleBtnText: { fontSize: 14, fontWeight: 'bold', color: '#8E8E93' },
  ruleBtnTextActive: { color: '#FFFFFF' },
});