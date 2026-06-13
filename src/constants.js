export const MODES = {
  DEEP_BREATHING: 'deep_breathing',
  NATURE_SOUND: 'nature_sound',
  SINGING_BOWL: 'singing_bowl',
  ASMR: 'asmr',
  MEDITATION: 'meditation',
  WHITE_NOISE: 'white_noise',
};

// Serene Harmony 配色映射后的模式颜色
export const MODE_CONFIG = {
  [MODES.DEEP_BREATHING]: {
    id: MODES.DEEP_BREATHING, title: '深呼吸', subtitle: '缓解紧张',
    description: '跟随节拍进行一分钟深呼吸，让身体重新找回节奏。',
    defaultDuration: 60, color: '#466253', icon: 'wind',
    soundFile: 'bell.wav', breathePattern: { inhale: 4, hold: 2, exhale: 4 },
  },
  [MODES.NATURE_SOUND]: {
    id: MODES.NATURE_SOUND, title: '自然音', subtitle: '缓解焦虑',
    description: '三分钟模拟大自然环境音，带你远离喧嚣。',
    defaultDuration: 180, color: '#3e6562', icon: 'leaf',
    subModes: [
      { key: 'rain', label: '雨声', icon: 'water-drop' },
      { key: 'forest', label: '森林', icon: 'park' },
      { key: 'ocean', label: '海浪', icon: 'waves' },
    ],
  },
  [MODES.SINGING_BOWL]: {
    id: MODES.SINGING_BOWL, title: '音钵', subtitle: '清空大脑',
    description: '一分钟音钵共鸣，清空杂念，让大脑回归宁静。',
    defaultDuration: 60, color: '#426169', icon: 'bell',
    soundFile: 'bowl.wav',
  },
  [MODES.ASMR]: {
    id: MODES.ASMR, title: 'ASMR', subtitle: '缓解失眠',
    description: '柔和的ASMR背景音，可自定义播放时长，陪伴你入睡。',
    defaultDuration: 600, color: '#5b7982', icon: 'moon',
    soundFile: 'white_noise.wav', allowLoop: true, customDuration: true,
  },
  [MODES.MEDITATION]: {
    id: MODES.MEDITATION, title: '冥想', subtitle: '激发创造',
    description: '在冥想中激发内在创造力，让灵感自然流淌。',
    defaultDuration: 300, color: '#5f7b6b', icon: 'sun',
    soundFile: 'white_noise.wav', customDuration: true,
  },
  [MODES.WHITE_NOISE]: {
    id: MODES.WHITE_NOISE, title: '专注', subtitle: '提升专注',
    description: '纯净白噪音屏蔽环境干扰，进入深度专注状态。',
    defaultDuration: 1800, color: '#466253', icon: 'cloud',
    soundFile: 'white_noise.wav', customDuration: true,
  },
};

export const STORAGE_KEYS = { DAILY_STATS: '@daily_stats', SETTINGS: '@settings' };
export const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
export const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];
