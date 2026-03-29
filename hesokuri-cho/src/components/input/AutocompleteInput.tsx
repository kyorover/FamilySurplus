// src/components/input/AutocompleteInput.tsx
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView, Keyboard } from 'react-native';

interface AutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  history: string[];
  onFocus?: () => void;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ value, onChangeText, placeholder, history, onFocus }) => {
  const [isFocused, setIsFocused] = useState(false);

  // 入力された文字を含む履歴だけを抽出（大文字小文字は区別しない）
  const filtered = history.filter(h => h.toLowerCase().includes(value.toLowerCase()) && h !== value);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        onFocus={() => { setIsFocused(true); onFocus && onFocus(); }}
        // タップ判定を優先するため、少し遅らせてサジェストを閉じる
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      />
      
      {/* 候補が存在し、かつフォーカス中の場合のみプルダウンを表示 */}
      {isFocused && filtered.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={styles.scrollArea}>
            {filtered.map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.dropdownItem} 
                onPress={() => { onChangeText(item); setIsFocused(false); Keyboard.dismiss(); }}
              >
                <Text style={styles.dropdownText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative', marginBottom: 8 },
  textInput: { backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, fontSize: 14 },
  dropdown: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  scrollArea: { maxHeight: 150 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  dropdownText: { fontSize: 14, color: '#1C1C1E', fontWeight: '500' }
});