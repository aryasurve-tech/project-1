"use client";

import { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import * as Linking from "expo-linking";
import {
  zonesOrder,
  scrollState,
  interactionState,
  scrollToSection,
  useFrameLoop,
  type SectionKey,
} from "@/lib/experience";
import { sectionOpacity } from "@/lib/zoneWeights";
import { colors, typography, spacing, zIndices, breakpoints } from "@/constants/design";

interface ProjectItem {
  index: number;
  name: string;
  desc: string;
  tag: string;
}

const projects: ProjectItem[] = [
  {
    index: 0,
    name: "Edge Orchestration Platform",
    tag: "Distributed Systems",
    desc: "A control plane that orchestrates compute across a fleet of edge nodes with sub-second failover and deterministic dispatch.",
  },
  {
    index: 1,
    name: "Real-time Settlement Engine",
    tag: "Data Infrastructure",
    desc: "A settlement fabric that processes continuous payment flows with exactly-once semantics and full auditability.",
  },
  {
    index: 2,
    name: "Autonomous Fleet Control",
    tag: "Intelligence",
    desc: "Mission control for a coordinated fleet — fusing sensor streams into actuation decisions at the edge, closed-loop.",
  },
  {
    index: 3,
    name: "Diagnostic Intelligence Suite",
    tag: "Observability",
    desc: "Monitoring, anomaly detection and prediction woven directly into the operations loop rather than layered on top.",
  },
  {
    index: 4,
    name: "Supply Network Synthesis",
    tag: "Optimization",
    desc: "A planning layer that turns noisy demand signals into synchronized, resilient supply decisions across the network.",
  },
];

function SectionOverlays() {
  useFrameLoop(() => {});

  const { width, height } = useWindowDimensions();
  const wide = width >= breakpoints.mobile;
  const contentW = Math.min(width - (wide ? 96 : 48), 1180);
  const isHuge = height > 800;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {zonesOrder.map((zone, i) => (
        <Section
          key={zone.key}
          index={i}
          zoneKey={zone.key}
          wide={wide}
          isHuge={isHuge}
          contentW={contentW}
        />
      ))}
      <MiniRail visible={wide} />
      <View style={styles.footer} pointerEvents="box-none">
        <Text style={styles.footerText}>AUVERION SYSTEMS</Text>
        <View style={styles.footerDot} />
        <Text style={styles.footerText}>SYS://01</Text>
      </View>
    </View>
  );
}

const Section = memo(function Section({
  index,
  zoneKey,
  wide,
  isHuge,
  contentW,
}: {
  index: number;
  zoneKey: SectionKey;
  wide: boolean;
  isHuge: boolean;
  contentW: number;
}) {
  const opacity = sectionOpacity(index);
  const active = opacity > 0.5;
  const interactive = opacity > 0.05;

  return (
    <View
      style={[
        styles.section,
        zoneKey === "hero" ? styles.sectionHero : styles.sectionBody,
        zoneKey === "cta" && styles.sectionCTA,
        { opacity },
      ]}
      pointerEvents="box-none"
    >
      {zoneKey === "hero" && <HeroContent active={interactive} />}
      {zoneKey === "architecture" && (
        <RowContent
          active={active}
          wide={wide}
          isHuge={isHuge}
          contentW={contentW}
          eyebrow="CAPABILITIES / 01"
          title="Architecture"
          body="Every system begins as a structure. We engineer the shape of your platform before a single line ships — the boundaries, the resilience, and the contracts between components."
          rows={[
            { n: "01", t: "Distributed foundations", d: "Event-driven, partition-tolerant cores that keep working when parts fail." },
            { n: "02", t: "Real-time data platforms", d: "Decision paths measured in milliseconds, not batch windows." },
            { n: "03", t: "Cloud-native infrastructure", d: "Portable, observable, repeatable environments across providers." },
            { n: "04", t: "Security posture", d: "Identity, encryption and least privilege as structural requirements." },
          ]}
        />
      )}
      {zoneKey === "engineering" && (
        <RowContent
          active={active}
          wide={wide}
          isHuge={isHuge}
          contentW={contentW}
          eyebrow="CAPABILITIES / 02"
          title="Engineering"
          body="Building under uncertainty is a discipline. We frame problems carefully, reason in public, and ship small systems that compound — continuously measured, continuously corrected."
          rows={[
            { n: "01", t: "Frame", d: "Name the constraint precisely before touching the architecture." },
            { n: "02", t: "Reason", d: "Make decisions explicit, testable, and reversible." },
            { n: "03", t: "Build", d: "Deliver thin slices of working system, judged by real behavior." },
            { n: "04", t: "Measure", d: "Instrument everything; let the system reveal the next move." },
          ]}
        />
      )}
      {zoneKey === "intelligence" && (
        <RowContent
          active={active}
          wide={wide}
          isHuge={isHuge}
          contentW={contentW}
          eyebrow="CAPABILITIES / 03"
          title="Intelligence"
          body="Intelligence is a property of the whole system, not a model in a box. We wire inference into the places where decisions are actually made — with the telemetry and controls to prove it works."
          rows={[
            { n: "01", t: "Inference at the edge", d: "Models run where the decision is needed, not in a distant cluster." },
            { n: "02", t: "Closed feedback loops", d: "Predictions are validated against outcomes and re-tuned continuously." },
            { n: "03", t: "Explainable midpoints", d: "Every automated decision leaves an auditable trace you can interrogate." },
            { n: "04", t: "Human override", d: "Confidence thresholds keep people in control of high-stakes paths." },
          ]}
        />
      )}
      {zoneKey === "scale" && (
        <RowContent
          active={active}
          wide={wide}
          isHuge={isHuge}
          contentW={contentW}
          eyebrow="CAPABILITIES / 04"
          title="Scale without changing nature"
          body="Scale is a property, not a goal. Systems must be able to grow an order of magnitude without redesigning — the same architecture, the same invariants, the same failure behavior."
          rows={[
            { n: "01", t: "Partitioning built-in", d: "Work splits along natural boundaries from day one." },
            { n: "02", t: "Elastic primitives", d: "Capacity expands and contracts without operator theatrics." },
            { n: "03", t: "Graceful degradation", d: "When load exceeds the plan, the system degrades predictably." },
            { n: "04", t: "Capacity as code", d: "Growth is rehearsed and automated, not discovered mid-incident." },
          ]}
        />
      )}
      {zoneKey === "infrastructure" && (
        <RowContent
          active={active}
          wide={wide}
          isHuge={isHuge}
          contentW={contentW}
          eyebrow="CAPABILITIES / 05"
          title="Infrastructure"
          body="From physical substrate to the final layer of orchestration, we build and run the invisible machinery that makes the product feel effortless. Boring, dependable, and unfailingly there."
          rows={[
            { n: "01", t: "Substrate control", d: "Servers, networks and stores provisioned with deterministic tooling." },
            { n: "02", t: "Orchestration", d: "Workload scheduling that treats capacity as a first-class object." },
            { n: "03", t: "Observability core", d: "Traces, metrics and logs as one coherent signal, not three silos." },
            { n: "04", t: "Disaster recovery", d: "Failover is an exercise, not a hope — rehearsed on a schedule." },
          ]}
        />
      )}
      {zoneKey === "work" && <WorkContent active={active} isHuge={isHuge} contentW={contentW} />}
      {zoneKey === "philosophy" && (
        <RowContent
          active={active}
          wide={wide}
          isHuge={isHuge}
          contentW={contentW}
          eyebrow="COMPANY / PHILOSOPHY"
          title="Clarity over cleverness"
          body="We build fewer things, more completely — and hold ourselves to the same standard we ask of our systems. Precision over volume, engineering over theatrics, durability over speed."
          rows={[
            { n: "01", t: "Clarity", d: "The simplest design that could possibly work, taken seriously." },
            { n: "02", t: "Precision", d: "Fewer, sharper decisions made on purpose." },
            { n: "03", t: "Durability", d: "Systems and relationships built to outlast the first release." },
          ]}
        />
      )}
      {zoneKey === "cta" && <CTAContent active={active} />}
    </View>
  );
});

function HeroContent({ active }: { active: boolean }) {
  return (
    <View style={styles.hero} pointerEvents="box-none">
      <View>
        <Text style={styles.eyebrow}>SIGNAL / 01 — AUVERION SYSTEMS</Text>
        <Text style={styles.heroTitle}>
          Infrastructure for systems{"\n"}that matter.
        </Text>
        <Text style={styles.heroBody}>
          We design and operate the computational backbone for organizations that
          can't afford uncertainty — real-time, distributed, and built to last.
        </Text>
        <View style={styles.heroActions} pointerEvents="box-none">
          <PrimaryButton active={active} label="Explore the system" onPress={() => scrollToSection(1)} />
          <GhostButton active={active} label="Start a conversation" onPress={() => scrollToSection(8)} />
        </View>
      </View>
      <View style={styles.scrollHint} pointerEvents="none">
        <View style={styles.hintLine} />
        <Text style={styles.hintText}>SCROLL TO TRAVEL</Text>
      </View>
    </View>
  );
}

function RowContent({
  active,
  wide,
  isHuge,
  contentW,
  eyebrow,
  title,
  body,
  rows,
}: {
  active: boolean;
  wide: boolean;
  isHuge: boolean;
  contentW: number;
  eyebrow: string;
  title: string;
  body: string;
  rows: { n: string; t: string; d: string }[];
}) {
  return (
    <View style={{ width: contentW }} pointerEvents="box-none">
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={isHuge ? styles.rowTitleLarge : styles.rowTitle}>{title}</Text>
      <Text style={styles.rowBody}>{body}</Text>
      <View style={styles.rowList}>
        {rows.map((r) => (
          <View key={r.n} style={styles.rowItem}>
            <Text style={styles.rowNum}>{r.n}</Text>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowItemTitle}>{r.t}</Text>
              <Text style={styles.rowItemDesc}>{r.d}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function WorkContent({ active, isHuge, contentW }: { active: boolean; isHuge: boolean; contentW: number }) {
  const selected = interactionState.selectedProject;
  const project = selected >= 0 && selected < projects.length ? projects[selected] : null;

  return (
    <View style={{ width: contentW }} pointerEvents="box-none">
      <Text style={styles.eyebrow}>SELECTED WORK</Text>
      <Text style={isHuge ? styles.rowTitleLarge : styles.rowTitle}>Work</Text>
      <View style={styles.workRow}>
        <View style={styles.workList}>
          {projects.map((p) => (
            <Pressable
              key={p.index}
              pointerEvents={active ? "auto" : "none"}
              onPress={() => {
                interactionState.selectedProject = selected === p.index ? -1 : p.index;
              }}
              style={[styles.workItem, selected === p.index && styles.workItemActive]}
            >
              <Text style={styles.workItemNum}>{String(p.index + 1).padStart(2, "0")}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.workItemTag}>{p.tag}</Text>
                <Text style={styles.workItemName}>{p.name}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        <View style={styles.workDetail}>
          {project ? (
            <>
              <Text style={styles.workDetailTag}>{project.tag}</Text>
              <Text style={styles.workDetailTitle}>{project.name}</Text>
              <Text style={styles.workDetailBody}>{project.desc}</Text>
            </>
          ) : (
            <Text style={styles.workDetailEmpty}>
              Select a module to inspect the system.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function CTAContent({ active }: { active: boolean }) {
  return (
    <View style={styles.cta} pointerEvents="box-none">
      <Text style={styles.eyebrow}>CONTACT / START</Text>
      <Text style={styles.ctaTitle}>Build what{"\n"}comes next.</Text>
      <Text style={styles.ctaBody}>
        Tell us where your system is constrained. We'll show you the shape of the way out.
      </Text>
      <View style={styles.ctaActions} pointerEvents="box-none">
        <PrimaryButton
          active={active}
          label="hello@auverion.systems"
          onPress={() => {
            try {
              Linking.openURL("mailto:hello@auverion.systems");
            } catch {
              // No mail client available — the address above remains.
            }
          }}
        />
        <GhostButton active={active} label="Replay the journey" onPress={() => scrollToSection(0)} />
      </View>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  active,
}: {
  label: string;
  onPress: () => void;
  active: boolean;
}) {
  return (
    <Pressable
      pointerEvents={active ? "auto" : "none"}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
    >
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

function GhostButton({
  label,
  onPress,
  active,
}: {
  label: string;
  onPress: () => void;
  active: boolean;
}) {
  return (
    <Pressable
      pointerEvents={active ? "auto" : "none"}
      onPress={onPress}
      style={({ pressed }) => [styles.ghostBtn, pressed && styles.btnPressed]}
    >
      <Text style={styles.ghostBtnText}>{label}</Text>
    </Pressable>
  );
}

function MiniRail({ visible }: { visible: boolean }) {
  if (!visible) return null;
  const section = scrollState.section;
  return (
    <View style={styles.rail} pointerEvents="none">
      {zonesOrder.map((z, i) => (
        <View key={z.key} style={styles.railItem}>
          <Text style={[styles.railLabel, i === section && styles.railLabelActive]}>{z.navLabel}</Text>
          <View style={[styles.railTick, i === section && styles.railTickActive]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: zIndices.uiBase,
  },
  section: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 48,
  },
  sectionHero: {
    justifyContent: "flex-end",
    paddingBottom: 140,
    paddingTop: 120,
  },
  sectionBody: {
    justifyContent: "flex-start",
    paddingTop: 150,
    paddingBottom: 60,
  },
  sectionCTA: {
    justifyContent: "flex-end",
    paddingBottom: 160,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerText: {
    fontFamily: typography.fontFamilyMono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentStrong,
  },
  eyebrow: {
    fontFamily: typography.fontFamilyMono,
    fontSize: 11,
    letterSpacing: 2.5,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: "uppercase",
  },
  hero: {
    maxWidth: 900,
  },
  heroTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 64,
    fontWeight: typography.weights.semibold,
    lineHeight: 68,
    letterSpacing: -1.5,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  heroBody: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    lineHeight: 28,
    color: colors.textSecondary,
    maxWidth: 560,
    marginBottom: spacing.xl,
  },
  heroActions: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 2,
  },
  primaryBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: typography.weights.semibold,
    color: colors.background,
    letterSpacing: 0.5,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: colors.accentMedium,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  ghostBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  btnPressed: {
    opacity: 0.7,
  },
  scrollHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: spacing.xl,
  },
  hintLine: {
    width: 56,
    height: 1,
    backgroundColor: colors.accentMedium,
  },
  hintText: {
    fontFamily: typography.fontFamilyMono,
    fontSize: 10,
    letterSpacing: 2.5,
    color: colors.textMuted,
  },
  rowTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: typography.weights.semibold,
    letterSpacing: -1,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  rowTitleLarge: {
    fontFamily: typography.fontFamily,
    fontSize: 52,
    lineHeight: 56,
    fontWeight: typography.weights.semibold,
    letterSpacing: -1.2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  rowBody: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    lineHeight: 26,
    color: colors.textSecondary,
    maxWidth: 560,
    marginBottom: spacing.xl,
  },
  rowList: {
    gap: 0,
  },
  rowItem: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "flex-start",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    maxWidth: 720,
  },
  rowNum: {
    fontFamily: typography.fontFamilyMono,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    width: 36,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowItemTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  rowItemDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  rail: {
    position: "absolute",
    right: 24,
    top: "50%",
    transform: [{ translateY: -120 }],
    gap: 10,
    zIndex: 1,
    alignItems: "flex-end",
  },
  railItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
  },
  railTick: {
    width: 18,
    height: 1,
    backgroundColor: colors.accentSoft,
  },
  railTickActive: {
    backgroundColor: colors.accent,
    width: 28,
  },
  railLabel: {
    fontFamily: typography.fontFamilyMono,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  railLabelActive: {
    color: colors.textSecondary,
  },
  workRow: {
    flexDirection: "row",
    gap: spacing.xl,
    alignItems: "flex-start",
  },
  workList: {
    flex: 1,
    maxWidth: 520,
  },
  workItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  workItemActive: {
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  workItemNum: {
    fontFamily: typography.fontFamilyMono,
    fontSize: 11,
    color: colors.textMuted,
    width: 36,
  },
  workItemTag: {
    fontFamily: typography.fontFamilyMono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  workItemName: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  workDetail: {
    width: 340,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  workDetailTag: {
    fontFamily: typography.fontFamilyMono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  workDetailTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  workDetailBody: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  workDetailEmpty: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  cta: {
    maxWidth: 900,
  },
  ctaTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 56,
    lineHeight: 60,
    fontWeight: typography.weights.semibold,
    letterSpacing: -1.2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  ctaBody: {
    fontFamily: typography.fontFamily,
    fontSize: 17,
    lineHeight: 27,
    color: colors.textSecondary,
    maxWidth: 520,
    marginBottom: spacing.xl,
  },
  ctaActions: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
    alignItems: "center",
  },
});

export default SectionOverlays;