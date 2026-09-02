'use client';

import { View, StyleSheet, StatusBar } from 'react-native';
import { ExperienceCanvas } from '@/components/3d/ExperienceCanvas';
import { colors } from '@/constants/design';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent />
      <ExperienceCanvas />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});