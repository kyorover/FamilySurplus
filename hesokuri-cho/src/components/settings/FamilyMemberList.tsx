// src/components/settings/FamilyMemberList.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import { FamilyMember } from '../../types';

interface FamilyMemberListProps {
  members: FamilyMember[];
  onUpdate: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onUpdateList: (newList: FamilyMember[]) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const FamilyMemberList: React.FC<FamilyMemberListProps> = ({ members, onUpdate, onDelete, onAdd, onUpdateList, onDragStart, onDragEnd }) => {

  const onReordered = (fromIndex: number, toIndex: number) => {
    const arr = [...members];
    const item = arr.splice(fromIndex, 1)[0];
    arr.splice(toIndex, 0, item);
    onUpdateList(arr);
  };

  const renderItem = ({ item, onDragStart: startDrag, onDragEnd: endDrag, isActive }: DragListRenderItemInfo<FamilyMember>) => (
    <View style={[styles.row, isActive && styles.activeRow]}>
      
      {/* ≡アイコンに触れた瞬間に掴む（onPressIn） */}
      <TouchableOpacity activeOpacity={0.6} onPressIn={startDrag} onPressOut={endDrag} style={styles.dragHandle}>
        <Text style={[styles.dragIcon, isActive && { color: '#007AFF' }]}>≡</Text>
      </TouchableOpacity>

      <View style={styles.infoWrapper}>
        <View style={styles.infoHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={[styles.roleBadge, item.role === '子供' && styles.roleBadgeChild]}>{item.role}</Text>
          {item.role === '子供' && item.age !== undefined && <Text style={styles.ageText}>{item.age}歳</Text>}
        </View>
        {item.role === '大人' && (
          <View style={styles.pocketMoneyWrap}>
            <Text style={styles.pocketMoneyLabel}>基本小遣い：</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currency}>￥</Text>
              <TextInput style={styles.textInput} keyboardType="number-pad" value={item.pocketMoneyAmount === 0 ? '' : String(item.pocketMoneyAmount || '')} placeholder="0" onChangeText={(val) => onUpdate({ ...item, pocketMoneyAmount: parseInt(val, 10) || 0 })} editable={!isActive} />
            </View>
          </View>
        )}
      </View>
      
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn} disabled={isActive}>
        <Text style={styles.deleteBtnText}>削除</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.card}>
      <DragList
        data={members}
        keyExtractor={(item) => item.id}
        onReordered={onReordered}
        renderItem={renderItem}
        onDragBegin={onDragStart}
        onDragEnd={onDragEnd}
        scrollEnabled={false} // リスト自体のスクロールは止め、親のScrollViewに任せる
      />
      <View style={{ height: 1, backgroundColor: '#E5E5EA' }} />
      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Text style={styles.addBtnText}>＋ 家族を追加</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', height: 85, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', backgroundColor: '#FFFFFF' },
  activeRow: { backgroundColor: '#F0F8FF', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 10, zIndex: 999 },
  dragHandle: { paddingLeft: 16, paddingRight: 16, paddingVertical: 16, justifyContent: 'center' },
  dragIcon: { fontSize: 28, color: '#C7C7CC', fontWeight: '300' },
  infoWrapper: { flex: 1, justifyContent: 'center' },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginRight: 8 },
  roleBadge: { fontSize: 10, backgroundColor: '#8E8E93', color: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold', overflow: 'hidden', marginRight: 8 },
  roleBadgeChild: { backgroundColor: '#34C759' },
  ageText: { fontSize: 12, color: '#8E8E93', fontWeight: 'bold' },
  pocketMoneyWrap: { flexDirection: 'row', alignItems: 'center' },
  pocketMoneyLabel: { fontSize: 12, color: '#8E8E93', width: 80 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, width: 90 },
  currency: { color: '#8E8E93', marginRight: 4, fontSize: 12 },
  textInput: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'right', padding: 0 },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFF0F0', borderRadius: 6, marginRight: 16 },
  deleteBtnText: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
  addBtn: { padding: 16, alignItems: 'center', backgroundColor: '#F9F9FB' },
  addBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
});