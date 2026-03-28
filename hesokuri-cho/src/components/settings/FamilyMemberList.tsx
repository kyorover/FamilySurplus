// src/components/settings/FamilyMemberList.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { FamilyMember } from '../../types';

interface FamilyMemberListProps {
  members: FamilyMember[];
  onUpdate: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const FamilyMemberList: React.FC<FamilyMemberListProps> = ({ members, onUpdate, onDelete, onAdd }) => {
  return (
    <View style={styles.card}>
      {members.map((m, index) => (
        <View key={m.id}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.row}>
            <View style={styles.infoWrapper}>
              <View style={styles.infoHeader}>
                <Text style={styles.name}>{m.name}</Text>
                <Text style={[styles.roleBadge, m.role === '子供' && styles.roleBadgeChild]}>{m.role}</Text>
                {m.role === '子供' && m.age !== undefined && <Text style={styles.ageText}>{m.age}歳</Text>}
              </View>
              {m.role === '大人' && (
                <View style={styles.pocketMoneyWrap}>
                  <Text style={styles.pocketMoneyLabel}>基本のお小遣い：</Text>
                  <View style={styles.inputBox}>
                    <Text style={styles.currency}>￥</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="number-pad"
                      value={m.pocketMoneyAmount === 0 ? '' : String(m.pocketMoneyAmount || '')}
                      placeholder="0"
                      onChangeText={(val) => onUpdate({ ...m, pocketMoneyAmount: parseInt(val, 10) || 0 })}
                    />
                  </View>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => onDelete(m.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>削除</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <View style={styles.divider} />
      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Text style={styles.addBtnText}>＋ 家族を追加</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginLeft: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  infoWrapper: { flex: 1 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 8 },
  roleBadge: { fontSize: 10, backgroundColor: '#8E8E93', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold', overflow: 'hidden', marginRight: 8 },
  roleBadgeChild: { backgroundColor: '#34C759' },
  ageText: { fontSize: 12, color: '#8E8E93', fontWeight: 'bold' },
  pocketMoneyWrap: { flexDirection: 'row', alignItems: 'center' },
  pocketMoneyLabel: { fontSize: 12, color: '#8E8E93', width: 90 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, width: 100 },
  currency: { color: '#8E8E93', marginRight: 4, fontSize: 12 },
  textInput: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'right', padding: 0 },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFF0F0', borderRadius: 6, marginLeft: 16 },
  deleteBtnText: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
  addBtn: { padding: 16, alignItems: 'center', backgroundColor: '#F9F9FB' },
  addBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
});