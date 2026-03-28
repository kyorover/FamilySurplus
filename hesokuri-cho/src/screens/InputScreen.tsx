// src/screens/InputScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useHesokuriStore } from '../store';
import { ExpenseInputPad } from '../components/input/ExpenseInputPad';

interface InputScreenProps {
  onComplete: () => void;
}

export const InputScreen: React.FC<InputScreenProps> = ({ onComplete }) => {
  const { settings, expenseInput, setExpenseInput, saveExpenseInput } = useHesokuriStore();
  const paymentMethods = ['現金', 'コード決済', 'クレジット'];
  
  // フォーカス状態の管理（デフォルトはfalse = フォーカスなし）
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);

  if (!settings) return null;

  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  const activeCategories = settings.categories.filter(cat => cat.isFixed && cat.name === '養育費' ? hasChild : true);

  // フォーカス中のみカーソルを点滅させる
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAmountFocused) {
      setCursorVisible(true);
      interval = setInterval(() => setCursorVisible(v => !v), 500);
    } else {
      setCursorVisible(false);
    }
    return () => clearInterval(interval);
  }, [isAmountFocused]);

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
    try {
      await saveExpenseInput();
      Alert.alert('完了', '記録を保存しました！');
      setIsAmountFocused(false);
      onComplete();
    } catch (e: any) {
      Alert.alert('エラー', e.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      <View style={styles.inputFocusWrapper}>
        <TouchableOpacity 
          style={[styles.inputDisplayArea, isAmountFocused && styles.inputDisplayAreaFocused]} 
          activeOpacity={0.8}
          onPress={() => { Keyboard.dismiss(); setIsAmountFocused(true); }}
        >
          <Text style={[styles.inputCurrency, isAmountFocused && styles.inputCurrencyFocused]}>￥</Text>
          <Text style={styles.inputDisplayAmount}>
            {parseInt(expenseInput.amount, 10).toLocaleString()}
            <Text style={{ color: cursorVisible ? '#007AFF' : 'transparent' }}>|</Text>
          </Text>
        </TouchableOpacity>
        {expenseInput.date && <Text style={styles.dateHint}>{expenseInput.date.split('-')[1]}月{expenseInput.date.split('-')[2]}日 の記録</Text>}
      </View>

      <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipContainer}>
            {activeCategories.map(cat => {
              const isSelected = expenseInput.categoryId === cat.id;
              const isDisabled = expenseInput.isLocked && !isSelected;
              return (
                <TouchableOpacity key={cat.id} style={[styles.chip, isSelected && styles.chipSelected, isDisabled && styles.chipDisabled]}
                  disabled={expenseInput.isLocked} onPress={() => { setExpenseInput({ categoryId: cat.id }); setIsAmountFocused(false); }}>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected, isDisabled && styles.chipTextDisabled]}>
                    {cat.name} {isSelected && expenseInput.isLocked && ' 🔒'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipContainer}>
            {paymentMethods.map(method => (
              <TouchableOpacity key={method} style={[styles.chip, expenseInput.paymentMethod === method && styles.chipSelected]} onPress={() => { setExpenseInput({ paymentMethod: method }); setIsAmountFocused(false); }}>
                <Text style={[styles.chipText, expenseInput.paymentMethod === method && styles.chipTextSelected]}>{method}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.optionalInputArea}>
          <TextInput style={styles.textInput} placeholder="店名（任意）" value={expenseInput.storeName} onChangeText={(text) => setExpenseInput({ storeName: text })} onFocus={() => setIsAmountFocused(false)} />
          <TextInput style={styles.textInput} placeholder="コメント（任意）" value={expenseInput.memo} onChangeText={(text) => setExpenseInput({ memo: text })} onFocus={() => setIsAmountFocused(false)} />
        </View>

        {/* 金額枠がフォーカスされている時だけテンキーを表示 */}
        {isAmountFocused && <ExpenseInputPad onKeyPress={handleNumpadPress} />}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>{expenseInput.id ? '修正を保存する' : 'この内容で記録する'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollArea: { flex: 1 },
  inputFocusWrapper: { backgroundColor: '#FFFFFF', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', alignItems: 'center' },
  inputDisplayArea: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E5E5EA', backgroundColor: '#FAFAFC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minWidth: '80%' },
  inputDisplayAreaFocused: { borderColor: '#007AFF', backgroundColor: '#F0F8FF' },
  inputCurrency: { fontSize: 24, color: '#C7C7CC', marginRight: 8, fontWeight: 'bold' },
  inputCurrencyFocused: { color: '#007AFF' },
  inputDisplayAmount: { fontSize: 48, fontWeight: 'bold', color: '#1C1C1E', letterSpacing: -1 },
  dateHint: { fontSize: 12, color: '#8E8E93', fontWeight: 'bold', marginTop: 12 },
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