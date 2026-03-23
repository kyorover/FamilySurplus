import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

// ==========================================
// 1. 定義データ
// ==========================================
const CATEGORIES = ['食費', '外食', '日用品', '養育費'];
const PAYMENT_METHODS = ['電子決済', 'クレジット', '現金'];
const PAYERS = ['夫', '妻', '共通財布']; // 管理画面で設定可能な「誰が払ったか」

// ==========================================
// 2. 入力画面メインコンポーネント
// ==========================================
export default function App() {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [payer, setPayer] = useState(PAYERS[0]); // 支払者のState
  const [inputDate, setInputDate] = useState('2026/03/23'); 
  const [comment, setComment] = useState('');
  const MAX_COMMENT_LENGTH = 50;

  // テンキー入力処理
  const handleNumberPress = (num) => {
    if (amount.length >= 7) return;
    if (amount === '' && (num === '0' || num === '00')) return;
    setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleSave = () => {
    if (!amount) {
      alert('金額を入力してください');
      return;
    }
    alert(`【保存完了】\n日付: ${inputDate}\nカテゴリ: ${selectedCategory}\n金額: ￥${parseInt(amount, 10).toLocaleString()}\n支払者: ${payer}\n支払方法: ${paymentMethod}\nメモ: ${comment}`);
    setAmount('');
    setComment('');
  };

  // 日付変更のモック処理（本来はモーダル等でカレンダーor手入力を選ばせる）
  const handleDatePress = () => {
    alert('日付入力方式の選択\n・カレンダーから選ぶ\n・数字で直接入力 (例: 20260323)');
  };

  const formattedAmount = amount ? parseInt(amount, 10).toLocaleString() : '0';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* 1. ヘッダー領域 */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>支出の入力</Text>
            <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
              <Text style={[styles.saveText, !amount && styles.saveTextDisabled]}>保存</Text>
            </TouchableOpacity>
          </View>

          {/* 2. カメラ自動入力ボタン */}
          <TouchableOpacity style={styles.cameraButton} onPress={() => alert('カメラを起動してレシートを読み取ります（実装予定）')}>
            <Text style={styles.cameraButtonIcon}>📷</Text>
            <Text style={styles.cameraButtonText}>レシートを撮影して自動入力</Text>
          </TouchableOpacity>

          {/* 3. 日付 */}
          <View style={styles.sectionRow}>
            <TouchableOpacity style={styles.datePickerButton} onPress={handleDatePress}>
              <Text style={styles.sectionLabel}>日付</Text>
              <Text style={styles.dateText}>{inputDate}</Text>
              <Text style={styles.dateEditHint}>✎ 変更</Text>
            </TouchableOpacity>
          </View>

          {/* 4. カテゴリ */}
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 5. 支払者と支払区分（横並びから縦積みに変更して見やすく） */}
          <View style={styles.detailSettingsContainer}>
            
            {/* 誰が払ったか */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>支払者:</Text>
              <View style={styles.settingButtons}>
                {PAYERS.map((p) => {
                  const isActive = payer === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.settingChip, isActive && styles.payerChipActive]}
                      onPress={() => setPayer(p)}
                    >
                      <Text style={[styles.settingText, isActive && styles.settingTextActive]}>{p}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 支払方法 */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>支払方法:</Text>
              <View style={styles.settingButtons}>
                {PAYMENT_METHODS.map((method) => {
                  const isActive = paymentMethod === method;
                  return (
                    <TouchableOpacity
                      key={method}
                      style={[styles.settingChip, isActive && styles.paymentChipActive]}
                      onPress={() => setPaymentMethod(method)}
                    >
                      <Text style={[styles.settingText, isActive && styles.settingTextActive]}>{method}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

          </View>

          {/* 6. コメント（メモ）入力 */}
          <View style={styles.commentContainer}>
            <View style={styles.commentInputWrapper}>
              <TextInput
                style={styles.commentInput}
                placeholder="メモを入力 (店名や用途など)"
                placeholderTextColor="#8E8E93" // プレースホルダーの色を濃く
                value={comment}
                onChangeText={(text) => {
                  if(text.length <= MAX_COMMENT_LENGTH) setComment(text);
                }}
                returnKeyType="done"
                maxLength={MAX_COMMENT_LENGTH}
              />
              <Text style={styles.charCount}>
                {comment.length}/{MAX_COMMENT_LENGTH}
              </Text>
            </View>
          </View>

          {/* 7. 金額表示領域 */}
          <View style={styles.amountDisplayContainer}>
            <Text style={styles.currencySymbol}>￥</Text>
            <Text style={[styles.amountText, !amount && styles.amountTextEmpty]}>
              {formattedAmount}
            </Text>
          </View>

        </ScrollView>

        {/* 8. カスタムテンキー領域 */}
        <View style={styles.keypadContainer}>
          <View style={styles.keyRow}>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('1')}><Text style={styles.keyText}>1</Text></TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('2')}><Text style={styles.keyText}>2</Text></TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('3')}><Text style={styles.keyText}>3</Text></TouchableOpacity>
          </View>
          <View style={styles.keyRow}>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('4')}><Text style={styles.keyText}>4</Text></TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('5')}><Text style={styles.keyText}>5</Text></TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('6')}><Text style={styles.keyText}>6</Text></TouchableOpacity>
          </View>
          <View style={styles.keyRow}>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('7')}><Text style={styles.keyText}>7</Text></TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('8')}><Text style={styles.keyText}>8</Text></TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('9')}><Text style={styles.keyText}>9</Text></TouchableOpacity>
          </View>
          <View style={styles.keyRow}>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('00')}><Text style={styles.keyText}>00</Text></TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('0')}><Text style={styles.keyText}>0</Text></TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={handleDelete} onLongPress={() => setAmount('')}><Text style={styles.keyTextSpecial}>⌫</Text></TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================
// 3. スタイル定義
// ==========================================
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  saveTextDisabled: {
    color: '#A1C4FD',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5F1FF',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCE4FF',
    borderStyle: 'dashed',
  },
  cameraButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  sectionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  dateEditHint: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#E5E5EA',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 4,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  detailSettingsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    width: 65,
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  settingButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  settingChip: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 6,
  },
  payerChipActive: {
    backgroundColor: '#5856D6', // 支払者は紫系で区別
  },
  paymentChipActive: {
    backgroundColor: '#34C759', // 支払方法は緑系
  },
  settingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  settingTextActive: {
    color: '#FFFFFF',
  },
  commentContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  commentInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA', // 枠線を追加して入力欄であることを強調
  },
  commentInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1C1E',
  },
  charCount: {
    fontSize: 11,
    color: '#8E8E93',
    marginLeft: 8,
  },
  amountDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#1C1C1E',
    marginRight: 4,
    fontWeight: '500',
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1C1C1E',
    letterSpacing: 1,
  },
  amountTextEmpty: {
    color: '#C7C7CC',
  },
  keypadContainer: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: '#F2F2F7',
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  keyButton: {
    width: (width - 48) / 3,
    aspectRatio: 2.2, // 高さを少し抑えてコンパクトに
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  keyTextSpecial: {
    fontSize: 24,
    color: '#8E8E93',
  },
});