"use client";

import { View, Text, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import { scrollToSection, useDeviceCategory } from "@/lib/experience";

function Navigation() {
  const device = useDeviceCategory();
  const { width } = useWindowDimensions();
  const isMobile = device === "mobile" || width < 640;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.logo}>AUVERION SYSTEMS</Text>
        </View>
        <View style={styles.right}>
          {!isMobile ? (
            <View style={styles.navLinks}>
              <NavLink label="Capabilities" onPress={() => scrollToSection(1)} />
              <NavLink label="Work" onPress={() => scrollToSection(6)} />
              <NavLink label="Approach" onPress={() => scrollToSection(2)} />
              <NavLink label="Company" onPress={() => scrollToSection(7)} />
              <NavLink label="Contact" onPress={() => scrollToSection(8)} />
            </View>
          ) : null}
          <Pressable style={styles.ctaButton} onPress={() => scrollToSection(8)}>
            <Text style={styles.ctaText}>Start a Conversation</Text>
          </Pressable>
          {isMobile ? (
            <Pressable style={styles.menuButton} onPress={() => {}}>
              <Text style={styles.menuText}>MENU</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function NavLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.navLink} onPress={onPress}>
      <Text style={styles.navLinkText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(20px)",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    paddingHorizontal: 32,
    paddingVertical: 16,
    zIndex: 100,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 1440,
    marginHorizontal: "auto",
  },
  left: {
    flex: 1,
  },
  logo: {
    fontFamily: "IBM Plex Sans",
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
  },
  navLinks: {
    flexDirection: "row",
    gap: 32,
  },
  navLink: {
    paddingVertical: 8,
  },
  navLinkText: {
    fontFamily: "IBM Plex Sans",
    fontSize: 14,
    fontWeight: "500",
    color: "#a0a0a0",
  },
  ctaButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 2,
  },
  ctaText: {
    fontFamily: "IBM Plex Sans",
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: 0.5,
  },
  menuButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuText: {
    fontFamily: "IBM Plex Sans",
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 1,
  },
});

export default Navigation;
