// src/components/settings/BudgetEvaluationCard.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BudgetEvaluationResult } from '../../functions/budgetUtils';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface BudgetEvaluationCardProps {
  fixedMonthlyBudget: number; // 評価対象の予算合計額
  averageGuideline: number;   // 年齢・CPIを考慮した世間目安
  evaluation: BudgetEvaluationResult;
  hasChild: boolean; 
}

export const BudgetEvaluationCard: React.FC<BudgetEvaluationCardProps> = ({ 
  fixedMonthlyBudget, 
  averageGuideline, 
  evaluation 
}) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: スタイル生成に isDark も渡す

  return (
    <View style={[styles.evaluationContainer, { backgroundColor: evaluation.bgColor }]}>
      <View style={styles.evalHeader}>
        <Text style={[styles.evaluationTitle, { color: evaluation.color }]}>{evaluation.title}</Text>
      </View>
      <Text style={[styles.evaluationMessage, { color: evaluation.color }]}>{evaluation.message}</Text>
      
      <View style={styles.detailsBox}>
        <Text style={[styles.detailText, { color: evaluation.color }]}>
          評価対象の合計: ￥{fixedMonthlyBudget.toLocaleString()}
        </Text>
        <Text style={[styles.detailText, { color: evaluation.color }]}>
          世間の目安: ￥{averageGuideline.toLocaleString()}
        </Text>
      </View>
      <Text style={[styles.guidelineNote, { color: evaluation.color }]}>
        ※「計算対象」として設定されたカテゴリの合計値で評価しています。
      </Text>
    </View>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  evaluationContainer: { padding: 16, borderRadius: 12, marginBottom: 24 },
  evalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  evaluationTitle: { fontSize: 16, fontWeight: 'bold' },
  evaluationMessage: { fontSize: 13, lineHeight: 18, opacity: 0.9, marginBottom: 12 },
  // ▼ 変更: ダークモード時は背景になじむよう黒の半透明に変更してコントラストを確保
  detailsBox: { backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.4)', padding: 12, borderRadius: 8, marginBottom: 8 },
  detailText: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  guidelineNote: { fontSize: 11, opacity: 0.7, fontWeight: 'bold' },
});