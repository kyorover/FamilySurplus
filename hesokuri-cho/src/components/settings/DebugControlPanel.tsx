// src/components/settings/DebugControlPanel.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useHesokuriStore } from '../../store';

export const DebugControlPanel: React.FC = () => {
  const { accountInfo, monthlyBudget, updateMonthlyBudget } = useHesokuriStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // 管理者権限がなければ一切表示しない（絶対的フェイルセーフ）
  if (!accountInfo?.isAdmin) {
    return null;
  }

  const handleTimeTravel = async () => {
    if (!monthlyBudget) return;

    Alert.alert(
      '【デバッグ】タイムトラベル',
      '現在の予算データの対象月を「先月」に強制上書きします。これにより、次回のダッシュボード表示時に「月締め確定モーダル」が発火します。実行しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '実行する',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              // 現在の予算の月を1ヶ月前に戻す (例: 2026-04 -> 2026-03)
              const [yearStr, monthStr] = monthlyBudget.month_id.split('-');
              let year = parseInt(yearStr, 10);
              let month = parseInt(monthStr, 10);

              if (month === 1) {
                month = 12;
                year -= 1;
              } else {
                month -= 1;
              }

              const prevMonthId = `${year}-${String(month).padStart(2, '0')}`;

              // DB上の月を先月扱いで上書き保存
              await updateMonthlyBudget(
                monthlyBudget.budgets,
                monthlyBudget.bonusAllocation,
                monthlyBudget.deficitRule,
                prevMonthId
              );

              Alert.alert('完了', `予算の対象月を ${prevMonthId} に書き換えました。ダッシュボードに戻ると月締め処理が発火します。`);
            } catch (error: any) {
              Alert.alert('エラー', 'タイムトラベルに失敗しました: ' + error.message);
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠 デバッグコントロール</Text>
      <Text style={styles.description}>
        このパネルは isAdmin = true のアカウントにのみ表示されています。
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, isProcessing && styles.buttonDisabled]} 
        onPress={handleTimeTravel}
        disabled={isProcessing}
      >
        <Text style={styles.buttonText}>
          {isProcessing ? '処理中...' : '⏳ 月締めモーダルをテスト (先月へ戻る)'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    padding: 16,
    backgroundColor: '#FFE5E5', // 危険/デバッグ領域であることを視覚的に強調
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#FFB3B0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});