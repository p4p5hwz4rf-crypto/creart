import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, SHADOWS, RADIUS, FONT } from '../theme';
import { MODE_CONFIG, MODES } from '../constants';
import BreathingGuide from './BreathingGuide';
import NatureSound from './NatureSound';
import BowlSound from './BowlSound';
import ASMRPlayer from './ASMRPlayer';
import MeditationPlayer from './MeditationPlayer';
import { getTodayStats, addUsageTime } from '../storage';

const focusAudio = require('../../assets/sounds/gymnopedie_focus.mp3');

const MODE_LIST = [
  MODES.DEEP_BREATHING, MODES.NATURE_SOUND, MODES.SINGING_BOWL,
  MODES.ASMR, MODES.MEDITATION, MODES.WHITE_NOISE,
];

const MODE_IMAGES = {
  [MODES.MEDITATION]: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzoi6RZKWOlUNloKRliuyhAZSXdlaHWrtUGf6cSEugcgsAqYxPoJ6kFpdhLeejiDAZiV1L2V4OZ1SYjsawvV00PwoTJXq6i3U_t8QMYFojNfI5CaYeJdocsxyjNsj4roH7_NKdZ-i2YeMnPkxyPiGo83bgP_1G0UV_i03dbZoP2yI_YJ_iLeaqEEd_L5EGz0g0rziUCfKmSawB1IOVDNSDM5rsR9wxYHV5lnk_8HwINxxGj76uDuwwvR0CLNStHs1OsXwD4EBVaA',
  [MODES.NATURE_SOUND]: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuOxODjOp5SP62iCcxdJRdA6QyXLFutgRs7DZOjPVbF7l3g4jVrMGUQ1pFs8mt6TLOmv9AqwiqLD-4lLtwJh5g2OMW7PyCj-i-2vNTn5Xw9d6zUfR2WJiMIc5Hy4nRSbKmbx4qHy_WCxW1yElZOBIA3KJ8ARgr-4h_kM1P2sduGfxnNIAHHcakO37EuylKbb8kApynZXBGgbMN9Wrg2nOnI00Nz-ocPvnePAH_eBykJ8VE9SUO_RVekMD16cfk-nIsFzEegd-zRQ',
  [MODES.WHITE_NOISE]: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYNgU4Ch8PVlKsi9u1FD9Zbuc8inviBI60FOBm5UF9uUFTTdARa6PqG2XO1H0bubydStq27Xiiu7Us15Grpzb03ETgzoYsJd4lP6BjZ6sAYPvpzc8YmNKtoGnqjA-iStjc3AC_jkvf0lw0R02xCGoNr1JZxpi9p5OjtkRD0CajRtCixsa0lolVxbT_fT2GXQxNnMgivGi03w_KU1FjNUZZh_wqjsrp0PeS97odAE1yNcfTeVwBBF-LdHKCwCUrZIyxqTYjHYhTTg',
};

const MODE_LABELS = {
  [MODES.DEEP_BREATHING]: '深呼吸',
  [MODES.NATURE_SOUND]: '自然音',
  [MODES.SINGING_BOWL]: '音钵',
  [MODES.ASMR]: 'ASMR',
  [MODES.MEDITATION]: '冥想',
  [MODES.WHITE_NOISE]: '专注',
};
export default function TherapyScreen() {
  const [selectedMode, setSelectedMode] = useState(MODES.MEDITATION);
  const [isActive, setIsActive] = useState(false);
  const [todayStats, setTodayStats] = useState({});
  const [natureSubMode, setNatureSubMode] = useState('rain');
  const [buttonCountdown, setButtonCountdown] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const countdownRef = useRef(null);
  const completedRef = useRef(false); // prevent double-counting

  useFocusEffect(
    useCallback(() => {
      getTodayStats().then(setTodayStats);
    }, [isActive])
  );

  const config = MODE_CONFIG[selectedMode];

  // Sync selectedDuration on mode switch
  useEffect(() => {
    setSelectedDuration(config.defaultDuration);
  }, [selectedMode]);

  // Item 2: 精确倒计时，1秒刷新（Date.now() 基准，无漂移）
  useEffect(() => {
    if (isActive) {
      const total = selectedDuration || config.defaultDuration;
      const startTime = Date.now();
      setButtonCountdown(total);
      countdownRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = total - elapsed;
        if (remaining <= 0) {
          clearInterval(countdownRef.current);
          setButtonCountdown(0);
          // Item 1: 时长到了自动停止音频
          setIsActive(false);
          handleComplete(total);
        } else {
          setButtonCountdown(remaining);
        }
      }, 1000);
    } else {
      clearInterval(countdownRef.current);
      setButtonCountdown(0);
    }
    return () => clearInterval(countdownRef.current);
  }, [isActive, selectedDuration, config.defaultDuration]);

  const handleToggle = () => {
    if (isActive) {
      // Pausing: record elapsed time
      const total = selectedDuration || config.defaultDuration;
      const elapsed = total - buttonCountdown;
      if (elapsed > 0) {
        addUsageTime(selectedMode, elapsed);
        getTodayStats().then(setTodayStats);
      }
    } else {
      // Starting new session: reset completion guard
      completedRef.current = false;
    }
    setIsActive(prev => !prev);
  };

  const handleModeChange = (modeKey) => {
    if (modeKey === selectedMode) return;
    if (isActive) {
      const total = selectedDuration || config.defaultDuration;
      const elapsed = total - buttonCountdown;
      if (elapsed > 0) addUsageTime(selectedMode, elapsed);
    }
    setSelectedMode(modeKey);
  };

  const handleComplete = (seconds) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsActive(false);
    addUsageTime(selectedMode, seconds || selectedDuration || config.defaultDuration);
    getTodayStats().then(setTodayStats);
  };

  const renderPlayer = () => {
    const commonProps = {
      active: isActive,
      onComplete: handleComplete,
      color: config.color,
    };
    switch (selectedMode) {
      case MODES.DEEP_BREATHING:
        return <BreathingGuide {...commonProps} pattern={config.breathePattern} />;
      case MODES.NATURE_SOUND:
        return (
          <NatureSound
            {...commonProps}
            defaultDuration={config.defaultDuration}
            subMode={natureSubMode}
          />
        );
      case MODES.SINGING_BOWL:
        return <BowlSound {...commonProps} defaultDuration={config.defaultDuration} />;
      case MODES.ASMR:
        return <ASMRPlayer {...commonProps} duration={selectedDuration} onDurationChange={setSelectedDuration} allowLoop />;
      case MODES.MEDITATION:
        return <MeditationPlayer {...commonProps} duration={selectedDuration} onDurationChange={setSelectedDuration} />;
      case MODES.WHITE_NOISE:
        return <MeditationPlayer {...commonProps} duration={selectedDuration} onDurationChange={setSelectedDuration} showTimer audioSource={focusAudio} />;
      default:
        return null;
    }
  };

  const todayTotal = Object.values(todayStats).reduce((a, b) => a + b, 0);
  const totalDuration = selectedDuration || config.defaultDuration;
  const liveElapsed = isActive ? totalDuration - buttonCountdown : 0;
  const liveTodaySeconds = todayTotal + liveElapsed;

  return (
    <LinearGradient
      colors={['#f4fbf8', '#eef5f2', '#cbead6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 顶部 Blur Header */}
          <BlurView intensity={30} tint="light" style={styles.header}>
            <View style={styles.headerInner}>
              <View style={styles.logoRow}>
                <MaterialIcons name="spa" size={20} color={COLORS.primary} />
                <Text style={styles.logoText}>数字静修所</Text>
              </View>


            </View>
          </BlurView>

          {/* 标题区 */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.greeting}>重拾宁静</Text>
              <Text style={styles.subGreeting}>拥抱当下的静谧</Text>
            </View>
            <View style={styles.todayBadge}>
              <Text style={styles.todayMinutes}>{Math.floor(liveTodaySeconds / 60)}:{String(liveTodaySeconds % 60).padStart(2, '0')}</Text>
              <Text style={styles.todayLabel}>今日分钟</Text>
            </View>
          </View>

          {/* 模式卡片滑块 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modeList}
          >
            {MODE_LIST.map((modeKey) => {
              const active = selectedMode === modeKey;
              const imageUri = MODE_IMAGES[modeKey];
              return (
                <TouchableOpacity
                  key={modeKey}
                  activeOpacity={0.85}
                  onPress={() => handleModeChange(modeKey)}
                  style={styles.modeCardWrap}
                >
                  <View style={[styles.modeImageWrap, active && styles.modeImageWrapActive]}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={styles.modeImage} />
                    ) : (
                      <View style={[styles.modeImageFallback, { backgroundColor: config.color }]}>
                        <Text style={styles.modeImageFallbackText}>{MODE_LABELS[modeKey]?.[0]}</Text>
                      </View>
                    )}
                    {active && <View style={styles.modeImageOverlay} />}
                  </View>
                  <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                    {MODE_LABELS[modeKey]}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {/* Explore More 卡片 */}
            <TouchableOpacity activeOpacity={0.85} style={styles.modeCardWrap}>
              <View style={styles.modeImageWrap}>
                <View style={[styles.modeImageFallback, { backgroundColor: COLORS.surfaceContainerHigh }]}>
                  <MaterialIcons name="add-circle" size={32} color={COLORS.primary} style={{ opacity: 0.4 }} />
                </View>
              </View>
              <Text style={styles.modeLabel}>探索更多</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* 计时器区域 */}
          <View style={styles.timerSection}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={handleToggle}
              style={styles.timerButton}
            >
              <MaterialIcons
                name={isActive ? 'pause' : 'play-arrow'}
                size={48}
                color={COLORS.primary}
              />
              <Text style={styles.timerButtonText}>
                {isActive ? '暂停' : '开始'}
              </Text>
              {/* 倒计时 — 只在按下开始后显示实时计时 */}
              {isActive && buttonCountdown > 0 && (
                <Text style={styles.timerCountdown}>
                  {Math.floor(buttonCountdown / 60)}:{String(buttonCountdown % 60).padStart(2, '0')}
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.timerCaption}>{config.description}</Text>
          </View>

          {/* 子模式选择器（仅 Nature 模式） */}
          {selectedMode === MODES.NATURE_SOUND && config.subModes && (
            <View style={styles.soundRow}>
              {config.subModes.map((sm) => {
                const active = natureSubMode === sm.key;
                return (
                  <TouchableOpacity
                    key={sm.key}
                    activeOpacity={0.8}
                    onPress={() => { setNatureSubMode(sm.key); }}
                    style={styles.soundWrap}
                  >
                    <View style={[styles.soundBtn, active && styles.soundBtnActive]}>
                      <MaterialIcons
                        name={sm.icon}
                        size={active ? 24 : 20}
                        color={active ? COLORS.primary : COLORS.onSurfaceVariant}
                      />
                    </View>
                    <Text style={[styles.soundLabel, active && styles.soundLabelActive]}>{sm.label}</Text>
                    <View style={[styles.soundDot, active && styles.soundDotActive]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Player 容器 */}
          <View style={styles.playerContainer}>
            {renderPlayer()}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  // 顶部 Blur Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    height: 64,
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.containerMargin,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  cumulativeMinutes: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  cumulativeLabel: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
    opacity: 0.6,
  },
  logoText: {
    fontSize: 20,
    fontFamily: FONT.semiBold,
    fontStyle: 'italic',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  // 标题区
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.containerMargin,
    paddingTop: 88,
    paddingBottom: SPACING.lg,
  },
  greeting: {
    fontSize: 24,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  subGreeting: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
    opacity: 0.7,
  },
  todayBadge: {
    alignItems: 'flex-end',
  },
  todayMinutes: {
    fontSize: 32,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    lineHeight: 36,
  },
  todayLabel: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
    opacity: 0.6,
    marginTop: 2,
  },
  // 模式卡片
  modeList: {
    paddingLeft: SPACING.containerMargin,
    paddingVertical: SPACING.md,
    paddingRight: 40,
    gap: 12,
  },
  modeCardWrap: {
    marginRight: 12,
    alignItems: 'center',
  },
  modeImageWrap: {
    width: 112,
    height: 112,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.figmaCard,
  },
  modeImageWrapActive: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modeImageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeImageFallbackText: {
    fontSize: 28,
    fontFamily: FONT.bold,
    color: '#fff',
    opacity: 0.8,
  },
  modeImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(70,98,83,0.15)',
  },
  modeLabel: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
    marginTop: 8,
    textAlign: 'center',
  },
  modeLabelActive: {
    color: COLORS.primary,
    fontFamily: FONT.semiBold,
  },
  // 计时器区域
  timerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    position: 'relative',
  },
  timerGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(70,98,83,0.06)',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -130 }, { translateY: -130 }],
  },
  timerButton: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.figmaCard,
    borderWidth: 1,
    borderColor: 'rgba(194,200,194,0.1)',
    zIndex: 2,
  },
  timerButtonText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.primary,
    letterSpacing: 2,
    marginTop: 4,
  },
  timerCountdown: {
    fontSize: 28,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginTop: 4,
  },
  timerCaption: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    opacity: 0.8,
    marginTop: SPACING.lg,
  },
  // 声音切换
  soundRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 20,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  soundWrap: {
    alignItems: 'center',
  },
  soundBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(233,239,236,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundBtnActive: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryFixed,
    borderWidth: 2,
    borderColor: '#fff',
    ...SHADOWS.figmaButton,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  soundLabel: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
    opacity: 0.7,
  },
  soundLabelActive: {
    color: COLORS.primary,
    opacity: 1,
    fontFamily: FONT.semiBold,
  },
  soundDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    opacity: 0,
  },
  soundDotActive: {
    opacity: 1,
  },
  // Player
  playerContainer: {
    minHeight: 120,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SPACING.containerMargin,
  },
});
