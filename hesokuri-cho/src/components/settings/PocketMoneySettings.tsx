// src/components/settings/PocketMoneySettings.tsx
import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { FamilyMember, HouseholdSettings } from '../../types';

interface PocketMoneySettingsProps {
  settings: HouseholdSettings;
  onChangeMember: (updatedMember: FamilyMember) => void;
  onChangeDeficitRule: (rule: HouseholdSettings['deficitRule']) => void;
}

export const PocketMoneySettings: React.FC<PocketMoneySettingsProps> = ({ settings, onChangeMember, onChangeDeficitRule }) => {
  // 変更点: '大人'フィルタを撤廃し、全メンバーを対象とする
  const targetMembers = settings.familyMembers;

  if (!targetMembers || targetMembers.length === 0) return null;

  return (
    <View style={styles.card}>
      {targetMembers.map((member, index) => (
        <View key={member.id} style={[styles.memberRow, index > 0 && styles.borderTop]}>
          <Text style={styles.memberName}>{member.name} {member.role === '子供' && <Text style={styles.childBadge}>（子供）</Text>}</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>基本のお小遣い</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.currency}>￥</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="number-pad"
                value={String(member.pocketMoneyAmount || 0)}
                onChangeText={(val) => onChangeMember({ ...member, pocketMoneyAmount: parseInt(val, 10) || 0 })}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>へそくり配分率</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                keyboardType="number-pad"
                value={String(member.surplusRatio || 0)}
                onChangeText={(val) => {
                  let num = parseInt(val, 10) || 0;
                  if (num > 100) num = 100;
                  onChangeMember({ ...member, surplusRatio: num });
                }}
              />
              <Text style={styles.percent}>%</Text>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.ruleSection}>
        <Text style={styles.ruleTitle}>⚠️ 予算オーバー（不足）時のルール</Text>
        <Text style={styles.ruleDesc}>赤字になった分を、来月のお小遣い等からどう負担するかを設定します。</Text>
        <View style={styles.ruleSelectors}>
          {['折半', '配分比率', 'ペナルティなし'].map((rule) => {
            const isActive = settings.deficitRule === rule;
            return (
              <TouchableOpacity key={rule} style={[styles.ruleBtn, isActive && styles.ruleBtnActive]} onPress={() => onChangeDeficitRule(rule as HouseholdSettings['deficitRule'])}>
                <Text style={[styles.ruleBtnText, isActive && styles.ruleBtnTextActive]}>{rule}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  memberRow: { padding: 16 },
  borderTop: { borderTopWidth: 1, borderTopColor: '#E5E5EA' },
  memberName: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 12 },
  childBadge: { fontSize: 12, color: '#8E8E93', fontWeight: 'normal' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  inputLabel: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, width: 120 },
  currency: { color: '#8E8E93', marginRight: 4 },
  percent: { color: '#8E8E93', marginLeft: 4 },
  textInput: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'right' },
  ruleSection: { backgroundColor: '#FFF0F0', padding: 16, borderTopWidth: 1, borderTopColor: '#FFE5E5' },
  ruleTitle: { fontSize: 13, fontWeight: 'bold', color: '#FF3B30', marginBottom: 4 },
  ruleDesc: { fontSize: 11, color: '#FF3B30', opacity: 0.8, marginBottom: 12 },
  ruleSelectors: { flexDirection: 'row', justifyContent: 'space-between' },
  ruleBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, backgroundColor: '#FFFFFF', borderRadius: 6, marginHorizontal: 4, borderWidth: 1, borderColor: '#FFE5E5' },
  ruleBtnActive: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  ruleBtnText: { fontSize: 11, fontWeight: 'bold', color: '#FF3B30' },
  ruleBtnTextActive: { color: '#FFFFFF' },
});