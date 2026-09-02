"use client";

import { zoneConfigs } from "./journey";
import { scrollState, ZONE_COUNT, type SectionKey } from "./experience";

export interface ZoneWeight {
  enter: number;
  deep: number;
}

export const zoneWeights = {} as Record<SectionKey, ZoneWeight>;
zoneConfigs.forEach((zc) => {
  zoneWeights[zc.key] = { enter: 0, deep: 0 };
});

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function smoother(t: number): number {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function computeZoneWeights() {
  const progress = scrollState.progress;
  const d = 1 / (ZONE_COUNT - 1);

  zoneConfigs.forEach((zc, i) => {
    const pc = i / (ZONE_COUNT - 1);
    const prevPc = i === 0 ? -d : pc - d;

    const enterRaw = i === 0 ? 1 : clamp01((progress - prevPc) / d);
    const deepRaw = clamp01((progress - (pc - d)) / (2 * d));

    const w = zoneWeights[zc.key];
    w.enter = smoother(enterRaw);
    w.deep = smoother(deepRaw);
  });
}

export function sectionOpacity(index: number) {
  const d = 1 / (ZONE_COUNT - 1);
  const pc = index / (ZONE_COUNT - 1);
  const start = index === 0 ? 0 : pc - d * 0.55;
  const end = index === ZONE_COUNT - 1 ? 1 : pc + d * 0.55;
  const progress = scrollState.progress;
  if (progress <= start || progress >= end) return 0;
  const t = (progress - start) / (end - start);
  return smoother(t) * smoother(1 - t);
}

export function resolveZoneWeight(
  zone: string | undefined,
  weightKey: "enter" | "deep" | undefined,
  fallback: number
): number {
  if (!zone) return fallback;
  const w = (zoneWeights as Record<string, ZoneWeight>)[zone];
  if (!w) return fallback;
  return weightKey ? w[weightKey] : w.enter;
}

