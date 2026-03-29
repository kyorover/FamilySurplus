// src/components/settings/FamilyMemberList.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
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
      
      <View style={styles.actionWrap}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editBtn} disabled={isActive}>
          <Text style={styles.editBtnText}>編集</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn} disabled={isActive}>
          <Text style={styles.deleteBtnText}>削除</Text>
        </TouchableOpacity>
      </View>
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

      {/* 名前編集用の極小モーダル */}
      <Modal visible={!!editingMember} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>名前の編集</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              autoFocus
              placeholder="名前を入力"
              placeholderTextColor="#C7C7CC"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => setEditingMember(null)}>
                <Text style={styles.modalCancelText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalSave]} onPress={handleSaveName}>
                <Text style={styles.modalSaveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  actionWrap: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E5F1FF', borderRadius: 6, marginRight: 8 },
  editBtnText: { fontSize: 12, color: '#007AFF', fontWeight: 'bold' },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFF0F0', borderRadius: 6 },
  deleteBtnText: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
  addBtn: { padding: 16, alignItems: 'center', backgroundColor: '#F9F9FB' },
  addBtnText: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  
  // モーダル用のスタイル
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '80%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#1C1C1E', textAlign: 'center' },
  modalInput: { backgroundColor: '#F2F2F7', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 20, color: '#1C1C1E' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8 },
  modalCancel: { backgroundColor: '#F2F2F7', marginRight: 8 },
  modalCancelText: { color: '#8E8E93', fontWeight: 'bold' },
  modalSave: { backgroundColor: '#007AFF', marginLeft: 8 },
  modalSaveText: { color: '#FFFFFF', fontWeight: 'bold' },
});