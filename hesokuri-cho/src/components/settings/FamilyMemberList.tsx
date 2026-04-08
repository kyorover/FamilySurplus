// src/components/settings/FamilyMemberList.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import { FamilyMember } from '../../types';

interface FamilyMemberListProps {
  members: FamilyMember[];
  isReorderMode: boolean;
  onUpdate: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onEditClick: (member: FamilyMember) => void;
  onUpdateList: (newList: FamilyMember[]) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const FamilyMemberList: React.FC<FamilyMemberListProps> = ({ 
  members, isReorderMode, onUpdate, onDelete, onAdd, onEditClick, onUpdateList, onDragStart, onDragEnd 
}) => {

  const onReordered = (fromIndex: number, toIndex: number) => {
    const arr = [...members];
    const item = arr.splice(fromIndex, 1)[0];
    arr.splice(toIndex, 0, item);
    onUpdateList(arr);
  };

  const renderDragItem = ({ item, onDragStart: s, onDragEnd: e, isActive }: DragListRenderItemInfo<FamilyMember>) => (
    <View style={[styles.row, isActive && styles.activeRow]}>
      <TouchableOpacity onPressIn={s} onPressOut={e} style={styles.dragHandle}>
        <Text style={styles.dragIcon}>≡</Text>
      </TouchableOpacity>
      <View style={styles.infoWrapper} pointerEvents="none">
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      {isReorderMode ? (
        <DragList data={members} keyExtractor={(i) => i.id} onReordered={onReordered} renderItem={renderDragItem} onDragBegin={onDragStart} onDragEnd={onDragEnd} scrollEnabled={false} />
      ) : (
        <View>
          {members.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.infoWrapper}>
                <View style={styles.infoHeader}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={[styles.roleBadge, item.role === '子供' && styles.roleBadgeChild]}>{item.role}</Text>
                </View>
                <View style={styles.pocketMoneyWrap}>
                  <Text style={styles.pocketMoneyLabel}>基本小遣い：</Text>
                  <TextInput style={styles.textInput} keyboardType="number-pad" value={String(item.pocketMoneyAmount || '')} onChangeText={(v) => onUpdate({ ...item, pocketMoneyAmount: parseInt(v, 10) || 0 })} />
                </View>
              </View>
              <View style={styles.actionWrap}>
                <TouchableOpacity onPress={() => onEditClick(item)} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>編集</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>削除</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Text style={styles.addBtnText}>＋ 家族を追加</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, margin: 16, overflow: 'hidden', elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  activeRow: { backgroundColor: '#F0F8FF' },
  dragHandle: { paddingRight: 16 },
  dragIcon: { fontSize: 24, color: '#CCC' },
  infoWrapper: { flex: 1 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  roleBadge: { fontSize: 10, backgroundColor: '#8E8E93', color: '#FFF', padding: 4, borderRadius: 4, marginLeft: 8, overflow: 'hidden' },
  roleBadgeChild: { backgroundColor: '#34C759' },
  pocketMoneyWrap: { flexDirection: 'row', alignItems: 'center' },
  pocketMoneyLabel: { fontSize: 12, color: '#8E8E93' },
  textInput: { fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#DDD', width: 60, textAlign: 'right', color: '#1C1C1E' },
  actionWrap: { flexDirection: 'row' },
  editBtn: { backgroundColor: '#E5F1FF', padding: 8, borderRadius: 6, marginRight: 8 },
  editBtnText: { color: '#007AFF', fontSize: 12, fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#FFF0F0', padding: 8, borderRadius: 6 },
  deleteBtnText: { color: '#FF3B30', fontSize: 12, fontWeight: 'bold' },
  addBtn: { padding: 16, alignItems: 'center' },
  addBtnText: { color: '#007AFF', fontWeight: 'bold' },
});