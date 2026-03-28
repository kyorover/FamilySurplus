// src/screens/InputScreen.tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useHesokuriStore } from '../store';
import { ExpenseInputPad } from '../components/input/ExpenseInputPad';

interface InputScreenProps {
  onComplete: () => void;
}

export const InputScreen: React.FC<InputScreenProps> = ({ onComplete }) => {
  const { settings, addExpense, expenseInput, setExpenseInput, resetExpenseInput } = useHesokuriStore();
  const paymentMethods = ['現金', '電子PAY', 'クレジット'];

  if (!settings) return null;

  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  const activeCategories = settings.categories.filter(cat => cat.isFixed && cat.name === '養育費' ? hasChild : true);

  useEffect(() => {
    if (!expenseInput.categoryId && activeCategories.length > 0) setExpenseInput({ categoryId: activeCategories[0].id });
  }, [settings]);

  const handleNumpadPress = (val: string) => {
    if (val === 'BS') {
      setExpenseInput({ amount: expenseInput.amount.length > 1 ? expenseInput.amount.slice(0, -1) : '0' });
    } else {
      setExpenseInput({ amount: expenseInput.amount === '0' ? (val === '00' ? '0' : val) : (expenseInput.amount.length >= 8 ? expenseInput.amount : expenseInput.amount + val) });
    }
  };

  const handleSubmit = async () => {
    const amountNum = parseInt(expenseInput.amount, 10);
    if (amountNum <= 0) return Alert.alert('エラー', '金額を入力してください');
    if (!expenseInput.categoryId) return Alert.alert('エラー', 'カテゴリを選択してください');

    const today = new Date().toISOString().slice(0, 10);
    await addExpense({
      householdId: settings.householdId, date: today, categoryId: expenseInput.categoryId,
      amount: amountNum, paymentMethod: expenseInput.paymentMethod,
      storeName: expenseInput.storeName.trim(), memo: expenseInput.memo.trim()
    });

    Alert.alert('記録完了', `￥${amountNum.toLocaleString()} を記録しました！`);
    resetExpenseInput();
    onComplete();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inputDisplayArea}>
        <Text style={styles.inputCurrency}>￥</Text>
        <Text style={styles.inputDisplayAmount}>{parseInt(expenseInput.amount, 10).toLocaleString()}</Text>
      </View>

      <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
        {/* カテゴリ選択 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipContainer}>
            {activeCategories.map(cat => {
              const isSelected = expenseInput.categoryId === cat.id;
              const isDisabled = expenseInput.isLocked && !isSelected;
              return (
                <TouchableOpacity key={cat.id} style={[styles.chip, isSelected && styles.chipSelected, isDisabled && styles.chipDisabled]}
                  disabled={expenseInput.isLocked} onPress={() => setExpenseInput({ categoryId: cat.id })}>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected, isDisabled && styles.chipTextDisabled]}>
                    {cat.name} {isSelected && expenseInput.isLocked && ' 🔒'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* 決済手段選択 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipContainer}>
            {paymentMethods.map(method => (
              <TouchableOpacity key={method} style={[styles.chip, expenseInput.paymentMethod === method && styles.chipSelected]} onPress={() => setExpenseInput({ paymentMethod: method })}>
                <Text style={[styles.chipText, expenseInput.paymentMethod === method && styles.chipTextSelected]}>{method}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* 任意入力（店名・コメント） */}
        <View style={styles.optionalInputArea}>
          <TextInput style={styles.textInput} placeholder="店名（任意）" value={expenseInput.storeName} onChangeText={(text) => setExpenseInput({ storeName: text })} />
          <TextInput style={styles.textInput} placeholder="コメント（任意）" value={expenseInput.memo} onChangeText={(text) => setExpenseInput({ memo: text })} />
        </View>

        <ExpenseInputPad onKeyPress={handleNumpadPress} />
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}><Text style={styles.submitBtnText}>この内容で記録する</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollArea: { flex: 1 },
  inputDisplayArea: { backgroundColor: '#FFFFFF', paddingVertical: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  inputCurrency: { fontSize: 24, color: '#8E8E93', marginRight: 4, marginTop: 12 },
  inputDisplayAmount: { fontSize: 48, fontWeight: 'bold', color: '#1C1C1E', letterSpacing: -1 },
  chipScroll: { maxHeight: 54, minHeight: 54, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', backgroundColor: '#FAFAFC' },
  chipContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E5EA', marginRight: 8 },
  chipSelected: { backgroundColor: '#007AFF' },
  chipDisabled: { backgroundColor: '#F2F2F7', opacity: 0.5 },
  chipText: { fontSize: 13, color: '#1C1C1E', fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF' },
  chipTextDisabled: { color: '#C7C7CC' },
  optionalInputArea: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  textInput: { backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 8, fontSize: 14 },
  submitBtn: { backgroundColor: '#007AFF', margin: 16, paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});