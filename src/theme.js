// Serene Harmony 设计系统 —— 源自 Stitch 导出规范
// 风格：Minimalism + Glassmorphism，Botanical/Aquatic 色调

export const COLORS = {
  // === Serene Harmony 核心色板 ===
  onSurface: '#161d1b',
  onSurfaceVariant: '#727973',
  primary: '#466253',
  onPrimary: '#ffffff',
  primaryContainer: '#5f7b6b',
  onPrimaryContainer: '#f5fff6',
  primaryFixed: '#cbead6',
  primaryFixedDim: '#afcebb',
  onPrimaryFixed: '#052014',
  onPrimaryFixedVariant: '#314c3e',

  secondary: '#3e6562',
  onSecondary: '#ffffff',
  secondaryContainer: '#bee8e4',
  onSecondaryContainer: '#426a66',
  secondaryFixed: '#c1ebe6',
  secondaryFixedDim: '#a5cfca',
  onSecondaryFixed: '#00201e',
  onSecondaryFixedVariant: '#254d4a',

  tertiary: '#426169',
  onTertiary: '#ffffff',
  tertiaryContainer: '#5b7982',
  onTertiaryContainer: '#f9fdff',
  tertiaryFixed: '#c7e8f2',
  tertiaryFixedDim: '#acccd6',
  onTertiaryFixed: '#001f26',
  onTertiaryFixedVariant: '#2d4b54',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  background: '#f4fbf8',
  onBackground: '#161d1b',

  surface: '#f4fbf8',
  surfaceDim: '#d5dbd9',
  surfaceBright: '#f4fbf8',
  surfaceVariant: '#dde4e1',
  surfaceTint: '#496455',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eef5f2',
  surfaceContainer: '#e9efec',
  surfaceContainerHigh: '#e3eae7',
  surfaceContainerHighest: '#dde4e1',

  outline: '#727973',
  outlineVariant: '#c2c8c2',

  inverseSurface: '#2b3230',
  inverseOnSurface: '#ebf2ef',
  inversePrimary: '#afcebb',

  // === 向后兼容别名（旧组件仍可用） ===
  card: '#ffffff',
  textPrimary: '#161d1b',
  textSecondary: '#727973',
  textLight: '#c2c8c2',
  divider: '#e9efec',
  deep_breathing: '#466253',
  nature_sound: '#3e6562',
  singing_bowl: '#426169',
  asmr: '#5b7982',
  meditation: '#466253',
  white_noise: '#bee8e4',
  accent: '#5f7b6b',
};

export const FONT = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
};

export const FONTS = {
  // 优先 Manrope（需通过 expo-font 加载），回退系统字体
  sans: '"Manrope", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif',
  numeric: '"Manrope", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  huge: 48,
};

export const SPACING = {
  unit: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  huge: 96,
  containerMargin: 24,
  gutter: 16,
};

// Figma 精确阴影规范（Serene Harmony）
export const SHADOWS = {
  small: {
    shadowColor: '#466253',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  medium: {
    shadowColor: '#466253',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  large: {
    shadowColor: '#466253',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 6,
  },
  ambient: {
    shadowColor: '#466253',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
  },
  // Figma 精确阴影
  figmaCard: {
    shadowColor: '#466253',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 4,
  },
  figmaAvatar: {
    shadowColor: '#426169',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.1,
    shadowRadius: 80,
    elevation: 6,
  },
  figmaTabBar: {
    shadowColor: '#466253',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 4,
  },
  figmaTabBarStrong: {
    shadowColor: '#426169',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 4,
  },
  figmaButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  figmaGlow: {
    shadowColor: '#466253',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 4,
  },
};

// 圆角系统
export const RADIUS = {
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

// 柔和的缓动曲线
export const EASINGS = {
  breathe: { duration: 6000, easing: 'cubic-in-out' },
  gentle: { duration: 400, easing: 'cubic-in-out' },
  reveal: { duration: 800, easing: 'cubic-in-out' },
};

export const MODE_GRADIENTS = {
  deep_breathing: ['#7EB5A6', '#9BCFC3'],
  nature_sound: ['#A8C686', '#C2D9A5'],
  singing_bowl: ['#B8A9C9', '#D4C9E1'],
  asmr: ['#8FA3BF', '#B3C4D9'],
  meditation: ['#D4A373', '#E4C19F'],
  white_noise: ['#A0C4C8', '#BDD9DC'],
};
