// src/screens/InputScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useHesokuriStore } from '../store';
import { ExpenseInputPad } from '../components/input/ExpenseInputPad';

interface InputScreenProps {
  onComplete: () => void; // 入力完了後にダッシュボードへ戻るためのコールバック
}

export const InputScreen: React.FC<InputScreenProps> = ({ onComplete }) => {
  const { settings, addExpense } = useHesokuriStore();
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPayer, setSelectedPayer] = useState<string>('');

  if (!settings) return null;

  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  const activeCategories = settings.categories.filter(cat => 
    cat.isFixed && cat.name === '養育費' ? hasChild : true
  );

  useEffect(() => {
    if (activeCategories.length > 0 && !selectedCategory) setSelectedCategory(activeCategories[0].id);
    if (settings.payers.length > 0 && !selectedPayer) setSelectedPayer(settings.payers[0].id);
  }, [settings]);

  const handleNumpadPress = (val: string) => {
    if (val === 'BS') {
      setInputAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      setInputAmount(prev => {
        if (prev === '0') return val === '00' ? '0' : val;
        if (prev.length >= 8) return prev;
        return prev + val;
      });
    }
  };

  const handleSubmit = async () => {
    const amountNum = parseInt(inputAmount, 10);
    if (amountNum <= 0) return Alert.alert('エラー', '金額を入力してください');
    if (!selectedCategory || !selectedPayer) return Alert.alert('エラー', '選択漏れがあります');

    const today = new Date().toISOString().slice(0, 10);
    await addExpense({
      householdId: settings.householdId,
      date: today,
      categoryId: selectedCategory,
      amount: amountNum,
      payerId: selectedPayer,
      paymentMethod: '現金',
      memo: ''
    });

    Alert.alert('記録完了', `￥${amountNum.toLocaleString()} を記録しました！`);
    setInputAmount('0');
    onComplete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputDisplayArea}>
        <Text style={styles.inputCurrency}>￥</Text>
        <Text style={styles.inputDisplayAmount}>{parseInt(inputAmount, 10).toLocaleString()}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipContainer}>
          {activeCategories.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.chip, selectedCategory === cat.id && styles.chipSelected]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextSelected]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipContainer}>
          {settings.payers.map(payer => (
            <TouchableOpacity 
              key={payer.id} 
              style={[styles.chip, selectedPayer === payer.id && styles.chipSelected]}
              onPress={() => setSelectedPayer(payer.id)}
            >
              <Text style={[styles.chipText, selectedPayer === payer.id && styles.chipTextSelected]}>{payer.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ExpenseInputPad onKeyPress={handleNumpadPress} />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>この内容で記録する</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputDisplayArea: { backgroundColor: '#FFFFFF', padding: 32, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  inputCurrency: { fontSize: 24, color: '#8E8E93', marginRight: 4, marginTop: 16 },
  inputDisplayAmount: { fontSize: 56, fontWeight: 'bold', color: '#1C1C1E', letterSpacing: -1 },
  chipScroll: { maxHeight: 60, minHeight: 60, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', backgroundColor: '#FAFAFC' },
  chipContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E5EA', marginRight: 8 },
  chipSelected: { backgroundColor: '#007AFF' },
  chipText: { fontSize: 14, color: '#1C1C1E', fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF' },
  submitBtn: { backgroundColor: '#007AFF', margin: 16, paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});