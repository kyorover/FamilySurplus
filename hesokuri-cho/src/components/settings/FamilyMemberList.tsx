// src/components/settings/FamilyMemberList.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { FamilyMember } from '../../types';

interface FamilyMemberListProps {
  members: FamilyMember[];
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const FamilyMemberList: React.FC<FamilyMemberListProps> = ({ members, onDelete, onAdd }) => {
  return (
    <View style={styles.card}>
      {members.map((m, index) => (
        <View key={m.id}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{m.name}</Text>
              <Text style={[styles.roleBadge, m.role === '子供' && styles.roleBadgeChild]}>{m.role}</Text>
              {m.role === '子供' && m.age !== undefined && (
                <Text style={styles.ageText}>{m.age}歳</Text>
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
  info: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 8 },
  roleBadge: { fontSize: 10, backgroundColor: '#8E8E93', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold', overflow: 'hidden', marginRight: 8 },
  roleBadgeChild: { backgroundColor: '#34C759' },
  ageText: { fontSize: 12, color: '#8E8E93', fontWeight: 'bold' },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFF0F0', borderRadius: 6 },
  deleteBtnText: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
  addBtn: { padding: 16, alignItems: 'center', backgroundColor: '#F9F9FB' },
  addBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
});