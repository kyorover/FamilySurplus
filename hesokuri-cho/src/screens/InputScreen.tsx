// src/screens/InputScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useHesokuriStore } from '../store';
import { DatePickerModal } from '../components/input/DatePickerModal';
import { AutocompleteInput } from '../components/input/AutocompleteInput';
import { InputDisplayHeader } from '../components/input/InputDisplayHeader';
import { InputScreenHeader } from '../components/input/InputScreenHeader';
import { useExpenseSubmit } from '../hooks/useExpenseSubmit';
import { DEFAULT_CATEGORY_NAMES } from '../constants';

interface InputScreenProps {
  onComplete: () => void;
}

export const InputScreen: React.FC<InputScreenProps> = ({ onComplete }) => {
  const { settings, expenseInput, setExpenseInput } = useHesokuriStore();
  const paymentMethods = ['現金', 'コード決済', 'クレジット'];
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const amountInputRef = useRef<TextInput>(null);

  const { handleSubmit, handleCancel, hasReturnTarget, isAmountError, setIsAmountError } = useExpenseSubmit(onComplete, setIsAmountFocused);

  if (!settings) return null;

  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  const activeCategories = settings.categories.filter(cat => cat.isFixed && cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE ? hasChild : true);
  const displayDate = expenseInput.date || new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!expenseInput.categoryId && activeCategories.length > 0) setExpenseInput({ categoryId: activeCategories[0].id });
  }, [settings]);

  // ネイティブキーボードからの入力制御
  const handleAmountChange = (text: string) => {
    if (isAmountError) setIsAmountError(false);
    // 数字のみを抽出し、最大8桁に制限
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 8);
    setExpenseInput({ amount: numericValue || '0' });
  };

  const handleFocusAmount = () => {
    setIsAmountFocused(true);
    amountInputRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <InputScreenHeader 
        isEditing={!!expenseInput.id} 
        hasReturnTarget={hasReturnTarget} 
        onCancel={handleCancel} 
        onSubmit={handleSubmit} 
      />

      <InputDisplayHeader 
        date={displayDate} 
        amount={expenseInput.amount} 
        isAmountFocused={isAmountFocused} 
        hasError={isAmountError}
        onPressDate={() => setDatePickerVisible(true)} 
        onPressAmount={handleFocusAmount} 
      />

      {/* ネイティブキーボードを呼び出すための隠しTextInput (確定・保存アクションを排除) */}
      <TextInput
        ref={amountInputRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        value={expenseInput.amount === '0' ? '' : expenseInput.amount}
        onChangeText={handleAmountChange}
        onBlur={() => setIsAmountFocused(false)}
      />

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipContainer}>
            {activeCategories.map(cat => {
              const isSelected = expenseInput.categoryId === cat.id;
              const isDisabled = expenseInput.isLocked && !isSelected;
              return (
                <TouchableOpacity key={cat.id} style={[styles.chip, isSelected && styles.chipSelected, isDisabled && styles.chipDisabled]} disabled={expenseInput.isLocked} onPress={() => { setExpenseInput({ categoryId: cat.id }); setIsAmountFocused(false); }}>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected, isDisabled && styles.chipTextDisabled]}>{cat.name} {isSelected && expenseInput.isLocked && ' 🔒'}</Text>
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
          <AutocompleteInput placeholder="店名（任意）" value={expenseInput.storeName || ''} onChangeText={(text) => setExpenseInput({ storeName: text })} history={settings.storeNameHistory || []} onFocus={() => setIsAmountFocused(false)} />
          <AutocompleteInput placeholder="コメント（任意）" value={expenseInput.memo || ''} onChangeText={(text) => setExpenseInput({ memo: text })} history={settings.memoHistory || []} onFocus={() => setIsAmountFocused(false)} />
        </View>
      </ScrollView>

      <DatePickerModal visible={isDatePickerVisible} initialDate={displayDate} onSelect={(date) => setExpenseInput({ date })} onClose={() => setDatePickerVisible(false)} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' }, 
  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  hiddenInput: { height: 0, width: 0, opacity: 0, position: 'absolute' },
  chipScroll: { maxHeight: 54, minHeight: 54, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', backgroundColor: '#FAFAFC' }, 
  chipContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E5EA', marginRight: 8 }, 
  chipSelected: { backgroundColor: '#007AFF' }, 
  chipDisabled: { backgroundColor: '#F2F2F7', opacity: 0.5 },
  chipText: { fontSize: 13, color: '#1C1C1E', fontWeight: '600' }, 
  chipTextSelected: { color: '#FFFFFF' }, 
  chipTextDisabled: { color: '#C7C7CC' },
  optionalInputArea: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA', zIndex: 10 },
});