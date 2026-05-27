// src/screens/MaintenanceScreen.tsx
import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/colors';

export const MaintenanceScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>メンテナンス中</Text>
        
        <Text style={styles.subtitle}>
          現在、システムメンテナンスを行っております。{'\n'}
          ご迷惑をおかけいたしますが、{'\n'}
          しばらく経ってから再度お試しください。
        </Text>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  innerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 32 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: colors.textPrimary, 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    lineHeight: 24 
  }
});