// src/components/settings/SettingsMenuCard.tsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface Props {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

export const SettingsMenuCard: React.FC<Props> = ({ icon, title, description, onPress }) => {
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 24, marginRight: 16 },
  title: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 2 },
  desc: { fontSize: 10, color: colors.textSecondary },
  chevron: { fontSize: 20, color: colors.textSecondary, fontWeight: 'bold' },
});