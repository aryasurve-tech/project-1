'use client';

import { View, Text, StyleSheet, Animated, useWindowDimensions, Pressable } from 'react-native';
import { colors, typography, spacing, sceneConfig, transitions, easings } from '@/constants/design';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';

interface SceneUIProps {
  currentScene: number;
  progress: number;
  scenes: string[];
}

const sceneContent: Record<string, { headline: string; subheadline: string; cta?: string }> = {
  hero: {
    headline: 'BUILD. SCALE. WIN.',
    subheadline: 'Precision-engineered digital infrastructure for teams building what comes next.',
    cta: 'Start a Conversation',
  },
  architecture: {
    headline: 'Architecture for Scale',
    subheadline: 'We design technical foundations around long-term growth and scale. Systems that evolve with your ambition.',
  },
  engineering: {
    headline: 'Engineering Without Compromise',
    subheadline: 'Modular, type-safe, high-performance engineering. Every component serves a purpose. Every line matters.',
  },
  intelligence: {
    headline: 'Build for the Autonomous Age',
    subheadline: 'AI and data systems operating as an integrated computational layer within your architecture.',
  },
  scale: {
    headline: 'Engineered to Scale',
    subheadline: 'Performance, resilience, and the ability to support demanding workloads at massive scale.',
  },
  infrastructure: {
    headline: 'Infrastructure That Doesn\'t Get in the Way',
    subheadline: 'Terraform, Kubernetes, serverless architectures. Abstracted complexity. Operational clarity.',
  },
  cta: {
    headline: 'Have something to build?',
    subheadline: 'Let\'s engineer what\'s next.',
    cta: 'Start a Conversation',
  },
};

export function SceneUI({ currentScene, progress, scenes }: SceneUIProps) {
  const deviceType = useDeviceType();
  const { width, height } = useWindowDimensions();
  const isMobile = deviceType === 'mobile' || width < 640;

  const sceneKey = scenes[currentScene] || 'hero';
  const content = sceneContent[sceneKey];
  
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Animate on scene change
  if (content) {
    opacity.value = withTiming(1, { duration: transitions.normal, easing: easings.easeOut });
    translateY.value = withTiming(0, { duration: transitions.normal, easing: easings.easeOut });
  }

  if (!content) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        {!isMobile && (
          <View style={styles.progressIndicator}>
            {scenes.map((scene, i) => (
              <View
                key={scene}
                style={[
                  styles.progressDot,
                  i === currentScene ? styles.progressDotActive : {},
                  i < currentScene ? styles.progressDotCompleted : {},
                ]}
              />
            ))}
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={[
            styles.headline,
            isMobile ? styles.headlineMobile : styles.headlineDesktop,
          ]}>
            {content.headline}
          </Text>
          
          <Text style={[
            styles.subheadline,
            isMobile ? styles.subheadlineMobile : styles.subheadlineDesktop,
          ]}>
            {content.subheadline}
          </Text>
          
          {content.cta && (
            <Pressable style={styles.ctaButton} onPress={() => {}}>
              <Text style={styles.ctaText}>{content.cta}</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['4xl'],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 800,
  },
  progressIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    pointerEvents: 'none',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.accent,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressDotCompleted: {
    backgroundColor: colors.accentSoft,
  },
  textContainer: {
    gap: spacing.lg,
  },
  headlineDesktop: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.sizes['5xl'] * typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
    maxWidth: 900,
  },
  headlineMobile: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.sizes['3xl'] * typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  subheadlineDesktop: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: typography.sizes.xl * typography.lineHeights.relaxed,
    letterSpacing: typography.letterSpacing.normal,
    maxWidth: 600,
  },
  subheadlineMobile: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: typography.sizes.lg * typography.lineHeights.relaxed,
    letterSpacing: typography.letterSpacing.normal,
  },
  ctaButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 2,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  ctaText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.background,
    letterSpacing: typography.letterSpacing.wide,
  },
});