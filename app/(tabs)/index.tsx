"use client";

import { Suspense } from "react";
import { View, StyleSheet } from "react-native";
import ExperienceCanvas from "@/components/3d/ExperienceCanvas";
import SectionOverlays from "@/components/ui/overlays/SectionOverlays";
import Navigation from "@/components/ui/Navigation";
import LoadingFallback from "@/components/ui/LoadingFallback";

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Suspense fallback={<LoadingFallback />}>
        <ExperienceCanvas />
      </Suspense>
      <SectionOverlays />
      <Navigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});

export default HomeScreen;