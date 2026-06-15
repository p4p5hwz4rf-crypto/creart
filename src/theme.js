export const COLORS = {
  background: '#f7fbf7',
  backgroundAlt: '#eef7f2',
  onBackground: '#18201d',

  surface: '#f7fbf7',
  surfaceDim: '#d8e4dd',
  surfaceBright: '#ffffff',
  surfaceVariant: '#dfeae4',
  surfaceTint: '#527564',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f1f7f3',
  surfaceContainer: '#eaf2ed',
  surfaceContainerHigh: '#e0ece5',
  surfaceContainerHighest: '#d7e3dc',

  card: '#ffffff',
  cardMuted: '#f4faf6',
  divider: '#dde8e1',
  outline: '#78857d',
  outlineVariant: '#c7d3cc',

  onSurface: '#18201d',
  onSurfaceVariant: '#65736a',
  textPrimary: '#18201d',
  textSecondary: '#65736a',
  textLight: '#93a199',

  primary: '#4f7a64',
  onPrimary: '#ffffff',
  primaryContainer: '#d8efdf',
  onPrimaryContainer: '#163424',
  primaryFixed: '#d8efdf',
  primaryFixedDim: '#b9dcc7',
  onPrimaryFixed: '#163424',
  onPrimaryFixedVariant: '#315340',

  secondary: '#437678',
  onSecondary: '#ffffff',
  secondaryContainer: '#d6f0ef',
  onSecondaryContainer: '#244d4e',
  secondaryFixed: '#d6f0ef',
  secondaryFixedDim: '#add7d6',
  onSecondaryFixed: '#0d3132',
  onSecondaryFixedVariant: '#2c5859',

  tertiary: '#75669a',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ebe3ff',
  onTertiaryContainer: '#392d5f',
  tertiaryFixed: '#ebe3ff',
  tertiaryFixedDim: '#cfc3f3',
  onTertiaryFixed: '#2d2450',
  onTertiaryFixedVariant: '#554579',

  warm: '#c8846e',
  warmContainer: '#ffe7dd',
  onWarmContainer: '#704030',
  amber: '#c99a45',
  amberContainer: '#fff1ce',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  inverseSurface: '#2c322f',
  inverseOnSurface: '#edf3ef',
  inversePrimary: '#b9dcc7',

  deep_breathing: '#4f7a64',
  nature_sound: '#4f8a73',
  singing_bowl: '#75669a',
  asmr: '#5f7899',
  meditation: '#c8846e',
  white_noise: '#437678',
  accent: '#c8846e',
};

export const FONT = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
};

export const FONTS = {
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
  huge: 44,
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
  containerMargin: 22,
  gutter: 16,
};

export const SHADOWS = {
  small: {
    shadowColor: '#335042',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  medium: {
    shadowColor: '#335042',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 4,
  },
  large: {
    shadowColor: '#335042',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 6,
  },
  ambient: {
    shadowColor: '#355b48',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 36,
    elevation: 7,
  },
  figmaCard: {
    shadowColor: '#335042',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 4,
  },
  figmaAvatar: {
    shadowColor: '#5f7899',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 34,
    elevation: 5,
  },
  figmaTabBar: {
    shadowColor: '#335042',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 5,
  },
  figmaTabBarStrong: {
    shadowColor: '#335042',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 5,
  },
  figmaButton: {
    shadowColor: '#335042',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  figmaGlow: {
    shadowColor: '#4f7a64',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
};

export const RADIUS = {
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const EASINGS = {
  breathe: { duration: 6000, easing: 'cubic-in-out' },
  gentle: { duration: 400, easing: 'cubic-in-out' },
  reveal: { duration: 800, easing: 'cubic-in-out' },
};

export const SCREEN_GRADIENT = ['#fbfdf9', '#eef8f2', '#f7f0ea'];

export const MODE_GRADIENTS = {
  deep_breathing: ['#dff4e6', '#9fd0b5'],
  nature_sound: ['#e5f4da', '#86c8a2'],
  singing_bowl: ['#eee6ff', '#b9a8df'],
  asmr: ['#e5eef8', '#9cb5d3'],
  meditation: ['#ffe6db', '#e6a687'],
  white_noise: ['#dff4f3', '#8cc7c7'],
};
