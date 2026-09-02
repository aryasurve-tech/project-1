'use client';

import { useEffect, useRef, useLayoutEffect, useState } from 'react';

export type SectionKey =
  | 'hero'
  | 'architecture'
  | 'engineering'
  | 'intelligence'
  | 'scale'
  | 'infrastructure'
  | 'work'
  | 'philosophy'
  | 'cta';

export interface JourneyZone {
  key: SectionKey;
  label: string;
  navLabel: string;
}

export const zonesOrder: JourneyZone[] = [
  { key: 'hero', label: 'Hero', navLabel: 'Home' },
  { key: 'architecture', label: 'Architecture', navLabel: 'Capabilities' },
  { key: 'engineering', label: 'Engineering', navLabel: 'Approach' },
  { key: 'intelligence', label: 'Intelligence', navLabel: 'Intelligence' },
  { key: 'scale', label: 'Scale', navLabel: 'Scale' },
  { key: 'infrastructure', label: 'Infrastructure', navLabel: 'Infrastructure' },
  { key: 'work', label: 'Work', navLabel: 'Work' },
  { key: 'philosophy', label: 'Philosophy', navLabel: 'Company' },
  { key: 'cta', label: 'CTA', navLabel: 'Contact' },
];

export const ZONE_COUNT = zonesOrder.length;

export const scrollState = {
  progress: 0,
  velocity: 0,
  section: 0,
};

export const pointerState = {
  x: 0,
  y: 0,
  active: false,
};

export const interactionState = {
  selectedProject: -1 as number,
};

let scrollEl: HTMLDivElement | null = null;

export function setScrollElement(el: HTMLDivElement | null) {
  scrollEl = el;
}

export function scrollToSection(index: number) {
  if (!scrollEl) return;
  const target = Math.max(0, Math.min(1, index / (ZONE_COUNT - 1)));
  const max = Math.max(1, scrollEl.scrollHeight - scrollEl.clientHeight);
  const top = max * target;
  try {
    scrollEl.scrollTo({ top, behavior: 'smooth' });
  } catch {
    scrollEl.scrollTop = top;
  }
}

export function useFrameLoop(callback: (now: number) => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    let frame = 0;
    const loop = (now: number) => {
      callbackRef.current(now);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

export function useDeviceCategory(): 'mobile' | 'tablet' | 'desktop' {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const measure = () => {
      const w = window.innerWidth;
      setDevice(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return device;
}