// src/components/settings/FamilyMemberList.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import { FamilyMember } from '../../types';

interface FamilyMemberListProps {
  members: FamilyMember[];
  isReorderMode: boolean;
  onUpdate: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onUpdateList: (newList: FamilyMember[]) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const FamilyMemberList: React.FC<FamilyMemberListProps> = ({ 
  members, isReorderMode, onUpdate, onDelete, onAdd, onUpdateList, onDragStart, onDragEnd 
}) => {
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [editName, setEditName] = useState('');

  const onReordered = (fromIndex: number, toIndex: number) => {
    const arr = [...members];
    const item = arr.splice(fromIndex, 1)[0];
    arr.splice(toIndex, 0, item);
    onUpdateList(arr);
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setEditName(member.name);
  };

  const handleSaveName = () => {
    if (editingMember && editName.trim()) {
      onUpdate({ ...editingMember, name: editName.trim() });
      setEditingMember(null);
    }
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
                {item.role === '大人' && (
                  <View style={styles.pocketMoneyWrap}>
                    <Text style={styles.pocketMoneyLabel}>基本小遣い：</Text>
                    <TextInput style={styles.textInput} keyboardType="number-pad" value={String(item.pocketMoneyAmount || '')} onChangeText={(v) => onUpdate({ ...item, pocketMoneyAmount: parseInt(v, 10) || 0 })} />
                  </View>
                )}
              </View>
              <View style={styles.actionWrap}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editBtn}><Text style={styles.editBtnText}>編集</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}><Text style={styles.deleteBtnText}>削除</Text></TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}><Text style={styles.addBtnText}>＋ 家族を追加</Text></TouchableOpacity>
        </View>
      )}

      <Modal visible={!!editingMember} transparent animationType="fade" onRequestClose={() => setEditingMember(null)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>名前の編集</Text>
            <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditingMember(null)}><Text style={styles.modalCancelText}>キャンセル</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveName}><Text style={styles.modalSaveText}>保存</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  name: { fontSize: 16, fontWeight: 'bold' },
  roleBadge: { fontSize: 10, backgroundColor: '#8E8E93', color: '#FFF', padding: 4, borderRadius: 4, marginLeft: 8 },
  roleBadgeChild: { backgroundColor: '#34C759' },
  pocketMoneyWrap: { flexDirection: 'row', alignItems: 'center' },
  pocketMoneyLabel: { fontSize: 12, color: '#888' },
  textInput: { fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#DDD', width: 60, textAlign: 'right' },
  actionWrap: { flexDirection: 'row' },
  editBtn: { backgroundColor: '#E5F1FF', padding: 8, borderRadius: 6, marginRight: 8 },
  editBtnText: { color: '#007AFF', fontSize: 12 },
  deleteBtn: { backgroundColor: '#FFF0F0', padding: 8, borderRadius: 6 },
  deleteBtnText: { color: '#FF3B30', fontSize: 12 },
  addBtn: { padding: 16, alignItems: 'center' },
  addBtnText: { color: '#007AFF', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '80%', backgroundColor: '#FFF', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalInput: { backgroundColor: '#F2F2F7', padding: 12, borderRadius: 8, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  modalCancel: { flex: 1, alignItems: 'center', padding: 12 },
  modalCancelText: { color: '#888' },
  modalSave: { flex: 1, alignItems: 'center', backgroundColor: '#007AFF', padding: 12, borderRadius: 8 },
  modalSaveText: { color: '#FFF', fontWeight: 'bold' },
});