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

  if (!category) return null;

  const handleEdit = (exp: ExpenseRecord) => { setEditingId(exp.id); setEditAmount(String(exp.amount)); };
  const handleSave = (exp: ExpenseRecord) => {
    const num = parseInt(editAmount, 10);
    if (isNaN(num) || num <= 0) return Alert.alert('エラー', '正しい金額を入力してください');
    onUpdate({ ...exp, amount: num });
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
                <View key={exp.id} style={styles.row}>
                  <View style={styles.infoLeft}>
                    <Text style={styles.date}>{exp.date.split('-')[2]}日</Text>
                    <View>
                      <Text style={styles.methodBadge}>{exp.paymentMethod}</Text>
                      {exp.storeName ? <Text style={styles.subText}>{exp.storeName}</Text> : null}
                    </View>
                  </View>
                  {editingId === exp.id ? (
                    <View style={styles.editWrap}>
                      <TextInput style={styles.input} keyboardType="number-pad" value={editAmount} onChangeText={setEditAmount} autoFocus />
                      <TouchableOpacity onPress={() => handleSave(exp)} style={styles.saveBtn}><Text style={styles.saveBtnText}>保存</Text></TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.infoRight}>
                      <Text style={styles.amount}>￥{exp.amount.toLocaleString()}</Text>
                      <View style={styles.actions}>
                        <TouchableOpacity onPress={() => handleEdit(exp)} style={styles.actionBtn}><Text style={styles.editText}>修正</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(exp)} style={styles.actionBtn}><Text style={styles.deleteText}>削除</Text></TouchableOpacity>
                      </View>
                    </View>
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
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '80%', minHeight: '50%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  closeText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  addDirectBtn: { backgroundColor: '#E5F1FF', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  addDirectBtnText: { color: '#007AFF', fontWeight: 'bold', fontSize: 14 },
  list: { flexGrow: 0 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  date: { fontSize: 14, color: '#8E8E93', width: 40, fontWeight: 'bold' },
  methodBadge: { fontSize: 10, backgroundColor: '#E5E5EA', color: '#8E8E93', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', alignSelf: 'flex-start', marginBottom: 2 },
  subText: { fontSize: 12, color: '#1C1C1E' },
  infoRight: { alignItems: 'flex-end' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4 },
  actions: { flexDirection: 'row' },
  actionBtn: { paddingVertical: 4, paddingHorizontal: 8, marginLeft: 8, backgroundColor: '#F2F2F7', borderRadius: 4 },
  editText: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  deleteText: { fontSize: 12, color: '#FF3B30', fontWeight: '600' },
  editWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  input: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', backgroundColor: '#F2F2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginHorizontal: 8 },
  saveBtn: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});