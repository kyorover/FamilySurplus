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
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ visible, category, expenses, onClose, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  if (!category) return null;

  const handleEdit = (exp: ExpenseRecord) => {
    setEditingId(exp.id);
    setEditAmount(String(exp.amount));
  };

  const handleSave = (exp: ExpenseRecord) => {
    const num = parseInt(editAmount, 10);
    if (isNaN(num) || num <= 0) {
      Alert.alert('エラー', '正しい金額を入力してください');
      return;
    }
    onUpdate({ ...exp, amount: num });
    setEditingId(null);
  };

  const handleDelete = (exp: ExpenseRecord) => {
    Alert.alert('確認', 'この記録を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => onDelete(exp.date_id) }
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>{category.name} の明細 (今月)</Text>
            <TouchableOpacity onPress={() => { setEditingId(null); onClose(); }}>
              <Text style={styles.closeText}>閉じる</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list}>
            {expenses.length === 0 ? (
              <Text style={styles.emptyText}>今月の記録はありません</Text>
            ) : (
              expenses.map(exp => (
                <View key={exp.id} style={styles.row}>
                  <Text style={styles.date}>{exp.date.split('-')[2]}日</Text>
                  
                  {editingId === exp.id ? (
                    <View style={styles.editWrap}>
                      <Text style={styles.currency}>￥</Text>
                      <TextInput 
                        style={styles.input} 
                        keyboardType="number-pad" 
                        value={editAmount} 
                        onChangeText={setEditAmount} 
                        autoFocus 
                      />
                      <TouchableOpacity onPress={() => handleSave(exp)} style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>保存</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.amount}>￥{exp.amount.toLocaleString()}</Text>
                      <View style={styles.actions}>
                        <TouchableOpacity onPress={() => handleEdit(exp)} style={styles.actionBtn}>
                          <Text style={styles.editText}>修正</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(exp)} style={styles.actionBtn}>
                          <Text style={styles.deleteText}>削除</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '80%', minHeight: '50%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  closeText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  list: { flexGrow: 0 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 32 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  date: { fontSize: 14, color: '#8E8E93', width: 40 },
  amount: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  actions: { flexDirection: 'row' },
  actionBtn: { paddingVertical: 4, paddingHorizontal: 8, marginLeft: 8, backgroundColor: '#F2F2F7', borderRadius: 4 },
  editText: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  deleteText: { fontSize: 13, color: '#FF3B30', fontWeight: '600' },
  editWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  currency: { fontSize: 16, color: '#8E8E93' },
  input: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', backgroundColor: '#F2F2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginHorizontal: 8 },
  saveBtn: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});