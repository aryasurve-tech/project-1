'use client';

import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '@/constants/design';

function LoadingFallback() {
  return (
    <View style={styles.container} accessible={false}>
      <ActivityIndicator size="large" color={colors.accent} style={styles.spinner} />
      <Text style={styles.text}>LOADING SYSTEM</Text>
      <View style={styles.barContainer}>
        <View style={styles.bar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  spinner: {
    marginBottom: spacing.sm,
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase',
  },
  barContainer: {
    width: 200,
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  bar: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.accent,
  },
});

export default LoadingFallback;