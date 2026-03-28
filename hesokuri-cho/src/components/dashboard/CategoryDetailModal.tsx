// src/components/dashboard/CategoryDetailModal.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ExpenseRecord, Category } from '../../types';

interface CategoryDetailModalProps {
  visible: boolean;
  category: Category | null;
  expenses: ExpenseRecord[];
  onClose: () => void;
  onUpdate: (expense: ExpenseRecord) => void;
  onDelete: (date_id: string) => void;
  onAddExpense: (categoryId: string) => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ visible, category, expenses, onClose, onUpdate, onDelete, onAddExpense }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editStoreName, setEditStoreName] = useState<string>('');
  const [editMemo, setEditMemo] = useState<string>('');

  if (!category) return null;

  const handleEdit = (exp: ExpenseRecord) => {
    setEditingId(exp.id);
    setEditAmount(String(exp.amount));
    setEditStoreName(exp.storeName || '');
    setEditMemo(exp.memo || '');
  };

  const handleSave = (exp: ExpenseRecord) => {
    const num = parseInt(editAmount, 10);
    if (isNaN(num) || num <= 0) return Alert.alert('エラー', '正しい金額を入力してください');
    onUpdate({ ...exp, amount: num, storeName: editStoreName.trim(), memo: editMemo.trim() });
    setEditingId(null);
  };

  const handleDelete = (exp: ExpenseRecord) => {
    Alert.alert('確認', '削除しますか？', [{ text: 'キャンセル', style: 'cancel' }, { text: '削除', style: 'destructive', onPress: () => onDelete(exp.date_id) }]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>{category.name} の明細</Text>
            <TouchableOpacity onPress={() => { setEditingId(null); onClose(); }}><Text style={styles.closeText}>閉じる</Text></TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addDirectBtn} onPress={() => { setEditingId(null); onClose(); onAddExpense(category.id); }}>
            <Text style={styles.addDirectBtnText}>＋ このカテゴリに支出を追加</Text>
          </TouchableOpacity>

          <ScrollView style={styles.list}>
            {expenses.length === 0 ? <Text style={styles.emptyText}>記録はありません</Text> : 
              expenses.map(exp => (
                <View key={exp.id} style={styles.recordItem}>
                  {editingId === exp.id ? (
                    <View style={styles.editForm}>
                      <TextInput style={styles.editInput} keyboardType="number-pad" placeholder="金額" value={editAmount} onChangeText={setEditAmount} autoFocus />
                      <TextInput style={styles.editInput} placeholder="店名（任意）" value={editStoreName} onChangeText={setEditStoreName} />
                      <TextInput style={styles.editInput} placeholder="コメント（任意）" value={editMemo} onChangeText={setEditMemo} />
                      <View style={styles.editActions}>
                        <TouchableOpacity onPress={() => setEditingId(null)} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>キャンセル</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleSave(exp)} style={styles.saveBtn}><Text style={styles.saveBtnText}>保存</Text></TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.recordHeader}>
                        <View style={styles.dateAndMethod}>
                          <Text style={styles.date}>{exp.date.split('-')[2]}日</Text>
                          <Text style={styles.methodBadge}>{exp.paymentMethod}</Text>
                        </View>
                        <Text style={styles.amount}>￥{exp.amount.toLocaleString()}</Text>
                      </View>
                      <View style={styles.recordBody}>
                        <View style={styles.textContainer}>
                          {exp.storeName ? <Text style={styles.storeName} numberOfLines={1}>📍 {exp.storeName}</Text> : null}
                          {exp.memo ? <Text style={styles.memo} numberOfLines={1}>💬 {exp.memo}</Text> : null}
                        </View>
                        <View style={styles.actions}>
                          <TouchableOpacity onPress={() => handleEdit(exp)} style={styles.actionBtn}><Text style={styles.editText}>修正</Text></TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(exp)} style={styles.actionBtn}><Text style={styles.deleteText}>削除</Text></TouchableOpacity>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              ))
            }
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '85%', minHeight: '60%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  closeText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  addDirectBtn: { backgroundColor: '#E5F1FF', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  addDirectBtnText: { color: '#007AFF', fontWeight: 'bold', fontSize: 14 },
  list: { flexGrow: 0 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 24 },
  recordItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  dateAndMethod: { flexDirection: 'row', alignItems: 'center' },
  date: { fontSize: 14, color: '#8E8E93', width: 40, fontWeight: 'bold' },
  methodBadge: { fontSize: 10, backgroundColor: '#E5E5EA', color: '#8E8E93', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  recordBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  textContainer: { flex: 1, marginRight: 8 },
  storeName: { fontSize: 13, color: '#1C1C1E', marginBottom: 2, fontWeight: '500' },
  memo: { fontSize: 12, color: '#8E8E93' },
  actions: { flexDirection: 'row' },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, marginLeft: 8, backgroundColor: '#F2F2F7', borderRadius: 6 },
  editText: { fontSize: 12, color: '#007AFF', fontWeight: 'bold' },
  deleteText: { fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
  editForm: { backgroundColor: '#FAFAFC', padding: 12, borderRadius: 8 },
  editInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, marginBottom: 8 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 16, marginRight: 8 },
  cancelBtnText: { color: '#8E8E93', fontWeight: 'bold', fontSize: 13 },
  saveBtn: { backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});