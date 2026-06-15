export const MODES = {
  DEEP_BREATHING: 'deep_breathing',
  NATURE_SOUND: 'nature_sound',
  SINGING_BOWL: 'singing_bowl',
  ASMR: 'asmr',
  MEDITATION: 'meditation',
  WHITE_NOISE: 'white_noise',
};

export const MODE_CONFIG = {
  [MODES.DEEP_BREATHING]: {
    id: MODES.DEEP_BREATHING,
    title: '深呼吸',
    subtitle: '松开紧绷',
    description: '跟随节拍完成一段缓慢呼吸，让身体先回到安全的节奏里。',
    defaultDuration: 60,
    color: '#4f7a64',
    icon: 'air',
    soundFile: 'bell.wav',
    breathePattern: { inhale: 4, hold: 2, exhale: 4 },
  },
  [MODES.NATURE_SOUND]: {
    id: MODES.NATURE_SOUND,
    title: '自然音',
    subtitle: '把噪声留远',
    description: '选择雨声、森林或海浪，让自然声场慢慢铺开。',
    defaultDuration: 180,
    color: '#4f8a73',
    icon: 'park',
    customDuration: true,
    subModes: [
      { key: 'rain', label: '雨声', icon: 'water-drop' },
      { key: 'forest', label: '森林', icon: 'park' },
      { key: 'ocean', label: '海浪', icon: 'waves' },
    ],
  },
  [MODES.SINGING_BOWL]: {
    id: MODES.SINGING_BOWL,
    title: '音钵',
    subtitle: '清空杂念',
    description: '用持续的共振声清理脑内杂讯，留出一点安静的空白。',
    defaultDuration: 60,
    color: '#75669a',
    icon: 'radio-button-unchecked',
    soundFile: 'bowl.wav',
    customDuration: true,
  },
  [MODES.ASMR]: {
    id: MODES.ASMR,
    title: 'ASMR',
    subtitle: '陪你入睡',
    description: '柔和的近距离声音，适合睡前或需要被轻轻陪伴的时刻。',
    defaultDuration: 600,
    color: '#5f7899',
    icon: 'bedtime',
    soundFile: 'white_noise.wav',
    allowLoop: true,
    customDuration: true,
  },
  [MODES.MEDITATION]: {
    id: MODES.MEDITATION,
    title: '冥想',
    subtitle: '安放注意力',
    description: '给自己一段完整的留白，把注意力慢慢带回当下。',
    defaultDuration: 300,
    color: '#c8846e',
    icon: 'self-improvement',
    soundFile: 'white_noise.wav',
    customDuration: true,
  },
  [MODES.WHITE_NOISE]: {
    id: MODES.WHITE_NOISE,
    title: '专注',
    subtitle: '进入心流',
    description: '纯净的白噪音遮蔽环境干扰，陪你进入稳定专注。',
    defaultDuration: 1800,
    color: '#437678',
    icon: 'blur-on',
    soundFile: 'white_noise.wav',
    customDuration: true,
  },
};

export const STORAGE_KEYS = {
  DAILY_STATS: '@daily_stats',
  SETTINGS: '@settings',
};

export const MONTH_NAMES = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
];

export const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];
