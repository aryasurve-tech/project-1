'use client';

import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { colors, typography, spacing, zIndices } from '@/constants/design';
import { useDeviceType } from '@/hooks/useDeviceType';

export function Navigation() {
  const deviceType = useDeviceType();
  const { width } = useWindowDimensions();
  const isMobile = deviceType === 'mobile' || width < 640;

  return (
    <View style={[styles.container, { zIndex: zIndices.navigation }]}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.logo}>AUVERION SYSTEMS</Text>
        </View>
        
        <View style={styles.right}>
          {!isMobile && (
            <View style={styles.navLinks}>
              <NavLink label="Capabilities" href="#capabilities" />
              <NavLink label="Work" href="#work" />
              <NavLink label="Approach" href="#approach" />
              <NavLink label="Company" href="#company" />
              <NavLink label="Contact" href="#contact" />
            </View>
          )}
          
          <Pressable style={styles.ctaButton} onPress={() => {}}>
            <Text style={styles.ctaText}>Start a Conversation</Text>
          </Pressable>
          
          {isMobile && (
            <Pressable style={styles.menuButton} onPress={() => {}}>
              <Text style={styles.menuText}>MENU</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <Pressable style={styles.navLink} onPress={() => {}}>
      <Text style={styles.navLinkText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(20px)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1440,
    marginHorizontal: 'auto',
  },
  left: {
    flex: 1,
  },
  logo: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  navLinks: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  navLink: {
    paddingVertical: spacing.xs,
  },
  navLinkText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacing.normal,
  },
  ctaButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 2,
  },
  ctaText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.background,
    letterSpacing: typography.letterSpacing.wide,
  },
  menuButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  menuText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wider,
  },
});