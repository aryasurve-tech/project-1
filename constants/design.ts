export const colors = {
  background: '#000000',
  surface: '#0a0a0a',
  surfaceElevated: '#111111',
  border: '#1a1a1a',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#606060',
  accent: '#ffffff',
  accentSoft: 'rgba(255, 255, 255, 0.1)',
  accentMedium: 'rgba(255, 255, 255, 0.3)',
  accentStrong: 'rgba(255, 255, 255, 0.6)',
  nodeColor: '#ffffff',
  nodeColorDim: 'rgba(255, 255, 255, 0.15)',
  pathwayColor: 'rgba(255, 255, 255, 0.08)',
  pathwayColorActive: 'rgba(255, 255, 255, 0.4)',
  structureColor: '#ffffff',
  structureColorDim: 'rgba(255, 255, 255, 0.05)',
  dataSignalColor: '#ffffff',
  fogColor: '#000000',
};

export const typography = {
  fontFamily: 'IBM Plex Sans',
  fontFamilyMono: 'IBM Plex Mono',
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
    '4xl': 64,
    '5xl': 96,
    '6xl': 128,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.02,
    wider: 0.1,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128,
};

export const breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1440,
  wide: 1920,
};

export const transitions = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
  cinematic: 1200,
};

export const easings = {
  easeOut: [0.25, 0.46, 0.45, 0.94],
  easeInOut: [0.4, 0, 0.2, 1],
  cinematic: [0.16, 1, 0.3, 1],
  spring: [0.34, 1.56, 0.64, 1],
};

export const zIndices = {
  canvas: 0,
  uiBase: 10,
  navigation: 100,
  modal: 200,
  tooltip: 300,
};

export const sceneConfig = {
  hero: { name: 'hero', progress: { start: 0, end: 0.15 } },
  architecture: { name: 'architecture', progress: { start: 0.15, end: 0.3 } },
  engineering: { name: 'engineering', progress: { start: 0.3, end: 0.45 } },
  intelligence: { name: 'intelligence', progress: { start: 0.45, end: 0.6 } },
  scale: { name: 'scale', progress: { start: 0.6, end: 0.75 } },
  infrastructure: { name: 'infrastructure', progress: { start: 0.75, end: 0.9 } },
  cta: { name: 'cta', progress: { start: 0.9, end: 1 } },
};

export const performanceConfig = {
  desktop: {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    nodeCount: 3000,
    structureCount: 150,
    pathwayCount: 500,
    enablePostProcessing: true,
    enableShadows: true,
    enableFog: true,
  },
  tablet: {
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    nodeCount: 1500,
    structureCount: 80,
    pathwayCount: 250,
    enablePostProcessing: true,
    enableShadows: false,
    enableFog: true,
  },
  mobile: {
    pixelRatio: 1,
    nodeCount: 500,
    structureCount: 30,
    pathwayCount: 100,
    enablePostProcessing: false,
    enableShadows: false,
    enableFog: false,
  },
};